const express = require('express');
const router = express.Router();
const pm2 = require('pm2');
const expressConfig = require('../express.config');
const { spawn } = require('child_process');

const defineRoutes = () => {
  router.get('/telemetry', async (req, res) => {
    pm2.describe(expressConfig[0].name, (err, data) => {
      if (err !== null) return res.send({ error: err });
      res.send(data[0]);
    });
  });

  router.get('/logs', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders();

    const logReader = spawn('tail', ['-n', '200', '-f', expressConfig[0].out_file]);
    logReader.stdout.on('data', (data) => {
      data
        .toString()
        .split('\n')
        .forEach((message) => {
          res.write(JSON.stringify({ date: new Date(), message }) + '\n');
        });
    });

    logReader.on('close', () => {
      res.close();
    });
  });

  return router;
};

module.exports = defineRoutes();
