const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsConst = require('fs').constants;
const path = require('path');
const directories = require('./directories');

const getModule = async (name) => {
  const modulePath = path.resolve(directories.pluginDir, name);
  const expressFile = path.resolve(modulePath, 'express.js');

  try {
    await fs.access(expressFile, fsConst.F_OK);
    delete require.cache[require.resolve(expressFile)];
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
        router: express.Router(),
        static: express.static
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
