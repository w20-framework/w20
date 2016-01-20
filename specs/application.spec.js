/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',
    '{w20-core}/modules/application',
    '{angular-mocks}/angular-mocks'
], function (angular, application) {
    'use strict';

    describe('The Application Service', function () {
        var $injector,
            $rootScope,
            $route,
            $controller,
            $location,
            applicationService,
            checkFn;

        beforeEach(function (done) {
            checkFn = false;

            application.lifecycle.pre([], {
                'test-fragment': {
                    configuration: {},
                    definition: {
                        id: 'test-fragment-core',
                        routes: {
                            testRouteViewTemplate: {
                                category: 'categoryView',
                                sortKey: 1,
                                template: '<div id="test-route-view-template"></div>',
                                controller: 'ViewController'
                            },
                            testRouteCheck: {
                                type: 'view',
                                check: 'testRouteCheckFn'
                            },
                            testRouteAuthenticationRequired: {
                                type: 'view',
                                controller: 'MockController',
                                security: 'isAuthenticated()'
                            }
                        }
                    }
                }
            }, function () {
                angular.mock.module('w20CoreApplication', function ($provide, $controllerProvider) {
                    $provide.value('testRouteCheckFn', function () {
                        checkFn = true;
                    });
                    $controllerProvider.register('MockController', ['$scope', 'security', function ($scope, security) {
                        $scope.security = security;
                    }]);
                });

                angular.mock.inject(function (_$injector_, _$rootScope_, _$route_, _$location_, _$controller_) {
                    $injector = _$injector_;
                    $rootScope = _$rootScope_;
                    $route = _$route_;
                    $location = _$location_;
                    $controller = _$controller_;
                    applicationService = $injector.get('ApplicationService');

                    $rootScope.$digest();
                });

                done();
            });
        });

        it('should be able to provide the application id', function () {
            var id = applicationService.applicationId;

            expect(id).toBeDefined();
            expect(id).toBe('w20-test');
        });

        it('should normalize route path', function () {
            var route1 = 'app/test/route',
                normalizedRoute1 = applicationService.normalizeRouteName(route1);
            expect(normalizedRoute1).toBe('app.test.route');

            var route2 = 'app/test/route',
                normalizedRoute2 = applicationService.normalizeRouteName(route2, ', ');
            expect(normalizedRoute2).toBe('app, test, route');

            var route3 = 'app/test/#route',
                normalizedRoute3 = applicationService.normalizeRouteName(route3, '/');
            expect(normalizedRoute3).toBe('app/test/route');
        });

        it('should return the home path', function () {
            var homePath = applicationService.homePath;

            expect(homePath).toEqual('/test');
        });

        it('should be able to configure a view route from custom fragment', function () {
            expect($route.routes['/test-fragment/testRouteViewTemplate']).toBeDefined();
            expect($route.routes['/test-fragment/testRouteViewTemplate'].category).toBe('categoryView');
            expect($route.routes['/test-fragment/testRouteViewTemplate'].sortKey).toBe(1);
            expect($route.routes['/test-fragment/testRouteViewTemplate'].template).toBe('<div id="test-route-view-template"></div>');
            expect($route.routes['/test-fragment/testRouteViewTemplate'].controller).toBe('ViewController');
        });

        it('should be able to run a "resolve" function before routing', function () {
            expect(checkFn).toBe(false);
            expect($route.routes['/test-fragment/testRouteCheck'].resolve.routeCheck).toBeDefined();

            $injector.invoke($route.routes['/test-fragment/testRouteCheck'].resolve.routeCheck);

            expect(checkFn).toBe(true);
        });

        it('should be able to run a "resolve" function before routing', function () {
            expect(checkFn).toBe(false);
            expect($route.routes['/test-fragment/testRouteCheck'].resolve.routeCheck).toBeDefined();

            $injector.invoke($route.routes['/test-fragment/testRouteCheck'].resolve.routeCheck);

            expect(checkFn).toBe(true);
        });

        // TODO - test route resolve security
        it('should reject route resolution promise if not authenticated', function () {
            expect($route.routes['/test-fragment/testRouteAuthenticationRequired']).toBeDefined();
            expect($route.routes['/test-fragment/testRouteAuthenticationRequired'].security).toBe('isAuthenticated()');
            expect($route.routes['/test-fragment/testRouteAuthenticationRequired'].resolve.security).toBeDefined();

            var resolveSecurity = $route.routes['/test-fragment/testRouteAuthenticationRequired'].resolve.security;
            var resolved = $injector.invoke(resolveSecurity);

            console.log(resolved);

            $rootScope.$apply();
        });

    });
});