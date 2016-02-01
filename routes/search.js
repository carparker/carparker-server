'use strict';

function search(req, res, next) {
  // TODO: Joi validation
  res.send('OK');
  next();
}

module.exports = (server) => server.post('/search', search);
