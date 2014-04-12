/**
 * Haml tasks configuration
 */

module.exports = {
  layouts: {
    files: [{
      expand: true,
      cwd: '_themes/darklemon/dev/haml/layouts',
      src: ['*.haml'],
      dest:'_themes/darklemon/layouts',
      ext: ['.html']
    }]
  },
  templates: {
    files: [{
      expand: true,
      cwd: '_themes/darklemon/dev/haml/templates',
      src: ['*.haml'],
      dest:'_themes/darklemon/templates',
      ext: ['.html']
    }]
  },
  partials: {
    files: [{
      expand: true,
      cwd: '_themes/darklemon/dev/haml/partials',
      src: ['*.haml'],
      dest:'_themes/darklemon/partials',
      ext: ['.html']
    }]
  }
}