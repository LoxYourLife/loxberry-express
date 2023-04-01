#!/usr/bin/env node

process.env.NODE_ENV = 'development';

const express = require('express');
const fileUpload = require('express-fileupload');
const logger = require('./lib/Logger')('Express');
const path = require('path');
const fs = require('fs').promises;
const fsConstants = require('fs').constants;
const { engine } = require('express-handlebars');
const i18next = require('i18next');
const { onUpgrade, addWsToRouter } = require('./lib/webSocket');
const _ = require('lodash');
const loxberry = require('./lib/loxberry');
const setupEnvironment = require('./setupEnvironment');

const getLanguage = async (defaultLanguage, templatePath, logger) => {
  let languages = {};
  try {
    const files = await fs.readdir(templatePath);
    languages = _.reduce(
      _.filter(files, (file) => file.endsWith('.js')),
      (acc, file) => {
        const content = require(path.resolve(templatePath, file));
        const language = file.replace('.js', '');
        acc[language] = {
          translation: content
        };
        return acc;
      },
      {}
    );
  } catch {
    logger.info('No language files available');
  }

  return i18next.init({
    lng: defaultLanguage,
    fallbackLng: Object.keys(languages),
    debug: false,
    resources: languages
  });
};

const secureRouter = (router) => {
  const secure = (method) => {
    const orignalMethod = method.bind(router);
    return (route, handler) =>
      orignalMethod(route, async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (e) {
          next(e);
        }
      });
  };
  router.get = secure(router.get);
  router.post = secure(router.post);
  router.put = secure(router.put);
  router.patch = secure(router.patch);
  router.delete = secure(router.delete);
  router.options = secure(router.options);
  router.head = secure(router.head);
  router.link = secure(router.link);
  router.unlink = secure(router.unlink);
  router.purge = secure(router.purge);
  router.lock = secure(router.lock);
  router.unlock = secure(router.unlock);
  router.propfind = secure(router.propfind);
  router.use = secure(router.use);

  return router;
};
const pluginRenderer = (module, plugin, logger, loxberryLibrary) => async (req, res, next) => {
  const originalRender = res.render;
  const translate = await getLanguage('de', path.resolve(plugin.directories.lbptemplatedir, 'lang'), logger);
  const handlbarsTranslate = (context, options) => {
    if (options && options.hash) {
      return translate(context, options.hash);
    }
    return translate(context);
  };

  const moduleRouter = module({
    router: secureRouter(addWsToRouter(express.Router())),
    expressStatic: express.static,
    logger,
    _,
    translate,
    loxberry: loxberryLibrary
  });

  res.render = (view, options, fn) => {
    if (_.has(options, 'helpers')) {
      options.helpers = _.assign({ t: handlbarsTranslate }, _.get(options, 'helpers'));
    } else {
      options.helpers = { t: handlbarsTranslate };
    }
    originalRender.call(res, view, options, fn);
  };
  await moduleRouter(req, res, next);
};

const createServer = async () => {
  // Setup environemnt
  const pluginName = await setupEnvironment();

  const app = express();
  const loxberryLibrary = loxberry(pluginName);
  const plugin = await loxberryLibrary.system.pluginData();

  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization');
    next();
  });

  app.use(fileUpload({ createParentPath: true }));
  app.use(express.json());
  app.engine(
    '.hbs',
    engine({
      extname: '.hbs',
      layoutsDir: path.resolve(__dirname, 'views/layouts')
    })
  );
  app.set('view engine', '.hbs');

  app.set('views', [path.resolve(__dirname, 'views'), plugin.directories.lbptemplatedir]);

  try {
    const expressAuthFile = path.resolve(plugin.directories.lbphtmlauthdir, 'express', 'express.auth.js');
    await fs.access(expressAuthFile, fsConstants.R_OK);
    const authModule = require(expressAuthFile);
    app.use(`/admin/express/plugins/${plugin.name}/`, pluginRenderer(authModule, plugin, logger, loxberryLibrary));
  } catch {
    logger.info('No express.auth.js in webfrontend/htmlauth found');
  }
  try {
    const expressFile = path.resolve(plugin.directories.lbphtmlauthdir, 'express', 'express.js');
    await fs.access(expressFile, fsConstants.R_OK);
    const module = require(expressFile);
    app.use(`/express/plugins/${plugin.name}/`, pluginRenderer(module, plugin, logger, loxberryLibrary));
  } catch {
    logger.info('No express.js in webfrontend/htmlauth found');
  }

  app.get('*', (req, res, next) => {
    if (req.ws) return next();
    logger.info(`ACCESS 404 ${req.method} ${req.url}`);
    res.status(404).end();
  });

  const server = app.listen(3300, 'localhost', () => {
    logger.info(`LoxBerry Express Server listening at http://localhost:3300`);
    logger.info(`    Authenticated: /admin/express/plugins/${plugin.name}/`);
    logger.info(`    No Auth:       /express/plugins/${plugin.name}/`);
  });

  server.on('upgrade', onUpgrade(app));
};

createServer();
