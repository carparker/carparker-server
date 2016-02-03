'use strict';

const bunyan = require('bunyan');
const config = require('config');

const logger = bunyan.createLogger({
  name: 'carparker-server',
  stream: process.stdout,
  level: config.log.level,
  serializers: {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  }
});

module.exports = logger;
