/**
 * SAMPLE tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  bsFiles: {
      src: [
      '**/*.css',
      '**/**/*.php',
      '**/**/*.html',
      '**/**/*.png',
    ]

  },
  options: {
    watchTask: true,
    proxy: '0.0.0.0:9999',
    host: '192.168.0.6',
  }
}