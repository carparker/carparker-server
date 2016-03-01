'use strict';

const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');
const sinon = require('sinon');

const mapper = require('../../../../worker/opendata/mapping/paris.js');

const input = require('./paris.in.json');
const output = require('./paris.out.json');

function formatDate(data) {
  if (data.last_update) {
    data.last_update = moment(data.last_update).toDate();
  }
  return data;
}

describe('[WORKER] mapper.paris', () => {
  let clock;

  before(done => {
    clock = sinon.useFakeTimers(1420070400 * 1000);
    done();
  });

  after(done => {
    clock.restore();
    done();
  });

  for (let i = 0; i < input.parkings.length; ++i) {
    it('should correctly map the data', () => {
      expect(mapper(input.parkings[i])).to.deep.equal(formatDate(output.parkings[i]));
    });
  }
});
