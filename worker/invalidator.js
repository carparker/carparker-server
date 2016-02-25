'use strict';

const co = require('co');
const CarPark = require('../models').CarPark;
const CronJob = require('cron').CronJob;
const logger = require('../modules').logger;
const moment = require('moment');
const rollbarHelper = require('../modules').rollbarHelper;

function *invalidate() {
  logger.info('[WORKER.invalidator] Triggered');

  try {
    const response = yield CarPark.update({
      last_update: { $lt: moment().subtract(2, 'weeks') },
      outdated: false
    }, {
      outdated: true
    });
    logger.info({ nbUpdated: response.nModified }, '[WORKER.invalidator] Updated parkings');
  } catch (err) {
    logger.error(err, '[WORKER.invalidator] Uncaught exception');
    rollbarHelper.rollbar.handleError(err, '[WORKER.invalidator] Uncaught exception');
  }

  logger.info('[WORKER.invalidator] Ended');
}

module.exports = {
  start: () => {
    logger.info('[WORKER.invalidator] Starting');
    /* eslint no-new: 0 */ /* Everyday at 4.30AM */
    new CronJob('00 30 04 * * *', co.wrap(invalidate), null, true, 'Europe/Paris');
  },

  invalidate
};
