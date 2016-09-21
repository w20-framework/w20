/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* global module: false, config: false */
module.exports = function (config) {
    'use strict';

    config.set({
        basePath: '.',
        frameworks: [
            'systemjs',
            'jasmine',
            'phantomjs-shim'
        ],
        plugins: [
            'karma-systemjs',
            'karma-jasmine',
            'karma-phantomjs-shim',
            'karma-phantomjs-launcher'
        ],
        systemjs: {
            configFile: 'system.test.conf.js',
            serveFiles: [
                'dist/**/*.js'
            ]
        },
        exclude: [
            '*.map.js',
            'dist/**/*.js.map',
        ],
        files: [
            {pattern: 'src/test/mock/*.json', included: false, served: true},
            'dist/src/test/*.spec.js'
        ],

        port: 9876,
        colors: true,
        logLevel: 'INFO',
        browsers: ['PhantomJS']
    });
};