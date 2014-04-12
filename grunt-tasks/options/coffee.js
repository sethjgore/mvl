/**
 * Middleman taks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  compile:{
    files: {
      '_themes/darklemon/js/all.js' : ['_themes/darklemon/js/*.coffee']
    }
  }
}