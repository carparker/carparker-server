'use strict';

if (process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

const express = require('express');
const logger = require('./modules').logger;

const rollbarHelper = require('./modules').rollbarHelper;
rollbarHelper.init();

const server = express();

require('./routes').config(server);

require('./modules').mongooseHelper.connect()
  .then(() => {
    const listener = server.listen(server.get('port'), () => {
      logger.info(`Server started on port ${listener.address().port} in ${process.env.NODE_ENV} environment`);
    });
  });
