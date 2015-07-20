/*
 * Copyright (c) 2013-2015 by The SeedStack authors. All rights reserved.
 *
 * This file is part of SeedStack, An enterprise-oriented full development stack.
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
        '/base/core/w20-core.w20.json': {
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
                hypermedia: {}
            },
            vars: {
                'components-path': '/base/bower_components'
            }
        },
        '/base/ui/w20-ui.w20.json': {
            modules: {
                ui: {
                    'expandedRouteCategories': ['category1.category11']
                },
                grid: {},
                select: {}
            },
            vars: {
                'components-path': '/base/bower_components'
            }
        },
        'base/extra/w20-extra.w20.json': {
            modules: {
                analytics: {
                    provider: 'piwik',
                    virtualPageViews: true,
                    settings: {
                        jsUrl: '/base/extra/specs/mock-piwik.js',
                        trackerUrl: 'url/of/tracker.url',
                        siteId: 1
                    }
                }
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

requirejs([ '/base/core/modules/w20.js' ]);


