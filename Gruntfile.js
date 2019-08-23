module.exports = function( grunt ) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    // pkg: grunt.file.readJSON('package.json'),

    pkg: {
      src: 'app',
      dst: 'dist'
    },

    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '<%= pkg.dst %>/*'
            ]
          }
        ]
      }
    },

    'bower-install': {
      app: {
        html: '<%= pkg.src %>/index.html',
        ignorePath: '<%= pkg.src %>/'
      }
    },

    rev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      assets: {
        files: [
          {
            src: [
              '<%= pkg.dst %>/js/**/*.js',
              '<%= pkg.dst %>/css/**/*.css'
            ]
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
        },
        files: [
          {
            expand: true,
            cwd: '<%= pkg.src %>',
            src: '*.html',
            dest: '<%= pkg.dst %>'
          }
        ]
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= pkg.dst %>'
      },
      html: '<%= pkg.src %>/index.html'
    },

    usemin: {
      options: {
        assetsDirs: ['<%= pkg.dst %>']
      },
      html: ['<%= pkg.dst %>/{,*/}*.html'],
      css: ['<%= pkg.dst %>/css/{,*/}*.css']
    },

    zip: {
      sigci_dev: {
        router: function( filepath ) {
          return filepath.substring(5, filepath.length);
        },
        src: ['<%= pkg.dst %>/**'],
        dest: 'sigci_dev.zip'
      }
    },

    copy: {
      fontAwesome: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= pkg.src %>/bower_components/font-awesome',
            dest: '<%= pkg.dst %>',
            src: [
              'fonts/**/*'
            ]
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= pkg.src %>',
            dest: '<%= pkg.dst %>',
            src: [
              'img/**/*',
              'partials/**/*'
            ]
          }
        ]
      }
    }
  });

  grunt.registerTask('createManifest', function() {
    // TODO hard-coded for now
    var o = {
      "name": "SIGCI Maintenance",
      "description": "apps developpee pour les besoins du pays",
      "version": "1.5",
      "developer": {
        "name": "HISP-CI",
        "email": "cyrillekouassi2002@gmail.com"
      },

      "installs_allowed_from": [
        "*"
      ],

      "launch_path": "index.html",

      "activities": {
        "dhis": {
          "href": "*"
        }
      },

      "icons": {
        "128": null,
        "16": null,
        "48": "/img/icons/id_card.png"
      },

      "default_locale": "en"
    };

    grunt.file.write('dist/manifest.webapp', JSON.stringify(o));
  });

  grunt.registerTask('default', [
    'clean:dist',
    'createManifest',
    'useminPrepare',
    'htmlmin',
    'cssmin',
    'concat',
    'uglify',
    'rev',
    'usemin',
    'copy',
    'zip'
  ]);

};
