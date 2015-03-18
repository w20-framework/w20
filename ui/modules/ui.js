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
    'module',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',

    '[text]!{w20-ui}/templates/error-report.html',

    '{w20-core}/modules/env',
    '{w20-core}/modules/security',
    '{bootstrap}/js/bootstrap',
    '[css]!{bootstrap}/css/bootstrap',
    '[css]!{font-awesome}/css/font-awesome',
    '{angular-bootstrap}/ui-bootstrap-tpls'
], function (require, module, $, _, angular, errorReportTemplate) {
    'use strict';

    /**
     * This module manages the UI. It provides Bootstrap 3 and UI-Bootstrap libraries. It is automatically loaded.
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
     *
     * @name w20UI
     * @module
     */
    var w20UI = angular.module('w20UI', ['ui.bootstrap', 'w20CoreEnv', 'w20CoreSecurity']),
        config = module && module.config() || {},
        allNavigation = {};


    w20UI.factory('DisplayService', ['$window', '$log', function ($window, $log) {
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
            oldContentShift = [0, 0, 0, 0],
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

            exitFullScreen: function () {
                if ($window.document.cancelFullScreen) {
                    $window.document.cancelFullScreen();
                } else if ($window.document.webkitCancelFullScreen) {
                    $window.document.webkitCancelFullScreen();
                } else if ($window.document.mozCancelFullScreen) {
                    $window.document.mozCancelFullScreen();
                }
            },

            registerContentShiftCallback: function (callback) {
                if (callback) {
                    shiftCallbacks.push(callback);
                    this.computeContentShift();
                }

                return shiftCallbacks;
            },

            computeContentShift: function () {
                var contentShift = _.reduce(_.map(shiftCallbacks, function (callback) {
                    return callback();
                }), function (memory, element) {
                    memory[0] += element[0];
                    memory[1] += element[1];
                    memory[2] += element[2];
                    memory[3] += element[3];

                    return memory;
                }, [0, 0, 0, 0]);


                if (contentShift[0] !== oldContentShift[0]) {
                    shiftClasses['top-shift-padding'].style.setProperty('padding-top', contentShift[0] + 'px', 'important');
                    shiftClasses['top-shift-margin'].style.setProperty('margin-top', contentShift[0] + 'px', 'important');
                    shiftClasses['top-shift'].style.setProperty('top', contentShift[0] + 'px', 'important');
                    oldContentShift[0] = contentShift[0];
                }

                if (contentShift[1] !== oldContentShift[1]) {
                    shiftClasses['right-shift-padding'].style.setProperty('padding-right', contentShift[1] + 'px', 'important');
                    shiftClasses['right-shift-margin'].style.setProperty('margin-right', contentShift[1] + 'px', 'important');
                    shiftClasses['right-shift'].style.setProperty('right', contentShift[1] + 'px', 'important');
                    oldContentShift[1] = contentShift[1];
                }

                if (contentShift[2] !== oldContentShift[2]) {
                    shiftClasses['bottom-shift-padding'].style.setProperty('padding-bottom', contentShift[2] + 'px', 'important');
                    shiftClasses['bottom-shift-margin'].style.setProperty('margin-bottom', contentShift[2] + 'px', 'important');
                    shiftClasses['bottom-shift'].style.setProperty('bottom', contentShift[2] + 'px', 'important');
                    oldContentShift[2] = contentShift[2];
                }

                if (contentShift[3] !== oldContentShift[3]) {
                    shiftClasses['left-shift-padding'].style.setProperty('padding-left', contentShift[3] + 'px', 'important');
                    shiftClasses['left-shift-margin'].style.setProperty('margin-left', contentShift[3] + 'px', 'important');
                    shiftClasses['left-shift'].style.setProperty('left', contentShift[3] + 'px', 'important');
                    oldContentShift[3] = contentShift[3];
                }

            }
        };
    }]);

    w20UI.factory('NavigationService', ['$route', 'SecurityExpressionService', 'EventService', function ($route, securityExpressionService, eventService) {
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
            routeTree: function () {
                return routeTree;
            },

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

            expandedRouteCategories: function () {
                return expandedRouteCategories;
            },

            topLevelRouteCategories: function () {
                return topLevelCategories;
            },

            topLevelRoutes: function () {
                return topLevelRoutes;
            },

            routesFromCategory: function (category) {
                return _.filter($route.routes, function (route) {
                    return typeof route.category !== 'undefined' && route.category === category && isRouteVisible(route);
                });
            },

            isRouteVisible: function (route) {
                return isRouteVisible(route);
            },

            refreshNavigation: function () {
                refreshNavigation();
            }
        };
    }]);

    w20UI.factory('MenuService', ['SecurityExpressionService', 'AuthenticationService', 'AuthorizationService', 'CultureService',
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

                target['register' + itemName + 'Type'] = registerType;
                target['add' + itemName] = add;
                target['get' + itemName] = get;
                target['remove' + itemName] = remove;
                target['get' + itemName + 's'] = getAll;
                target['getRegistered' + itemName + 's'] = getRegistered;
            }

            var service = {};

            buildItemSubservice(service, 'Action');
            buildItemSubservice(service, 'Section');

            service.registerActionType('w20-action', {});

            service.registerSectionType('w20-section', {});

            service.registerActionType('w20-login', {
                templateUrl: '{w20-ui}/templates/action-login.html',
                showFn: function () {
                    return authenticationService.isAuthentifiable();
                }
            });

            service.registerActionType('w20-logout', {
                templateUrl: '{w20-ui}/templates/action-logout.html',
                showFn: function () {
                    return authenticationService.isAuthentifiable() && authenticationService.subjectAuthenticated();
                }
            });

            service.registerActionType('w20-link', {
                templateUrl: '{w20-ui}/templates/action-link.html'
            });

            service.registerActionType('w20-culture', {
                templateUrl: '{w20-ui}/templates/action-culture.html',
                showFn: function () {
                    return cultureService.availableCultures().length > 0;
                }
            });

            service.registerActionType('w20-connectivity', {
                templateUrl: '{w20-ui}/templates/action-connectivity.html'
            });

            service.registerActionType('w20-profile', {
                templateUrl: '{w20-ui}/templates/action-profile.html',
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

    w20UI.factory('BookmarkService', ['CultureService', 'StateService', 'ApplicationService', '$window',
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
                addBookmark: function (bookmarkName, bookmark) {
                    if (!(bookmarkName in bookmarkMap)) {
                        bookmarkMap[bookmarkName] = _.extend(bookmark, {
                            id: new Date().valueOf(),
                            localized: bookmark.userDefinedName || cultureService.displayName(bookmark)
                        });
                        persistence.persistBookmarks();
                    }
                },
                getBookmark: function (bookmarkName) {
                    return bookmarkMap[bookmarkName] || false;
                },
                getAllBookmarks: function () {
                    return bookmarkMap;
                },
                removeBookmark: function (bookmarkName) {
                    delete bookmarkMap[bookmarkName];
                    persistence.persistBookmarks();
                },
                reset: function () {
                    bookmarkMap = {};
                    persistence.removeBookmarks();
                    this.removeLandingRoute();
                },
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
     * To use the error report, include <code> &lt;div data-w20-error-report &gt;&lt;/div&gt; </code> in your index.html
     * just before the end of the body tag.
     *
     * @name w20ErrorReport
     * @memberOf w20UI
     * @w20doc directive
     */
    w20UI.directive('w20ErrorReport', ['$rootScope', function ($rootScope) {
        return {
            template: errorReportTemplate,
            replace: true,
            restrict: 'A',
            scope: false,
            link: function () {
                function formatStack(arg) {
                    if (typeof arg === 'undefined') {
                        return 'No stack trace';
                    }

                    return $.trim(arg.replace(/^(?!at).*$/m, '')).replace(/\n/g, '<br/>');
                }

                $rootScope.$on('w20.core.application.error-occured', function (event, errors) {
                    $('#w20ErrorReportMessage').html(errors[0].exception.message);
                    $('#w20ErrorReportStack').html(formatStack(errors[0].exception.stack));
                    $('#w20ErrorReport').modal('show');
                });
            }
        };
    }]);

    w20UI.controller('W20LoginActionController', ['$scope', 'AuthenticationService', function ($scope, authenticationService) {
        $scope.isAuthentifiable = authenticationService.isAuthentifiable;
        $scope.subjectAuthenticated = authenticationService.subjectAuthenticated;
        $scope.authenticate = authenticationService.authenticate;

        $scope.subjectType = authenticationService.subjectType;
        $scope.subjectId = authenticationService.subjectId;
        $scope.subjectPrincipals = authenticationService.subjectPrincipals;
    }]);

    w20UI.controller('W20LogoutActionController', ['$scope', 'AuthenticationService', function ($scope, authenticationService) {
        $scope.isAuthentifiable = authenticationService.isAuthentifiable;
        $scope.subjectAuthenticated = authenticationService.subjectAuthenticated;
        $scope.deauthenticate = authenticationService.deauthenticate;
    }]);

    w20UI.controller('W20CultureActionController', ['$scope', 'CultureService', function ($scope, cultureService) {
        $scope.currentCulture = function () {
            return cultureService.culture();
        };

        $scope.switchCulture = function (newCulture) {
            cultureService.culture(newCulture);
        };

        $scope.availableCultures = cultureService.availableCultures;
    }]);

    w20UI.controller('W20ConnectivityActionController', ['$scope', 'ConnectivityService', function ($scope, connectivityService) {
        $scope.checkConnectivity = connectivityService.check;
        $scope.state = function () {
            return connectivityService.state().online ? 'online' : 'offline';
        };
    }]);

    w20UI.controller('W20ProfileActionController', ['$scope', 'AuthenticationService', 'AuthorizationService', 'EventService', function ($scope, authenticationService, authorizationService, eventService) {
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

    w20UI.run(['EventService', 'CultureService', 'datepickerConfig', 'datepickerPopupConfig', function (eventService, cultureService, datepickerConfig, datepickerPopupConfig) {
        datepickerConfig.formatDay = 'dd';
        datepickerConfig.formatMonth = 'MMMM';
        datepickerConfig.formatYear = 'yyyy';
        datepickerConfig.formatDayHeader = 'ddd';
        datepickerConfig.formatDayTitle = 'MMMM yyyy';
        datepickerConfig.formatMonthTitle = 'yyyy';

        function updateDatePicker(culture) {
            datepickerPopupConfig.datepickerPopup = culture.calendars.standard.patterns.d;
            datepickerPopupConfig.currentText = cultureService.localize('w20.ui.datepicker.today');
            datepickerPopupConfig.clearText = cultureService.localize('w20.ui.datepicker.clear');
            datepickerPopupConfig.closeText = cultureService.localize('w20.ui.datepicker.close');
        }

        eventService.on('w20.culture.culture-changed', function (culture) {
            updateDatePicker(culture);
        });

        updateDatePicker(cultureService.culture());
    }]);

    return {
        angularModules: ['w20UI'],
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