'use strict';

const _ = require('lodash');
const config = require('config');
const mongoose = require('mongoose');
const logger = require('./logger');
const rollbarHelper = require('./rollbar.helper');

mongoose.Promise = global.Promise;

function connect() {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === mongoose.STATES.connected) return resolve();

    if (!_.includes([mongoose.STATES.connected, mongoose.STATES.connecting], mongoose.connection.readyState)) {
      const db = mongoose.connection;
      db.setMaxListeners(0);    // https://github.com/Automattic/mongoose/issues/1992

      db.once('connected', resolve);
      db.once('error', reject);

      mongoose.connect(config.db.url);
    }
  });
}

function waitConnection() {
  return new Promise(resolve => {
    if (mongoose.connection.readyState === mongoose.STATES.connected) return resolve();
    mongoose.connection.once('connected', resolve);
  });
}

function disconnect() {
  return new Promise(resolve => {
    if (!_.includes([mongoose.STATES.disconnecting, mongoose.STATES.disconnected], mongoose.connection.readyState)) {
      mongoose.connection.once('disconnected', resolve);
      mongoose.disconnect();
    }
  });
}

function dropDatabase() {
  return mongoose.connection.db.dropDatabase();
}

mongoose.connection.on('open', () => logger.info('Connection established to database'));
mongoose.connection.on('error', err => {
  logger.error(err, 'Cannot connect to database');
  rollbarHelper.rollbar.handleError(err, '[modules.mongoose] Mongoose connection error');
  connect();
});
mongoose.connection.on('disconnected', () => logger.info('Disconnected from database'));

module.exports = { mongoose, connect, waitConnection, disconnect, dropDatabase };
