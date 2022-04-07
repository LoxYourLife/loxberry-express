const _ = require('lodash');
const express = require('express');
const router = express.Router();
const { readJson, read, write, writeJson } = require('../lib/fileHandler');
const directories = require('../lib/directories');
const path = require('path');
const handlebars = require('handlebars');
const { exec } = require('child_process');
const configFile = path.resolve(directories.config, 'express.json');
const logFile = path.resolve(directories.logdir, 'express.log');
const errorLogFile = path.resolve(directories.logdir, 'express-error.log');

const readLog = (file) => async (req, res) => {
  const log = await read(file);
  res.setHeader('content-type', 'text/plain');
  res.send(log);
};

const validateConfig = (config) => {
  const portRegex = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
  if (!portRegex.test(_.get(config, 'expressPort'))) {
    throw { error: 'ExpressPort is not a valid port.' };
  }
  if (!portRegex.test(_.get(config, 'managerPort'))) {
    throw { error: 'ManagerPort is not a valid port.' };
  }
  if (!_.get(config, 'loglevel')) {
    throw { error: 'Loglevel are missing' };
  }
  ['info', 'debug', 'warning', 'error'].forEach((level) => {
    if (![true, false].includes(_.get(config, `loglevel.${level}`))) {
      throw { error: `Loglevel "${level}" contains a wrong value` };
    }
  });

  return {
    expressPort: _.get(config, 'expressPort'),
    managerPort: _.get(config, 'managerPort'),
    loglevel: {
      info: _.get(config, 'loglevel.info'),
      debug: _.get(config, 'loglevel.debug'),
      warning: _.get(config, 'loglevel.warning'),
      error: _.get(config, 'loglevel.error')
    }
  };
};

const executeNpm = (command) =>
  new Promise((resolve, reject) => {
    exec(`npm --prefix ${directories.bindir} run ${command}`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

const purgeLog = (file) => async (req, res) => {
  await write(file, '');
  res.json({ ok: 'ok' });
};

router.post('/plugin/:pluginName', async (req, res) => {
  _.forEach(_.keys(require.cache), (key) => delete require.cache[key]);
  res.json('ok');
});

router.get('/config', async (req, res) => {
  const config = await readJson(configFile);
  res.send(config);
});
router.post('/config', async (req, res) => {
  try {
    const previousConfig = await readJson(configFile);
    const config = validateConfig(req.body);
    await writeJson(configFile, config);

    if (previousConfig.expressPort != config.expressPort) {
      const htmlHtaccess = await read(path.resolve(__dirname, '../views/htaccess/html_htaccess'));
      await write(path.resolve(directories.htmlExpressDir, '.htaccess'), handlebars.compile(htmlHtaccess)(config));

      const htmlauthHtaccess = await read(path.resolve(__dirname, '../views/htaccess/htmlauth_htaccess'));
      await write(path.resolve(directories.htmlauthExpressDir, '.htaccess'), handlebars.compile(htmlauthHtaccess)(config));
    }

    res.send(config);

    if (previousConfig.managerPort != config.managerPort) {
      executeNpm('manager:restart');
    }
    if (previousConfig.expressPort != config.expressPort) {
      executeNpm('restart');
    }
  } catch (error) {
    res.status(400);
    res.send(error);
  }
});

router.get('/log', readLog(logFile));
router.get('/error-log', readLog(errorLogFile));
router.delete('/log', purgeLog(logFile));
router.delete('/error-log', purgeLog(errorLogFile));

module.exports = router;
