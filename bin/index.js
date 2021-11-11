const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const plugins = require('./lib/plugins');

const createServer = async () => {
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Cache-control, Accept, Authorization');
    next();
  });

  app.use(fileUpload({ createParentPath: true }));
  app.use(bodyParser.json());

  app.use('/plugins', plugins());

  app.get('*', (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.send('ok');
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log(`loxberry express server listening at http://localhost:3000`);
  });
};

createServer();
