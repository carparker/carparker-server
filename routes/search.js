'use strict';

const httpStatus = require('http-status-codes');
const Joi = require('joi');
const logger = require('../modules').logger;

const searchSchema = require('./schema').search;

function search(req, res, next) {
  const validation = Joi.validate(req.body, searchSchema);
  logger.debug({ body: req.body, validation }, '[SERVER.routes.search] Body validation');

  if (validation.error) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  } else {
    res.status(httpStatus.OK).send('OK');
  }
  next();
}

module.exports = (server) => server.post('/search', search);
