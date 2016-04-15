/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',
    'w20',
    '{w20-core}/modules/culture',
    '{w20-core}/modules/application',
    '{angular-mocks}/angular-mocks'
], function (angular, w20, culture, application) {
    'use strict';

    describe('The Culture Service', function () {
        var $rootScope,
            cultureService;

        beforeEach(function (done) {
            if (localStorage) {
                localStorage.clear();
            }
            culture.lifecycle.pre([], {
                'test-fragment': {
                    definition: {
                        'i18n': {
                            'en-GB': ['base/mocks/mock-en.i18n.json'],
                            'fr-FR': ['base/mocks/mock-fr.i18n.json']
                        }
                    }
                }
            }, function () {
                angular.mock.module('w20CoreCulture');

                angular.mock.inject(function ($injector, _$rootScope_) {
                    $rootScope = _$rootScope_;
                    cultureService = $injector.get('CultureService');

                    $rootScope.$digest();
                });

                done();
            });
        });

        it('should return the default culture of the application (en-GB by default)', function () {
            expect(cultureService.defaultCulture()).toBeDefined();
            expect(cultureService.defaultCulture().name).toBe('en-GB');
        });

        it('should be able to return the active culture of the application', function () {
            var culture = cultureService.culture();

            expect(culture).toBeDefined();
            expect(culture.name).toBe('en-GB');
        });

        it('should fire an event when culture changes', function () {
            spyOn($rootScope, '$emit');

            $rootScope.$on('w20.culture.culture-changed', function (culture) {
            });
            cultureService.culture('en-GB');
            $rootScope.$apply();

            expect($rootScope.$emit).toHaveBeenCalledWith('w20.culture.culture-changed', cultureService.culture());
        });

        it('should persist the culture name to local storage when switching culture', function (done) {
            expect(cultureService.culture().name).toBe('en-GB');
            expect(localStorage.getItem('w20.' + application.id + '.preferred-culture')).toBeNull();

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect(localStorage.getItem('w20.' + application.id + '.preferred-culture')).toEqual(cultureService.culture().name);
                unregister();
                done();
            });
            cultureService.culture('fr-FR');
        });

        it('should be able to set the active culture of the application', function (done) {
            expect(cultureService.culture().name).toBe('en-GB');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                unregister();
                done();
            });
            cultureService.culture('fr-FR');

        });

        it('should be able to return a list of available cultures', function () {
            var cultureList;
            cultureList = cultureService.availableCultures().map(function (elt) {
                return elt.name;
            });

            expect(cultureList).toContain('en-GB');
            expect(cultureList).toContain('fr-FR');
        });

        // TODO can't change culture specifically k
        it('should be able to localize an i18n key in the specified culture if available', function () {
            var localisedKey = cultureService.localize('test.key.to.localize', [], null, 'en-GB');
            $rootScope.$apply();
            expect(localisedKey).toBe('key to localize in english');
        });

        it('should be able to localize an i18n key in the active culture if no culture was specified', function () {
            expect(cultureService.culture().name).toBe('en-GB');

            var localisedKey = cultureService.localize('test.key.to.localize');

            expect(localisedKey).toBe('key to localize in english');
        });

        it('should be able to localize an i18n key in the default culture if the value does not exist in the specified culture', function () {
            var localisedKey = cultureService.localize('test.key.no.value.in.french', [], null, 'fr-FR');

            expect(localisedKey).toBe('No value in other language than en-GB');
        });

        it('should be able to localize an i18n key with placeholders', function () {
            var localisedKey = cultureService.localize('test.key.to.localize.with.placeholder', ['key', 'three', 'placeholders'], null, 'en-GB');

            expect(localisedKey).toBe('this key has three placeholders');
        });

        it('should be able to return a default value if no localization exists in the language', function () {
            var localisedKey = cultureService.localize('test.key.without.value.in.the.language', [], 'default value', 'en-GB');

            expect(localisedKey).toBe('default value');
        });

        it('should be able to display name', function () {
            var obj = {i18n: 'test.key.to.localize'};
            obj = cultureService.displayName(obj);

            expect(obj).toEqual('key to localize in english');
        });
    });


    describe('the culture module filters', function () {
        var $rootScope,
            cultureService,
            $filter;

        beforeEach(function (done) {
            angular.mock.module('w20CoreCulture');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;
                cultureService = $injector.get('CultureService');

                $rootScope.$digest();
            });

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                unregister();
                done();
            });

            cultureService.culture('en-GB');
        });

        it('should have a localize filter', function () {
            expect($filter('localize')).toBeDefined();
        });

        it('should have a localize filter which returns an empty string if input is not a string', function () {
            expect($filter('localize')(1)).toBe('');
            expect($filter('localize')({})).toBe('');
            expect($filter('localize')([])).toBe('');
            expect($filter('localize')(new Date())).toBe('');
        });

        it('should should have a localize filter to translate the input in the active culture', function () {
            expect($filter('localize')).toBeDefined();
            expect(cultureService.culture().name).toBe('en-GB');

            var result = $filter('localize')('test.key.to.localize');

            expect(result).toBe('key to localize in english');
        });

        it('should have a displayName filter', function () {
            expect($filter('displayName')).toBeDefined();
        });

        it('should have a displayName filter which return an empty string if input is not an object', function () {
            expect($filter('displayName')('string')).toBe('');
            expect($filter('displayName')(1)).toBe('');
            expect($filter('displayName')(true)).toBe('');
        });

        it('should have a displayName filter localized object with an i18n property', function () {
            expect($filter('displayName')({i18n: 'test.key.to.localize'})).toBe('key to localize in english');
        });

        it('should have a currency filter', function () {
            expect($filter('currency')).toBeDefined();
        });

        it('should have a currency filter which return an empty string if input is not a number', function () {
            expect($filter('currency')('string')).toBe('');
            expect($filter('currency')(new Date())).toBe('');
            expect($filter('currency')(true)).toBe('');
        });

        it('should have a currency filter which format numbers to currency in the active language', function (done) {
            var currency = 10;

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('currency')(currency)).toBe('£10.00');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('currency')(currency)).toBe('10,00 €');
                unregister();
                done();
            });
            cultureService.culture('fr-FR');
        });

        it('should have a datetime filter', function () {
            expect($filter('datetime')).toBeDefined();
        });

        it('should have a datetime filter which format a date to a localized datetime', function (done) {
            var dateNumber = 1413196736826;
            var dateObj = new Date(1413196736826);

            var hours = new Date(1413196736826).getHours();
            var day = new Date(1413196736826).getDate();

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('datetime')(dateNumber)).toEqual(day + ' October 2014 ' + hours + ':38:56');
            expect($filter('datetime')(dateObj)).toEqual(day + ' October 2014 ' + hours + ':38:56');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('datetime')(dateNumber)).toEqual('lundi ' + day + ' octobre 2014 ' + hours + ':38:56');
                expect($filter('datetime')(dateObj)).toEqual('lundi ' + day + ' octobre 2014 ' + hours + ':38:56');
                unregister();
                done();
            });
            cultureService.culture('fr-FR');
        });

        it('should have a date filter', function () {
            expect($filter('date')).toBeDefined();
        });

        it('should have a date filter which format a date to a localized date', function (done) {
            var dateNumber = 1413196736826;
            var dateObj = new Date(1);

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('date')(dateNumber)).toEqual('13/10/2014');
            expect($filter('date')(dateObj)).toEqual('01/01/1970');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('date')(dateNumber)).toEqual('13/10/2014');
                expect($filter('date')(dateObj)).toEqual('01/01/1970');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });

        it('should have a time filter', function () {
            expect($filter('time')).toBeDefined();
        });

        it('should have a time filter which format a date to a localized time', function (done) {
            var dateNumber = 1413196736826;
            var dateObj = new Date(1413196736826);

            var hours = new Date(1413196736826).getHours();

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('time')(dateNumber)).toEqual(hours + ':38:56');
            expect($filter('time')(dateObj)).toEqual(hours + ':38:56');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('time')(dateNumber)).toEqual(hours + ':38:56');
                expect($filter('time')(dateObj)).toEqual(hours + ':38:56');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });

        it('should have a number filter', function () {
            expect($filter('number')).toBeDefined();
        });

        it('should have a number filter which format a number to a localized number', function (done) {
            var number = 1.2;

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('number')(number)).toEqual('1.20');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('number')(number)).toEqual('1,20');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });

        it('should have a digit filter', function () {
            expect($filter('digit')).toBeDefined();
        });

        it('should have a digit filter which format a digit to a localized digit string', function (done) {
            var number = 1;

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('number')(number)).toEqual('1.00');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('number')(number)).toEqual('1,00');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });

        it('should have a percent filter', function () {
            expect($filter('percent')).toBeDefined();
        });

        it('should have a percent filter which format a percentage to a localized percentage', function (done) {
            var number = 10;

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('number')(number)).toEqual('10.00');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('number')(number)).toEqual('10,00');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });

        it('should have a format filter', function () {
            expect($filter('format')).toBeDefined();
        });

        it('should have a format filter which format an input according to the formating argument', function (done) {
            var number = 10;

            expect(cultureService.culture().name).toBe('en-GB');
            expect($filter('number')(number, 'd')).toEqual('10');

            var unregister = $rootScope.$on('w20.culture.culture-changed', function () {
                expect(cultureService.culture().name).toBe('fr-FR');
                expect($filter('number')(number, 'd')).toEqual('10');
                unregister();
                done();
            });

            cultureService.culture('fr-FR');
        });
    });
});
