'use strict';

const _ = require('lodash');

const fieldMap = require('./paris.json');

function applyFixes(parkData) {
  for (const fix of fieldMap.fixes) {
    if (_.isMatch(parkData, fix.condition)) {
      _.merge(parkData, fix.fix);
    }
  }
}

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

    open_hours: { open: 0, close: 1440 },

    prices: [],

    last_update: new Date(),
    outdated: false
  };

  if (_.isArray(park.xy) && park.xy.length === 2) {
    parkData.location.coordinates = [park.xy[1], park.xy[0]];
  }

  parkData.open_hours = fieldMap.opening[park.horaires_ouvertures_pour_les_usagers_non_abonnes] || parkData.open_hours;

  _.forEach(fieldMap.price, (value, key) => {
    if (park[key]) {
      parkData.prices.push({
        duration: value,
        price: parseFloat(park[key].slice(0, -2).replace(',', '.'))
      });
    }
  });

  applyFixes(parkData);

  return parkData;
};
