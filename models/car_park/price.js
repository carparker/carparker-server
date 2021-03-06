'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PriceSchema = new Schema({
  duration: { type: Number, index: true },
  price: { type: Number, index: true },
  ranking: { type: Number, min: 0, max: 2 }
}, { _id: false });

module.exports = {
  PriceSchema
};
