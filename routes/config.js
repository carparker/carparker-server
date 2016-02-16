'use strict';

const bodyParser = require('body-parser');
const config = require('config');
const rollbarHelper = require('../modules').rollbarHelper;

function configServer(server) {
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  server.set('port', config.port);

  require('./search.js')(server);

  server.use(rollbarHelper.rollbar.errorHandler(config.rollbar.token, rollbarHelper.options));
}

module.exports = configServer;
