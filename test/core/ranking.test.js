'use strit';

const chai = require('chai');
const expect = chai.expect;

const models = require('../../models');
const carParkMock = models.mocks.CarPark;
const ranking = require('../../core').ranking;

const logger = require('../../modules').logger;

describe('[CORE] Ranking', () => {
  describe('#computeGreenRankingLimit', () => {
    it('should return the average', function* it() {
      const average = 42;
      const res = ranking.computeGreenRankingLimit(average);
      expect(res).to.equal(average);
    });

    it('should return 0', function* it() {
      const average = null;
      const res = ranking.computeGreenRankingLimit(average);
      expect(res).to.equal(0);
    });
  });

  describe('#computeOrangeRankingLimit', () => {
    it('should return the result', function* it() {
      const average = 42;
      const res = ranking.computeOrangeRankingLimit(average);
      expect(res).to.equal(46.2);
    });

    it('should return 0', function* it() {
      const average = null;
      const res = ranking.computeOrangeRankingLimit(average);
      expect(res).to.equal(0);
    });
  });

  describe('#selectTag', () => {
    const green = 10;
    const orange = 20;

    it('should return green', function* it() {
      const price = 0;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.GREEN);
    });
    it('should return green', function* it() {
      const price = 9;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.GREEN);
    });

    it('should return orange', function* it() {
      const price = 10;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.ORANGE);
    });
    it('should return orange', function* it() {
      const price = 19;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.ORANGE);
    });

    it('should return red', function* it() {
      const price = 20;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.RED);
    });
    it('should return red', function* it() {
      const price = 30;
      const res = ranking.selectTag(price, green, orange);
      expect(res).to.equal(ranking.rankings.RED);
    });
  });

  describe.skip('#updateRankings', () => {
    const parkings = [
      carParkMock({
        prices: [{
          duration: 15,
          price: 2
        }, {
          duration: 30,
          price: 4
        }]
      }),
      carParkMock({
        prices: [{
          duration: 15,
          price: 3
        }, {
          duration: 30,
          price: 6
        }]
      }),
      carParkMock({
        prices: [{
          duration: 15,
          price: 5
        }, {
          duration: 30,
          price: 10
        }]
      })
    ];

    it('should set the correct rankings', function* it() {
      const res = ranking.updateRanking(parkings);
      logger.info({ parkings }, 'ORIGINAL PARKINGS');
      logger.info({ res }, 'RANKED PARKINGS');
      // TODO: rewrite the function to remove the side effect
      expect(res).to.not.deep.equal(parkings);
    });
  });
});
