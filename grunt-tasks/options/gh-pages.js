/**
 * SAMPLE tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  build: {
    options: {
      base: 'build',
      branch: 'dist',
      dotfiles: 'true'

    },
    src: ['**'],
  }
}