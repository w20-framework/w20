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
    '{angular}/angular',
    '{w20-core}/modules/culture',
    '{w20-ui}/modules/grid',
    '{angular-mocks}/angular-mocks'
], function (angular) {
    'use strict';

    describe('The Grid module', function () {
        var $injector,
            $rootScope,
            $compile,
            i18nService,
            cultureService;

        beforeEach(function () {
            angular.mock.module('w20UIGrid');

            angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_) {
                $injector = _$injector_;
                $rootScope = _$rootScope_;
                $compile = _$compile_;
                i18nService = $injector.get('i18nService');
                cultureService = $injector.get('CultureService');

                $rootScope.$digest();
            });
        });


        it('should add the culture and its messages when culture changes', function () {
            cultureService.culture('fr-FR');
            cultureService.culture('en-GB');
            expect(i18nService.getAllLangs()).toContain('fr-FR'.toLowerCase(), 'en-GB'.toLowerCase());
        });

        it('should set the new culture for the grid when culture changes', function () {
            spyOn(i18nService, 'setCurrentLang').and.callThrough();

            cultureService.culture('fr-FR');
            expect(i18nService.setCurrentLang).toHaveBeenCalledWith('fr-FR');
            expect(i18nService.getCurrentLang()).toBe('fr-FR'.toLowerCase());

            cultureService.culture('en-GB');
            expect(i18nService.setCurrentLang).toHaveBeenCalledWith('en-GB');
            expect(i18nService.getCurrentLang()).toBe('en-GB'.toLowerCase());
        });


    });

});