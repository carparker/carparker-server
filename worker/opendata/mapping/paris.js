'use strict';

const _ = require('lodash');
const logger = require('../../../modules').logger;

const priceMap = require('./paris.json');

module.exports = (park) => {
  const arrdt = `0${park.arrdt}`.slice(-2);

  const parkData = {
    name: park.nom_du_parc_de_stationnement,
    location: {
      address: park.adresse,
      postcode: `750${arrdt}`,
      city: 'Paris',
      country: 'France'
    },

    // TODO: map opening hours
    //  -> update mapping json like: `{ 24h/24: { open: 0, close: 1440 } }`
    // park.horaires_ouvertures_pour_les_usagers_non_abonnes

    prices: [],

    last_update: new Date()
  };

  if (_.isArray(park.xy) && park.xy.length === 2) {
    parkData.location.coordinates = [park.xy[1], park.xy[0]];
  }

  for (const price in priceMap) {
    if (park[price]) {
      parkData.prices.push({
        duration: priceMap[price],
        price: parseFloat(park[price].slice(0, -2).replace(',', '.'))
      });
    }
  }

  return parkData;
};
