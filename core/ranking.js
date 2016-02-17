'use strict';

const _ = require('lodash');

const rankings = {
  GREEN: 0,
  ORANGE: 1,
  RED: 2
};

function computeGreenRankingLimit(average) {
  return average || 0;
}

function computeOrangeRankingLimit(average) {
  const overAveragePercentage = 10;
  return average ? average + average * overAveragePercentage / 100 : 0;
}

function selectTag(greenRankingLimit, orangeRankingLimit, price) {
  if (price < greenRankingLimit) return rankings.GREEN;
  if (price < orangeRankingLimit) return rankings.ORANGE;
  return rankings.RED;
}

function updateRanking(carParks) {
  const prices = _.reduce(carParks, (result, carPark) => {
    Array.prototype.push.apply(result, carPark.prices);
    return result;
  }, []);

  const averages = _.reduce(_.groupBy(prices, 'duration'), (result, pricesForDuration, duration) => {
    result[duration] = _.reduce(pricesForDuration, (sum, price) => sum + price.price, 0) / pricesForDuration.length;
    return result;
  }, {});

  for (const carPark of carParks) {
    /* eslint no-loop-func: 0 */
    carPark.prices = _.map(carPark.prices, price => {
      const greenRankingLimit = computeGreenRankingLimit(averages[price.duration]);
      const orangeRankingLimit = computeOrangeRankingLimit(averages[price.duration]);
      price.ranking = selectTag(greenRankingLimit, orangeRankingLimit, price.price);
      return price;
    });
  }

  return carParks;
}

module.exports = {
  updateRanking
};
