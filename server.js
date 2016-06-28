'use strict';

if (process.env.NEW_RELIC_LICENSE_KEY) require('newrelic'); // eslint-disable-line global-require

const config = require('config');
const express = require('express');
const http = require('http');
const logger = require('./modules').logger;
const mongooseHelper = require('./modules').mongooseHelper;
const rollbarHelper = require('./modules').rollbarHelper;

const app = express();
const server = http.createServer(app);

require('./routes').config(app);

function start() {
  return rollbarHelper.init()
    .then(() => mongooseHelper.connect())
    .then(() => {
      server.listen(config.port, () => {
        logger.info({ port: config.port, environment: process.env.NODE_ENV }, '[SERVER] Server started');
      });
    })
    .catch(err => shutdown(err));
}

function shutdown(err, callback) {
  if (err) {
    logger.error(err, '[SERVER] Uncaught error');
    rollbarHelper.rollbar.handleError(err, '[SERVER] Uncaught exception');
  }

  server.close(closeErr => {
    if (closeErr) {
      logger.error(closeErr, '[SERVER] Error closing the server');
      rollbarHelper.rollbar.handleError(closeErr, '[SERVER] Error closing the server');
    } else {
      logger.info('[SERVER] Server closed');
    }
    process.exit(err ? 1 : 0);
    // XXX: callback used for tests, process.exit should be stubed in the case
    if (callback) callback(closeErr);
  });
}

if (!module.parent) {
  start();
} else {
  module.exports = {
    server,
    start,
    shutdown
  };
}
