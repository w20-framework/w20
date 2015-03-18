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
    'require',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular'
], function (module, require, $, _, angular) {
    'use strict';

    /**
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
     * @name w20CoreUtils
     * @module
     */
    var w20CoreUtils = angular.module('w20CoreUtils', []);

    w20CoreUtils.factory('DOMService', function () {
        var idSequence = 0;

        return {
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
     * This filter produces a HTML markup with the highlighting of a substring, passed as an argument.
     *
     * @name highlight
     * @w20doc filter
     * @memberOf w20CoreUtils
     * @argument {String} The substring to highlight.
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
     * This filter convert to upper case the first letter of the input string.
     * It takes no argument.
     *
     * @name firstUpperCase
     * @w20doc filter
     * @memberOf w20CoreUtils
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
     * This filter left and right trims the input string.
     * It takes no argument.
     *
     * @name trim
     * @w20doc filter
     * @memberOf w20CoreUtils
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
     * This filter apply a function to each element of the input array and produce
     * a new array with altered values.
     *
     * @name map
     * @w20doc filter
     * @memberOf w20CoreUtils
     * @argument {String|Function} A property name to select a property value in objects or a generic function to transform each element.
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
     * This filter join the input array elements as a string delimited by the first
     * argument (default to ', ').
     *
     * @name join
     * @w20doc filter
     * @memberOf w20CoreUtils
     * @argument {String} The delimiter inserted between each array elements.
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
     * This filter produces an array of the keys of the input object.
     * It takes no argument.
     *
     * @name keys
     * @w20doc filter
     * @memberOf w20CoreUtils
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
     * This filter produces a duplicate-free array of the input array.
     * It takes no argument.
     *
     * @name unique
     * @w20doc filter
     * @memberOf w20CoreUtils
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
     * This filter resolves an url using the RequireJS loader.
     * It takes no argument.
     *
     * @name path
     * @w20doc filter
     * @memberOf w20CoreUtils
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
     * This directive sets the html evaluated from the expression, sets it as the element children and compiles
     * it.
     *
     * @name w20Compile
     * @w20doc directive
     * @memberOf w20CoreUtils
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
     * AngularJS directive for list of checkboxes by vitalets - http://vitalets.github.io/checklist-model
     *
     * This directive allows selection of several checked value as part of one model (useful when checkboxes are
     * used inside a repeat loop for instance)
     *
     * @name checklistModel
     * @w20doc directive
     * @memberOf w20CoreUtils
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
                if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
                    throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                }

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
