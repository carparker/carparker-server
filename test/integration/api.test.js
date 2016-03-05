'use strict';

const bluebird = require('bluebird');
const chai = require('chai');
const expect = chai.expect;
const httpStatus = require('http-status-codes');
const supertest = require('supertest-as-promised');
const sinon = require('sinon');

const models = require('../../models');
const CarPark = models.CarPark;
const carParkMock = models.mocks.CarPark;
const formattedCarParkMock = models.mocks.FormattedCarPark;
const mongooseHelper = require('../../modules').mongooseHelper;

const server = require('../../server.js');

describe('[SERVER] API', () => {
  before(function* before() {
    yield server.start();
    yield mongooseHelper.dropDatabase();
    yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });
  });

  after(function* after() {
    let exitStatus;
    sinon.stub(process, 'exit', status => {
      exitStatus = status;
    });
    yield bluebird.promisify(server.shutdown)(null);
    expect(exitStatus).to.equal(0);
    process.exit.restore();
  });

  describe('POST /search', () => {
    describe('when there is no body', () => {
      it('should return a BAD_REQUEST', () => supertest(server.server)
         .post('/search')
         .send({})
         .expect(httpStatus.BAD_REQUEST)
         .then(res => expect(res.body).to.deep.equal({}))
        );
    });

    describe('when there is an invalid body', () => {
      it('should return a BAD_REQUEST', () => supertest(server.server)
         .post('/search')
         .send({ invalid: 'invalid' })
         .expect(httpStatus.BAD_REQUEST)
         .then(res => expect(res.body).to.deep.equal({}))
        );

      it('should return a BAD_REQUEST', () => supertest(server.server)
         .post('/search')
         .send({
           invalid: 'invalid',
           address: 'address',
           radius: 42,
           price: {
             min: 0,
             max: 100
           },
           duration: {
             min: 15
           }
         })
         .expect(httpStatus.BAD_REQUEST)
         .then(res => expect(res.body).to.deep.equal({}))
        );

      it('should return a BAD_REQUEST', () => supertest(server.server)
         .post('/search')
         .send({
           position: {
             latitude: 0,
             longitude: 0
           },
           address: 'address',
           radius: 42,
           price: {
             min: 0,
             max: 100
           },
           duration: {
             min: 15
           }
         })
         .expect(httpStatus.BAD_REQUEST)
         .then(res => expect(res.body).to.deep.equal({}))
        );
    });

    describe('when there is a valid body', () => {
      let parkings;

      before(function* before() {
        parkings = [
          carParkMock({
            prices: [{
              duration: 15,
              price: 2,
              ranking: 0
            }],
            location: {
              address: 'address',
              coordinates: [0, 0]
            }
          }),
          carParkMock({
            prices: [{
              duration: 15,
              price: 2,
              ranking: 0
            }],
            location: {
              address: 'nope',
              coordinates: [2, 48]
            }
          })
        ];
        yield CarPark.create(parkings);
      });

      it('should return an OK response', () => supertest(server.server)
         .post('/search')
         .send({
           position: {
             latitude: 0,
             longitude: 0
           },
           radius: 42,
           price: {
             min: 0,
             max: 100
           },
           duration: {
             min: 15
           }
         })
         .expect(httpStatus.OK)
         .then(res => expect(res.body).to.deep.equal({
           parkings: [
             formattedCarParkMock({
               name: parkings[0].name,
               location: parkings[0].location,
               price: {
                 duration: 15,
                 price: 2,
                 ranking: 0
               },
               last_update: parkings[0].last_update.toISOString()
             })
           ]
         }))
        );

      it('should return an OK response', () => supertest(server.server)
         .post('/search')
         .send({
           address: 'address',
           radius: 42,
           price: {
             min: 0,
             max: 100
           },
           duration: {
             min: 15
           }
         })
         .expect(httpStatus.OK)
         .then(res => expect(res.body).to.deep.equal({
           parkings: [
             formattedCarParkMock({
               name: parkings[0].name,
               location: parkings[0].location,
               price: {
                 duration: 15,
                 price: 2,
                 ranking: 0
               },
               last_update: parkings[0].last_update.toISOString()
             })
           ]
         }))
        );

      it('should return an OK response', () => supertest(server.server)
         .post('/search')
         .send({
           address: 'nothing',
           radius: 42,
           price: {
             min: 0,
             max: 100
           },
           duration: {
             min: 15
           }
         })
         .expect(httpStatus.OK)
         .then(res => expect(res.body).to.deep.equal({ parkings: [] }))
        );
    });
  });
});
