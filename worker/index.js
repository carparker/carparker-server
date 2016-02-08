'use strict';

const test = require('./test');
const opendata = require('./opendata');

require('../modules').mongoose.connect()
  .then(() => {
    test.start();
    opendata.start();
  });
