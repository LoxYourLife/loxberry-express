process.env.NODE_ENV = '/opt/loxberry' === process.env.HOME ? 'production' : 'development';

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const logger = require('./lib/Logger')('Express');
const plugins = require('./lib/plugins');
const path = require('path');
const exphbs = require('express-handlebars');
const createLayout = require('./lib/createLayout');
const { onUpgrade } = require('./lib/webSocket');
const directories = require('./lib/directories');

const createServer = async () => {
  await createLayout();
  const app = express();

  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization');
    next();
  });

  app.use(fileUpload({ createParentPath: true }));
  app.use(bodyParser.json());
  app.engine(
    '.hbs',
    exphbs({
      extname: '.hbs',
      layoutsDir: path.resolve('./', 'views/layouts')
    })
  );
  app.set('view engine', '.hbs');

  app.set('views', [path.resolve('./', 'views')]);
  app.use('/plugins', plugins(app));
  app.use('/system', express.static(path.resolve(directories.homedir, 'webfrontend/html/system')));

  app.get('*', (req, res, next) => {
    if (req.ws) return next();
    logger.info(`ACCESS 404 ${req.method} ${req.url}`);
    res.status(404);
  });

  const server = app.listen(3000, '0.0.0.0', () => {
    logger.info(`LoxBerry Express Server listening at http://localhost:3000`);
  });

  server.on('upgrade', onUpgrade(app));
};

createServer();
