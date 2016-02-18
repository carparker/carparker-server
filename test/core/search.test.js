'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;

const models = require('../../models');
const carParkMock = models.mocks.CarPark;
const formattedCarParkMock = models.mocks.FormattedCarPark;
const search = require('../../core').search;

describe('[CORE] Search', () => {
  describe('#formatParkings', () => {
    describe('when there is no matching parking', () => {
      it('should return an empty array', function* it() {
        const res = yield search.formatParkings([], 0, 0, 0, 0);
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

        const res = yield search.formatParkings(parkings, 0, 0, duration, maxprice);
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

        const res = yield search.formatParkings(parkings, 0, 0, duration, maxprice);
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
                                                parkings[0].location.coordinates[1],
                                                parkings[0].location.coordinates[0],
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

  describe('#getDistance', () => {
    it('should return the distance between the two points', function* it() {
      const distance = search.getDistance({
        latitude: 48.8153291,
        longitude: 2.360979
      }, {
        latitude: 48.8582606,
        longitude: 2.2923184
      });
      // XXX: the result may not be axact depending on the calculus implementation
      expect(distance).to.be.above(6930).and.below(6950);
    });

    it('should return the distance between the two points', function* it() {
      const distance = search.getDistance({
        latitude: 48.8153291,
        longitude: 2.360979
      }, {
        latitude: 48.8153291,
        longitude: 2.360979
      });
      expect(distance).to.equal(0);
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
