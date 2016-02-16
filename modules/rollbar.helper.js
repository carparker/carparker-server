'use strict';

const config = require('config');
const rollbar = require('rollbar');

const options = {
  endpoint: config.rollbar.url,
  environment: config.rollbar.environment,
  codeVersion: config.rollbar.version,
  enabled: config.rollbar.enabled === 'true'
};

function init() {
  rollbar.init(config.rollbar.token, options);
  rollbar.handleUncaughtExceptions(config.rollbar.token, {
    exitOnUncaughtException: true
  });
}

module.exports = { rollbar, init };
