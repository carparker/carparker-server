'use strict';

const _ = require('lodash');
const CarPark = require('../models').CarPark;
const overAveragePercentage = 10;
const rankings = {
    GREEN: {value: 0, name: "Green"},
    ORANGE: {value: 1, name: "Orange"},
    RED: {value: 2, name: "Red"}
}

function computeGreenRankingLimit(average) {
    return average;
}

function computeOrangeRankingLimit(average) {
    return average + average * overAveragePercentage / 100;
}

function selectTag(greenRankingLimit, orangeRankingLimit, price) {
    if (price < greenRankingLimit)
	return rankings.GREEN;
    if (price < orangeRankingLimit)
	return rankings.ORANGE;
    return rankings.RED;
}

function updateRanking(carParks) {
    const averages = [];
    const prices = [];
    for (const carPark of carParks) {
	prices = prices.concat(carPark.prices);
    }
    // Sets price averages
    _.groupby(prices, duration)).forEach(function(key, values) {
	averages[key] = _.sum(values) / values.length;
    });

    // Computes ranking
    for (const carPark of carParks) {
	_.map(carPark.prices, price => {
	    const greenRankingLimit = computeGreenRankingLimit(averages[price.duration]);
	    const orangeRankingLimit = computeOrangeRankingLimit(averages[price.duration]);
	    price.ranking = selectTag(greenRankingLimit, orangeRankingLimit, price.price).value;
	});
    }
}

module.exports = {
    updateRanking
};
