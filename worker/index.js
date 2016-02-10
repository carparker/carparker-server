'use strict';

const opendata = require('./opendata');

require('../modules').mongooseHelper.connect()
  .then(() => {
    opendata.start();
  });
