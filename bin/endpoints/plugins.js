const express = require('express');
const fs = require('fs').promises;
const fsConst = require('fs').constants;
const path = require('path');
const directories = require('../lib/directories');
const _ = require('lodash');
const { addWsToRouter } = require('../lib/webSocket');
const i18next = require('i18next');
const loxberry = require('../lib/loxberry');

const getModule = async (plugindata, auth) => {
  const expressFileName = auth ? 'express.auth.js' : 'express.js';
  const modulePath = plugindata.directories.lbphtmlauthdir;
  const expressFile = path.join(modulePath, 'express', expressFileName);

  try {
    await fs.access(expressFile, fsConst.F_OK);
    return expressFile;
  } catch {
    return false;
  }
};

const getLanguage = async (defaultLanguage, templatePath) => {
  let languages = {};
  try {
    const files = await fs.readdir(templatePath);
    languages = _.reduce(
      files,
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
    languages = {};
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

module.exports = ({ app, language, config, auth }) => {
  const router = express.Router();
  router.use('/:name', async (req, res, next) => {
    const pluginName = req.params.name;
    const { system } = loxberry(pluginName);

    let pluginData;
    try {
      pluginData = await system.pluginData();
    } catch {
      logger.error(`No plugin with name "${pluginName}" installed.`);
      return res.status(404).send('404');
    }

    const templatePath = pluginData.directories.lbptemplatedir;
    const languagePath = path.resolve(templatePath, 'lang');

    const logger = require('../lib/Logger')(pluginData.title, config);
    logger.info(`ACCESS ${req.method} ${req.url}`);

    const pluginFile = await getModule(pluginData, auth);
    if (false === pluginFile) {
      logger.error(`Plugin "${pluginData.title}" does not provide an express${auth ? '.auth' : ''}.js file in "htmlauth" folder.`);
      return res.status(404).send('404');
    }

    try {
      const translate = await getLanguage(language, languagePath);

      const module = require(pluginFile);
      const plugin = module({
        router: secureRouter(addWsToRouter(express.Router())),
        expressStatic: express.static,
        logger: logger,
        _,
        translate,
        loxberry: loxberry(pluginName)
      });

      const handlbarsTranslate = (context, options) => {
        if (options && options.hash) {
          return translate(context, options.hash);
        }
        return translate(context);
      };
      app.set('views', [...app.get('views'), templatePath]);
      const originalRender = res.render;

      res.render = (view, options, fn) => {
        if (_.has(options, 'helpers')) {
          options.helpers = _.assign({ t: handlbarsTranslate }, _.get(options, 'helpers'));
        } else {
          options.helpers = { t: handlbarsTranslate };
        }
        if (!options.cache) {
          options.cache = false;
        }
        originalRender.call(res, view, options, fn);
      };

      await plugin(req, res, (e) => {
        if (e) {
          logger.error('Something went wrong', e);
          return res.status(500).send('error');
        }
        next();
      });
    } catch (e) {
      logger.error('Something went wrong', e);
      res.status(500).send('error');
    } finally {
      app.set(
        'views',
        app.get('views').filter((p) => p !== templatePath)
      );
    }
  });

  return router;
};
