/**
 * PHP Server taks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  server: {
    options: {
      keepalive: true,
      port: 9999,
      base: ""
    }
  }
}