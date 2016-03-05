'use strict';

const bluebird = require('bluebird');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const httpStatus = require('http-status-codes');
const supertest = require('supertest-as-promised');
const sinon = require('sinon');

const config = require('config');
const server = require('../server.js');

describe('[SERVER]', () => {
  describe('when there is no error', () => {
    let exitStatus;

    before(function* before() {
      sinon.stub(process, 'exit', status => {
        exitStatus = status;
      });
    });

    after(done => {
      process.exit.restore();
      done();
    });

    it('should start and shutdown without error', function* it() {
      yield server.start();

      yield supertest(`http://localhost:${config.port}`)
        .options('/search')
        .send()
        .expect(httpStatus.OK);

      yield bluebird.promisify(server.shutdown)(null);

      yield expect(supertest(`http://localhost:${config.port}`)
             .options('/search')
             .send()).to.eventually.be.rejectedWith(Error);

      expect(exitStatus).to.equal(0);
    });
  });

  describe('when there is an error', () => {
    let exitStatus;

    before(function* before() {
      sinon.stub(process, 'exit', status => {
        exitStatus = status;
      });
      sinon.stub(server.server, 'listen', () => {
        throw new Error('error to catch');
      });
    });

    after(done => {
      process.exit.restore();
      server.server.listen.restore();
      done();
    });

    it('should start and shutdown with an error', function* it() {
      yield expect(server.start()).to.eventually.be.fulfilled;

      yield expect(supertest(`http://localhost:${config.port}`)
             .options('/search')
                   .send()).to.eventually.be.rejectedWith(Error);

      expect(exitStatus).to.equal(1);
    });
  });
});
