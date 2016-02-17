'use strict';

const config = require('config');
const logger = require('../modules').logger;
const rollbarHelper = require('../modules').rollbarHelper;

const invalidator = require('./invalidator');
const opendata = require('./opendata');

require('../modules').mongooseHelper.connect()
  .then(() => {
    rollbarHelper.init();

    invalidator.start();
    opendata.start();

    logger.info('[WORKER] Started');
  });

process.on('SIGTERM', () => {
  logger.info('[WORKER] Ending');
  setTimeout(process.exit, config.worker.exit_timeout);
});
