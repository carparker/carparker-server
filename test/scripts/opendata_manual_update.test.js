'use strict';

const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const sinon = require('sinon');

const config = require('config');
const models = require('../../models');
const CarPark = models.CarPark;
const mongooseHelper = require('../../modules').mongooseHelper;
const rollbarHelper = require('../../modules').rollbarHelper;
const manualUpdater = require('../../scripts/opendata_manual_update.js').manualUpdater;

describe('[SCRIPT] opendata_manual_update', () => {
  const opendataUri = 'http://paris_opendata';
  const opendataUrn = '/get';

  describe('when the update works', () => {
    let clock;
    let exitStatus;

    before(function* before() {
      yield mongooseHelper.connect();
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

      clock = sinon.useFakeTimers(1420070400 * 1000);
      sinon.stub(process, 'exit', status => {
        exitStatus = status;
      });

      config.worker.opendata.paris.url = `${opendataUri}${opendataUrn}`;
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

    after(function* after() {
      clock.restore();
      process.exit.restore();
      yield mongooseHelper.disconnect();
    });

    it('should update the parkings', function* it() {
      yield manualUpdater();

      expect(exitStatus).to.equal(0);

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

  describe('when the update does not work', () => {
    let exitStatus;

    before(function* before() {
      yield mongooseHelper.connect();
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

      sinon.stub(rollbarHelper, 'init', () => Promise.reject('error to catch'));
      sinon.stub(process, 'exit', status => {
        exitStatus = status;
      });
    });

    after(function* after() {
      rollbarHelper.init.restore();
      process.exit.restore();
      yield mongooseHelper.disconnect();
    });

    it('should update the parkings', function* it() {
      yield manualUpdater();

      expect(exitStatus).to.equal(1);

      const parkings = yield CarPark.find({}, { _id: 0 }).lean();
      expect(parkings).to.deep.equal([]);
    });
  });
});
