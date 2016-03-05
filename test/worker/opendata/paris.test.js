'use strict';

const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const sinon = require('sinon');

const config = require('config');
const models = require('../../../models');
const CarPark = models.CarPark;
const mongooseHelper = require('../../../modules').mongooseHelper;
const rollbarHelper = require('../../../modules').rollbarHelper;

const parisUpdate = require('../../../worker/opendata/paris.js').update;

describe('[WORKER] opendata.paris', () => {
  const opendataUri = 'http://paris_opendata';
  const opendataUrn = '/get';

  before(function* before() {
    yield mongooseHelper.connect();
    config.worker.opendata.paris.url = `${opendataUri}${opendataUrn}`;
  });

  after(function* after() {
    yield mongooseHelper.disconnect();
  });

  describe('when the response is invalid', () => {
    describe('when the response is undefined', () => {
      before(function* before() {
        yield mongooseHelper.dropDatabase();
        yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

        nock(opendataUri)
          .get(opendataUrn)
          .reply(200, undefined);
      });

      it('should do nothing', function* it() {
        yield parisUpdate();

        const parkings = yield CarPark.find({});
        expect(parkings).to.deep.equal([]);
      });
    });

    describe('when the response is not JSON', () => {
      before(function* before() {
        yield mongooseHelper.dropDatabase();
        yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

        nock(opendataUri)
          .get(opendataUrn)
          .reply(200, 'lala');
      });

      it('should catch the exception and do nothing', function* it() {
        yield parisUpdate();

        const parkings = yield CarPark.find({});
        expect(parkings).to.deep.equal([]);
      });
    });

    describe('when the response does not match the expected result', () => {
      describe('when there is no `nhits`', () => {
        before(function* before() {
          yield mongooseHelper.dropDatabase();
          yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

          nock(opendataUri)
            .get(opendataUrn)
            .reply(200, { records: [] });
        });

        it('should do nothing', function* it() {
          yield parisUpdate();

          const parkings = yield CarPark.find({});
          expect(parkings).to.deep.equal([]);
        });
      });

      describe('when there is no `records`', () => {
        before(function* before() {
          yield mongooseHelper.dropDatabase();
          yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

          nock(opendataUri)
            .get(opendataUrn)
            .reply(200, { nhits: 42 });
        });

        it('should do nothing', function* it() {
          yield parisUpdate();

          const parkings = yield CarPark.find({});
          expect(parkings).to.deep.equal([]);
        });
      });
    });
  });

  describe('when the response is valid', () => {
    describe('when there are no parkings in the result', () => {
      before(function* before() {
        yield mongooseHelper.dropDatabase();
        yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

        // XXX: we need to init it here because in this test case we call
        //      rollbar to notify that we did not receive any parking, but it
        //      throws is rollbar is not initialized...
        yield rollbarHelper.init();

        nock(opendataUri)
          .get(opendataUrn)
          .reply(200, { nhits: 1, records: [] }); // XXX: put nhits to 1 here because is it is 0 there is no update
      });

      after(done => {
        done();
      });

      it('should do nothing', function* it() {
        yield parisUpdate();

        const parkings = yield CarPark.find({});
        expect(parkings).to.deep.equal([]);
      });
    });

    describe('when there are parkings in the result', () => {
      let clock;

      before(function* before() {
        yield mongooseHelper.dropDatabase();
        yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

        clock = sinon.useFakeTimers(1420070400 * 1000);

        nock(opendataUri)
          .get(opendataUrn)
          .reply(200, {
            nhits: 1,
            records: [{
              fields: {
                nom_du_parc_de_stationnement: 'test1',
                adresse: '420 rue machintruc',
                arrdt: '16',
                tarif_1_2_heure: '2,20 €',
                horaires_ouvertures_pour_les_usagers_non_abonnes: '06h / 20h'
              }
            }]
          });
      });

      after(done => {
        clock.restore();
        done();
      });

      it('should add them in database', function* it() {
        yield parisUpdate();

        const parkings = yield CarPark.find({}, { _id: 0 }).lean();
        expect(parkings).to.deep.equal([{
          name: 'test1',
          location: {
            address: '420 rue machintruc',
            postcode: '75016',
            city: 'Paris',
            country: 'France'
          },
          open_hours: {
            open: 360,
            close: 1200
          },
          prices: [{
            duration: 30,
            price: 2.2,
            ranking: 1
          }],
          last_update: new Date('2015-01-01T00:00:00.000Z'),
          outdated: false
        }]);
      });
    });
  });
});
