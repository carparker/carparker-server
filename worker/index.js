'use strict';

const opendata = require('./opendata');

require('../modules').mongoose.connect()
  .then(() => {
    opendata.start();
  });
