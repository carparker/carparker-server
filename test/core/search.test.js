'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const co = require('co');

const models = require('../../models');
const CarPark = models.CarPark;
const carParkMock = models.mocks.CarPark;
const formattedCarParkMock = models.mocks.FormattedCarPark;
const mongooseHelper = require('../../modules').mongooseHelper;
const search = require('../../core').search;

describe('[CORE] Search', () => {
  describe('#searchParkings', () => {
    let parkings;

    before(function* before() {
      yield mongooseHelper.connect();
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });

      parkings = [
        carParkMock({
          prices: [{
            duration: 15,
            price: 2,
            ranking: 0
          }],
          location: { coordinates: [48, 2] }
        }), carParkMock({
          prices: [{
            duration: 15,
            price: 2,
            ranking: 0
          }],
          location: {
            address: 'test',
            coordinates: [0, 0]
          }
        })
      ];

      yield CarPark.create(parkings);
    });
    after(mongooseHelper.disconnect);

    describe('when it is a geo search', () => {
      it('should return the matching parking', function* it() {
        const res = yield search.searchParkings({
          position: {
            latitude: 2,
            longitude: 48
          },
          radius: 100,
          duration: { min: 15 },
          price: { max: 5 }
        });

        expect(res).to.deep.equal([
          formattedCarParkMock({
            name: parkings[0].name,
            location: parkings[0].location,
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            last_update: parkings[0].last_update
          })
        ]);
      });
    });

    describe('when it is a text search', () => {
      it('should return the matching parking', function* it() {
        const res = yield search.searchParkings({
          address: 'test',
          radius: 100,
          duration: { min: 15 },
          price: { max: 5 }
        });

        expect(res).to.deep.equal([
          formattedCarParkMock({
            name: parkings[1].name,
            location: parkings[1].location,
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            last_update: parkings[1].last_update
          })
        ]);
      });
    });

    describe('when it is an invalid message', () => {
      it('should throw an Error', function* it() {
        expect(co.wrap(search.searchParkings)({})).to.eventually.be.rejectedWith(Error);
      });
    });
  });

  describe('#searchParkingsGeo', () => {
    before(function* before() {
      yield mongooseHelper.connect();
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });
    });
    after(mongooseHelper.disconnect);

    describe('when there is no matching parking', () => {
      it('should return an empty array', function* it() {
        const res = yield search.searchParkingsGeo(0, 0, 100, 0, 0);
        expect(res).to.deep.equal([]);
      });
    });

    describe('when there are matching parkings', () => {
      let parkings;

      before(function* before() {
        parkings = [
          carParkMock({
            prices: [{
              duration: 15,
              price: 2,
              ranking: 0
            }],
            location: { coordinates: [0, 0] }
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 3,
              ranking: 1
            }],
            location: { coordinates: [0, 0] }
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 2,
              ranking: 0
            }],
            location: { coordinates: [48, 2] }
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 5,
              ranking: 0
            }],
            location: { coordinates: [0, 0] }
          }), carParkMock({
            prices: [{
              // duration: 30,
              duration: 10,
              price: 2,
              ranking: 0
            }],
            location: { coordinates: [0, 0] }
          })];

        yield CarPark.create(parkings);
      });

      it('should return the sorted valid parkings', function* it() {
        const expected = [
          formattedCarParkMock({
            name: parkings[0].name,
            location: _.merge(parkings[0].location, { coordinates: [0, 0] }),
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            last_update: parkings[0].last_update
          }),
          formattedCarParkMock({
            name: parkings[1].name,
            location: _.merge(parkings[1].location, { coordinates: [0, 0] }),
            price: {
              duration: 15,
              price: 3,
              ranking: 1
            },
            last_update: parkings[1].last_update
          })
        ];

        const res = yield search.searchParkingsGeo(0, 0, 100, 15, 3);
        expect(res).to.deep.equal(expected);
      });
    });
  });

  describe('#searchParkingsText', () => {
    before(function* before() {
      yield mongooseHelper.connect();
      yield mongooseHelper.dropDatabase();
      yield CarPark.collection.ensureIndex({ 'location.coordinates': '2dsphere' });
    });
    after(mongooseHelper.disconnect);

    describe('when there is no matching parking', () => {
      it('should return an empty array', function* it() {
        const res = yield search.searchParkingsText('test', 0, 0);
        expect(res).to.deep.equal([]);
      });
    });

    describe('when there are matching parkings', () => {
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
              address: 'Test Street',
              country: 'This is an awesome test'
            }
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 3,
              ranking: 1
            }],
            location: {
              city: 'TESTTESTTESTTEST'
            }
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 2,
              ranking: 0
            }]
          }), carParkMock({
            prices: [{
              duration: 15,
              price: 5,
              ranking: 0
            }]
          }), carParkMock({
            prices: [{
              duration: 10,
              price: 2,
              ranking: 0
            }]
          })];

        yield CarPark.create(parkings);
      });

      it('should return the sorted valid parkings', function* it() {
        const expected = [
          formattedCarParkMock({
            name: parkings[0].name,
            location: parkings[0].location,
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            last_update: parkings[0].last_update
          }),
          formattedCarParkMock({
            name: parkings[1].name,
            location: parkings[1].location,
            price: {
              duration: 15,
              price: 3,
              ranking: 1
            },
            last_update: parkings[1].last_update
          })
        ];

        const res = yield search.searchParkingsText('test', 15, 3);
        expect(res).to.deep.equal(expected);
      });
    });
  });

  describe('#formatParkings', () => {
    describe('when there is no matching parking', () => {
      it('should return an empty array', function* it() {
        const res = yield search.formatParkings([], 0, 0);
        expect(res).to.deep.equal([]);
      });

      it('should return an empty array', function* it() {
        const parkings = [
          carParkMock({
            prices: [{
              duration: 15,
              price: 10,
              ranking: 0
            }]
          })
        ];
        const duration = 30;
        const maxprice = 5;

        const res = yield search.formatParkings(parkings, duration, maxprice);
        expect(res).to.deep.equal([]);
      });

      it('should return an empty array', function* it() {
        const parkings = [
          carParkMock({
            prices: [{
              duration: 15,
              price: 5,
              ranking: 0
            }]
          })
        ];
        const duration = 15;
        const maxprice = 3;

        const res = yield search.formatParkings(parkings, duration, maxprice);
        expect(res).to.deep.equal([]);
      });
    });

    describe('when there are matching parkings', () => {
      it('should return the formatted parkings', function* it() {
        const parkings = [
          carParkMock({
            prices: [{
              duration: 15,
              price: 5,
              ranking: 0
            }]
          })
        ];
        const duration = 15;
        const maxprice = 10;

        const expectedRes = formattedCarParkMock({
          name: parkings[0].name,
          location: _.merge(parkings[0].location, { distance: 0 }),
          price: {
            duration: 15,
            price: 5,
            ranking: 0
          },
          last_update: parkings[0].last_update
        });
        const res = yield search.formatParkings(parkings,
                                                duration,
                                                maxprice);

        expect(res).to.deep.equal([expectedRes]);
      });
    });
  });

  describe('#findBestPrice', () => {
    describe('when there is no matching price', () => {
      const prices = [{
        duration: 15,
        price: 2,
        ranking: 0
      }];

      it('should return null', function* it() {
        const duration = 30;
        const maxprice = 10;
        const res = yield search.findBestPrice(prices, duration, maxprice);
        expect(res).to.equal(null);
      });

      it('should return null', function* it() {
        const duration = 10;
        const maxprice = 1;
        const res = yield search.findBestPrice(prices, duration, maxprice);
        expect(res).to.equal(null);
      });
    });

    describe('when there is a matching price', () => {
      const prices = [{
        duration: 15,
        price: 2,
        ranking: 0
      }, {
        duration: 30,
        price: 4,
        ranking: 0
      }];

      it('should return the best price', function* it() {
        const duration = 10;
        const maxprice = 10;
        const res = yield search.findBestPrice(prices, duration, maxprice);
        expect(res).to.deep.equal(prices[0]);
      });
    });
  });

  describe('#sortParkings', () => {
    describe('when it is already sorted', () => {
      let parkings;

      before(function* before() {
        parkings = [
          carParkMock({
            price: {
              duration: 15,
              price: 1,
              ranking: 0
            },
            location: {
              distance: 100
            }
          }),
          carParkMock({
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            location: {
              distance: 100
            }
          }),
          carParkMock({
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            location: {
              distance: 500
            }
          })
        ];
      });

      it('should not change the order', function* it() {
        const orderedParkings = search.sortParkings(parkings);
        expect(orderedParkings).to.deep.equal(parkings);
      });
    });

    describe('when it is not sorted', () => {
      let parkings;

      before(function* before() {
        parkings = [
          carParkMock({
            price: {
              duration: 15,
              price: 3,
              ranking: 1
            },
            location: {
              distance: 100
            }
          }),
          carParkMock({
            price: {
              duration: 15,
              price: 1,
              ranking: 1
            },
            location: {
              distance: 100
            }
          }),
          carParkMock({
            price: {
              duration: 15,
              price: 2,
              ranking: 0
            },
            location: {
              distance: 500
            }
          })
        ];
      });

      it('should change the order', function* it() {
        const orderedParkings = search.sortParkings(parkings);
        expect(orderedParkings).to.deep.equal([parkings[2], parkings[1], parkings[0]]);
      });
    });
  });
});
