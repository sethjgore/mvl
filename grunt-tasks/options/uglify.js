
/**
 * Middleman taks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  dev: {
    options:{
      mangle: false,
      beautify: true
    },
    files: {
      'resources/js/app.js' : ['bower_components/conditionizr/src/conditionizr.js', 'bower_components/jquery/dist/jquery.js', 'bower_components/isotope/jquery.isotope.js', 'bower_components/owlcarousel/owl-carousel/owl.carousel.js' ,'resources/js/script.js']
    }
  },
  polyfills: {
    options: {
      mangle: false,
      beautify: true
    },
    files: {
      'resources/js/ios.js':['bower_components/vminpoly/parser.js', 'bower_components/vminpoly/tokenizer.js', 'bower_components/vminpoly/vminpoly.js'],
    }
  },
}