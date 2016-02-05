'use strict';

const CronJob = require('cron').CronJob;
const logger = require('../modules').logger;

function runTest() {
  logger.info('[WORKER.test] Triggered');
}

module.exports = {
  start: () => {
    logger.info('[WORKER.test] Starting');
    /* eslint no-new: 0 */
    new CronJob('00 00 00 * * *', runTest, null, true, 'Europe/Paris');
  }
};
