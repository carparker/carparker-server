'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const models = require('../../../models');
const CarPark = models.CarPark;
const carParkMock = models.mocks.CarPark;
const mongooseHelper = require('../../../modules').mongooseHelper;

const parkUpdater = require('../../../worker/opendata/park_updater.js');

describe('[WORKER] park_updater', () => {
  before(function* before() {
    yield mongooseHelper.connect();
  });

  after(function* after() {
    yield mongooseHelper.disconnect();
  });

  describe('when the park is a new one', () => {
    before(function* before() {
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });
    });

    it('should create new parkings in database', function* it() {
      const parkings = [
        carParkMock(),
        carParkMock()
      ];

      const res = yield parkUpdater(parkings);
      expect(res.ok).to.equal(1);

      const parkingsDb = yield CarPark.find({
        name: { $in: [parkings[0].name, parkings[1].name] }
      }, { _id: 0 }).lean();
      expect(parkingsDb).to.deep.equal(parkings);
    });
  });

  describe('when the park is a new one', () => {
    const parkings = [
      carParkMock(),
      carParkMock()
    ];

    before(function* before() {
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

      yield CarPark.create(parkings);
    });

    it('should create new parkings in database', function* it() {
      const now = new Date();
      parkings[0].last_update = now;
      parkings[1].last_update = now;

      const res = yield parkUpdater(parkings);
      expect(res.ok).to.equal(1);

      const updatedParkings = yield CarPark.find({
        name: { $in: [parkings[0].name, parkings[1].name] }
      }, { _id: 0 }).lean();
      expect(updatedParkings).to.deep.equal(parkings);
    });
  });
});
