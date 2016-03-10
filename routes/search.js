'use strict';

const co = require('co');
const httpStatus = require('http-status-codes');
const Joi = require('joi');

const logger = require('../modules').logger;
const searchSchema = require('./schema').search;
const searchParkings = require('../core').search.searchParkings;

function search(req, res) {
  const validation = Joi.validate(req.body, searchSchema);
  logger.debug({ body: req.body, validation }, '[SERVER.routes.search] Body validation');

  if (validation.error) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  } else {
    co.wrap(searchParkings)(req.body)
      .then(parkings => {
        logger.debug({ req: req.body, parkings }, '[SERVER.routes.search] Sending response');
        res.status(httpStatus.OK).send({ parkings });
      })
      .catch(err => {
        logger.error(err, '[SERVER.routes.search] Error');
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
      });
  }
}

module.exports = (server) => server.post('/search', search);
