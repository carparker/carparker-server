'use strict';

const bunyan = require('bunyan');
const config = require('config');

const stream = {
  level: config.log.level,
  stream: process.stdout
};

if (process.env.NODE_ENV === 'test') {
  const PrettyStream = require('bunyan-prettystream');
  const prettyStdOut = new PrettyStream();

  prettyStdOut.pipe(process.stdout);

  stream.stream = prettyStdOut;
  stream.type = 'raw';
}

const logger = bunyan.createLogger({
  name: 'carparker-server',
  streams: [stream],
  level: config.log.level,
  serializers: {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  }
});

module.exports = logger;
