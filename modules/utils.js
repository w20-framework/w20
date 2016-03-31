/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'module',
    'require',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular'
], function (module, require, $, _, angular) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreUtils
     *
     * @description
     *
     * This module provides various utility services, directives and filters.
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
    var w20CoreUtils = angular.module('w20CoreUtils', []);

    /**
     * @ngdoc service
     * @name w20CoreUtils.service:DOMService
     *
     * @description
     *
     * This service performs DOM utility manipulation
     */
    w20CoreUtils.factory('DOMService', function () {
        var idSequence = 0;

        return {
            /**
             * @ngdoc function
             * @name w20CoreUtils.service:DOMService#autoId
             * @methodOf w20CoreUtils.service:DOMService
             * @param {String} element A DOM selector (class, element)
             * @returns {String} if the element selected with the parameter had no id it returns the generated id, otherwise it returns the element id
             *
             * @description
             *
             * Add an id attribute on the element with an auto-generated value in the form "w20-autoid-(increment)"
             *
             * @example
             *
             * ```
             * <span class="without-id"> I am the 14th element with class "without-id" </span>
             *
             * domService.autoId('.without-id');
             *
             * <span class="without-id" id="w20-autoid-14"> I am the 14th element with class "without-id" </span>
             * ```
             *
             */
            autoId: function (element) {
                var id = $(element).attr('id');
                if (typeof id === 'undefined') {
                    id = 'w20-autoid-' + idSequence++;
                    $(element).attr('id', id);
                }
                return id;
            }
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:highlight
     * @param {String} The substring to highlight.
     *
     * @description
     *
     * This filter produces a HTML markup with the highlighting of a substring, passed as an argument.
     *
     *
     */
    w20CoreUtils.filter('highlight', function () {
        return function (text, filter, color) {
            if (typeof filter === 'undefined' || $.trim(filter) === '') {
                return text;
            }

            return text.replace(new RegExp(filter, 'gi'), '<span class="w20-highlight"' + (typeof color === 'undefined' ? '' : ' style=""') + '>$&</span>');
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:firstUpperCase
     *
     * @description
     *
     * This filter convert to upper case the first letter of the input string.
     * It takes no argument.
     *
     */
    w20CoreUtils.filter('firstUpperCase', function () {
        return function (input) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return input.charAt(0).toUpperCase() + input.slice(1);
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:trim
     *
     * @description
     *
     * This filter left and right trims the input string.
     * It takes no argument.
     *
     */
    w20CoreUtils.filter('trim', function () {
        return function (input) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return $.trim(input);
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:map
     * @param {String|Function} A property name to select a property value in objects or a generic function to transform each element.
     *
     * @description
     *
     * This filter apply a function to each element of the input array and produce
     * a new array with altered values.
     *
     */
    w20CoreUtils.filter('map', function () {
        return function (input, argument) {
            if (typeof argument === 'string') {
                return input.map(function (elt) {
                    return elt[argument];
                });
            } else if (typeof argument === 'function') {
                return input.map(argument);
            } else {
                return undefined;
            }
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:join
     * @param {String} The delimiter inserted between each array elements.
     *
     * @description
     *
     * This filter join the input array elements as a string delimited by the first
     * argument (default to ', ').
     *
     */
    w20CoreUtils.filter('join', function () {
        return function (input, delimiter) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return input.join(delimiter || ', ');
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:keys
     *
     * @description
     *
     * This filter produces an array of the keys of the input object.
     * It takes no argument.
     *
     */
    w20CoreUtils.filter('keys', function () {
        return function (input) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return _.keys(input);
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:unique
     *
     * @description
     *
     * This filter produces a duplicate-free array of the input array.
     * It takes no argument.
     *
     */
    w20CoreUtils.filter('unique', function () {
        return function (input) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return _.uniq(input);
        };
    });

    /**
     * @ngdoc filter
     * @name w20CoreUtils.filter:path
     *
     * @description
     *
     * This filter resolves an url using the RequireJS loader.
     * It takes no argument.
     *
     */
    w20CoreUtils.filter('path', function () {
        return function (input) {
            if (typeof input === 'undefined') {
                return undefined;
            }

            return require.toUrl(input);
        };
    });

    /**
     * @ngdoc directive
     * @name w20CoreUtils.directive:w20Compile
     *
     * @description
     *
     * This directive sets the html evaluated from the expression, sets it as the element children and compiles
     * it.
     *
     */
    w20CoreUtils.directive('w20Compile', ['$compile', function ($compile) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.w20Compile);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name w20CoreUtils.directive:w20IncludeReplace
     * @require ngInclude
     * @description
     *
     * This directive replace the element by its children. It requires ngInclude to be declared on the element.
     *
     */
    w20CoreUtils.directive('w20IncludeReplace', function () {
        return {
            require: 'ngInclude',
            restrict: 'A',
            priority: 399,
            link: function (scope, element) {
                element.replaceWith(element.children());
            }
        };
    });

    /**
     * @ngdoc directive
     * @name w20CoreUtils.directive:stopEvent
     * @param {String} stopEvent The name of the event to stop the propagation for
     *
     * @description
     *
     * This directive will stop the propagation of the event passed in the stop-event attribute.
     *
     */
    w20CoreUtils.directive('stopEvent', ['$document', function($document) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
    }]);


    /**
     * @ngdoc directive
     * @name w20CoreUtils.directive:checklistModel
     *
     * @description
     *
     * AngularJS directive for list of checkboxes by vitalets - http://vitalets.github.io/checklist-model
     *
     * This directive allows selection of several checked value as part of one model (useful when checkboxes are
     * used inside a repeat loop for instance)
     *
     */
    w20CoreUtils.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
        function contains(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function add(arr, item) {
            arr = angular.isArray(arr) ? arr : [];
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], item)) {
                    return arr;
                }
            }
            arr.push(item);
            return arr;
        }

        function remove(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        function postLinkFn(scope, elem, attrs) {
            $compile(elem)(scope);

            var getter = $parse(attrs.checklistModel);
            var setter = getter.assign;

            var value = $parse(attrs.checklistValue)(scope.$parent);

            scope.$watch('checked', function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (newValue === true) {
                    setter(scope.$parent, add(current, value));
                } else {
                    setter(scope.$parent, remove(current, value));
                }
            });

            scope.$parent.$watch(attrs.checklistModel, function(newArr, oldArr) {
                scope.checked = contains(newArr, value);
            }, true);
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function(tElement, tAttrs) {
                if (!tAttrs.checklistValue) {
                    throw 'You should provide `checklist-value`.';
                }

                tElement.removeAttr('checklist-model');
                tElement.attr('ng-model', 'checked');

                return postLinkFn;
            }
        };
    }]);

    return {
        angularModules: ['w20CoreUtils']
    };
});
