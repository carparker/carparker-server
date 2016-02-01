'use strict';

const CronJob = require('cron').CronJob;

function runTest() {
  console.log('[WORKER.test] Triggered');
}

module.exports = {
  start: () => {
    console.log('[WORKER.test] Starting');
    new CronJob('00 00 00 * * *', runTest, null, true, 'Europe/Paris');
  }
};
