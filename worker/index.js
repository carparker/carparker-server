'use strict';

const config = require('config');
const logger = require('../modules').logger;

const invalidator = require('./invalidator');
const opendata = require('./opendata');

require('../modules').mongooseHelper.connect()
  .then(() => {
    invalidator.start();
    opendata.start();

    logger.info('[WORKER] Started');
  });

process.on('SIGTERM', () => {
  logger.info('[WORKER] Ending');
  setTimeout(process.exit, config.worker.exit_timeout);
});
