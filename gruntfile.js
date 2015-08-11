/*
 * Copyright (c) 2013-2015 by The SeedStack authors. All rights reserved.
 *
 * This file is part of SeedStack, An enterprise-oriented full development stack.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global module: false, grunt: false, process: false */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            'bower_components/**',
            'docs/**',
            'dist/**',
            'coverage/**'
        ],
        jshint: {
            core: {
                src: ['core/modules/**/*.js']
            },
            dataviz: {
                src: ['dataviz/modules/**/*.js']
            },
            extra: {
                src: ['extra/modules/**/*.js']
            },
            ui: {
                src: ['ui/modules/**/*.js']
            }
        },
        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },
        karma: {
            test: {
                configFile: 'karma.conf.js',
                singleRun: true
            },
            watch: {
                configFile: 'karma.conf.js',
                autoWatch: true
            }
        },
        coveralls: {
            src: ['coverage/lcov.info'],
            options: {
                force: true
            }
        },
        ngdocs: {
            options: {
                startPage: '/core',
            },
            core: {
                src: ['core/modules/**/*.js'],
                title: 'Core',
                api: true
            },
            ui: {
                src: ['ui/modules/**/*.js'],
                title: 'UI',
                api: true
            }
        },
        connect: {
            docs: {
                options: {
                    port: 9000,
                    base: 'docs',
                    keepalive: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('docs', ['ngdocs', 'connect:docs']);

    grunt.registerTask('default', ['jshint', 'bower', 'karma:test', 'coveralls', 'ngdocs']);
};
