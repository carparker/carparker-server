'use strict';

const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();
const Schema = mongoose.Schema;

const PriceSchema = require('./price').PriceSchema;

const CarParkSchema = new Schema({
  name: { type: String, required: true },
  location: {
    address: String,
    postcode: String,
    city: String,
    country: String,
    coordinates: { type: [Number], index: '2dsphere' }
  },

  open_hours: {
    open: { type: Number, min: 0, max: 1440 },
    close: { type: Number, min: 0, max: 1440 }
  },

  prices: [PriceSchema],

  last_update: { type: Date, required: true },
  outdated: { type: Boolean, default: false }
});

// TODO: complete that depending on the db queries
// CarParkSchema.index({});

CarParkSchema.plugin(mongooseHidden);

module.exports = CarParkSchema;
