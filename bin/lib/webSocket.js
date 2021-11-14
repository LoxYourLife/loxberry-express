const WebSocket = require('ws');
const http = require('http');
const _ = require('lodash');

const websockets = {};

const onUpgrade = (app) => (req, sock, head) => {
  if (_.get(req, 'headers.upgrade', '').toLowerCase() !== 'websocket') {
    return sock.destroy();
  }

  req.url = wsUrl(req.url);
  req.wsHandled = false;
  if (!websockets[req.url]) {
    websockets[req.url] = new WebSocket.Server({ noServer: true });
  }

  websockets[req.url].handleUpgrade(req, sock, head, (websocket) => {
    req.ws = websocket;
    websocket.on('close', () => {
      if (websockets[req.url].clients.size === 0) {
        delete websockets[req.url];
      }
    });

    app.handle(req, new http.ServerResponse(req), () => {
      if (!req.wsHandled) {
        sock.destroy();
      } else {
        websocket.emit('open');
      }
    });
  });
};

const wsUrl = (url) => {
  if (url.indexOf('?') > -1) {
    return url.replace('?', '.ws?');
  }
  return `${url}.ws`;
};

const addWsToRouter = (router) => {
  router.ws = (route, handler) => {
    const wsRoute = wsUrl(route);
    router.get(wsRoute, (req, res, next) => {
      if (_.isNil(req.ws)) {
        return next();
      }

      req.wsHandled = true;
      try {
        handler(req.ws, req, () => {});
        next();
      } catch (error) {
        next(error);
      }
    });
  };
  return router;
};

module.exports = {
  onUpgrade,
  wsUrl,
  addWsToRouter
};
