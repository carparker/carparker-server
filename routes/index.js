'use strict';

const expressConfig = require('./config');
const searchRoutes = require('./search');

module.exports = {
  config: expressConfig,

  /* exported for tests */
  search: searchRoutes
};
