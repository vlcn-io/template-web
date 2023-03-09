#!/usr/bin/env node

import express from 'express';

import { Connection, logger } from '@vlcn.io/server-core';
import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketWrapper } from '@vlcn.io/server-websocket';
import * as http from 'http';
import { IncomingMessage } from 'node:http';

const config = {
  dbDir: './dbs',
  schemaDir: '../shared/schemas',
  maxOutstandingAcks: 10,
};

const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, request) => {
  logger.info('info', `established ws connection`, {
    event: 'main.establish',
  });

  new Connection(config, new WebSocketWrapper(ws));
});

function authenticate(req: IncomingMessage, cb: (err: any) => void) {
  // TODO: for you to implement authentication of the user
  const authHeader = req.headers['sec-websocket-protocol'] || '';
  const authToken = authHeader.split(', ')[1];
  cb(null);
}

server.on('upgrade', (request, socket, head) => {
  logger.info('upgrading to ws connection', {
    event: 'main.upgrade',
  });
  authenticate(request, (err) => {
    if (err) {
      logger.error('failed to authenticate ' + err.message, {
        event: 'auth',
      });
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
});

server.listen(port, () => logger.log('info', `listening on port ${port}!`));
