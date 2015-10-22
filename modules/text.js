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
    'jquery',
    '{angular}/angular',
    '{w20-core}/modules/application',
    '',
    '{w20-core}/modules/utils'
], function (_require, $, angular, w20CoreApplication, showdown) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreText
     * @require w20CoreUtils
     *
     * @description
     *
     * This module provides text services and directives for publishing content.
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
     */
    var w20CoreText = angular.module('w20CoreText', [ 'w20CoreUtils' ]);

    /**
     * @ngdoc service
     * @name w20CoreText.service:TextService
     *
     * @description
     *
     * This service provides text manipulation functions.
     *
     */
    w20CoreText.factory('TextService', [function() {
        var converter = new showdown.Converter(),
            placeholderRegexp = new RegExp('(src|href)="(.*{.+}[^"]*)"', 'g');


        return {
            /**
             * @ngdoc function
             * @name w20CoreText.service:TextService#markdown
             * @methodOf w20CoreText.service:TextService
             * @param {String} value The markdown text to convert.
             * @return {String} The HTML text converted.
             *
             * @description
             *
             * Convert markdown text to html.
             */
            markdown: function(value) {
                return converter.makeHtml(value).replace(placeholderRegexp, function (all, attr, link) {
                    return attr + '="' + _require.toUrl(link) + '"';
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name w20CoreText.directive:w20Markdown
     * @restrict A
     *
     * @description
     *
     * This directive converts the element markdown content to HTML.
     *
     * @example
     *
     * ```
     * <div data-w20-mardown> ... </div>
     * ```
     */
    w20CoreText.directive('w20Markdown', ['TextService', 'EventService', function (textService, eventService) {
        return {
            replace: false,
            transclude: false,
            restrict: 'EA',
            scope: false,
            link : function(scope, iElement, iAttrs) {
                if (iAttrs.w20Markdown !== '') {
                    $.ajax({
                        url: scope.$eval(iAttrs.w20Markdown),
                        dataType: 'text',
                        success: function (data) {
                            iElement.html(textService.markdown(data));
                            eventService.emit('w20.publishing.text.markdown-rendered', iElement);

                            if (iAttrs.onload) {
                                scope.$apply(function () {
                                    scope.$eval(iAttrs.onload);
                                });
                            }
                        },
                        error: function () {
                            iElement.html('');
                        }
                    });
                } else {
                    iElement.html(textService.markdown(iElement.html()));
                }
            }
        };
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreText.filter:markdown
     *
     * @description
     *
     * This filter convert the input string from markdown text to HTML.
     * It takes no argument.
     *
     */
    w20CoreText.filter('markdown', ['TextService', function (textService) {
        return function(value) {
            if (value) {
                return textService.markdown(value);
            }
        };
    }]);

    w20CoreApplication.registerRouteHandler('markdown', function(route) {
        route.template = '<div class="container-fluid"><div class="row-fluid"><div data-w20-markdown="currentRoute.url | path"></div></div></div>';
        delete route.templateUrl;

        return route;
    });

    return {
        angularModules:[ 'w20CoreText' ]
    };
});
