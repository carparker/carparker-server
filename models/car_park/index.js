'use strict';

const mongoose = require('mongoose');

const CarParkModel = mongoose.model('car_parks', require('./schema'));

module.exports = CarParkModel;
