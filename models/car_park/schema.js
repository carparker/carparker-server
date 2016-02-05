'use strict';

const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();
const Schema = mongoose.Schema;

const CarParkSchema = new Schema({
  name: { type: String, required: true },
  location: {
    address: String,
    postcode: String,
    city: String,
    country: String,
    coordinates: { type: [Number], index: '2dsphere' }
  },

  price: [{
    duration: Number,
    price: Number
  }],
  ranking: Number,

  last_update: { type: Date, required: true }
});

// TODO: complete that depending on the db queries
// CarParkSchema.index({});

CarParkSchema.plugin(mongooseHidden);

module.exports = CarParkSchema;
