/*
 * Copyright (c) 2013-2015 by The SeedStack authors. All rights reserved.
 *
 * This file is part of SeedStack, An enterprise-oriented full development stack.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'module',
    'require',
    '{angular}/angular',

    '{angulartics}/angulartics'

], function (module, require, angular) {
    'use strict';

    var W20ExtraPiwik = angular.module('W20ExtraPiwik', ['ng']);

    W20ExtraPiwik.factory('PiwikService', ['$window', function ($window) {

        function addFileExtension(path) {
            var split = path.split('.');
            if (split[split.length - 1] === 'js') {
                return path;
            } else {
                split.push('js');
                return split.join('.');
            }
        }

        return {
            configure: function(settings) {

                var jsUrl = settings.jsUrl || [],
                    trackerUrl = settings.trackerUrl || [],
                    siteId = settings.siteId || [];

                require([addFileExtension(jsUrl)], function() {
                    if ($window._paq) {
                        $window._paq.push(['trackPageView']);
                        $window._paq.push(['enableLinkTracking']);
                        $window._paq.push(['setTrackerUrl', trackerUrl]);
                        $window._paq.push(['setSiteId', siteId]);
                    } else {
                        throw new Error('Unable to configure Piwik: _paq is not defined. Check the jsUrl parameter.');
                    }
                });
            },
            getAPI: function() {
                return $window.Piwik;
            }
        };
    }]);

    return {
        service: 'PiwikService',
        angularModules: [ 'W20ExtraPiwik' ]
    };

});


