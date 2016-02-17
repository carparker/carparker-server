'use strict';

if (process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

const express = require('express');
const logger = require('./modules').logger;
const mongooseHelper = require('./modules').mongooseHelper;
const rollbarHelper = require('./modules').rollbarHelper;

const server = express();

require('./routes').config(server);

rollbarHelper.init()
  .then(() => mongooseHelper.connect())
  .then(() => {
    const listener = server.listen(server.get('port'), () => {
      logger.info({ port: listener.address().port, environment: process.env.NODE_ENV }, '[SERVER] Server started');
    });
  })
  .catch(err => {
    logger.error(err, '[SERVER] Uncaught error');
    rollbarHelper.rollbar.handleError(err, '[SERVER] Uncaught exception');
    process.exit(1);
  });
