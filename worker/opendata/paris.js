'use strict';

const co = require('co');
const config = require('config');
const CronJob = require('cron').CronJob;
const superagent = require('superagent');
const Promise = require('bluebird');
const logger = require('../../modules').logger;
// const CarPark = require('../../models').CarPark;

Promise.promisifyAll(superagent.Request.prototype);

function* _update() {
  logger.info('[WORKER.opendata.paris] Starting');

  // const data = yield superagent.get('http://opendata.paris.fr/api/records/1.0/search/?dataset=parcs-de-stationnement-concedes-de-la-ville-de-paris&facet=arrdt&facet=delegataire&facet=type_de_parc&facet=horaires_ouvertures_pour_les_usagers_non_abonnes&facet=ascenseur_debouchant_en_surface&facet=acces_motos&facet=acces_velos&facet=station_autopartage')
  const data = yield superagent.get('http://opendata.paris.fr/api/records/1.0/search/?dataset=parcs-de-stationnement-concedes-de-la-ville-de-paris&facet=arrdt&facet=delegataire&facet=type_de_parc&refine.type_de_parc=Mixte')
          .timeout(config.worker.opendata.timeout)
          .send()
          .endAsync();

  if (!data || !data.text) {
    return logger.error({ data }, '[WORKER.opendata.paris] Invalid data');
  }

  logger.info({ data: JSON.parse(data.text) }, `[WORKER.opendata.paris] received data`);
  try {
    const res = JSON.parse(data.text);

    if (!res || !res.nhits || !res.records) {
      return logger.warn();            // TODO
    }

    res.records.forEach((park) => {
      logger.debug({ park }, 'Adding parking to database');
      // TODO: Map data
    });
  } catch (err) {
    return logger.warn({ err }, '[WORKER.opendata.paris] Error processing data');
  }

  logger.info('[WORKER.opendata.paris] Ended');
}

module.exports = {
  start: () => {
    logger.info('[WORKER.opendata.paris] Starting');
    /* eslint no-new: 0 */ /* Every monday at 4AM */
    new CronJob('00 00 04 * * 0', co(_update), null, true, 'Europe/Paris');
  }
};
