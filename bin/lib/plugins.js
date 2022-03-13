const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsConst = require('fs').constants;
const path = require('path');
const directories = require('./directories');
const _ = require('lodash');
const crypto = require('crypto');
const fileHashes = {};
const { addWsToRouter } = require('./webSocket');
const i18next = require('i18next');

const getFileHash = async (fileName) => {
  const file = await fs.open(fileName, 'r');
  const content = await file.readFile();
  await file.close();
  const hashSum = crypto.createHash('sha256');
  hashSum.update(content);

  return hashSum.digest('hex');
};

const getModule = async (name) => {
  const modulePath = path.resolve(directories.pluginDir, name);
  const expressFile = path.resolve(modulePath, 'express.js');

  try {
    await fs.access(expressFile, fsConst.F_OK);

    const hash = await getFileHash(expressFile);
    if (_.isNil(fileHashes[expressFile])) {
      fileHashes[expressFile] = hash;
    } else if (fileHashes[expressFile] !== hash) {
      // Delete require cache
      delete require.cache[require.resolve(expressFile)];
    }

    return expressFile;
  } catch {
    return false;
  }
};

const getLanguage = async (defaultLanguage, templatePath, logger) => {
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
    logger.info('No language files available');
  }

  return i18next.init({
    lng: defaultLanguage,
    fallbackLng: Object.keys(languages),
    debug: false,
    resources: languages
  });
};

module.exports = (app, loxberryLanguage) => {
  router.use('/:name', async (req, res, next) => {
    const pluginName = req.params.name;
    const modulePath = path.resolve(directories.pluginDir, pluginName);
    const templatePath = path.resolve(directories.templateDir, pluginName);
    const languagePath = path.resolve(templatePath, 'lang');

    const niceName = pluginName
      .split('_')
      .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
      .join(' ');

    const logger = require('./Logger')(niceName);
    logger.info(`ACCESS ${req.method} ${req.url}`);

    const pluginFile = await getModule(pluginName);
    if (false === pluginFile) {
      logger.error(`Plugin "${niceName}" does not provide an express.js file.`);
      return res.status(404).send('404');
    }

    try {
      const translate = await getLanguage(loxberryLanguage, languagePath, logger);
      const handlbarsTranslate = (context, options) => {
        if (options && options.hash) {
          return translate(context, options.hash);
        }
        return translate(context);
      };
      const module = require(pluginFile);
      const plugin = module({
        router: addWsToRouter(express.Router()),
        static: express.static,
        logger: logger,
        _,
        translate
      });
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
      await plugin(req, res, next);
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
