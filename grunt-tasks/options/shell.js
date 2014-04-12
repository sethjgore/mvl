/**
 * SAMPLE tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  openProjectFolder: {
    command: 'subl',
    options: {
      stdout: true
    }
  },
  jumpToTheme : {
    command: "cd wp-content/themes/tigershredding"
  },
  dirListing: {
      command: 'ls',
      options: {
          stdout: true
      }
  }
}