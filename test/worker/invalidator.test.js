'use strict';

const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');

const models = require('../../models');
const CarPark = models.CarPark;
const carParkMock = models.mocks.CarPark;
const mongooseHelper = require('../../modules').mongooseHelper;
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
});
