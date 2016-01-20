/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var tests = [];

for (var file in window.__karma__.files) {
    if (/.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

window.w20 = {
    configuration: {
        '/base/w20-core.w20.json': {
            modules: {
                application: {
                    id: 'w20-test',
                    home: '/test'
                },
                culture: {
                    available: [
                        'en-GB',
                        'fr-FR'
                    ],
                    default: 'en-GB'
                },
                ui: {
                    'expandedRouteCategories': ['category1.category11']
                },
                hypermedia: {}
            },
            vars: {
                'components-path': '/base/bower_components'
            }
        }
    },
    deps: tests,
    callback: window.__karma__.start
};

requirejs.config({
    paths: {
        '{angular-mocks}': '/base/bower_components/angular-mocks'
    },
    shim: {
        '{angular-mocks}/angular-mocks': [ '{angular}/angular' ]
    }
});

requirejs([ '/base/modules/w20.js' ]);


