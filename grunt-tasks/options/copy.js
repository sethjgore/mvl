/**
 * COPY tasks configuration
 */

'use strict';

var config = require('../config');

module.exports = {
  fonts: {
    cwd: 'bower_components',
    src: [ 'font-awesome/fonts/**'],
    dest: 'source/fonts',
    expand: true,
    filter: 'isFile',
    flatten: true
  },
  build:{
    files: [
      {
        expand: true,
        src: [
          'index.php',
          'robots.txt',
          'resources/**',
          'images/**'
        ],
        dest: 'build/',
        filter: 'isFile'
      },
      {
        expand: true,
        src:['.htaccess-build'],
        dest: 'build'
      },
      {
        expand: true,
        cwd: 'craft',
        src: [
          'app/**',
          'config/**',
          'plugins/**',
          'storage/backups/**',
          'templates/**',
          'web.config'
        ],
        dest: 'build/craft',
        filter: 'isFile'
      }
    ]
  }
}