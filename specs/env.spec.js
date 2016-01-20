/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'jquery',
    '{angular}/angular',
    '{angular-mocks}/angular-mocks',
    '{w20-core}/modules/env'
], function ($, angular) {
    'use strict';

    describe('the state service', function () {
        var stateService,
            store;

        var authenticationServiceMock = function () {
            return {
                subjectId: jasmine.createSpy().and.callFake(function () {
                })
            };
        };

        var applicationServiceMock = function () {
            return {
                applicationId: 'testId'
            };
        };

        beforeEach(function () {
            store = {};

            spyOn(localStorage, 'getItem').and.callFake(function(key) {
                return store[key];
            });
            Object.defineProperty(sessionStorage, 'setItem', { writable: true });
            spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
                store[key] = value;
            });

            angular.mock.module('w20CoreEnv', function ($provide) {
                $provide.value('AuthenticationService', authenticationServiceMock());
                $provide.value('ApplicationService', applicationServiceMock());
            });

            angular.mock.inject(function ($injector) {
                stateService = $injector.get('StateService');
            });

        });


        it('should be able to store and retrieve simple values', function () {
            var state = stateService.state('test', 'testkey', 'defaultvalue');

            state.value('testvalue');
            expect(state.value()).toEqual('testvalue');
        });

        it('should be able to store and retrieve complex values', function () {
            var state = stateService.state('test', 'testkey', {});

            state.value({
                test: 'test'
            });
            expect(state.value()).toEqual({
                test: 'test'
            });
        });

        it('should be able to enumerate keys', function () {
            stateService.state('test1', 'testkey1', 'defaultvalue');
            stateService.state('test1', 'testkey2', 'defaultvalue');
            stateService.state('test1', 'testkey3', 'defaultvalue');
            stateService.state('test2', 'testkey1', 'defaultvalue');

            var keys1 = stateService.keys('test1');
            expect(keys1.length).toEqual(3);
            expect(keys1[0]).toEqual('testkey1');
            expect(keys1[1]).toEqual('testkey2');
            expect(keys1[2]).toEqual('testkey3');

            var keys2 = stateService.keys('test2');
            expect(keys2.length).toEqual(1);
            expect(keys2[0]).toEqual('testkey1');
        });
    });

    describe('the Event Service', function () {
        var $rootScope,
            eventService,
            $location,
            _$injector,
            event,
            handler = {
                listener: function (mockEventArg) {
                    event = mockEventArg;
                }
            };

        beforeEach(function () {
            angular.mock.module('w20CoreEnv');

            angular.mock.inject(function ($injector, _$rootScope_) {
                _$injector = $injector;
                $rootScope = _$rootScope_;
                eventService = $injector.get('EventService');
                $location = $injector.get('$location');

                $rootScope.$digest();
            });
        });

        it('should be able to emit en event', function () {
            spyOn($rootScope, '$emit');
            expect(event).toBeUndefined();

            var unregister = $rootScope.$on('mockEvent', function() {
                unregister();
                handler.listener();
            });
            eventService.emit('mockEvent', 'mockEventArg');

            expect($rootScope.$emit).toHaveBeenCalledWith('mockEvent', 'mockEventArg');
        });

        it('should be able to listen to a view scoped event', function () {
            spyOn(handler, 'listener');
            expect(event).toBeUndefined();

            eventService.on('mockEvent', handler.listener, 'view');

            $rootScope.$broadcast('$routeChangeSuccess'); // should unsubscribe event handler (view scoped event)
            $rootScope.$apply();

            eventService.emit('mockEvent', 'mockEventArg');
            expect(handler.listener).not.toHaveBeenCalled();
        });

        it('should be able to listen to an application scoped event', function () {
            spyOn(handler, 'listener');
            expect(event).toBeUndefined();

            eventService.on('mockEvent', handler.listener, 'application');

            $rootScope.$broadcast('$routeChangeSuccess'); // should not unsubscribe event
            $rootScope.$apply();

            eventService.emit('mockEvent', 'mockEventArg');
            expect(handler.listener).toHaveBeenCalledWith('mockEventArg');
        });

        it('should throw an error if listener is a string', function () {
            function errorWrapper() {
                eventService.on('mockEvent', 'badHandlerTypeString');
            }

            eventService.emit('mockEvent');
            expect(errorWrapper).toThrow();

        });

        it('should throw an error if listener is a numeral', function () {
            function errorWrapper() {
                eventService.on('mockEvent', 1);
            }

            eventService.emit('mockEvent');
            expect(errorWrapper).toThrow();
        });

    });

    describe('the Connectivity Service', function () {
        var $rootScope,
            connectivityService,
            eventService;

        beforeEach(function () {
            angular.mock.module('w20CoreEnv', function ($provide) {
                $provide.value('$log', console);
            });

            angular.mock.inject(function ($injector, _$rootScope_) {
                $rootScope = _$rootScope_;
                connectivityService = $injector.get('ConnectivityService');
                eventService = $injector.get('EventService');

                $rootScope.$digest();
            });
        });

        it('should be able to return the state of connectivity', function(done) {
            expect(connectivityService.state().online).toBeUndefined();

            connectivityService.check(function() {
                expect([true, false]).toContain(connectivityService.state().online);
                done();
            });
        });

        it('should be able to execute callback on connectivity check', function (done) {
            var callback = jasmine.createSpy().and.callFake(function() {
                expect(callback).toHaveBeenCalled();
                done();
            });

            connectivityService.check(callback);
        });
    });

});
