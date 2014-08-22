module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  var appConfig = {
    app: 'public',
    dist: 'dist'
  };

  grunt.initConfig({
    config: appConfig,

    wiredep: {
      dev: {
        src: '<%= config.app %>/index.html',
        exclude: ['less'],
        ignorePath: '..'
      },
      dist: {
        src: '<%= config.app %>/_index.html',
        exclude: ['less']
      }
    },

    useminPrepare: {
      html: '<%= config.dist %>/**/*.html',
      options: {
        flow: {
          steps: {
            js: ['concat', 'uglifyjs'],
            css: ['concat', 'cssmin'],
            less: [{
              name: 'less',
              createConfig: function (context, block) {
                var options = {};

                var files = context.inFiles.filter(function (file) {
                  return file.substr(file.length - 5, 5) === '.less';
                });

                options.files = files.map(function (file) {
                  return {
                    src: '<%= config.app%>/' + file,
                    dest: '<%= config.dist%>/' + file.replace(/less/g, 'css')
                  }
                });

                return options;
              }
            }]
          },
          post: {}
        }
      }
    },

    usemin: {
      html: '<%= config.dist %>/**/*.html',
      options: {
        blockReplacements: {
          less: function (block) {
            return '<link rel="stylesheet" href="' + block.dest + '">';
          }
        }
      }
    },

    watch: {
      dev: {
        files: '<%= config.app %>/**/*.*',
        options: {
          livereload: true
        }
      }
    },

    less: {
      options: {
        compress: true
      }
    },

    connect: {
      options: {
        port: 9000
      },
      dev: {
        options: {
          livereload: true,
          middleware: function (connect) {
            return [
              connect().use('/bower_components', connect.static('bower_components')),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },

    copy: {
      dist: {
        expand: true,
        cwd: '<%= config.app %>',
        src: '**/*.html',
        dest: '<%= config.dist %>/'
      }
    },

    clean: {
      temp: {
        src: '<%= config.app %>/_index.html'
      },
      dist: {
        src: '<%= config.dist %>'
      }
    }

  });

  grunt.registerTask('build', [
    'clean',
    'wiredep:dev',
    'copy:dist',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'less:generated',
    'usemin'
  ]);

  grunt.registerTask('serve', ['wiredep:dev', 'connect:dev', 'watch:dev']);

  grunt.registerTask('default', ['serve']);
};
