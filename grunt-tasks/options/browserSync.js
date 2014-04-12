/**
 * Browser Sync (Craft CMS) tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  bsFiles: {
      src: [
      'resources/*.css',
      'craft/templates/**/*.html',
      'resources/**/*.img',
      'resources/**/*.png',
    ]

  },
  options: {
    watchTask: true,
  }
}