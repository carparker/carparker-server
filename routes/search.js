'use strict';

/**
{
  position: {
    latitude: Number,
    longitude: Number
  },
  address: String,
  radius: Number,
  price: {
    min: Number,
    max: Number
  },
  duration: {
    min: Number
  }
}
 */

function search(req, res, next) {
  // TODO: Joi validation
  // https://github.com/hapijs/joi
  res.send('OK');
  next();
}

module.exports = (server) => server.post('/search', search);
