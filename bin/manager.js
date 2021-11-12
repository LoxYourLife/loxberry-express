process.env.NODE_ENV === ('/opt/loxberry' === process.env.HOME) ? 'production' : 'development';

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const logger = require('./lib/Logger')('ExpressManager');
const Pm2Manager = require('./lib/Pm2Manager');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const clients = new Set();
const pm2Manager = new Pm2Manager(clients);

wss.on('connection', (ws) => {
  pm2Manager.startTelemetryInterval();
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
    pm2Manager.stopTelemetryInterval();
  });

  ws.on('message', (message) => {
    logger.debug(`received Message: ${message}`);
    try {
      const data = JSON.parse(message);
      if (data.command) {
        pm2Manager.handleCommand(data.command);
      }
    } catch (e) {
      logger.error('recevied something else than json', e);
    }
  });
});

server.listen(process.env.PORT || 3001, () => {
  logger.info(`Express Manager on port ${server.address().port} :)`);
});
