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

module.exports = (app) => {
  router.use('/:name', async (req, res, next) => {
    const pluginName = req.params.name;
    const modulePath = path.resolve(directories.pluginDir, pluginName);
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

    const viewFolder = path.join(modulePath, '/views');

    try {
      const module = require(pluginFile);
      const plugin = module({
        router: addWsToRouter(express.Router()),
        static: express.static,
        logger: logger,
        _
      });
      app.set('views', [...app.get('views'), viewFolder]);
      await plugin(req, res, next);
    } catch (e) {
      logger.error('Something went wrong', e);
      res.status(500).send('error');
    } finally {
      app.set(
        'views',
        app.get('views').filter((p) => p !== viewFolder)
      );
    }
  });

  return router;
};
