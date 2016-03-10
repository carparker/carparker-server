'use strict';

const Joi = require('joi');

const searchBodySchema = Joi.object().keys({
  position: Joi.object().keys({
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
  }),
  address: Joi.string().allow(''),
  radius: Joi.number().positive().required(),
  price: Joi.object().required().keys({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(Joi.ref('min')).required()
  }),
  duration: Joi.object().required().keys({
    min: Joi.number().positive().required()
  })
}).xor('position', 'address');

module.exports = searchBodySchema;
