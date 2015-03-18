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
    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{hammerjs}/hammer',
    '{iscroll}/iscroll',
    '[css]!{w20-touch}/style/touch'
], function ($, _, angular, Hammer, IScroll) {
    'use strict';

    /**
     * This module provides touch support for W20, including:
     *
     *  * Div scrolling,
     *  * Touch gestures.
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
     * @name w20TouchTouch
     * @module
     */
    // Forked from https://github.com/randallb/angular-hammer
    var w20TouchTouch = angular.module('w20TouchTouch', []),
        gestures = {
            w20Hold: 'hold',
            w20Tap: 'tap',
            w20Doubletap: 'doubletap',
            w20Drag: 'drag',
            w20Dragup: 'dragup',
            w20Dragdown: 'dragdown',
            w20Dragleft: 'dragleft',
            w20Dragright: 'dragright',
            w20Swipe: 'swipe',
            w20Swipeup: 'swipeup',
            w20Swipedown: 'swipedown',
            w20Swipeleft: 'swipeleft',
            w20Swiperight: 'swiperight',
            w20Transform: 'transform',
            w20Rotate: 'rotate',
            w20Pinch: 'pinch',
            w20Pinchin: 'pinchin',
            w20Pinchout: 'pinchout',
            w20Touch: 'touch',
            w20Release: 'release'
        };

    /**
     * Evaluate angular expression when a hold touch gesture is applied on the element.
     *
     *     <any data-w20-hold="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Hold
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a tap touch gesture is applied on the element.
     *
     *     <any data-w20-tap="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Tap
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a doubletap touch gesture is applied on the element.
     *
     *     <any data-w20-doubletap="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Doubletap
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a drag touch gesture is applied on the element.
     *
     *     <any data-w20-drag="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Drag
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a dragup touch gesture is applied on the element.
     *
     *     <any data-w20-dragup="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Dragup
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a dragdown touch gesture is applied on the element.
     *
     *     <any data-w20-dragdown="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Dragdown
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a dragleft touch gesture is applied on the element.
     *
     *     <any data-w20-dragleft="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Dragleft
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a dragright touch gesture is applied on the element.
     *
     *     <any data-w20-dragright="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Dragright
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a swipe touch gesture is applied on the element.
     *
     *     <any data-w20-swipe="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Swipe
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a swipeup touch gesture is applied on the element.
     *
     *     <any data-w20-swipeup="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Swipeup
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a  touch gesture is applied on the element.
     *
     *     <any data-w20-swipedown="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Swipedown
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a swipeleft touch gesture is applied on the element.
     *
     *     <any data-w20-swipeleft="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Swipeleft
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a swiperight touch gesture is applied on the element.
     *
     *     <any data-w20-swiperight="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Swiperight
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a transform touch gesture is applied on the element.
     *
     *     <any data-w20-transform="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Transform
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a rotate touch gesture is applied on the element.
     *
     *     <any data-w20-rotate="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Rotate
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a pinch touch gesture is applied on the element.
     *
     *     <any data-w20-pinch="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Pinch
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a pinchin touch gesture is applied on the element.
     *
     *     <any data-w20-pinchin="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Pinchin
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a pinchout touch gesture is applied on the element.
     *
     *     <any data-w20-pinchout="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Pinchout
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when any touch gesture is applied on the element.
     *
     *     <any data-w20-touch="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Touch
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    /**
     * Evaluate angular expression when a gesture is released on the element.
     *
     *     <any data-w20-release="angular expression">
     *         ...
     *     </any>
     *
     * @name w20Release
     * @memberOf w20TouchTouch
     * @w20doc directive
     */

    _.each(gestures, function (eventName, directiveName) {
        w20TouchTouch.directive(directiveName, ['$parse', function ($parse) {
            return {
                restrict: 'A',
                scope: true,
                link: function (scope, element, attr) {
                    var fn, opts;
                    fn = $parse(attr[directiveName]);
                    opts = $parse(attr.options)(scope, {});
                    scope.hammer = scope.hammer || new Hammer(element[0], opts);
                    return scope.hammer.on(eventName, function (event) {
                        return scope.$apply(function () {
                            return fn(scope, {
                                $event: event
                            });
                        });
                    });
                }
            };
        }
        ]);
    });

    /**
     * Make a div touch-scrollable.
     *
     *     <div data-w20-scrollable>
     *         ...
     *     </div>
     *
     * @name w20Scrollable
     * @memberOf w20TouchTouch
     * @w20doc directive
     */
    w20TouchTouch.directive('w20Scrollable', function() {
        return {
            restrict: 'A',
            scope: false,
            replace: true,
            transclude: true,
            template: '<div><div data-ng-transclude></div></div>',
            link: function (scope, iElement, iAttrs) {
                var scroller;
                if(iElement.children().length === 1) {
                    scroller = new IScroll(iElement[0], {
                        hScrollbar: false,
                        vScrollbar: false,
                        onBeforeScrollStart: function (e) {
                            var target = e.target;
                            while (target.nodeType !== 1) {
                                target = target.parentNode;
                            }

                            if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                                e.preventDefault();
                            }

                            e.stopPropagation();
                        },
                        checkDOMChanges: typeof iAttrs.autorefresh === 'undefined' ? true : scope.$eval(iAttrs.autorefresh)
                    });

                    iElement.on('$destroy', function() {
                        if (scroller !== undefined) {
                            scroller.destroy();
                        }

                        iElement.off('refresh');
                    });

                    iElement.on('refresh', function() {
                        if (scroller !== undefined) {
                            scroller.refresh();
                        }
                    });
                }
            }
        };
    });

    return {
        angularModules: [ 'w20TouchTouch' ]
    };
});