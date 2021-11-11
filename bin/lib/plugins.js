const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsConst = require('fs').constants;
const path = require('path');
const directories = require('./directories');

const getModule = async (name) => {
  const modulePath = path.resolve(directories.plugindir, name);
  const expressFile = path.resolve(modulePath, 'express.js');

  try {
    await fs.access(expressFile, fsConst.F_OK);
    delete require.cache[require.resolve(expressFile)];
    return require(expressFile);
  } catch {
    return false;
  }
};

module.exports = () => {
  router.use('/:name', async (req, res, next) => {
    const pluginName = req.params.name;
    const plugin = await getModule(pluginName);

    if (false === plugin) {
      return res.status(404).send('404');
    }
    try {
      return plugin(req, res, next);
    } catch (e) {
      console.error(e);
    }
  });

  return router;
};
