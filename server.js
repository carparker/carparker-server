'use strict';

const express = require('express');

const server = express();

require('./routes').config(server);

/* TODO:
 * setup mongo
 * then listen on server
 */
const listener = server.listen(server.get('port'), () => {
  console.log(`Server started on port ${listener.address().port} in ${process.env.NODE_ENV} environment`);
});
