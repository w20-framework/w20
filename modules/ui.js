/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'require',
    'module',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',

    '[optional]![text]!{css-framework}/templates/error-report.html',
    '[optional]!{css-framework}/modules/css-framework',

    '{w20-core}/modules/env',
    '{w20-core}/modules/culture',
    '{w20-core}/modules/security'

], function (require, module, $, _, angular, errorReportTemplate, framework) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreUI
     *
     * @description
     *
     * This module provides basic UI services. It loads the configured CSS framework.
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
    var w20CoreUI = angular.module('w20CoreUI', ['w20CoreEnv', 'w20CoreSecurity', 'w20CoreCulture']),
        config = module && module.config() || {},
        allNavigation = {};

    /**
     * @ngdoc service
     * @name w20CoreUI.service:DisplayService
     *
     * @description
     *
     * This service manages different aspect of the display such as entering/exiting fullscreen or registering
     * dynamic value for margin and padding on dedicated css classes.
     *
     *
     */
    w20CoreUI.factory('DisplayService', ['$window', '$log', function ($window, $log) {
        function getCSSRule(ruleName) {
            var styleSheet = $window.document.styleSheets[0];
            var i = 0;
            var cssRule = false;
            do {
                if (styleSheet.cssRules) {
                    cssRule = styleSheet.cssRules[i];
                } else {
                    cssRule = styleSheet.rules[i];
                }
                if (cssRule) {
                    if (cssRule.selectorText && cssRule.selectorText === ruleName) {
                        return cssRule;
                    }
                }
                i++;
            } while (cssRule);

            return false;
        }

        function addCSSRule(ruleName) {
            $window.document.styleSheets[0].insertRule(ruleName + ' { }', $window.document.styleSheets[0].cssRules.length);
            return getCSSRule(ruleName);
        }

        var shiftCallbacks = [],
            currentContentShift = [0, 0, 0, 0],
            shiftClasses = {
                'top-shift-padding': addCSSRule('.w20-top-shift-padding'),
                'top-shift-margin': addCSSRule('.w20-top-shift-margin'),
                'top-shift': addCSSRule('.w20-top-shift'),
                'right-shift-padding': addCSSRule('.w20-right-shift-padding'),
                'right-shift-margin': addCSSRule('.w20-right-shift-margin'),
                'right-shift': addCSSRule('.w20-right-shift'),
                'bottom-shift-padding': addCSSRule('.w20-bottom-shift-padding'),
                'bottom-shift-margin': addCSSRule('.w20-bottom-shift-margin'),
                'bottom-shift': addCSSRule('.w20-bottom-shift'),
                'left-shift-padding': addCSSRule('.w20-left-shift-padding'),
                'left-shift-margin': addCSSRule('.w20-left-shift-margin'),
                'left-shift': addCSSRule('.w20-left-shift')
            };

        return {
            /**
             * @ngdoc function
             * @name w20CoreUI.service:DisplayService#enterFullScreen
             * @methodOf w20CoreUI.service:DisplayService
             * @param {Object} element Asynchronously requests that the element be made full-screen.
             * It's not guaranteed that the element will be put into full-screen mode.
             *
             * @description
             *
             * Request that the given element be made fullscreen. If no argument is supplied, defaults to the body element
             */
            enterFullScreen: function (element) {
                if (!element) {
                    element = angular.element('body')[0];
                }

                if (element.requestFullScreen) {
                    element.requestFullScreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen($window.Element.ALLOW_KEYBOARD_INPUT);
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullScreen) {
                    element.msRequestFullScreen();
                } else {
                    $log.warn('cannot enter fullscreen mode, no support');
                }
            },
            /**
             * @ngdoc function
             * @name w20CoreUI.service:DisplayService#exitFullScreen
             * @methodOf w20CoreUI.service:DisplayService
             *
             * @description
             *
             * Request that the given element exit fullscreen mode.
             */
            exitFullScreen: function () {
                if ($window.document.cancelFullScreen) {
                    $window.document.cancelFullScreen();
                } else if ($window.document.webkitCancelFullScreen) {
                    $window.document.webkitCancelFullScreen();
                } else if ($window.document.mozCancelFullScreen) {
                    $window.document.mozCancelFullScreen();
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:DisplayService#registerContentShiftCallback
             * @methodOf w20CoreUI.service:DisplayService
             * @param {Function} callback A function that return an array of length 4 corresponding, in the order, to
             * a top, right, bottom and left css content shift that will be summed to any previous content shift value
             * registered by this same method.
             * @returns {Array} An array of functions to be computed
             *
             * @description
             *
             * Register and compute a new css content shift.
             *
             * Explanation:
             *
             * The following classes can have dynamic values:
             *
             * .w20-top-shift-padding
             * .w20-top-shift-margin
             * .w20-top-shift
             * .w20-right-shift-padding
             * .w20-right-shift-margin
             * .w20-right-shift
             * .w20-bottom-shift-padding
             * .w20-bottom-shift-margin
             * .w20-bottom-shift
             * .w20-left-shift-padding
             * .w20-left-shift-margin
             * .w20-left-shift
             *
             * Whenever a function () { return [ a, b, c, d ]; } is registered through this method, the value of theses classes
             * is summed with the value of a, b, c and d
             *
             * a increment the value of .w20-top-shift-padding, .w20-top-shift-margin .w20-top-shift
             * b increment the value of .w20-right-shift-padding, .w20-right-shift-margin, .w20-right-shift
             * c increment the value of .w20-bottom-shift-padding, .w20-bottom-shift-margin, .w20-bottom-shift
             * d increment the value of .w20-left-shift-padding, .w20-left-shift-margin, .w20-left-shift
             *
             */
            registerContentShiftCallback: function (callback) {
                if (callback) {
                    shiftCallbacks.push(callback);
                    this.computeContentShift();
                }

                return shiftCallbacks;
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:DisplayService#computeContentShift
             * @methodOf w20CoreUI.service:DisplayService
             *
             * @description
             *
             * Compute the current css content shift to the w20 "shift" css classes.
             *
             */
            computeContentShift: function () {
                var newContentShift = _.reduce(_.map(shiftCallbacks, function (callback) {
                    return callback();
                }), function (memory, element) {
                    memory[0] += element[0];
                    memory[1] += element[1];
                    memory[2] += element[2];
                    memory[3] += element[3];

                    return memory;
                }, [0, 0, 0, 0]);


                if (newContentShift[0] !== currentContentShift[0]) {
                    shiftClasses['top-shift-padding'].style.setProperty('padding-top', newContentShift[0] + 'px', 'important');
                    shiftClasses['top-shift-margin'].style.setProperty('margin-top', newContentShift[0] + 'px', 'important');
                    shiftClasses['top-shift'].style.setProperty('top', newContentShift[0] + 'px', 'important');
                    currentContentShift[0] = newContentShift[0];
                }

                if (newContentShift[1] !== currentContentShift[1]) {
                    shiftClasses['right-shift-padding'].style.setProperty('padding-right', newContentShift[1] + 'px', 'important');
                    shiftClasses['right-shift-margin'].style.setProperty('margin-right', newContentShift[1] + 'px', 'important');
                    shiftClasses['right-shift'].style.setProperty('right', newContentShift[1] + 'px', 'important');
                    currentContentShift[1] = newContentShift[1];
                }

                if (newContentShift[2] !== currentContentShift[2]) {
                    shiftClasses['bottom-shift-padding'].style.setProperty('padding-bottom', newContentShift[2] + 'px', 'important');
                    shiftClasses['bottom-shift-margin'].style.setProperty('margin-bottom', newContentShift[2] + 'px', 'important');
                    shiftClasses['bottom-shift'].style.setProperty('bottom', newContentShift[2] + 'px', 'important');
                    currentContentShift[2] = newContentShift[2];
                }

                if (newContentShift[3] !== currentContentShift[3]) {
                    shiftClasses['left-shift-padding'].style.setProperty('padding-left', newContentShift[3] + 'px', 'important');
                    shiftClasses['left-shift-margin'].style.setProperty('margin-left', newContentShift[3] + 'px', 'important');
                    shiftClasses['left-shift'].style.setProperty('left', newContentShift[3] + 'px', 'important');
                    currentContentShift[3] = newContentShift[3];
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:DisplayService#getContentShift
             * @methodOf w20CoreUI.service:DisplayService
             * @returns {Object} An object containing top, right, bottom and left attributes denoting content shift values.
             *
             * @description
             *
             * Returns the current values of content shift.
             *
             */
            getContentShift: function() {
                return {
                    top: currentContentShift[0],
                    right: currentContentShift[1],
                    bottom: currentContentShift[2],
                    left: currentContentShift[3]
                };
            }
        };
    }]);

    /**
     * @ngdoc service
     * @name w20CoreUI.service:NavigationService
     *
     * @description
     *
     * This service provides an api for dealing with routes hierarchy in the application. It is used in themes
     * to build the tree menu for instance.
     *
     */
    w20CoreUI.factory('NavigationService', ['$route', 'SecurityExpressionService', 'EventService', function ($route, securityExpressionService, eventService) {
        var routeTree,
            expandedRouteCategories,
            topLevelCategories,
            topLevelRoutes;

        function getTopLevelCategories() {
            if (allNavigation && allNavigation['']) {
                return _.uniq(_.intersection(allNavigation[''].concat(_.keys(routeTree)), _.keys(routeTree)));
            }

            return _.keys(routeTree);
        }

        function buildRouteTree(categories) {
            if (allNavigation) {
                var routesToOrder = [];
                _.each(allNavigation, function (layer) {
                    _.each(layer, function (route, i) {
                        if ((/^\//).test(route)) {
                            routesToOrder.push({name: route, index: i});
                        }
                    });
                });
                if (routesToOrder.length) {
                    _.each(routesToOrder, function (route) {
                        _.each(categories, function (definedRoute, j) {
                            if (route.name === definedRoute.route.path) {
                                categories[j].route.categoryPosition = route.index;
                            }
                        });
                    });
                }
            }

            var pathByCategory = [], i;
            if (categories !== null) {
                pathByCategory = _.groupBy(categories, function (category) {
                    return category.category;
                });
            }

            var keys = _.keys(pathByCategory);
            _.each(keys, function (key) {
                while (key.lastIndexOf('.') > 0) {
                    key = key.substring(0, key.lastIndexOf('.'));
                    if (!_.contains(keys, key)) {
                        pathByCategory[key] = [];
                    }
                }
            });

            keys = _.keys(pathByCategory);
            _.each(keys, function (key) {
                pathByCategory[key].categoryName = key;
                if (allNavigation && key.indexOf('.') > -1) {
                    var split = key.split('.'),
                        child = split.pop(),
                        parent = split.join('.');

                    pathByCategory[key].categoryPosition = allNavigation[parent] ? allNavigation[parent].indexOf(child) : null;
                }
            });

            var tree = {};

            function addToTree(tree, array, paths) {
                for (i = 0; i < array.length; i++) {
                    tree = tree[array[i]] = tree[array[i]] || paths;
                }
            }

            _.each(_.sortBy(_.keys(pathByCategory), function (path) {
                return path;
            }), function (elt) {
                addToTree(tree, elt.split('.'), pathByCategory[elt]);
            });
            return tree;
        }

        function isRouteVisible(route) {
            return !route.hidden && (typeof route.security === 'undefined' || securityExpressionService.evaluate(route.security));
        }

        function buildRouteCategories() {
            return _.sortBy(_.uniq(_.filter(_.map($route.routes, function (route) {
                if (typeof route.category !== 'undefined' && route.category !== '__top' && isRouteVisible(route)) {
                    if (route.i18nKey) {
                        route.i18n = route.i18nKey;
                    }

                    return {
                        category: route.category,
                        route: route
                    };
                } else {
                    return null;
                }
            }), function (elt) {
                return elt !== null;
            })), function (elt) {
                return elt;
            });
        }

        function buildExpandedRouteCategories() {
            var categories = config.expandedRouteCategories || [],
                temp = [];

            function categoryConcat(previous, next) {
                return previous + '.' + next;
            }

            if (categories.length > 0) {
                for (var i = 0, ilen = categories.length; i < ilen; i++) {
                    var arrayPath = categories[i].split('.');
                    for (var j = 0, jlen = arrayPath.length; j < jlen; j++) {
                        var tempArray = arrayPath.slice(0, j + 1);
                        var path = _.reduce(tempArray, categoryConcat);
                        temp.push(path);
                    }
                }
                return _.uniq(temp, true);
            }

            return [];
        }

        function refreshNavigation() {
            var routeCategories = buildRouteCategories();
            routeTree = buildRouteTree(routeCategories);
            expandedRouteCategories = buildExpandedRouteCategories();
            topLevelCategories = getTopLevelCategories();
            topLevelRoutes = _.filter($route.routes, function (route) {
                return route.category === '__top' && isRouteVisible(route);
            });
        }

        refreshNavigation();

        eventService.on('w20.security.authenticated', refreshNavigation);
        eventService.on('w20.security.deauthenticated', refreshNavigation);
        eventService.on('w20.security.refreshed', refreshNavigation);
        eventService.on('w20.security.role-filter-changed', refreshNavigation);
        eventService.on('w20.security.attribute-filter-changed', refreshNavigation);

        return {
            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#routeTree
             * @methodOf w20CoreUI.service:NavigationService
             * @returns {Object} A map of routes hierarchically organized
             *
             * @description
             *
             * Returns the route hierarchy (i.e organized by categories).
             *
             */
            routeTree: function () {
                return routeTree;
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#computeSubTree
             * @methodOf w20CoreUI.service:NavigationService
             * @param {Object} parentMenuTree The parent tree
             * @returns {Object} The subtree of a parent tree
             *
             * @description
             *
             * Given a parent tree this function will compute the underlying subtree. This function is used to
             * determine the deeper level of themes sidebar tree in a recursive way.
             *
             */
            computeSubTree: function (parentMenuTree) {
                if (!parentMenuTree) {
                    return null;
                }
                return _.sortBy(_.compact(_.filter(_.values(parentMenuTree),
                        function (elt) {
                            return _.isArray(elt);
                        }).concat(_.pluck(_.compact(parentMenuTree), 'route'))),
                    function (elt) {
                        return typeof elt.categoryPosition !== 'undefined' ? elt.categoryPosition : (typeof elt.sortKey !== 'undefined' ? elt.sortKey : elt);
                    });
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#expandedRouteCategories
             * @methodOf w20CoreUI.service:NavigationService
             * @returns {Array} A list of the expanded route categories i.e the categories opened in a route menu of themes
             *
             * @description
             *
             * Return the list of the opened categories in a tree menu
             *
             */
            expandedRouteCategories: function () {
                return expandedRouteCategories;
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#topLevelRouteCategories
             * @methodOf w20CoreUI.service:NavigationService
             * @returns {Array} A list of the top level categories
             *
             * @description
             *
             * The top level categories are the one that appear first in a menu before any tree are opened. This function
             * return these top level categories.
             *
             */
            topLevelRouteCategories: function () {
                return topLevelCategories;
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#topLevelRoutes
             * @methodOf w20CoreUI.service:NavigationService
             * @returns {Array} A list of the top level routes
             *
             * @description
             *
             * Routes that are not part of a category are top level routes. Returns a list of these routes.
             *
             */
            topLevelRoutes: function () {
                return topLevelRoutes;
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#routesFromCategory
             * @methodOf w20CoreUI.service:NavigationService
             * @param {String} category The category from which to obtain all the available routes
             * @returns {Array} A list of the visible routes of the supplied category
             *
             * @description
             *
             * Returns the list of all visible routes from a given category name.
             *
             */
            routesFromCategory: function (category) {
                return _.filter($route.routes, function (route) {
                    return typeof route.category !== 'undefined' && route.category === category && isRouteVisible(route);
                });
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#routesFromCategory
             * @methodOf w20CoreUI.service:NavigationService
             * @param {Object} route The route to check visibility of
             * @returns {Boolean} The visibility status of the route
             *
             * @description
             *
             * Routes can be hidden (see security in w20CoreApplication). This function return the visibility state of a given
             * route.
             *
             */
            isRouteVisible: function (route) {
                return isRouteVisible(route);
            },

            /**
             * @ngdoc function
             * @name w20CoreUI.service:NavigationService#refreshNavigation
             * @methodOf w20CoreUI.service:NavigationService
             *
             * @description
             *
             * Refresh the routes hierarchy. This function is used on security event such as login/logout to refresh the available
             * routes for instance.
             *
             */
            refreshNavigation: function () {
                refreshNavigation();
            }
        };
    }]);

    /**
     * @ngdoc service
     * @name w20CoreUI.service:MenuService
     *
     * @description
     *
     * This service allows managing **"actions"** (topbar element) and **"sections"** (sidebar element) in themes that provides both or part
     * of this navigation components.
     *
     */
    w20CoreUI.factory('MenuService', ['SecurityExpressionService', 'AuthenticationService', 'AuthorizationService', 'CultureService',
        function (securityExpressionService, authenticationService, authorizationService, cultureService) {

            function buildItemSubservice(target, itemName) {
                var itemId = 0,
                    itemTypes = {},
                    items = {};

                function registerType(type, itemDefinition) {
                    itemTypes[type] = _.extend({
                        type: type,
                        showFn: function () {
                            return true;
                        },
                        alertCountFn: function () {
                            return 0;
                        }
                    }, itemDefinition);
                }

                function add(name, type, itemConfig) {
                    if (typeof itemTypes[type] === 'undefined') {
                        throw new Error('Unknown item type ' + type);
                    }

                    items[name] = _.extend({
                            sortKey: itemId++
                        },
                        itemConfig,
                        itemTypes[type], {
                            name: name
                        });
                }

                function get(name) {
                    var item = items[name];

                    if (typeof item === 'undefined') {
                        throw new Error('Unknown item ' + name);
                    }

                    if (item.security && !securityExpressionService.evaluate(item.security)) {
                        return null;
                    }

                    return item;
                }

                function remove(name) {
                    delete items[name];
                }

                function getAll() {
                    return _.pluck(_.sortBy(_.filter(items, function (item) {
                        return !item.security || securityExpressionService.evaluate(item.security);
                    }), 'sortKey'), 'name');
                }

                function getRegistered() {
                    return itemTypes;
                }

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#registerSectionType
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} type The name of the registered section type
                 * @param {Object} config Configuration of the registered section type
                 *
                 * @description
                 *
                 * Register a new section type.
                 *
                 * @example
                 *
                 * In themes this is used to register the views and bookmark section
                 *
                 * ```
                 *  menuService.registerSectionType('w20-views', { icon: 'fa fa-th-list' });
                 *
                 *  menuService.registerSectionType('w20-bookmark', { icon: 'fa fa-star' });
                 *```
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#registerActionType
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} type The name of the registered action type
                 * @param {Object} config Configuration of the registered action type
                 *
                 * @description
                 *
                 * Register a new action type.
                 *
                 * @example
                 *
                 * In themes this is used to register the login and culture dropdown type action
                 *
                 * ```
                 *  menuService.registerActionType('w20-login', {
                 *       templateUrl: '{css-framework}/templates/action-login.html',
                 *       showFn: function () {
                 *         return authenticationService.isAuthentifiable();
                 *       }
                 *   });
                 *
                 *  menuService.registerActionType('w20-culture', {
                 *       templateUrl: '{css-framework}/templates/action-culture.html',
                 *       showFn: function () {
                 *         return cultureService.availableCultures().length > 0;
                 *       }
                 *   });
                 *```
                 */
                target['register' + itemName + 'Type'] = registerType;

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#addSection
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the section to add
                 * @param {String} type The section type (which should have been registered with registerSectionType)
                 * @param {Object} config Configuration of the section to add
                 *
                 * @description
                 *
                 * Add a new section to the sidebar.
                 *
                 * @example
                 *
                 * In themes this is used to add the views sections which display routes.
                 * The templateUrl provide a template to use.
                 *
                 * ```
                 *  menuService.addSection('views', 'w20-views', {
                 *      templateUrl: '{w20-business-theme}/templates/sidebar-views.html'
                 *  });
                 *
                 *  // sidebar-views.html
                 *  <nav data-ng-controller="W20btViewsController"> ... </nav>;
                 *```
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#addAction
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the action to add
                 * @param {String} type The action type (which should have been registered with registerActionType)
                 * @param {Object} config Configuration of the action to add
                 *
                 * @description
                 *
                 * Add a new action to the topbar.
                 *
                 * @example
                 *
                 * In themes this is used to add the login action. The sortKey determine the position of the action.
                 *
                 * ```
                 *  menuService.addAction('login', 'w20-login', { sortKey: 100 });
                 *```
                 */
                target['add' + itemName] = add;

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getSection
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the section to find
                 *
                 * @description
                 *
                 * Get the section specified.
                 *
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getAction
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the action to find
                 *
                 * @description
                 *
                 * Get the action specified.
                 *
                 */
                target['get' + itemName] = get;

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#removeSection
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the section to remove
                 *
                 * @description
                 *
                 * Remove the section specified.
                 *
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#removeAction
                 * @methodOf w20CoreUI.service:MenuService
                 * @param {String} name The name of the action to remove
                 *
                 * @description
                 *
                 * Remove the action specified.
                 *
                 */
                target['remove' + itemName] = remove;

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getSections
                 * @methodOf w20CoreUI.service:MenuService
                 *
                 * @description
                 *
                 * Get all available sections.
                 *
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getActions
                 * @methodOf w20CoreUI.service:MenuService
                 *
                 * @description
                 *
                 * Get all available actions.
                 *
                 */
                target['get' + itemName + 's'] = getAll;

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getRegisteredSections
                 * @methodOf w20CoreUI.service:MenuService
                 *
                 * @description
                 *
                 * Get all registered sections.
                 *
                 */

                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:MenuService#getRegisteredActions
                 * @methodOf w20CoreUI.service:MenuService
                 *
                 * @description
                 *
                 * Get all registered actions.
                 *
                 */
                target['getRegistered' + itemName + 's'] = getRegistered;
            }

            var service = {};

            buildItemSubservice(service, 'Action');
            buildItemSubservice(service, 'Section');

            service.registerActionType('w20-action', {});

            service.registerSectionType('w20-section', {});

            service.registerActionType('w20-login', {
                templateUrl: '{css-framework}/templates/action-login.html',
                showFn: function () {
                    return authenticationService.isAuthentifiable();
                }
            });

            service.registerActionType('w20-logout', {
                templateUrl: '{css-framework}/templates/action-logout.html',
                showFn: function () {
                    return authenticationService.isAuthentifiable() && authenticationService.subjectAuthenticated();
                }
            });

            service.registerActionType('w20-link', {
                templateUrl: '{css-framework}/templates/action-link.html'
            });

            service.registerActionType('w20-culture', {
                templateUrl: '{css-framework}/templates/action-culture.html',
                showFn: function () {
                    return cultureService.availableCultures().length > 0;
                }
            });

            service.registerActionType('w20-connectivity', {
                templateUrl: '{css-framework}/templates/action-connectivity.html'
            });

            service.registerActionType('w20-profile', {
                templateUrl: '{css-framework}/templates/action-profile.html',
                showFn: function () {
                    return authenticationService.isAuthentifiable();
                }
            });

            service.registerSectionType('w20-bookmarks', {
                icon: 'fa fa-star'
            });

            service.registerSectionType('w20-views', {
                icon: 'fa fa-th-list'
            });

            return service;
        }]);

    /**
     * @ngdoc service
     * @name w20CoreUI.service:BookmarkService
     *
     * @description
     *
     * This service allows managing routes bookmarks. Bookmarked routes are persisted in a localstorage namespace **"w20-bookmark"**
     *
     */
    w20CoreUI.factory('BookmarkService', ['CultureService', 'StateService', 'ApplicationService', '$window',
        function (cultureService, stateService) {

            var namespace = {name: 'w20-bookmark', keys: {bookmarks: 'bookmarkMap', landingRoute: 'landingRoute'}},
                bookmarkMap = {},
                landingRoute = {},
                bookmarksState = stateService.state(namespace.name, namespace.keys.bookmarks, bookmarkMap),
                landingRouteState = stateService.state(namespace.name, namespace.keys.landingRoute, landingRoute),
                persistence = {
                    persistBookmarks: function () {
                        bookmarksState.value(bookmarkMap);
                    },
                    getBookmarks: function () {
                        return bookmarksState.value();
                    },
                    removeBookmarks: function () {
                        bookmarksState.value(null);
                        this.removeLandingRoute();
                    },
                    persistLandingRoute: function () {
                        landingRouteState.value(landingRoute);
                    },
                    getLandingRoute: function () {
                        return landingRouteState.value();
                    },
                    removeLandingRoute: function () {
                        landingRouteState.value(null);
                    }
                };

            bookmarkMap = persistence.getBookmarks() || {};
            landingRoute = persistence.getLandingRoute() || {};

            return {
                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:BookmarkService#addBookmark
                 * @methodOf w20CoreUI.service:BookmarkService
                 * @param {String} bookmarkName The name of the bookmark.
                 * @param {Object} bookmark The bookmark (i.e a route object)
                 *
                 * @description
                 *
                 * Add a new persistent bookmark.
                 *
                 * @exemple
                 *
                 *```
                 * // route is an angular route from $route.routes
                 * bookmarkService.addBookmark(route.i18n, route);
                 *```
                 *
                 */
                addBookmark: function (bookmarkName, bookmark) {
                    if (!(bookmarkName in bookmarkMap)) {
                        bookmarkMap[bookmarkName] = _.extend(bookmark, {
                            id: new Date().valueOf(),
                            localized: bookmark.userDefinedName || cultureService.displayName(bookmark)
                        });
                        persistence.persistBookmarks();
                    }
                },
                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:BookmarkService#getBookmark
                 * @methodOf w20CoreUI.service:BookmarkService
                 * @param {String} bookmarkName The name of the bookmark.
                 * @returns {Object} The bookmark (i.e a route object)
                 *
                 * @description
                 *
                 * Get a bookmark
                 */
                getBookmark: function (bookmarkName) {
                    return bookmarkMap[bookmarkName] || false;
                },
                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:BookmarkService#getBookmark
                 * @methodOf w20CoreUI.service:BookmarkService
                 * @returns {Object} A map of all bookmarks ({'bookmark-name': route})
                 *
                 * @description
                 *
                 * Get all bookmarks
                 */
                getAllBookmarks: function () {
                    return bookmarkMap;
                },
                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:BookmarkService#removeBookmark
                 * @methodOf w20CoreUI.service:BookmarkService
                 * @param {String} bookmarkName The name of the bookmark.
                 *
                 * @description
                 *
                 * Remove a bookmark (both from session and persistence)
                 */
                removeBookmark: function (bookmarkName) {
                    delete bookmarkMap[bookmarkName];
                    persistence.persistBookmarks();
                },
                /**
                 * @ngdoc function
                 * @name w20CoreUI.service:BookmarkService#reset
                 * @methodOf w20CoreUI.service:BookmarkService
                 *
                 * @description
                 *
                 * Remove all bookmarks (both session and persistence)
                 */
                reset: function () {
                    bookmarkMap = {};
                    persistence.removeBookmarks();
                    this.removeLandingRoute();
                },

                /*
                 Unused at the moment  : allow to set the landing route when app start based on a bookmark
                 */
                setLandingRoute: function (bookmarkName) {
                    landingRoute = this.getBookmark(bookmarkName);
                    persistence.persistLandingRoute(landingRoute);
                },
                getLandingRoute: function () {
                    return landingRoute || false;
                },
                removeLandingRoute: function () {
                    landingRoute = {};
                    persistence.removeLandingRoute();
                }
            };
        }]);

    /**
     * @ngdoc directive
     * @name w20CoreUI.directive:w20ErrorReport
     * @restrict A
     *
     * @description
     *
     * To use the error report, include <code> &lt;div data-w20-error-report &gt;&lt;/div&gt; </code> in your index.html
     * just before the end of the body tag.
     *
     */
    w20CoreUI.directive('w20ErrorReport', ['$rootScope', '$injector', function ($rootScope, $injector) {
        return {
            template: typeof errorReportTemplate === 'string' ? errorReportTemplate : '',
            replace: true,
            restrict: 'A',
            scope: false,
            link: function (scope) {

                function formatStack(arg) {
                    if (typeof arg === 'undefined') {
                        return 'No stack trace';
                    }

                    return $.trim(arg.replace(/^(?!at).*$/m, '')).replace(/\n/g, '<br/>');
                }

                scope.hideModal = true;

                $rootScope.$on('w20.core.application.error-occurred', function (event, errors) {

                    if (framework.name === 'bootstrap-2' || framework.name === 'bootstrap-3') {
                        $('#w20ErrorReportMessage').html(errors[0].exception.message);
                        $('#w20ErrorReportStack').html(formatStack(errors[0].exception.stack));
                        $('#w20ErrorReport').modal('show');
                    }

                    if (framework.name === 'material') {
                        $injector.get('$mdDialog').show({
                            template: errorReportTemplate,
                            parent: angular.element(document.body),
                            clickOutsideToClose:true,
                            controller: ['$scope', function ($scope) {
                                $scope.message = errors[0].exception.message;
                                $scope.stacktrace = errors[0].exception.stack;
                            }]
                        });
                    }
                });
            }
        };
    }]);

    w20CoreUI.controller('W20LoginActionController', ['$scope', 'AuthenticationService', function ($scope, authenticationService) {
        $scope.isAuthentifiable = authenticationService.isAuthentifiable;
        $scope.subjectAuthenticated = authenticationService.subjectAuthenticated;
        $scope.authenticate = authenticationService.authenticate;

        $scope.subjectType = authenticationService.subjectType;
        $scope.subjectId = authenticationService.subjectId;
        $scope.subjectPrincipals = authenticationService.subjectPrincipals;
    }]);

    w20CoreUI.controller('W20LogoutActionController', ['$scope', 'AuthenticationService', function ($scope, authenticationService) {
        $scope.isAuthentifiable = authenticationService.isAuthentifiable;
        $scope.subjectAuthenticated = authenticationService.subjectAuthenticated;
        $scope.deauthenticate = authenticationService.deauthenticate;
    }]);

    w20CoreUI.controller('W20CultureActionController', ['$scope', 'CultureService', function ($scope, cultureService) {
        $scope.currentCulture = function () {
            return cultureService.culture();
        };

        $scope.switchCulture = function (newCulture) {
            cultureService.culture(newCulture);
        };

        $scope.availableCultures = cultureService.availableCultures;
    }]);

    w20CoreUI.controller('W20ConnectivityActionController', ['$scope', 'ConnectivityService', function ($scope, connectivityService) {
        $scope.checkConnectivity = connectivityService.check;
        $scope.state = function () {
            return connectivityService.state().online ? 'online' : 'offline';
        };
    }]);

    w20CoreUI.controller('W20ProfileActionController', ['$scope', 'AuthenticationService', 'AuthorizationService', 'EventService', function ($scope, authenticationService, authorizationService, eventService) {
        $scope.subjectAuthenticated = authenticationService.subjectAuthenticated;
        $scope.subjectPrincipal = authenticationService.subjectPrincipal;
        $scope.subjectId = authenticationService.subjectId;
        $scope.authenticate = authenticationService.authenticate;
        $scope.deauthenticate = authenticationService.deauthenticate;
        $scope.getRoles = authorizationService.getRoles;
        $scope.getAttributes = authorizationService.getAttributes;
        $scope.getRoleFilter = authorizationService.getRoleFilter;
        $scope.getAttributeFilter = authorizationService.getAttributeFilter;

        $scope.roles = {};
        $scope.attributes = {};

        function buildRoleFilterModel(newValue) {
            $scope.roles = {};
            _.each(newValue, function(role) {
                $scope.roles[role] = true;
            });
        }

        function buildAttributeFilterModel(newValue) {
            $scope.attributes = newValue;
        }

        $scope.updateRole = function (role) {
            var currentFilter = authorizationService.getRoleFilter() || [];
            if ($scope.roles[role]) {
                currentFilter = _.union(currentFilter, [role]);
            } else {
                currentFilter = _.difference(currentFilter, [role]);
            }
            authorizationService.setRoleFilter(currentFilter);
        };

        $scope.updateAttribute = function (attribute) {
            var currentAttributes = authorizationService.getAttributeFilter() || {};
            if (!$scope.attributes[attribute]) {
                delete currentAttributes[attribute];
            } else {
                currentAttributes[attribute] = $scope.attributes[attribute];
            }
            authorizationService.setAttributeFilter(currentAttributes);
        };

        eventService.on('w20.security.role-filter-changed', buildRoleFilterModel);
        eventService.on('w20.security.attribute-filter-changed', buildAttributeFilterModel);
    }]);

    return {
        angularModules: ['w20CoreUI'],
        lifecycle: {
            pre: function (modules, fragments, callback) {
                var navigationsToLoad = [];

                _.each(fragments || {}, function (fragment) {
                    if (typeof fragment.definition.navigation === 'string') {
                        var name = fragment.definition.navigation + '?';
                        navigationsToLoad.push(name);
                    } else if (typeof fragment.definition.navigation === 'object') {
                        _.extend(allNavigation, fragment.definition.navigation || {});
                    }
                });

                require(navigationsToLoad.map(function (elt) {
                    return '[text]!' + elt;
                }), function () {
                    var loadedNavigations = Array.prototype.slice.call(arguments, 0);
                    _.each(loadedNavigations, function (loadedNavigation) {
                        _.extend(allNavigation, angular.fromJson(loadedNavigation));
                    });

                    callback(module);
                });
            }
        }
    };
});