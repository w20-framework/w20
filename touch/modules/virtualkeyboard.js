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
    'w20',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{w20-core}/modules/culture',

    '{jcaret2}/jquery.caret',

    '[css]!{w20-touch}/style/virtualkeyboard'
], function (require, module, w20, $, _, angular, cultureModule) {
    'use strict';

    /**
     * This module provides a virtual keyboard for touch interfaces.
     *
     *
     * Configuration
     * -------------
     *
     *      "virtualkeyboard" : {
     *          "available" : [ "name-of-builtin-keyboard-1", "name-of-builtin-keyboard-2", ... ]
     *          "custom" : {
     *              "name-of-the-custom-keyboard-1" : "path/to/the/custom/keyboard/1/json/definition",
     *              "name-of-the-custom-keyboard-2" : "path/to/the/custom/keyboard/2/json/definition",
     *              ...
     *          }
     *      }
     *
     * Fragment definition sections
     * ----------------------------
     *
     * This module has no fragment definition section.
     *
     * Virtual keyboard JSON definition
     * --------------------------------
     *
     *      {
     *          "layer1": [
     *              { value: 113 },
     *              { value: 119 },
     *              { value: 101 },
     *              { value: 114 },
     *              { value: 116 },
     *              { value: 121 },
     *              { value: 117 },
     *              { value: 105 },
     *              { value: 111 },
     *              { value: 112 },
     *              { value: "del", "isChar": "false", "onclick": "jsKeyboard.del()", "buttonClass": "kb-button kb-button-alpha-del", "keyClass": "kb-key kb-key-alpha-del" },
     *              {separator: "true" },
     *
     *
     *              { value: 97, "buttonClass": "kb-button kb-button-alpha-a" },
     *              { value: 115 },
     *              { value: 100 },
     *              { value: 102 },
     *              { value: 103 },
     *              { value: 104 },
     *              { value: 106 },
     *              { value: 107 },
     *              { value: 108 },
     *              { value: "Enter", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-enter", "onclick": "jsKeyboard.enter();", "keyClass": "kb-key kb-key-alpha-enter" },
     *              {separator: "true" },
     *
     *
     *              { value: "ABC", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-capitalletterleft", "onclick": "jsKeyboard.changeToLayer2();", "keyClass": "kb-key kb-key-alpha-capitalletterleft" },
     *              { value: 122 },
     *              { value: 120 },
     *              { value: 99 },
     *              { value: 118 },
     *              { value: 98 },
     *              { value: 110 },
     *              { value: 109 },
     *              { value: 44 },
     *              { value: 46 },
     *              { value: 39 },
     *              {separator: "true" },
     *
     *
     *              { value: "123", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-numberleft", "onclick": "jsKeyboard.changeToLayer3();", "keyClass": "kb-key kb-key-alpha-number" },
     *              { value: 32, "buttonClass": "kb-button kb-button-alpha-space" },
     *              { value: "#$@", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-symbolsright", "onclick": "jsKeyboard.changeToLayer4();", "keyClass": "kb-key kb-key-alpha-symbols" },
     *              { value: "Close", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-hide", "onclick": "virtualKeyboardService.close();", "keyClass": "kb-key kb-key-alpha-hide" }
     *          ],
     *          "layer2": [
     *              { value: 81 },
     *              { value: 87 },
     *              { value: 69 },
     *              { value: 82 },
     *              { value: 84 },
     *              { value: 89 },
     *              { value: 85 },
     *              { value: 73 },
     *              { value: 79 },
     *              { value: 80 },
     *              { value: "del", "isChar": "false", "onclick": "jsKeyboard.del()", "buttonClass": "kb-button kb-button-alpha-del", "keyClass": "kb-key kb-key-alpha-del" },
     *              {separator: "true" },
     *
     *
     *              { value: 65, "buttonClass": "kb-button kb-button-alpha-a" },
     *              { value: 83 },
     *              { value: 68 },
     *              { value: 70 },
     *              { value: 71 },
     *              { value: 72 },
     *              { value: 74 },
     *              { value: 75 },
     *              { value: 76 },
     *              { value: "Enter", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-enter", "onclick": "jsKeyboard.enter();", "keyClass": "kb-key kb-key-alpha-enter" },
     *              {separator: "true" },
     *
     *
     *              { value: "abc", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-smallletter", "onclick": "jsKeyboard.changeToLayer1();", "keyClass": "kb-key kb-key-alpha-smallletter" },
     *              { value: 90 },
     *              { value: 88 },
     *              { value: 67 },
     *              { value: 86 },
     *              { value: 66 },
     *              { value: 78 },
     *              { value: 77 },
     *              { value: 44 },
     *              { value: 46 },
     *              { value: 39 },
     *              {separator: "true" },
     *
     *
     *              { value: "123", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-numberleft", "onclick": "jsKeyboard.changeToLayer3();", "keyClass": "kb-key kb-key-alpha-number" },
     *              { value: 32, "buttonClass": "kb-button kb-button-alpha-space" },
     *              { value: "#$@", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-symbolsright", "onclick": "jsKeyboard.changeToLayer4();", "keyClass": "kb-key kb-key-alpha-symbols" },
     *              { value: "Close", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-hide", "onclick": "virtualKeyboardService.close();", "keyClass": "kb-key kb-key-alpha-hide" }
     *          ],
     *          "layer3": [
     *              { value: 49 },
     *              { value: 50 },
     *              { value: 51 },
     *              { value: 52 },
     *              { value: 53 },
     *              { value: 54 },
     *              { value: 55 },
     *              { value: 56 },
     *              { value: 57 },
     *              { value: 48 },
     *              { value: "del", "isChar": "false", "onclick": "jsKeyboard.del()", "buttonClass": "kb-button kb-button-alpha-del", "keyClass": "kb-key kb-key-alpha-del" },
     *              {separator: "true" },
     *
     *
     *              { value: 45, "buttonClass": "kb-button kb-button-alpha-dash" },
     *              { value: 47 },
     *              { value: 58 },
     *              { value: 59 },
     *              { value: 40 },
     *              { value: 41 },
     *              { value: 36 },
     *              { value: 38 },
     *              { value: 64 },
     *              { value: "Enter", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-enter", "onclick": "jsKeyboard.enter();", "keyClass": "kb-key kb-key-alpha-enter" },
     *              {separator: "true" },
     *
     *
     *              { value: "abc", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-smallletterleft", "onclick": "jsKeyboard.changeToLayer1()", "keyClass": "kb-key kb-key-alpha-smallletter" },
     *              { value: 63 },
     *              { value: 33 },
     *              { value: 34 },
     *              { value: 124 },
     *              { value: 92 },
     *              { value: 42 },
     *              { value: 61 },
     *              { value: 43 },
     *              { value: "abc", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-smallletterright", "onclick": "jsKeyboard.changeToLayer1();", "keyClass": "kb-key kb-key-alpha-smallletter" },
     *              {separator: "true" },
     *
     *
     *              { value: "#$@", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-symbolsleft", "onclick": "jsKeyboard.changeToLayer4();", "keyClass": "kb-key kb-key-alpha-symbols" },
     *              { value: 32, "buttonClass": "kb-button kb-button-alpha-space" },
     *              { value: "#$@", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-symbolsright", "onclick": "jsKeyboard.changeToLayer4();", "keyClass": "kb-key kb-key-alpha-symbols" },
     *              { value: "Close", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-hide", "onclick": "virtualKeyboardService.close();", "keyClass": "kb-key kb-key-alpha-hide" }
     *          ],
     *          "layer4": [
     *              { value: 91 },
     *              { value: 93 },
     *              { value: 123 },
     *              { value: 125 },
     *              { value: 35 },
     *              { value: 37 },
     *              { value: 94 },
     *              { value: 42 },
     *              { value: 43 },
     *              { value: 61 },
     *              { value: "del", "isChar": "false", "onclick": "jsKeyboard.del()", "buttonClass": "kb-button kb-button-alpha-del", "keyClass": "kb-key kb-key-alpha-del" },
     *              {separator: "true" },
     *
     *
     *              { value: 95, "buttonClass": "kb-button kb-button-alpha-underscore" },
     *              { value: 92 },
     *              { value: 124 },
     *              { value: 126 },
     *              { value: 60 },
     *              { value: 62 },
     *              { value: "&euro;", "isChar": "false", "onclick": "jsKeyboard.writeSpecial('&euro;');" },
     *              { value: 163 },
     *              { value: 165 },
     *              { value: "Enter", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-enter", "onclick": "jsKeyboard.enter();", "keyClass": "kb-key kb-key-alpha-enter" },
     *              {separator: "true" },
     *
     *
     *              { value: "abc", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-smallletterleft", "onclick": "jsKeyboard.changeToLayer1()", "keyClass": "kb-key kb-key-alpha-smallletter" },
     *              { value: 46 },
     *              { value: 44 },
     *              { value: 63 },
     *              { value: 33 },
     *              { value: 39 },
     *              { value: 34 },
     *              { value: 59 },
     *              { value: 92 },
     *              { value: "abc", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-smallletterright", "onclick": "jsKeyboard.changeToLayer1();", "keyClass": "kb-key kb-key-alpha-smallletter" },
     *              {separator: "true" },
     *
     *
     *              { value: "123", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-numberleft", "onclick": "jsKeyboard.changeToLayer3();", "keyClass": "kb-key kb-key-alpha-number" },
     *              { value: 32, "buttonClass": "kb-button kb-button-alpha-space" },
     *              { value: "123", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-numberright", "onclick": "jsKeyboard.changeToLayer3();", "keyClass": "kb-key kb-key-alpha-number" },
     *              { value: "Close", "isChar": "false", "buttonClass": "kb-button kb-button-alpha-hide", "onclick": "virtualKeyboardService.close();", "keyClass": "kb-key kb-key-alpha-hide" }
     *          ]
     *      }
     *
     * @name w20TouchVirtualKeyboard
     * @module
     */
    var w20TouchVirtualKeyboard = angular.module('w20TouchVirtualKeyboard', [ 'w20CoreCulture' ]),
        config = module && module.config() || {},
        keyboardDefs = {},
        builtinKeyboardLayouts = [ 'en-US', 'fr-FR', 'numpad' ];

    w20TouchVirtualKeyboard.factory('VirtualKeyboardService', ['StateService', 'CultureService', 'EventService', '$log', '$window', function (stateService, cultureService, eventService, $log, $window) {
        var currentLayout = 'alpha', allowClose = false, service = null, jsKeyboard = null, currentElement;

        $window.__w20TouchKeyboardClickHandler = function (code) { // global function for onclick events FIXME : is there a better way ?
            new Function('jsKeyboard', 'virtualKeyboardService', code)(jsKeyboard, service); // jshint ignore:line
        };

        // Heavily based on touch screen keyboard (http://code.technolatte.net/TouchScreenKeyboard/) but customized for w20
        jsKeyboard = {
            settings: {
                buttonClass: 'kb-button', // default button class
                onclick: 'jsKeyboard.write();', // default onclick event for button
                keyClass: 'kb-key', // default key class used to define style of text of the button
                text: {
                    close: 'close'
                }
            },
            keyboards: [], // different keyboards can be set to this variable in order to switch between keyboards easily.
            init: function (elem, keyboard) {
                jsKeyboard.keyboards['default'] = jsKeyboard.defaultKeyboard;
                jsKeyboard.keyboardLayout = elem;

                if (keyboard !== null && keyboard !== undefined) {
                    jsKeyboard.generateKeyboard(keyboard);
                } else {
                    jsKeyboard.generateKeyboard('default');
                }

                jsKeyboard.addKeyDownEvent();
            },
            keyboardLayout: '', // it shows the html element where keyboard is generated
            currentKeyboard: 'default', // it shows the which keyboard is used. If it's not set default keyboard is used.
            currentCallback: undefined,
            generateKeyboard: function (keyboard) {
                if (typeof jsKeyboard.keyboards[keyboard] === 'undefined') {
                    $log.warn('virtual keyboard layout ' + keyboard + ' is unknown, using default layout');
                    keyboard = 'default';
                }

                var bClass = '';
                var kClass = '';
                var onclick = '';
                var text = '';

                var s = '';
                s += '<div id="keyboard" class="keyboard keyboard-' + keyboard + '">';
                s += '<div id="w20-keyboard-header">';
                s += '<input id="w20-keyboard-preview" disabled="true" readonly="true"/>';
                s += '</div>';

                s += '<div id="keyboardLayer1">';
                $.each(jsKeyboard.keyboards[keyboard].layer1, function (i, key) {
                    generate(key);
                });
                s += '</div>';

                s += '<div id="keyboardLayer2">';
                $.each(jsKeyboard.keyboards[keyboard].layer2, function (i, key) {
                    generate(key);
                });
                s += '</div>';

                s += '<div id="keyboardLayer3">';
                $.each(jsKeyboard.keyboards[keyboard].layer3, function (i, key) {
                    generate(key);
                });
                s += '</div>';

                s += '<div id="keyboardLayer4">';
                $.each(jsKeyboard.keyboards[keyboard].layer4, function (i, key) {
                    generate(key);
                });
                s += '</div>';

                function generate(key) {
                    if (key.hasOwnProperty('separator')) {
                        s += '<div style="clear:both"></div>';
                        return;
                    }

                    bClass = key.buttonClass === undefined ? jsKeyboard.settings.buttonClass : key.buttonClass;
                    kClass = key.keyClass === undefined ? jsKeyboard.settings.keyClass : key.keyClass;
                    onclick = key.onclick === undefined ? jsKeyboard.settings.onclick.replace('()', '(' + key.value + ')') : key.onclick.replace(/'/g, '\\\'');

                    text = (key.isChar !== undefined || key.isChar === false) ? key.value : String.fromCharCode(key.value);

                    s += '<div class="' + bClass + '" onclick="__w20TouchKeyboardClickHandler(\'' + onclick + '\');"><div class="' + kClass + '">' + text + '</div></div>';

                    bClass = '';
                    kClass = '';
                    onclick = '';
                    text = '';
                }

                $('#' + jsKeyboard.keyboardLayout).html(s);
            },
            addKeyDownEvent: function () {
                $('#keyboardCapitalLetter > div.button, #keyboardSmallLetter > div.button, #keyboardNumber > div.button, #keyboardSymbols > div.button').
                    bind('mousedown', function () {
                        $(this).addClass('buttonDown');
                    }).
                    bind('mouseup', function () {
                        $(this).removeClass('buttonDown');
                    }).
                    bind('mouseout', function () {
                        $(this).removeClass('buttonDown');
                    });
            },
            changeToLayer1: function () {
                $('#keyboardLayer1').css('display', 'block');
                $('#keyboardLayer2,#keyboardLayer3,#keyboardLayer4').css('display', 'none');
            },
            changeToLayer2: function () {
                $('#keyboardLayer2').css('display', 'block');
                $('#keyboardLayer1,#keyboardLayer3,#keyboardLayer4').css('display', 'none');
            },
            changeToLayer3: function () {
                $('#keyboardLayer3').css('display', 'block');
                $('#keyboardLayer1,#keyboardLayer2,#keyboardLayer4').css('display', 'none');
            },
            changeToLayer4: function () {
                $('#keyboardLayer4').css('display', 'block');
                $('#keyboardLayer1,#keyboardLayer2,#keyboardLayer3').css('display', 'none');
            },
            write: function (m) {
                if (this.currentCallback) {
                    this.currentCallback('write', String.fromCharCode(m));
                }
            },
            del: function () {
                if (this.currentCallback) {
                    this.currentCallback('del');
                }
            },
            enter: function () {
                if (this.currentCallback) {
                    this.currentCallback('enter');
                }
            },
            writeSpecial: function (m) {
                if (this.currentCallback) {
                    this.currentCallback('write', m);
                }
            },
            open: function (arg) {
                this.currentCallback = arg;
                $('#keyboard').fadeIn('fast');
            },
            close: function () {
                this.currentCallback = undefined;
                $('#keyboard').fadeOut('fast');
            },
            defaultKeyboard: {
                layer1: [
                    { value: 113 },
                    { value: 119 },
                    { value: 101 },
                    { value: 114 },
                    { value: 116 },
                    { value: 121 },
                    { value: 117 },
                    { value: 105 },
                    { value: 111 },
                    { value: 112 },
                    { value: 'del', isChar: false, onclick: 'jsKeyboard.del()', buttonClass: 'kb-button kb-button-alpha-del', keyClass: 'kb-key kb-key-alpha-del' },
                    {separator: 'true' },


                    { value: 97, buttonClass: 'kb-button kb-button-alpha-a' },
                    { value: 115 },
                    { value: 100 },
                    { value: 102 },
                    { value: 103 },
                    { value: 104 },
                    { value: 106 },
                    { value: 107 },
                    { value: 108 },
                    { value: 'Enter', isChar: false, buttonClass: 'kb-button kb-button-alpha-enter', onclick: 'jsKeyboard.enter();', keyClass: 'kb-key kb-key-alpha-enter' },
                    {separator: 'true' },


                    { value: 'ABC', isChar: false, buttonClass: 'kb-button kb-button-alpha-capitalletterleft', onclick: 'jsKeyboard.changeToLayer2();', keyClass: 'kb-key kb-key-alpha-capitalletterleft' },
                    { value: 122 },
                    { value: 120 },
                    { value: 99 },
                    { value: 118 },
                    { value: 98 },
                    { value: 110 },
                    { value: 109 },
                    { value: 44 },
                    { value: 46 },
                    { value: 39 },
                    {separator: 'true' },


                    { value: '123', isChar: false, buttonClass: 'kb-button kb-button-alpha-numberleft', onclick: 'jsKeyboard.changeToLayer3();', keyClass: 'kb-key kb-key-alpha-number' },
                    { value: 32, buttonClass: 'kb-button kb-button-alpha-space' },
                    { value: '#$@', isChar: false, buttonClass: 'kb-button kb-button-alpha-symbolsright', onclick: 'jsKeyboard.changeToLayer4();', keyClass: 'kb-key kb-key-alpha-symbols' },
                    { value: 'Close', isChar: false, buttonClass: 'kb-button kb-button-alpha-hide', onclick: 'virtualKeyboardService.close();', keyClass: 'kb-key kb-key-alpha-hide' }
                ],
                'layer2': [
                    { value: 81 },
                    { value: 87 },
                    { value: 69 },
                    { value: 82 },
                    { value: 84 },
                    { value: 89 },
                    { value: 85 },
                    { value: 73 },
                    { value: 79 },
                    { value: 80 },
                    { value: 'Del', isChar: false, onclick: 'jsKeyboard.del()', buttonClass: 'kb-button kb-button-alpha-del', keyClass: 'kb-key kb-key-alpha-del' },
                    {separator: 'true' },


                    { value: 65, buttonClass: 'kb-button kb-button-alpha-a' },
                    { value: 83 },
                    { value: 68 },
                    { value: 70 },
                    { value: 71 },
                    { value: 72 },
                    { value: 74 },
                    { value: 75 },
                    { value: 76 },
                    { value: 'Enter', isChar: false, buttonClass: 'kb-button kb-button-alpha-enter', onclick: 'jsKeyboard.enter();', keyClass: 'kb-key kb-key-alpha-enter' },
                    {separator: 'true' },


                    { value: 'abc', isChar: false, buttonClass: 'kb-button kb-button-alpha-smallletter', onclick: 'jsKeyboard.changeToLayer1();', keyClass: 'kb-key kb-key-alpha-smallletter' },
                    { value: 90 },
                    { value: 88 },
                    { value: 67 },
                    { value: 86 },
                    { value: 66 },
                    { value: 78 },
                    { value: 77 },
                    { value: 44 },
                    { value: 46 },
                    { value: 39 },
                    {separator: 'true' },


                    { value: '123', isChar: false, buttonClass: 'kb-button kb-button-alpha-numberleft', onclick: 'jsKeyboard.changeToLayer3();', keyClass: 'kb-key kb-key-alpha-number' },
                    { value: 32, buttonClass: 'kb-button kb-button-alpha-space' },
                    { value: '#$@', isChar: false, buttonClass: 'kb-button kb-button-alpha-symbolsright', onclick: 'jsKeyboard.changeToLayer4();', keyClass: 'kb-key kb-key-alpha-symbols' },
                    { value: 'Close', isChar: false, buttonClass: 'kb-button kb-button-alpha-hide', onclick: 'virtualKeyboardService.close();', keyClass: 'kb-key kb-key-alpha-hide' }
                ],
                'layer3': [
                    { value: 49 },
                    { value: 50 },
                    { value: 51 },
                    { value: 52 },
                    { value: 53 },
                    { value: 54 },
                    { value: 55 },
                    { value: 56 },
                    { value: 57 },
                    { value: 48 },
                    { value: 'Del', isChar: false, onclick: 'jsKeyboard.del()', buttonClass: 'kb-button kb-button-alpha-del', keyClass: 'kb-key kb-key-alpha-del' },
                    {separator: 'true' },


                    { value: 45, buttonClass: 'kb-button kb-button-alpha-dash' },
                    { value: 47 },
                    { value: 58 },
                    { value: 59 },
                    { value: 40 },
                    { value: 41 },
                    { value: 36 },
                    { value: 38 },
                    { value: 64 },
                    { value: 'Enter', isChar: false, buttonClass: 'kb-button kb-button-alpha-enter', onclick: 'jsKeyboard.enter();', keyClass: 'kb-key kb-key-alpha-enter' },
                    {separator: 'true' },


                    { value: 'abc', isChar: false, buttonClass: 'kb-button kb-button-alpha-smallletterleft', onclick: 'jsKeyboard.changeToLayer1()', keyClass: 'kb-key kb-key-alpha-smallletter' },
                    { value: 63 },
                    { value: 33 },
                    { value: 34 },
                    { value: 124 },
                    { value: 92 },
                    { value: 42 },
                    { value: 61 },
                    { value: 43 },
                    { value: 'abc', isChar: false, buttonClass: 'kb-button kb-button-alpha-smallletterright', onclick: 'jsKeyboard.changeToLayer1();', keyClass: 'kb-key kb-key-alpha-smallletter' },
                    {separator: 'true' },


                    { value: '#$@', isChar: false, buttonClass: 'kb-button kb-button-alpha-symbolsleft', onclick: 'jsKeyboard.changeToLayer4();', keyClass: 'kb-key kb-key-alpha-symbols' },
                    { value: 32, buttonClass: 'kb-button kb-button-alpha-space' },
                    { value: '#$@', isChar: false, buttonClass: 'kb-button kb-button-alpha-symbolsright', onclick: 'jsKeyboard.changeToLayer4();', keyClass: 'kb-key kb-key-alpha-symbols' },
                    { value: 'Close', isChar: false, buttonClass: 'kb-button kb-button-alpha-hide', onclick: 'virtualKeyboardService.close();', keyClass: 'kb-key kb-key-alpha-hide' }
                ],
                'layer4': [
                    { value: 91 },
                    { value: 93 },
                    { value: 123 },
                    { value: 125 },
                    { value: 35 },
                    { value: 37 },
                    { value: 94 },
                    { value: 42 },
                    { value: 43 },
                    { value: 61 },
                    { value: 'Del', isChar: false, onclick: 'jsKeyboard.del()', buttonClass: 'kb-button kb-button-alpha-del', keyClass: 'kb-key kb-key-alpha-del' },
                    {separator: 'true' },


                    { value: 95, buttonClass: 'kb-button kb-button-alpha-underscore' },
                    { value: 92 },
                    { value: 124 },
                    { value: 126 },
                    { value: 60 },
                    { value: 62 },
                    { value: '&euro;', isChar: false, onclick: 'jsKeyboard.writeSpecial(\'&euro;\');' },
                    { value: 163 },
                    { value: 165 },
                    { value: 'Enter', isChar: false, buttonClass: 'kb-button kb-button-alpha-enter', onclick: 'jsKeyboard.enter();', keyClass: 'kb-key kb-key-alpha-enter' },
                    {separator: 'true' },


                    { value: 'abc', isChar: false, buttonClass: 'kb-button kb-button-alpha-smallletterleft', onclick: 'jsKeyboard.changeToLayer1()', keyClass: 'kb-key kb-key-alpha-smallletter' },
                    { value: 46 },
                    { value: 44 },
                    { value: 63 },
                    { value: 33 },
                    { value: 39 },
                    { value: 34 },
                    { value: 59 },
                    { value: 92 },
                    { value: 'abc', isChar: false, buttonClass: 'kb-button kb-button-alpha-smallletterright', onclick: 'jsKeyboard.changeToLayer1();', keyClass: 'kb-key kb-key-alpha-smallletter' },
                    {separator: 'true' },


                    { value: '123', isChar: false, buttonClass: 'kb-button kb-button-alpha-numberleft', onclick: 'jsKeyboard.changeToLayer3();', keyClass: 'kb-key kb-key-alpha-number' },
                    { value: 32, buttonClass: 'kb-button kb-button-alpha-space' },
                    { value: '123', isChar: false, buttonClass: 'kb-button kb-button-alpha-numberright', onclick: 'jsKeyboard.changeToLayer3();', keyClass: 'kb-key kb-key-alpha-number' },
                    { value: 'Close', isChar: false, buttonClass: 'kb-button kb-button-alpha-hide', onclick: 'virtualKeyboardService.close();', keyClass: 'kb-key kb-key-alpha-hide' }
                ]
            }
        };

        var keyboardToShow = function () {
            return (currentLayout === 'alpha') ? cultureService.culture().name : currentLayout;
        };

        eventService.on('w20.culture.culture-changed', function () {
            if (currentLayout === 'alpha') {
                jsKeyboard.generateKeyboard(keyboardToShow());
            }
        });

        service = {
            init: function (el, layout) {
                if (typeof layout !== 'undefined') {
                    currentLayout = layout;
                }

                jsKeyboard.init(el, keyboardToShow());
            },

            registerLayout: function (name, layout) {
                jsKeyboard.keyboards[name] = layout;
            },

            open: function (element, callback, layout, isClosedAllowed, scrollIntoView) {
                if (currentLayout !== layout) {
                    currentLayout = layout;
                    jsKeyboard.generateKeyboard(keyboardToShow());
                }

                $('#w20-keyboard-preview').val(element.val());

                if (scrollIntoView) {
                    var offset = element.offset();
                    $('html, body').animate({
                        scrollTop: offset.top - 20,
                        scrollLeft: offset.left - 20
                    });
                }

                jsKeyboard.open(function (type, value) {
                    var newValue = element.val(),
                        caret = element.caret(),
                        newCaret;

                    // compute the new value
                    switch (type) {
                        case 'enter':
                            value = '\n';
                            /* falls through */
                        case 'write':
                            newValue = newValue.substring(0, caret[0]) + value + newValue.substring(caret[1]);
                            newCaret = [ caret[0] + value.length, caret[0] + value.length ];
                            break;
                        case 'del':
                            if (caret[0] === caret[1]) {
                                newValue = newValue.substring(0, caret[0] - 1) + newValue.substring(caret[1]);
                                newCaret = [ caret[0] === 0 ? 0 : caret[1] - 1, caret[0] === 0 ? 0 : caret[1] - 1 ];
                            } else {
                                newValue = newValue.substring(0, caret[0]) + newValue.substring(caret[1]);
                                newCaret = [ caret[0], caret[0] ];
                            }
                            break;
                    }

                    if (callback) {
                        callback(newValue);
                        $('#w20-keyboard-preview').val(newValue);
                    }

                    element.focus();

                    if (newCaret !== undefined) {
                        element.caret(newCaret);
                    }
                });
                currentElement = $(element);
                allowClose = isClosedAllowed;

                /**
                 * This event is emitted after the virtual keyboard has opened.
                 *
                 * @name w20.virtualkeyboard.opened
                 * @w20doc event
                 * @memberOf w20TouchVirtualKeyboard
                 * @argument {jQuery} The jQuery object of the input field that the virtual keyboard is bound to.
                 * @argument {String} The keyboard layout.
                 */
                eventService.emit('w20.virtualkeyboard.opened', currentElement, currentLayout);
            },

            close: function () {
                jsKeyboard.close();
                currentElement = undefined;

                /**
                 * This event is emitted after the virtual keyboard has closed.
                 *
                 * @name w20.virtualkeyboard.closed
                 * @w20doc event
                 * @memberOf w20TouchVirtualKeyboard
                 */
                eventService.emit('w20.virtualkeyboard.closed');
            },

            toggle: function (element, callback, layout, isCloseAllowed, scrollIntoView) {
                if (typeof currentElement !== 'undefined') {
                    var keyboardChanged = !currentElement.is(element);

                    this.close();

                    if (keyboardChanged) {
                        this.open(element, callback, layout, isCloseAllowed, scrollIntoView);
                    }
                } else {
                    this.open(element, callback, layout, isCloseAllowed, scrollIntoView);
                }
            },

            allowClose: function (element) {
                return allowClose && currentElement && !currentElement.is($(element));
            }
        };

        return service;
    }]);

    /**
     * Bind a specific keyboard to an input field. When the input field is focused the keyboard is automatically displayed.
     * Keyboard must still be hidden manually after field editing. You can bind any available keyboard type (configured in
     * your application). The "alpha" keyboard type is automatically resolved to the active culture keyboard layout. If no
     * keyboard of the specified layout is available, the default keyboard is displayed. If keyboard mode is auto, the
     * keyboard is opened on focused and closed on blur. If keyboard mode is manual, the keyboard is toggled when clicking
     * on an icon appended to the input field.
     *
     *     <input type="text" data-w20-bind-keyboard="keyboard type" data-keyboard-mode="auto|manual"></input>
     *
     * @name w20BindKeyboard
     * @memberOf w20TouchVirtualKeyboard
     * @w20doc directive
     * @attribute {string} w20BindKeyboard A custom layout can be specified for the bound input field.
     * @attribute {string} keyboardMode Keyboard is automatically displayed upon input field focus, unless this attribute is set to 'manual'.
     * @attribute {string} keyboardScroll If this attribute is present the input field is scrolled into view if possible.
     */
    w20TouchVirtualKeyboard.directive('w20BindKeyboard', ['VirtualKeyboardService', function (virtualKeyboardService) {
        var idSequence = 0;

        return {
            replace: false,
            transclude: false,
            restrict: 'A',
            scope: false,
            require: '?ngModel',
            compile: function (tElement, tAttrs) {
                var manual = tAttrs.keyboardMode === 'manual',
                    scrollIntoView = typeof tAttrs.keyboardScroll !== 'undefined',
                    layout = tAttrs.w20BindKeyboard || 'alpha',
                    keyboardId = idSequence++;

                if (manual) {
                    // remove attribute to prevent directive recursive invocation
                    tAttrs.$set('w20BindKeyboard', undefined);
                    tAttrs.$set('keyboardMode', undefined);

                    tElement.wrap('<div class="input-append"></div>');
                    tElement.after('<span class="add-on" data-ng-click="$w20ToggleKeyboard' + keyboardId + '()"><i class="icon-pencil"/></span>');
                }

                return function (scope, iElement, iAttrs, controller) {
                    function keyboardCallback(newValue) {
                        // do the update
                        tElement.val(newValue);

                        if (controller) {
                            scope.$apply(function () {
                                controller.$setViewValue(newValue);
                            });
                        }
                    }

                    if (manual) {
                        // TODO: fix user scope pollution
                        scope['$w20ToggleKeyboard' + keyboardId] = function () {
                            virtualKeyboardService.toggle(tElement, keyboardCallback, layout, false, scrollIntoView);
                            tElement.focus();
                        };
                    } else {
                        tElement.bind('focus.w20VirtualKeyboard', function () {
                            virtualKeyboardService.open(tElement, keyboardCallback, layout, true, scrollIntoView);
                        });
                    }

                    tElement.bind('$destroy', function () {
                        tElement.unbind('focus.w20VirtualKeyboard');
                        virtualKeyboardService.close();
                    });
                };
            }
        };
    }]);

    /**
     * Create the virtual keyboard inside the element. The keyboard is initially hidden and can be shown
     * by using the VirtualKeyboardService API or by binding a keyboard to an input field (see the w20BindKeyboard).
     *
     *     <div data-w20-virtual-keyboard>
     *         ...
     *     </div>
     *
     * @name w20VirtualKeyboard
     * @memberOf w20TouchVirtualKeyboard
     * @w20doc directive
     */
    w20TouchVirtualKeyboard.directive('w20VirtualKeyboard', ['VirtualKeyboardService', '$window', function (virtualKeyboardService, $window) {
        return {
            template: '<div id="w20-virtual-keyboard"></div>',
            replace: true,
            transclude: true,
            restrict: 'EA',
            scope: false,
            link: function (scope, iElement) {
                virtualKeyboardService.init('w20-virtual-keyboard');

                $($window.document).bind('mousedown.w20VirtualKeyboard touchstart.w20VirtualKeyboard', function (e) {
                    if (virtualKeyboardService.allowClose(e.target) && $(e.target).parents('#w20-virtual-keyboard').length === 0) {
                        virtualKeyboardService.close();
                    }
                });

                iElement.bind('$destroy', function () {
                    $($window.document).unbind('mousedown.w20VirtualKeyboard touchstart.w20VirtualKeyboard');
                    virtualKeyboardService.close();
                });
            }
        };
    }]);

    w20TouchVirtualKeyboard.run(['VirtualKeyboardService', '$log', function (virtualKeyboardService, $log) {
        _.each(keyboardDefs, function (definition, name) {
            virtualKeyboardService.registerLayout(name, definition);
        });
        $log.info('available virtual keyboards: ' + _.keys(keyboardDefs));
    }]);

    return {
        angularModules: ['w20TouchVirtualKeyboard'],
        lifecycle: {
            pre: function (fragments, modules, callback) {
                var keyboardModulesToLoad = [],
                    keyboardNames = [];

                _.each(config.available, function (keyboardName) {
                    if (keyboardName === 'alpha') {
                        var alphaKeyboardNames = _.intersection(cultureModule.availableCultures, builtinKeyboardLayouts);
                        keyboardNames = keyboardNames.concat(alphaKeyboardNames);
                        keyboardModulesToLoad = keyboardModulesToLoad.concat(alphaKeyboardNames.map(function (elt) {
                            return '[text]!{w20-touch}/modules/virtualkeyboard/virtualkeyboard.' + elt + '.json';
                        }));
                    } else {
                        keyboardNames.push(keyboardName);
                        keyboardModulesToLoad.push('[text]!{w20-touch}/modules/virtualkeyboard/virtualkeyboard.' + keyboardName + '.json');
                    }
                });

                _.each(config.custom, function (keyboardPath, keyboardName) {
                    keyboardNames.push(keyboardName);
                    keyboardModulesToLoad.push('[text]!' + keyboardPath);
                });


                require(keyboardModulesToLoad, function () {
                    _.each(Array.prototype.slice.call(arguments, 0), function (keyboardDefinition, index) {
                        keyboardDefs[keyboardNames[index]] = angular.fromJson(keyboardDefinition);
                    });
                    callback(module);
                });
            }
        }
    };
});
