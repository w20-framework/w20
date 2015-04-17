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
    '{w20-core}/modules/application',
    '{w20-ui}/modules/ui',
    '{angular-mocks}/angular-mocks'
], function (angular, application) {
    'use strict';

    describe('The Display Service', function () {
        var $injector,
            $rootScope,
            $compile,
            displayService;

        beforeEach(function () {
            angular.mock.module('w20UI');

            angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_) {
                $injector = _$injector_;
                $rootScope = _$rootScope_;
                $compile = _$compile_;
                displayService = $injector.get('DisplayService');

                $rootScope.$digest();
            });
        });

        it('should request full screen', function () {
            var element = angular.element('body')[0];
            var div = angular.element('div');

            element.requestFullScreen = function() {};
            div.requestFullScreen = function() {};
            window.spyOn(element, 'requestFullScreen');
            window.spyOn(div, 'requestFullScreen');
            displayService.enterFullScreen(element);
            expect(element.requestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen();
            expect(element.requestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen(div);
            expect(div.requestFullScreen).toHaveBeenCalled();
            delete element.requestFullScreen;
            delete div.requestFullScreen;

            element.webkitRequestFullScreen = function() {};
            div.webkitRequestFullScreen = function() {};
            window.spyOn(element, 'webkitRequestFullScreen');
            window.spyOn(div, 'webkitRequestFullScreen');
            displayService.enterFullScreen(element);
            expect(element.webkitRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen();
            expect(element.webkitRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen(div);
            expect(div.webkitRequestFullScreen).toHaveBeenCalled();
            delete element.webkitRequestFullScreen;
            delete div.webkitRequestFullScreen;

            element.mozRequestFullScreen = function() {};
            div.mozRequestFullScreen = function() {};
            window.spyOn(element, 'mozRequestFullScreen');
            window.spyOn(div, 'mozRequestFullScreen');
            displayService.enterFullScreen(element);
            expect(element.mozRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen();
            expect(element.mozRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen(div);
            expect(div.mozRequestFullScreen).toHaveBeenCalled();
            delete element.mozRequestFullScreen;
            delete div.mozRequestFullScreen;

            element.msRequestFullScreen = function() {};
            div.msRequestFullScreen = function() {};
            window.spyOn(element, 'msRequestFullScreen');
            window.spyOn(div, 'msRequestFullScreen');
            displayService.enterFullScreen(element);
            expect(element.msRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen();
            expect(element.msRequestFullScreen).toHaveBeenCalled();
            displayService.enterFullScreen(div);
            expect(div.msRequestFullScreen).toHaveBeenCalled();
            delete element.msRequestFullScreen;
            delete div.msRequestFullScreen;

            var $log = $injector.get('$log');
            window.spyOn($log, 'warn');
            displayService.enterFullScreen(element);
            expect($log.warn).toHaveBeenCalledWith('cannot enter fullscreen mode, no support');
        });

        it('should exit full screen', function () {
            var $window = $injector.get('$window');
            expect($window).toBeDefined();

            var cancelFullScreen = $window.document.cancelFullScreen,
                webkitCancelFullScreen = $window.document.webkitCancelFullScreen,
                mozCancelFullScreen = $window.document.mozCancelFullScreen;

            $window.document.cancelFullScreen = function() {};
            window.spyOn($window.document, 'cancelFullScreen');
            displayService.exitFullScreen();
            expect($window.document.cancelFullScreen).toHaveBeenCalled();
            $window.document.cancelFullScreen = cancelFullScreen;

            $window.document.webkitCancelFullScreen = function() {};
            window.spyOn($window.document, 'webkitCancelFullScreen');
            displayService.exitFullScreen();
            expect($window.document.webkitCancelFullScreen).toHaveBeenCalled();
            $window.document.webkitCancelFullScreen = webkitCancelFullScreen;

            $window.document.mozCancelFullScreen = function() {};
            window.spyOn($window.document, 'mozCancelFullScreen');
            displayService.exitFullScreen();
            expect($window.document.mozCancelFullScreen).toHaveBeenCalled();
            $window.document.mozCancelFullScreen = mozCancelFullScreen;
        });

        it('should register content shift', function() {
            var callback = function () { return [0, 0, 0, 0]; };

            var shiftCallbacks = displayService.registerContentShiftCallback();
            expect(shiftCallbacks.length).toBe(0);
            shiftCallbacks = displayService.registerContentShiftCallback(callback);
            expect(shiftCallbacks).toBeDefined();
            expect(shiftCallbacks.indexOf(callback) > -1).toBeTruthy();
        });

        it('should compute the content shift', function() {
            var callback = { fn: function() {} };
            window.spyOn(displayService, 'computeContentShift');

            var shiftCallbacks = displayService.registerContentShiftCallback(callback.fn);

            expect(displayService.computeContentShift).toHaveBeenCalled();
            expect(shiftCallbacks).toEqual([callback.fn]);
        });
    });

    describe('The Navigation Service', function () {
        var $injector,
            $rootScope,
            $compile,
            $route,
            navigationService;

        beforeEach(function (done) {
            application.lifecycle.pre([], {
                'test-fragment-nav': {
                    configuration: {},
                    definition: {
                        id: 'test-fragment-nav',
                        routes: {
                            testRoute2: {
                                category: 'category2'
                            },
                            testRoute21: {
                                category: 'category2.category22'
                            },
                            testRoute1: {
                                category: 'category1'
                            },
                            testRoute11: {
                                category: 'category1.category11'
                            },
                            testRouteInvisible: {
                                category: 'invisible',
                                hidden: true
                            },
                            testTopLevelRoute1: {},
                            testTopLevelRoute2: {}
                        }
                    }
                }
            }, function () {
                angular.mock.module('w20UI');

                angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_, _$route_) {
                    $injector = _$injector_;
                    $rootScope = _$rootScope_;
                    $compile = _$compile_;
                    $route = _$route_;
                    navigationService = $injector.get('NavigationService');

                    $rootScope.$digest();

                    expect($route.routes['/test-fragment-nav/testRoute1']).toBeDefined();
                    expect($route.routes['/test-fragment-nav/testRoute2']).toBeDefined();
                });

                done();
            });
        });

        it('should return the route tree', function() {
            var routeTree = navigationService.routeTree();

            expect(routeTree).toBeDefined();
            expect(routeTree).toEqual(jasmine.any(Object));

            expect(routeTree.category1).toBeDefined();
            expect(routeTree.category1).toEqual(jasmine.any(Array));
            expect(routeTree.category1[0].hasOwnProperty('route')).toBeTruthy();
            expect(routeTree.category1[0].hasOwnProperty('category')).toBeTruthy();
            expect(routeTree.category1[0].route.category).toBe('category1');
            expect(routeTree.category1[0].route.name).toBe('test-fragment-nav.testRoute1');

            expect(routeTree.category2).toBeDefined();
            expect(routeTree.category2).toEqual(jasmine.any(Array));
            expect(routeTree.category2[0].hasOwnProperty('route')).toBeTruthy();
            expect(routeTree.category2[0].hasOwnProperty('category')).toBeTruthy();
            expect(routeTree.category2[0].route.category).toBe('category2');
            expect(routeTree.category2[0].route.name).toBe('test-fragment-nav.testRoute2');
        });

        it('should compute the subTree', function() {
            var routeTree = navigationService.routeTree();
            var subTree = navigationService.computeSubTree(routeTree);
            var subSubTree;

            expect(subTree).toEqual(jasmine.any(Array));

            expect(subTree[0]).toEqual(jasmine.any(Array));
            expect(subTree[0].categoryName).toEqual('category1');
            expect(subTree[0][0].route).toBeDefined();

            expect(subTree[1]).toEqual(jasmine.any(Array));
            expect(subTree[1].categoryName).toEqual('category2');
            expect(subTree[1][0].route).toBeDefined();

            subSubTree = navigationService.computeSubTree(subTree[0]);
            expect(subSubTree[0]).toEqual(jasmine.any(Array));
            expect(subSubTree[0][0].category).toEqual('category1.category11');
            expect(subSubTree[1].category).toEqual('category1');

            subSubTree = navigationService.computeSubTree(subTree[1]);
            expect(subSubTree[0]).toEqual(jasmine.any(Array));
            expect(subSubTree[0][0].category).toEqual('category2.category22');
            expect(subSubTree[1].category).toEqual('category2');

            subSubTree = navigationService.computeSubTree();
            expect(subSubTree).toBeNull();
        });

        it('should be able to detect expanded route categories in theme menu', function() {
            var expandedRouteCategories = navigationService.expandedRouteCategories();
            expect(expandedRouteCategories).toEqual(['category1', 'category1.category11']);
        });

        it('should return the top level route categories', function() {
            var topLevelRouteCategories = navigationService.topLevelRouteCategories();
            expect(topLevelRouteCategories).toEqual(['category1', 'category2']);
        });

        it('should return the top level routes', function() {
            var topLevelRoutes = navigationService.topLevelRoutes();

            expect(topLevelRoutes.length).toEqual(2);
            expect(topLevelRoutes[0].name).toEqual('test-fragment-nav.testTopLevelRoute1');
            expect(topLevelRoutes[1].name).toEqual('test-fragment-nav.testTopLevelRoute2');
        });

        it('should return the (visible) routes given the associated category', function() {
            var routesFromCategory = navigationService.routesFromCategory('category1');
            expect(routesFromCategory.length).toEqual(1);
            expect(routesFromCategory[0].name).toEqual('test-fragment-nav.testRoute1');

            routesFromCategory = navigationService.routesFromCategory('category2.category22');
            expect(routesFromCategory.length).toEqual(1);
            expect(routesFromCategory[0].name).toEqual('test-fragment-nav.testRoute21');
        });

        it('should NOT return the routes from category if they are not visible', function() {
            expect($route.routes['/test-fragment-nav/testRouteInvisible']).toBeDefined();

            var routesFromCategory = navigationService.routesFromCategory('invisible');
            expect(routesFromCategory).toEqual([]);
        });

        it('should return the route visiblity', function() {
            var isRouteVisible = navigationService.isRouteVisible($route.routes['/test-fragment-nav/testRoute1']);
            expect(isRouteVisible).toBeTruthy();

            isRouteVisible = navigationService.isRouteVisible($route.routes['/test-fragment-nav/testRouteInvisible']);
            expect(isRouteVisible).toBeFalsy();
        });
    });

    describe('the Menu Service', function () {
        var $injector,
            $rootScope,
            $compile,
            menuService;

        beforeEach(function () {
            angular.mock.module('w20UI');

            angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_) {
                $injector = _$injector_;
                $rootScope = _$rootScope_;
                $compile = _$compile_;
                menuService = $injector.get('MenuService');

                $rootScope.$digest();
            });
        });

        it('should have default action type registered', function() {
            var registeredActions = menuService.getRegisteredActions();

            expect(registeredActions['w20-action']).toBeDefined();
            expect(registeredActions['w20-login']).toBeDefined();
            expect(registeredActions['w20-logout']).toBeDefined();
            expect(registeredActions['w20-link']).toBeDefined();
            expect(registeredActions['w20-culture']).toBeDefined();
            expect(registeredActions['w20-connectivity']).toBeDefined();
        });

        it('should have default section type registered', function() {
            var registeredSections = menuService.getRegisteredSections();

            expect(registeredSections['w20-section']).toBeDefined();
            expect(registeredSections['w20-bookmarks']).toBeDefined();
            expect(registeredSections['w20-views']).toBeDefined();
        });

        it('should be able to register an action', function() {
            expect(menuService.getRegisteredActions()['w20-test-action']).toBeUndefined();
            menuService.registerActionType('w20-test-action', {});
            expect(menuService.getRegisteredActions()['w20-test-action']).toBeDefined();
        });

        it('should be able to register a section', function() {
            expect(menuService.getRegisteredSections()['w20-test-section']).toBeUndefined();
            menuService.registerSectionType('w20-test-section', {});
            expect(menuService.getRegisteredSections()['w20-test-section']).toBeDefined();
        });

        it('should be able to add an action', function() {
            menuService.registerActionType('w20-test-action', {});
            menuService.addAction('w20-test-action-name', 'w20-test-action', {});
            var addedAction = menuService.getAction('w20-test-action-name');
            expect(addedAction.sortKey).toBe(0);
            expect(addedAction.type).toBe('w20-test-action');
            expect(addedAction.showFn()).toBe(true);
            expect(addedAction.name).toBe('w20-test-action-name');
        });

        it('should be able to add a section', function() {
            menuService.registerSectionType('w20-test-section', {});
            menuService.addSection('w20-test-section-name', 'w20-test-section', {});
            var addedSection = menuService.getSection('w20-test-section-name');
            expect(addedSection.sortKey).toBe(0);
            expect(addedSection.type).toBe('w20-test-section');
            expect(addedSection.showFn()).toBe(true);
            expect(addedSection.name).toBe('w20-test-section-name');
        });

        it('should be able to remove an action', function() {
            menuService.registerActionType('w20-test-action', {});
            menuService.addAction('w20-test-action-name', 'w20-test-action', {});
            expect(menuService.getAction('w20-test-action-name')).toBeDefined();

            menuService.removeAction('w20-test-action-name');
            expect(function() { menuService.getAction('w20-test-action-name'); }).toThrow();
        });

        it('should be able to remove a section', function() {
            menuService.registerSectionType('w20-test-section', {});
            menuService.addSection('w20-test-section-name', 'w20-test-section', {});
            expect(menuService.getSection('w20-test-section-name')).toBeDefined();

            menuService.removeSection('w20-test-section-name');
            expect(function() { menuService.getSection('w20-test-section-name'); }).toThrow();
        });

    });

    describe('the Bookmark Service', function () {
        var $injector,
            $rootScope,
            $compile,
            $route,
            store,
            bookmarkService;

        beforeEach(function (done) {
            store = {};

            spyOn(localStorage, 'getItem').and.callFake(function(key) {
                return store[key];
            });
            Object.defineProperty(sessionStorage, 'setItem', { writable: true });
            spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
                store[key] = value;
            });

            application.lifecycle.pre([], {
                'test-fragment-bookmark': {
                    configuration: {},
                    definition: {
                        id: 'test-fragment-bookmark',
                        routes: {
                            testRoute2: {
                                category: 'category2'
                            },
                            testRoute21: {
                                category: 'category2.category22'
                            },
                            testRoute1: {
                                category: 'category1'
                            },
                            testRoute11: {
                                category: 'category1.category11'
                            },
                            testRouteInvisible: {
                                category: 'invisible',
                                hidden: true
                            },
                            testTopLevelRoute1: {},
                            testTopLevelRoute2: {}
                        }
                    }
                }
            }, function () {
                angular.mock.module('w20UI');

                angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_, _$route_) {
                    $injector = _$injector_;
                    $rootScope = _$rootScope_;
                    $compile = _$compile_;
                    $route = _$route_;
                    bookmarkService = $injector.get('BookmarkService');

                    $rootScope.$digest();
                });

                done();
            });
        });

        it('should be able to add a bookmark and retrieve it', function() {
            bookmarkService.addBookmark('testBookmark', $route.routes['/test-fragment-bookmark/testRoute1']);
            var bookmark = bookmarkService.getBookmark('testBookmark');
            expect(bookmark.name).toEqual('test-fragment-bookmark.testRoute1');
        });

        it('should be able to return all bookmarks', function() {
            bookmarkService.addBookmark('testBookmark1', $route.routes['/test-fragment-bookmark/testRoute1']);
            bookmarkService.addBookmark('testBookmark2', $route.routes['/test-fragment-bookmark/testRoute2']);
            var bookmarks = bookmarkService.getAllBookmarks();

            expect(bookmarks.testBookmark1.name).toBe('test-fragment-bookmark.testRoute1');
            expect(bookmarks.testBookmark2.name).toBe('test-fragment-bookmark.testRoute2');
        });

        it('should be able to remove a bookmark', function() {
            expect(bookmarkService.getBookmark('testBookmark')).toEqual(false);
            bookmarkService.addBookmark('testBookmark', $route.routes['/test-fragment-bookmark/testRoute1']);
            expect(bookmarkService.getBookmark('testBookmark')).toBeDefined();
            bookmarkService.removeBookmark('testBookmark');
            expect(bookmarkService.getBookmark('testBookmark')).toEqual(false);
        });

        it('should be able to reset all bookmarks', function() {
            bookmarkService.addBookmark('testBookmark1', $route.routes['/test-fragment-bookmark/testRoute1']);
            bookmarkService.addBookmark('testBookmark2', $route.routes['/test-fragment-bookmark/testRoute2']);
            expect(Object.keys(bookmarkService.getAllBookmarks()).length).toEqual(2);

            bookmarkService.reset();

            expect(bookmarkService.getAllBookmarks()).toEqual({});
        });
    });
});