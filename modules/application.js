/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'module',
    'w20',
    'require',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-route}/angular-route',
    '{angular-sanitize}/angular-sanitize',

    '{w20-core}/modules/env',
    '{w20-core}/modules/security'
], function (module, w20, require, $, _, angular) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreApplication
     *
     * @description
     *
     * This module configure the following AngularJS aspects:
     *
     * * Routing (more information [here](http://www.seedstack.org/docs/w20/manual/core/routing/)),
     * * Exception handler,
     * * Initialization.
     *
     * This module is required to run a W20 application. It is automatically loaded.
     *
     * # Configuration
     *
     *     "application" : {
     *         "id": "The application unique identifier",
     *         "home": "The path of the home view",
     *         "blank": "The path of the blank view",
     *         "notFound": "The path of the 'view not found' view",
     *         "redirectAfterRouteError": "Specify the path to go to after a route change error",
     *         "defaultSandboxPermissions": "Specify the default iframe-based sandbox permissions (can be overridden by the sandboxPermissions attribute on a specific route)",
     *         "defaultSandboxId": "Specify the default identifier for the sandbox iframe"
     *     }
     *
     * # Fragment definition sections
     *
     * The fragment "routes" section allows to declare application routes. All fragments "routes" sections are merged on application
     * initialization. Fragment "routes" definitions can be overriden by redeclaring the "routes" section in the configuration and
     * redeclaring any value to be overriden.
     *
     *     "routes" : {
     *         "path/of/the/route/1" : {
     *             // Type of the route (view by default by other type can be registered by modules)
     *             "type": "view|..."
     *
     *             // If type attribute is view, the URL of the view HTML template (exclusive with the "template" attribute)
     *             "templateUrl" : "module name of the template",
     *
     *             // If type attribute is view, inline template of the view (exclusive with the "templateUrl" attribute)
     *             "template" : "<html><of><the><template>...",
     *
     *             // Integer key used to sort the category entries
     *             "sortKey" : 1,
     *
     *             // Category of the route
     *             "category" : "category-name",
     *
     *             // Hide the route from being displayed
     *             "hidden" : true|false,
     *
     *             // Name of a "resolve" function that must return a promise. The routing is suspended until the promise is resolved (or rejected).
     *             // The function should be declared using module.value("checkFnName", [ "...", function(...) { } ])
     *             "check" : "checkFnName"
     *         },
     *
     *         "path/of/the/route/2" : { ... },
     *
     *         ...
     *     }
     */
    var w20CoreApplication = angular.module('w20CoreApplication', [ 'w20CoreEnv', 'ngRoute', 'ngSanitize' ]),
        config = module && module.config() || {},
        allRoutes = {},
        allRouteHandlers = {},
        sceUrlWhiteList = [],
        normalizeRouteName = function (path, separator) {
            var result = (typeof path === 'undefined' || path === '' ? 'unknown' : path.replace(/\//g, separator || '.').replace(/#/g, ''));

            if (result.indexOf('.') === 0) {
                result = result.substring(1);
            }

            return result;
        };

    // Routes configuration
    w20CoreApplication.config([ '$routeProvider', '$locationProvider', '$sceDelegateProvider', function ($routeProvider, $locationProvider, $sceDelegateProvider) {
        $locationProvider.hashPrefix('!');
        if (config.prettyUrls) {
            $locationProvider.html5Mode(true);
        } else {
            $locationProvider.html5Mode(false);
        }

        // WhiteList all trusted URLs
        $sceDelegateProvider.resourceUrlWhitelist($sceDelegateProvider.resourceUrlWhitelist().concat(sceUrlWhiteList));

        // User defined routes
        _.each(allRoutes, function (route, path) {
            route.type = route.type || ((typeof route.url !== 'undefined') ? 'sandbox' : 'view');
            route.path = route.path === '' ? '' : (route.path || path);
            route.category = route.category || '__top';
            route.name = normalizeRouteName(path);
            route.i18n = 'application.view.' + route.name;
            route.resolve = {
                security: ['$q', '$route', 'SecurityExpressionService', 'AuthenticationService', function ($q, $route, securityExpressionService, authenticationService) {
                    function checkSecurity() {
                        if (typeof $route.current.security !== 'undefined' && !securityExpressionService.evaluate($route.current.security)) {
                            return $q.reject('denied');
                        }

                        return $q.defer().resolve();
                    }

                    var deferred = authenticationService.currentOperationDeferred();

                    return deferred !== null ? deferred.then(checkSecurity, checkSecurity) : checkSecurity();
                }],

                routeCheck: [ '$q', '$injector', function ($q, $injector) {
                    if (typeof route.check === 'undefined') {
                        return $q.defer().resolve();
                    }

                    return $injector.invoke($injector.get(route.check));
                }]
            };

            if (typeof allRouteHandlers[route.type] === 'undefined') {
                console.warn('No handler for route type ' + route.type + ' when registering ' + route.path);
            } else {
                route = allRouteHandlers[route.type](route);
            }

            $routeProvider.when(route.path, route);
        });

        // Home route
        var homeRoute;
        if (typeof allRoutes[config.home] !== 'undefined') {
            homeRoute = _.extend(_.extend({}, allRoutes[config.home]), { path: '', hidden: true });
        }
        $routeProvider.when('/', homeRoute || { template: '' });

        // Fallback route
        var fallbackRoute;
        if (typeof allRoutes[config.notFound] !== 'undefined') {
            fallbackRoute = _.extend(_.extend({}, allRoutes[config.notFound]), { path: undefined, hidden: true });
            $routeProvider.otherwise(fallbackRoute);
        }
    } ]);

    // Cache busting
    w20CoreApplication.config(['$provide', function ($provide) {
        if (w20.appVersion) {
            return $provide.decorator('$http', ['$delegate', '$templateCache', function ($delegate, $templateCache) {
                var get = $delegate.get;

                $delegate.get = function (url, config) {
                    if (!$templateCache.get(url) && url.indexOf('__v=' + w20.appVersion) === -1) {
                        url += (url.indexOf('?') === -1 ? '?' : '&');
                        url += '__v=' + w20.appVersion;
                    }

                    return get(url, config);
                };

                return $delegate;
            }]);
        }
    }]);

    // debug mode
    w20CoreApplication.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(w20.debug);
    }]);

    /**
     * @ngdoc service
     * @name w20CoreApplication.service:ApplicationService
     *
     * @description
     *
     * The ApplicationService provides access to global application properties.
     */
    w20CoreApplication.factory('ApplicationService', [function () {
        return {
            /**
             * @ngdoc property
             * @name w20CoreApplication.service:ApplicationService#applicationId
             * @propertyOf w20CoreApplication.service:ApplicationService
             * @return {String} the unique id of the application.
             *
             * @description
             *
             * This id can be used to disambiguate between multiple W20 applications when necessary.
             */
            applicationId: config.id || 'w20app',

            /**
             * @ngdoc function
             * @name w20CoreApplication.service:ApplicationService#normalizeRouteName
             * @methodOf w20CoreApplication.service:ApplicationService
             *
             * @param {String} path Route path to normalize.
             * @param {String} separator The separator used to build the normalized name.
             * @return {String} The normalized route name.
             *
             * @description
             *
             * This method takes a route path and normalize it into a unique name. When multilevel paths (i.e. paths
             * containing slashes) are normalized the separator parameter is used to build the name (default separator
             * is the dot '.').
             */
            normalizeRouteName: normalizeRouteName,

            /**
             * @ngdoc property
             * @name w20CoreApplication.service:ApplicationService#homePath
             * @propertyOf w20CoreApplication.service:ApplicationService
             * @return {String} the path of the home route.
             */
            homePath: config.home
        };
    }]);

    /**
     * @ngdoc service
     * @name w20CoreApplication.provider:$exceptionHandler
     *
     * @description
     *
     * Replaces the default exception handler of AngularJS. It collapses similar errors (same type, same message, same
     * stack) and emits an event (`w20.core.application.error-occurred`). This event can be used to display an error
     * report.
     */
    w20CoreApplication.provider('$exceptionHandler', function () {
        var errorTimeoutPromise,
            allErrors = [];

        function isSameException(first, second) {
            if (!(first instanceof Error) || !(second instanceof Error)) {
                return false;
            }

            if (first.message !== second.message) {
                return false;
            }

            return first.stack === second.stack;
        }

        this.$get = [ '$log', '$injector', function ($log, $injector) {
            return function (exception, cause) {
                try {
                    $injector.invoke(['$timeout', 'EventService', function ($timeout, eventService) {
                        $timeout.cancel(errorTimeoutPromise);

                        if (!(exception instanceof Error)) {
                            exception = new Error(exception);
                        }

                        if (allErrors.length > 0 && isSameException(allErrors[0].exception, exception)) {
                            allErrors[0].repeat++;
                        } else {
                            allErrors.unshift({
                                repeat: 0,
                                cause: cause,
                                date: new Date(),
                                exception: exception
                            });
                        }

                        errorTimeoutPromise = $timeout(function () {
                            _.each(allErrors, function (error) {
                                $log.error(error.exception);
                                if (error.repeat > 0) {
                                    $log.warn('Previous error repeated ' + error.repeat + ' more time(s)');
                                }
                            });

                            /**
                             * @ngdoc event
                             * @name w20CoreApplication.provider:$exceptionHandler#w20\.core\.application\.error-occurred
                             * @eventOf w20CoreApplication.provider:$exceptionHandler
                             * @eventType emitted on root scope
                             *
                             * @description
                             *
                             * This event is emitted on the root scope after an error has occurred. It can be used to
                             * display an error report.
                             *
                             * @param {Error[]} allErrors The list of all errors that occurred since the last event.
                             */
                            eventService.emit('w20.core.application.error-occurred', allErrors);
                            allErrors = [];
                        }, 500, false); // do not apply which could re-trigger errors
                    }]);
                } catch (e) {
                    $log.error(exception);
                    $log.warn('Unable to process the previous error due to the following one');
                    $log.warn(e);
                }
            };
        }];
    });

    w20CoreApplication.run([ 'EventService', '$location', '$rootScope', function (eventService, $location, $rootScope) {
        if (typeof config.redirectAfterRouteError === 'string') {
            eventService.on('$routeChangeError', function () {
                $location.path(config.redirectAfterRouteError);
            });
        }

        eventService.on('$routeChangeSuccess', function (current) {
            $rootScope.currentRoute = current && current.$$route;
        });
    } ]);

    function registerRouteHandler(type, handlerFn) {
        allRouteHandlers[type] = handlerFn;
    }

    /**
     * This handler manages routes of the `view` type. It resolves template URLs with RequireJS and if the route is
     * marked as trusted, push it on the SCE URL whitelist.
     */
    registerRouteHandler('view', function (route) {
        if (typeof route.templateUrl !== 'undefined') {
            route.templateUrl = require.toUrl(route.templateUrl);

            if (route.trusted) {
                sceUrlWhiteList.push(route.templateUrl);
            }
        }

        return route;
    });

    /**
     * This handler manages routes of the `sandbox` type which are implemented with an iframe. This enables to embed
     * external UI as a view.
     */
    registerRouteHandler('sandbox', function (route) {
        var sandboxPermissions = route.sandboxPermissions || config.defaultSandboxPermissions;
        route.template = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; margin: 0; padding: 0;" class="w20-top-shift w20-right-shift w20-bottom-shift w20-left-shift">' +
                             '<iframe id="' + (route.sandboxId || config.defaultSandboxId || 'frmMain') + '" style="border: none; width: 100%; height: 100%;"' + (sandboxPermissions ? ' sandbox="' + sandboxPermissions + '"' : '') + ' data-ng-src="' + require.toUrl(route.url) + '"></iframe>' +
                         '</div>';
        return route;
    });

    return {
        angularModules: [ 'w20CoreApplication' ],

        lifecycle: {
            pre: function (modules, fragments, callback) {
                allRoutes = {};

                function addRoutes(fragmentname, newRoutes, routesConfiguration) {
                    _.each(newRoutes, function (route, routeName) {
                        var configuredRoute = routesConfiguration[routeName] || {};
                        _.extend(route, configuredRoute);
                        allRoutes[(fragmentname === '' ? '' : '/' + fragmentname) + (routeName.indexOf('/') === -1 ? '/' : '') + routeName] = route;
                    });
                }

                // compute all fragments routes
                var routesToLoad = [],
                    routeToFragment = {};
                _.each(fragments || {}, function (fragment, fragmentName) {
                    if (typeof fragment.definition.routes === 'string') {
                        var name = fragment.definition.routes + '?';
                        routesToLoad.push(name);
                        routeToFragment[name] = {
                            fragmentName: fragmentName,
                            routesConfiguration: fragment.configuration.routes || {}
                        };
                    } else if (typeof fragment.definition.routes === 'object') {
                        addRoutes(fragmentName, fragment.definition.routes, fragment.configuration.routes || {});
                    }
                });

                require(routesToLoad.map(function (elt) {
                    return '[text]!' + elt;
                }), function () {
                    var routesLoaded = Array.prototype.slice.call(arguments, 0);
                    _.each(routesLoaded, function (routeLoaded, index) {
                        var fragmentInfo = routeToFragment[routesToLoad[index]];
                        addRoutes(fragmentInfo.fragmentName, angular.fromJson(routeLoaded).routes, fragmentInfo.routesConfiguration);
                    });
                    callback(module);
                });
            },

            run: function (modules, fragments, callback) {
                var angularModules = [],
                    bootstrap = function () {
                        w20.console.log('Bootstrapping angular application with the following modules: ' + angularModules);

                        angular.bootstrap(window.document, angularModules, {
                            strictDi: !w20.debug
                        });

                        callback(module);
                    };

                _.each(modules, function (module) {
                    angularModules = angularModules.concat(module.angularModules || []);
                });

                angular.element(window.document).ready(bootstrap);
            }
        },

        registerRouteHandler: registerRouteHandler
    };
});
