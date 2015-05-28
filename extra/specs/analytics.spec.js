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
    'require',
    '{angular}/angular',
    '{angular-mocks}/angular-mocks',
    '{w20-extra}/modules/analytics',
    '{w20-extra}/modules/providers/piwik-config'
], function (require, angular) {
    'use strict';

    describe('The analytics module', function () {
        beforeEach(function () {
            angular.mock.module('W20ExtraAnalytics');
            angular.mock.module('W20ExtraPiwik');
        });

        it('should require the appropriate angulartics support for piwik as defined in the test fragment manifest', function () {
            var angularticsPiwikIsDefined = require.specified('{angulartics}/angulartics-piwik');
            expect(angularticsPiwikIsDefined).toBeDefined();
        });

        it('should require the w20 piwik config support if the \'settings\' property is set in the manifest (it is set in the test fragment)', function() {
            var w20PiwikConfigIsDefined = require.specified('{w20-extra}/modules/providers/piwik-config');
            expect(w20PiwikConfigIsDefined).toBeDefined();
        });

    });
});