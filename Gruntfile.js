module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'src/css/moonlightui.css' : 'src/scss/moonlightui.scss'
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path and its sub-directories
                    {
                        expand: true,
                        cwd: './src/lib/jstree/dist/themes/default', src: ['*.png','*.gif'],
                        dest: './dist/css/'
                    },
                    {
                        expand: true,
                        cwd: './dist/', src: ['**'],
                        dest: './docs/'
                    }
                ]
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: './dist/css',
                    src: ['*.css', '!*.min.css'],
                    dest: './dist/css',
                    ext: '.min.css'
                }]
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            uses_defaults: ['src/js/moonlightui.js']
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    './dist/js/moonlightui.min.js': ['./dist/js/moonlightui.js'],
                }
            }
        },
        concat: {
            js: {
                src: ['src/lib/jquery/dist/jquery.js', 'src/lib/jquery-ui/jquery-ui.js', 'src/lib/jsPlumb/dist/js/jsPlumb-2.1.5.js', 'src/lib/jquery.scrollbar/jquery.scrollbar.js', 'src/lib/jstree/dist/jstree.js', 'src/js/prism.js', 'src/lib/async/dist/async.js', 'src/js/moonlightui.js'],
                dest: 'dist/js/moonlightui.js'
            },
            css: {
                src: ['src/lib/jquery-ui/themes/base/jquery-ui.css', 'src/lib/animate.css/animate.css', 'src/lib/jquery.scrollbar/jquery.scrollbar.css', 'src/lib/jstree/dist/themes/default/style.css', 'src/css/prism.css', 'src/css/moonlightui.css'],
                dest: 'dist/css/moonlightui.css'
            }
        },
        watch: {
            css: {
                files: 'src/**/*.scss',
                tasks: ['sass', 'concat:css', 'cssmin', 'copy']
            },
            scripts: {
                files: 'src/**/*.js',
                tasks: ['jshint', 'concat:js', 'uglify', 'copy'],
                options: {
                    debounceDelay: 250
                }
            }
        },
        build: {
            tasks: ['sass', 'concat:css', 'cssmin', 'jshint', 'concat:js', 'uglify', 'copy']
        },
        exec: {
            server: 'node server.js'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('default',['watch']);
    grunt.registerTask('serve',['exec']);
};