const express = require('express');
const fs = require('fs').promises;
const fsConst = require('fs').constants;
const path = require('path');
const directories = require('../lib/directories');
const _ = require('lodash');
const { addWsToRouter } = require('../lib/webSocket');
const i18next = require('i18next');

const getModule = async (name, auth) => {
  const expressFileName = auth ? 'express.auth.js' : 'express.js';
  const modulePath = path.join(directories.htmlauthPluginDir, name);
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

module.exports = ({ app, language, config, auth }) => {
  const router = express.Router();
  router.use('/:name', async (req, res, next) => {
    const pluginName = req.params.name;
    const templatePath = path.resolve(directories.templateDir, pluginName);
    const languagePath = path.resolve(templatePath, 'lang');

    const niceName = pluginName
      .split('_')
      .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
      .join(' ');

    const logger = require('../lib/Logger')(niceName, config);
    logger.info(`ACCESS ${req.method} ${req.url}`);

    const pluginFile = await getModule(pluginName, auth);
    if (false === pluginFile) {
      logger.error(`Plugin "${niceName}" does not provide an express.js file in "${auth ? 'htmlauth' : 'html'}" folder.`);
      return res.status(404).send('404');
    }

    try {
      const translate = await getLanguage(language, languagePath);

      const module = require(pluginFile);
      const plugin = module({
        router: addWsToRouter(express.Router()),
        expressStatic: express.static,
        logger: logger,
        _,
        translate
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

      return await plugin(req, res, next);
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
