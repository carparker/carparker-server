var mongoose = require('mongoose');

var CarParkModel = mongoose.model('car_parks', require('./schema'));

module.exports.CarParkModel = CarParkModel;
