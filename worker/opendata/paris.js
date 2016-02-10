'use strict';

const _ = require('lodash');
const co = require('co');
const config = require('config');
const CronJob = require('cron').CronJob;
const superagent = require('superagent');
const Promise = require('bluebird');
const logger = require('../../modules').logger;
const parkUpdater = require('./park_updater');

const mapper = require('./mapping/paris.js');

Promise.promisifyAll(superagent.Request.prototype);

function* _update() {
  logger.info('[WORKER.opendata.paris] Triggered');

  const data = yield superagent.get(config.worker.opendata.paris.url)
          .timeout(config.worker.opendata.timeout)
          .send()
          .endAsync();

  if (!data || !data.text) {
    return logger.error({ data }, '[WORKER.opendata.paris] Invalid data');
  }

  try {
    const body = JSON.parse(data.text);

    logger.debug({ body }, `[WORKER.opendata.paris] received data`);
    if (!body || !body.nhits || !body.records) {
      return logger.warn({ data, body }, '[WORKER.opendata.paris] Invalid resilt from data');
    }

    const parks = [];

    body.records.forEach((park) => {
      const newpark = mapper(park.fields);
      logger.info({ parking: newpark }, 'PARKING');
      parks.push(newpark);
    });

    // TODO: apply ranking on prices
    for (const park of parks) {
      _.map(park.prices, price => {
        price.ranking = 0;
        return price;
      });
    }

    logger.info({ parkings: parks }, '[WORKER.opendata.paris] Updating parkings');
    yield parkUpdater(parks);
  } catch (err) {
    logger.warn({ err }, '[WORKER.opendata.paris] Error processing data');
  }

  return logger.info('[WORKER.opendata.paris] Ended');
}

module.exports = {
  start: () => {
    logger.info('[WORKER.opendata.paris] Starting');
    /* eslint no-new: 0 */ /* Every monday at 4AM */
    new CronJob('00 00 04 * * 0', co(_update), null, true, 'Europe/Paris');
  }
};
