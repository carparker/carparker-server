'use strict';

const co = require('co');
const CarPark = require('../../models').CarPark;

// http://stackoverflow.com/a/28081787

function* updateParkings(parks) {
  return new Promise((resolve, reject) => {
    const bulk = CarPark.collection.initializeUnorderedBulkOp();

    for (const park of parks) {
      bulk.find({ name: park.name }).upsert().updateOne(park);
    }
    // XXX: bulk does weird stuff if we promisify it, did not investigate,
    //      just used a callback by default
    bulk.execute((err, bulkres) => {
      if (err) return reject(err);
      return resolve(bulkres);
    });
  });
}

module.exports = co.wrap(updateParkings);
