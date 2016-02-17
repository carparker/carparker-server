'use strict';

const config = require('config');
const logger = require('../modules').logger;
const rollbarHelper = require('../modules').rollbarHelper;

const invalidator = require('./invalidator');
const opendata = require('./opendata');

function shutdown() {
  logger.info('[WORKER] Ending');
  setTimeout(process.exit, config.worker.exit_timeout);
}

if (!module.parent) {
  require('../modules').mongooseHelper.connect()
    .then(() => rollbarHelper.init())
    .then(() => {
      invalidator.start();
      opendata.start();

      logger.info('[WORKER] Started');
    })
    .catch(err => {
      logger.error(err, '[WORKER] Uncaught error');
      rollbarHelper.rollbar.handleError(err, '[WORKER] Uncaught exception');
      shutdown();
    });

  process.on('SIGTERM', shutdown);
}

module.exports = {
  opendata
};
