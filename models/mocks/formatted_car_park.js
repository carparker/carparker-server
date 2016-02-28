'use strict';

const _ = require('lodash');
const faker = require('faker');

faker.locale = 'fr';

function base(fields) {
  fields = fields || {};

  const park = {
    name: faker.company.companyName(),
    location: {
      address: faker.address.streetAddress(),
      postcode: faker.address.zipCode(),
      city: faker.address.city(),
      country: faker.address.country(),
      coordinates: [parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())]
    },

    open_hours: {
      open: 0,
      close: 1440
    },

    price: {
      duration: 15,
      price: 1.5,
      ranking: 0
    },

    last_update: new Date()
  };

  return _.merge(park, fields);
}

module.exports = base;
