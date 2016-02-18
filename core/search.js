'use strict';

const _ = require('lodash');
const CarPark = require('../models').CarPark;
const co = require('co');
const geolib = require('geolib');

function* searchParkings(latitude, longitude, radius, duration, maxprice) {
  const parkings = yield CarPark.find({
    'prices.duration': { $gte: duration },
    'prices.price': { $lte: maxprice },
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius
      }
    },
    outdated: false
  });

  return sortParkings(yield formatParkings(parkings.toObject(), latitude, longitude, duration, maxprice));
}

function* formatParkings(parkings, latitude, longitude, duration, maxprice) {
  const res = [];

  parkings.forEach(co.wrap(function* each(parking) {
    const newpark = _.pick(parking, ['name', 'location', 'open_hours', 'last_update']);
    newpark.price = yield findBestPrice(parking.prices, duration, maxprice);
    if (!newpark.price) {
      return;
    }

    newpark.location.distance = getDistance({
      latitude,
      longitude
    }, {
      latitude: newpark.location.coordinates[1],
      longitude: newpark.location.coordinates[0]
    });
    res.push(newpark);
  }));

  return res;
}

function* findBestPrice(prices, duration, maxprice) {
  const matchingPrices = _.filter(prices, price => price.duration >= duration && price.price <= maxprice);
  const sortedMatchingPrices = _.sortBy(matchingPrices, ['duration', 'price']);

  return _.head(sortedMatchingPrices) || null;
}

function getDistance(pos1, pos2) {
  return geolib.getDistance(pos1, pos2, 1, 1);
}

function sortParkings(parkings) {
  return _.sortBy(parkings, ['price.ranking', 'price.price', 'location.distance']);
}

module.exports = {
  searchParkings,

  formatParkings,
  findBestPrice,
  getDistance,
  sortParkings
};
