'use strict';

const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const expressBunyanLogger = require('express-bunyan-logger');
const rollbarHelper = require('../modules').rollbarHelper;

const searchRoutes = require('./search');

function configServer(server) {
  server.use(cors());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  if (config.log.requests === 'true') {
    server.use(expressBunyanLogger());
  }

  /* setup routes */
  searchRoutes(server);

  server.use(rollbarHelper.rollbar.errorHandler(config.rollbar.token, rollbarHelper.options));
}

module.exports = configServer;
