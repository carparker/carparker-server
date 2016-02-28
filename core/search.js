'use strict';

const _ = require('lodash');
const CarPark = require('../models').CarPark;
const forEach = require('co-foreach');
const logger = require('../modules').logger;

function* searchParkings(request) {
  if (request.position) {
    return yield searchParkingsGeo(request.position.latitude, request.position.longitude, request.radius,
                                   request.duration.min, request.price.max);
  } else if (request.address) {
    return yield searchParkingsText(request.address, request.duration.min, request.price.max);
  }

  logger.error({ request }, '[SERVER.core.search] Invalid request: missing position or address');
  throw new Error('invalid parking research');
}

function* searchParkingsGeo(latitude, longitude, radius, duration, maxprice) {
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

  return sortParkings(yield formatParkings(_.map(parkings, parking => parking.toObject()),
                                           duration, maxprice));
}

function* searchParkingsText(pattern, duration, maxprice) {
  const reg = new RegExp(pattern, 'i');

  const parkings = yield CarPark.find({
    'prices.duration': { $gte: duration },
    'prices.price': { $lte: maxprice },
    $or: [
      { name: reg },
      { 'location.address': reg },
      { 'location.postcode': reg },
      { 'location.city': reg },
      { 'location.country': reg }
    ],
    outdated: false
  });

  return sortParkings(yield formatParkings(_.map(parkings, parking => parking.toObject()),
                                           duration, maxprice));
}

function* formatParkings(parkings, duration, maxprice) {
  const res = [];

  return forEach(parkings, function* each(parking) {
    const newpark = _.pick(parking, ['name', 'location', 'open_hours', 'last_update']);
    newpark.price = yield findBestPrice(parking.prices, duration, maxprice);
    if (!newpark.price) {
      return;
    }

    res.push(newpark);
  })
    .then(() => new Promise(resolve => resolve(res)));
}

function* findBestPrice(prices, duration, maxprice) {
  const matchingPrices = _.filter(prices, price => price.duration >= duration && price.price <= maxprice);
  const sortedMatchingPrices = _.sortBy(matchingPrices, ['duration', 'price']);

  return _.head(sortedMatchingPrices) || null;
}

function sortParkings(parkings) {
  return _.sortBy(parkings, ['price.ranking', 'price.price', 'location.distance']);
}

module.exports = {
  searchParkings,
  searchParkingsGeo,
  searchParkingsText,

  formatParkings,
  findBestPrice,
  sortParkings
};
