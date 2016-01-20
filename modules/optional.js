/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([], {
    load : function (moduleName, parentRequire, onload, config) {
        'use strict';

        /**
         * @ngdoc object
         * @name optional
         *
         * @description
         *
         * This module is a RequireJS plugin that allows loading module optionally.
         * Usage: [optional]!optionalModule
         *
         * If the module is not present it will be replaced by the following object: { undef: true }
         *
         * Configuration
         * -------------
         *
         * This module has no configuration option.
         *
         * Fragment definition sections
         * ----------------------------
         *
         * This module has no fragment definition section.
         */
        var onLoadSuccess = function(moduleInstance) {
            onload(moduleInstance);
        };

        var onLoadFailure = function(err) {
            var failedId = err.requireModules && err.requireModules[0];
            console.warn('Could not load optional module: ' + failedId);

            requirejs.undef(failedId);

            define(failedId, [], function() { return { undef: true }; });

            parentRequire([failedId], onLoadSuccess);
        };

        parentRequire([moduleName], onLoadSuccess, onLoadFailure);
    }
});
