process.env.NODE_ENV = '/opt/loxberry' === process.env.HOME ? 'production' : 'development';

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { engine } = require('express-handlebars');
const getLayout = require('./lib/loxberry/getLayout');
const { onUpgrade } = require('./lib/webSocket');
const directories = require('./lib/directories');
const loxberry = require('./lib/loxberry')('express');
const configFile = path.resolve(directories.config, 'express.json');
const config = require(configFile);

const logger = require('./lib/Logger')('Express', config);
const plugins = require('./endpoints/plugins');
const system = require('./endpoints/system');

fs.watch(configFile, {}, () => {
  delete require.cache[require.resolve(configFile)];
  try {
    const newConfig = require(configFile);
    Object.assign(config, newConfig);
    logger.loglevel = newConfig.loglevel;
  } catch {
    // ignore
  }
});

const accessControl = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization');
  next();
};

const notFound = (req, res, next) => {
  if (req.ws) return next();
  logger.info(`ACCESS 404 ${req.method} ${req.url}`);
  res.status(404);
  res.end();
};

const createServer = async () => {
  await getLayout(logger);
  let language = 'en';
  try {
    language = await loxberry.system.getLanguage();
  } catch {
    logger.debug('Unable to fetch Loxberry system language. Falling back to EN');
  }

  const app = express();

  app.use(accessControl);
  app.use(fileUpload({ createParentPath: true }));
  app.use(express.json());

  const handlebars = engine({ extname: '.hbs', layoutsDir: path.resolve('./', 'views/layouts') });
  app.engine('.hbs', handlebars);
  app.set('view engine', '.hbs');
  app.set('views', [path.resolve('./', 'views')]);

  app.use('/plugins', plugins({ app, language, config, auth: false }));
  app.use('/auth/plugins', plugins({ app, language, config, auth: true }));

  app.use('/auth/system', system);

  app.get('*', notFound);

  const server = app.listen(config.expressPort, '0.0.0.0', () => {
    logger.info(`LoxBerry Express Server listening at http://localhost:${config.expressPort}}`);
  });

  server.on('upgrade', onUpgrade(app));
};

createServer();
