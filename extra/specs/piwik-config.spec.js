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
    '{w20-core}/modules/application',
    '{w20-extra}/modules/analytics',
    '{angular-mocks}/angular-mocks',
    '{w20-extra}/specs/mock-piwik'
], function (require, angular) {
    'use strict';

    describe('The w20 Piwik default config for the analytics module (piwik-config)', function () {
        var $injector,
            $rootScope,
            PiwikService;

        beforeEach(function () {
            angular.mock.module('W20ExtraPiwik');

            angular.mock.inject(function (_$injector_, _$rootScope_) {
                $injector = _$injector_;
                $rootScope = _$rootScope_;
                PiwikService = $injector.get('PiwikService');

                $rootScope.$digest();
            });
        });

        it('should register a PiwikService', function () {
            expect(PiwikService).toBeDefined();
        });

        it('should return the Piwik API when calling PiwikService.getAPI()', function () {
            expect(PiwikService.getAPI).toBeDefined();
            var Piwik = PiwikService.getAPI();
            expect(Piwik).toBeDefined();
            expect(Piwik.getTracker).toBeDefined();
        });

    });
});