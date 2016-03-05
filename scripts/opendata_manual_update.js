'use strict';

const co = require('co');
const logger = require('../modules').logger;
const mongooseHelper = require('../modules').mongooseHelper;
const opendata = require('../worker').opendata;
const rollbarHelper = require('../modules').rollbarHelper;

rollbarHelper.init()
  .then(() => mongooseHelper.connect())
  .then(() => {
    logger.info('[SCRIPT.opendata_manual_update] Updating Paris...');
    return co(opendata.paris.update);
  })
  .then(() => {
    logger.info('[SCRIPT.opendata_manual_update] Ended');
    process.exit(0);
  })
  .catch(err => {
    logger.error(err, '[SCRIPT.opendata_manual_update] Uncaught error');
    rollbarHelper.rollbar.handleError(err, '[SCRIPT.opendata_manual_update] Uncaught exception');
    process.exit(1);
  });
