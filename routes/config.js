'use strict';

const bodyParser = require('body-parser');
const config = require('config');

function configServer(server) {
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  server.set('port', config.port);

  require('./search')(server);
}

module.exports = configServer;
