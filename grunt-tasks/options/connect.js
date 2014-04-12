/**
 * Connect Server taks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  server: {
    options: {
      protcol: 'https',
      port: 4567,
      base: '/source',
      keepalive: true
    }
  }
}