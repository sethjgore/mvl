/**
 * WATCH tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  scripts : {
    files: ['resources/js/script.js'],
    tasks: ['uglify']
  },
  sass : {
    files: ['resources/sass/**/**/*.{sass, scss}'],
    tasks : ['sass:dist','autoprefixer', 'concat']
  },
  livereload: {
    files: ['craft/templates/**/*.html', '*.php', 'js/**/*.{js,json}', '*.css','img/**/*.{png,jpg,jpeg,gif,webp,svg}'],
    options: {
      livereload: true
    }
  }
}

/**
hamlstatamic : {
    files: ['haml/*.haml'],
    tasks : ['newer:haml:layouts', 'newer:haml:templates', 'newer:haml:partials']
  },
**/