'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const co = require('co');
const moment = require('moment');
const sinon = require('sinon');

const models = require('../../models');
const CarPark = models.CarPark;
const carParkMock = models.mocks.CarPark;
const mongooseHelper = require('../../modules').mongooseHelper;
const rollbarHelper = require('../../modules').rollbarHelper;
const invalidate = require('../../worker').invalidator.invalidate;

describe('[WORKER] Invalidator', () => {
  before(function* before() {
    yield mongooseHelper.connect();
    yield mongooseHelper.dropDatabase();
    yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });
  });
  after(mongooseHelper.disconnect);

  describe('when there are no outdated parkings', () => {
    let parking;

    before(function* before() {
      parking = yield new CarPark(carParkMock({ last_update: new Date(), outdated: false })).save();
    });

    it('should not update them', function* it() {
      yield invalidate();

      const sameParking = yield CarPark.findOne({ _id: parking._id });
      expect(sameParking.toObject()).to.deep.equal(parking.toObject());
    });
  });

  describe('when there are only already outdated parkings', () => {
    let parking;

    before(function* before() {
      parking = yield new CarPark(carParkMock({ outdated: true })).save();
    });

    it('should not update them', function* it() {
      yield invalidate();

      const sameParking = yield CarPark.findOne({ _id: parking._id });
      expect(sameParking.toObject()).to.deep.equal(parking.toObject());
    });
  });

  describe('when there are outdated parkings', () => {
    let parking;

    before(function* before() {
      parking = yield new CarPark(carParkMock({ last_update: moment().subtract(3, 'weeks'), outdated: false })).save();
    });

    it('should update them', function* it() {
      yield invalidate();

      const updatedParking = yield CarPark.findOne({ _id: parking._id });
      expect(updatedParking.toObject()).to.not.deep.equal(parking.toObject());
      expect(updatedParking.outdated).to.equal(true);
    });
  });

  describe('when there is an exception', () => {
    let exceptionHappened = false;

    before(function* before() {
      sinon.stub(CarPark, 'update', () => {
        throw new Error('update error');
      });
      sinon.stub(rollbarHelper.rollbar, 'handleError', () => {
        exceptionHappened = true;
      });
    });

    after(done => {
      CarPark.update.restore();
      rollbarHelper.rollbar.handleError.restore();
      done();
    });

    it('should catch it and return', function* it() {
      /* eslint no-unused-expressions: 0 */
      yield expect(co.wrap(invalidate)()).to.eventually.be.fulfilled;
      expect(exceptionHappened).to.equal(true);
    });
  });
});
