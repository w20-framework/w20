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
    'module',
    '{angular}/angular'
], function (module, angular) {
    'use strict';

    var config = module && module.config() || {},
        jsUrl = config.jsUrl || [],
        trackerUrl = config.trackerUrl || [],
        siteId = config.siteId || [],
        mod = angular.module('w20ExtraPiwik', []),
        arr_param_methods = [
            'setDomains',
            'setDownloadClasses',
            'setIgnoreClasses',
            'setLinkClasses'
        ],
        comma_regex = /,/g,
        build_p_call = function (method, attr_val) {
            var call, param, _i, _len, _ref;
            call = [method];
            if (arr_param_methods.indexOf(method) >= 0 && comma_regex.test(attr_val)) {
                call.push(attr_val.split(','));
            } else {
                _ref = attr_val.split(',');
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    param = _ref[_i];
                    call.push(param);
                }
            }
            return call;
        };

    /**
     *
     * ![alt text]({w20-doc}/views/extra/img/piwik.png "Piwik logo missing")
     *
     * Piwik is an analytical tool that allows statistical reporting and data analysis for the targeted website(s).
     *
     * Among Piwik features it is worth mentionning :
     *
     * - Counting and tracking visitor's actions
     * - Statistics on page viewed
     * - Keyword searched
     * - Full analytics for E-commerce web site
     * - Setting cookies for tracking visit
     * - Displaying comprehensive and detailed reports
     * ...
     *
     * Piwik runs on a PHP server and collects data from the website(s) you managed. It uses a marker that reference
     * the application and track data from visitors interactions.
     *
     * The server can be installed following Piwik official documentation. After the installation and configuration, you can mark the website(s) you wish to analyse
     * with Piwik. W20 offer an angular directive (see Directives) and a service (see Services) to ease this process on an SPA (Single Page Application) and provide
     * a central point of control. Piwik's action method can be accessed through the injectable service "Piwik" that exposes the same API as Piwik default configuration.
     *
     * Please refer to the [Piwik Documentation](http://piwik.org/) for an exhaustive guideline on Piwik features.
     *
     * ![alt text]({w20-doc}/views/extra/img/piwik_diagram1.png "Piwik diagram missing")
     *
     *
     * When your Piwik installation is complete (follow [instructions](http://piwik.org/docs/installation/) to deploy Piwik on your web server)
     * and the websites you want to track configured in Piwik, use the Piwik directive instead of the Piwik script marker that is issued to you by Piwik at the end of the installation.
     * The Piwik directive will take care of marking all your partial views and is adapted for AngularJS SPA application whereas Piwik default tracker is not.
     *
     * The directive will simply track the different URL and their view count. For specific usage and tracking technique the "Piwik" service can be injected into your controller. You can then use Piwik API for setting specific need.
     *
     *
     * <b>Example</b> :  using <code>Piwik.trackSiteSearch($scope.keyword)</code> can enable keyword tracking on an input field with an ngModel "keyword".
     *
     * ![alt text]({w20-doc}/views/extra/img/piwik_keyword.png "Piwik keyword illustration missing")
     *
     * ![alt text]({w20-doc}/views/extra/img/piwik_dashboard.png "Piwik dashboard illustration missing")
     *
     * # Installing the Piwik module
     *
     * Note : You need to have Piwik installed first. Follow the guide on the [documentation](http://piwik.org/docs/installation/).
     *
     * ## Fragment configuration
     *
     * Import the <b>analytics</b> module. You need to set <b> 3 properties </b> :
     *
     * - <b>jsUrl</b> (string) : The URI of the <b>piwik.js</b> file necessary to execute Piwik on the client.
     * - <b>trackerUrl</b> (string) : The URL of the <b>piwik tracker</b> (piwik.php on the server you deployed Piwik to).
     * - <b>siteId</b> (integer) : The <b>unique id</b> of the website you are tracking (given by Piwik when you register the site in Piwik).
     *
     * Example :
     *
     *
     *             "../w20/w20-extra/w20-extra.w20.json": {
     *                    "modules": {
     *                        "analytics": {
     *                            "jsUrl": "//localhost/analytics/piwik/piwik.js",
     *                            "trackerUrl": "//localhost/analytics/piwik/piwik.php",
     *                            "siteId": 1
     *                        }
     *                    }
     *            }
     *
     * To activate tracking put the <code>w20-analytics-piwik</code> directive inside your main html above <code>body</code>. Use the Piwik service for advanced tracking options.
     *
     * In short :
     *
     * - Mark your main html (index.html) with the directive (see Directives)
     * - Inject the Piwik service where needed (see Services)
     * - Refer to Piwik official API for setting specific needs
     *
     * @name w20AnalyticsPiwik
     * @module
     */

    mod.factory('PiwikActionMethods', function () {
        return ['setTrackerUrl',
            'setSiteId',
            'setCustomData',
            'setCustomVariable',
            'deleteCustomVariable',
            'setLinkTrackingTimer',
            'setDownloadExtensions',
            'addDownloadExtensions',
            'setDomains',
            'setIgnoreClasses',
            'setRequestMethod',
            'setReferrerUrl',
            'setCustomUrl',
            'setDocumentTitle',
            'setDownloadClasses',
            'setLinkClasses',
            'setCampaignNameKey',
            'setCampaignKeywordKey',
            'discardHashTag',
            'setCookieNamePrefix',
            'setCookieDomain',
            'setCookiePath',
            'setVisitorCookieTimeout',
            'setSessionCookieTimeout',
            'setReferralCookieTimeout',
            'setConversionAttributionFirstReferrer',
            'setDoNotTrack',
            'addListener',
            'enableLinkTracking',
            'setHeartBeatTimer',
            'killFrame',
            'redirectFile',
            'setCountPreRendered',
            'trackGoal',
            'trackLink',
            'trackPageView',
            'setEcommerceView',
            'addEcommerceItem',
            'trackEcommerceOrder',
            'trackEcommerceCartUpdate',
            'trackSiteSearch']; //trackSiteSearch(keyword, category, searchCount)
    });


    mod.factory('PiwikGetMethods', function () {
        return ['getVisitorId',
            'getVisitorInfo',
            'getAttributionInfo',
            'getAttributionCampaignName',
            'getAttributionCampaignKeyword',
            'getAttributionReferrerTimestamp',
            'getAttributionReferrerUrl',
            'getCustomData',
            'getCustomVariable'];
    });


    /**
     *
     * The <code>Piwik</code> service encapsulate all Piwik method available in the tracker.
     * Inject Piwik and use Piwik.xxx() actions.
     *
     * The full documentation is availabale in [Piwik](http://piwik.org/docs/javascript-tracking/)
     *
     *  @name Piwik
     *  @memberOf w20AnalyticsPiwik
     *  @w20doc service
     */
    mod.factory('Piwik', [ '$q', '$window', 'PiwikActionMethods', 'PiwikGetMethods', function ($q, $window, PiwikActionMethods, PiwikGetMethods) {
        var piwik;

        $window._paq = $window._paq || [];

        piwik = (function () {
            var method, _fn, _fn1, _i, _j, _len, _len1, _self;

            function Piwik() {
            }

            _self = Piwik;

            _fn = function (method) {
                _self[method] = function () {
                    var arg, cmd, _j, _len1;
                    cmd = [method];
                    for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
                        arg = arguments[_j];
                        cmd.push(arg);
                    }
                    return $window._paq.push(cmd);
                };

                return _self[method];
            };
            for (_i = 0, _len = PiwikActionMethods.length; _i < _len; _i++) {
                method = PiwikActionMethods[_i];
                _fn(method);
            }

            _fn1 = function (method) {
                _self[method] = function () {
                    var deferred, _args;
                    deferred = $q.defer();
                    _args = arguments;
                    $window._paq.push(function () {
                        try {
                            return deferred.resolve(this[method].apply(this, _args));
                        } catch (e) {
                            return deferred.reject(e);
                        }
                    });
                    return deferred.promise;
                };

                return _self[method];
            };
            for (_j = 0, _len1 = PiwikGetMethods.length; _j < _len1; _j++) {
                method = PiwikGetMethods[_j];
                _fn1(method);
            }

            require(['piwik']);


            return Piwik;

        })();

        return piwik;
    }
    ]);

    /**
     *
     * To enable analytic tracking on your website include the directive in your main html above the <code>body</code> tag.
     *
     *        <div data-w20-analytics-piwik></div>
     *
     * Your fragment definition should be configured.
     * <br />
     * Example :
     *
     *        "../w20/w20-extra/w20-extra.w20.json": {
    *            "modules": {
    *                "analytics": {
    *                    "jsUrl": "//localhost/analytics/piwik/piwik.js",
    *                    "trackerUrl": "//localhost/analytics/piwik/piwik.php",
    *                    "siteId": 1
    *                }
    *            }
    *        }
     *
     *  The directive should be declared preferably in your application entry point (index.html) just above the <code>&ltbody&gt</code> tag
     *  so that all the views are managed when route changes.
     *
     * @name w20AnalyticsPiwik
     * @memberOf w20AnalyticsPiwik
     * @w20doc directive
     *
     */
    mod.directive('w20AnalyticsPiwik', [ '$window', '$document', 'PiwikActionMethods', function ($window, $document, PiwikActionMethods) {
        return {
            restrict: 'A',
            replace: false,
            transclude: true,
            compile: function (tElement, tAttrs) {
                function callPiwik(k, v) {
                    var method = k[12].toLowerCase() + k.slice(13);

                    if (PiwikActionMethods.indexOf(method) < 0) {
                        return;
                    }

                    $window._paq.push(build_p_call(method, v));

                    return tAttrs.$observe(k, function (val) {
                        return $window._paq.push(build_p_call(method, val));
                    });
                }

                var script_elem = $document[0].createElement('script');
                script_elem.setAttribute('src', jsUrl);
                $document[0].body.appendChild(script_elem);

                return function (scope, iElement, iAttrs) {
                    var k, v;
                    for (k in iAttrs) {
                        if (iAttrs.hasOwnProperty(k)) {
                            v = iAttrs[k];
                            if (/^w20Analytics/.test(k)) {
                                callPiwik(k, v);
                            }
                        }
                    }
                };
            }
        };
    }]);

    mod.run([ '$rootScope', 'Piwik', '$location', function ($rootScope, Piwik, $location) {
        Piwik.setTrackerUrl(trackerUrl);
        Piwik.setSiteId(siteId);

        // watch for routes change on the global scope to inform Piwik that new views should be tracked
        $rootScope.$on('$routeChangeSuccess', function () {
            Piwik.enableLinkTracking();
            Piwik.setCustomUrl($location.path()); // name that the new view should have in Piwik dashboard
            Piwik.trackPageView($location.path());   // Tell Piwik to track the new view
        });
    }]);

    return {
        angularModules: [ 'w20ExtraPiwik' ]
    };
});


