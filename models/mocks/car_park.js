'use strict';

const _ = require('lodash');

function base(fields) {
  fields = fields || {};

  const park = {
    name: String,
    location: {
      address: String,
      postcode: String,
      city: String,
      country: String,
      coordinates: [0, 1]
    },

    open_hours: {
      open: 0,
      close: 1440
    },

    prices: [{
      duration: 15,
      price: 1.5,
      ranking: 0
    }, {
      duration: 30,
      price: 3,
      ranking: 0
    }],

    last_update: Date.now(),
    outdated: false
  };

  return _.merge(park, fields);
}

module.exports = base;
