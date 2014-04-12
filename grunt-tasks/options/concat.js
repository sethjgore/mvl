/**
 * CONCAT tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  sass: {
    src: [
          'resources/sass/style-prefixed.css',
          ],
    dest: 'resources/style.css'
  }
}