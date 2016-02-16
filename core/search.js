'use strict';

const _ = require('lodash');
const CarPark = require('../models').CarPark;
const co = require('co');
const logger = require('../modules').logger;

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

  return sortParkings(yield formatParkings(parkings, duration, maxprice));
}

function* formatParkings(parkings, duration, maxprice) {
  const res = [];

  parkings.forEach(co.wrap(function* (parking) {
    const newpark = _.pick(parking.toObject(), ['name', 'location', 'open_hours', 'last_update']);
    newpark.price = yield findBestPrice(parking.prices, duration, maxprice);
    if (newpark.price) {
      res.push(newpark);
    }
  }));

  return res;
}

function* findBestPrice(prices, duration, maxprice) {
  const matchingPrices = _.filter(prices, price => {
    return price.duration >= duration && price.price <= maxprice;
  });
  const sortedMatchingPrices = _.sortBy(matchingPrices, ['duration', 'price']);

  return _.head(sortedMatchingPrices);
}

function sortParkings(parkings) {
  return _.sortBy(parkings, ['price.ranking', 'price.price']);
}

module.exports = {
  searchParkings
};
