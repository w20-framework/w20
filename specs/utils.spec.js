/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',
    '{angular-mocks}/angular-mocks',
    '{w20-core}/modules/utils'
], function (angular) {
    'use strict';

    describe('The DOM service', function() {
        var $rootScope,
            domService;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_) {
                $rootScope = _$rootScope_;
                domService = $injector.get('DOMService');

                $rootScope.$digest();
            });
        });

        it('should set an incremental id attribute on the element without id', function() {
            var id, element;
            function addTestElement(i) {
                var test = document.createElement('test' + i);
                document.body.appendChild(test);
            }

            addTestElement(1);
            element = angular.element('test1');
            id = domService.autoId('test1');
            expect(id).toEqual('w20-autoid-0');
            expect(element.attr('id').toString()).toEqual('w20-autoid-0');

            addTestElement(2);
            element = angular.element('test2');
            id = domService.autoId('test2');
            expect(id).toEqual('w20-autoid-1');
            expect(element.attr('id').toString()).toEqual('w20-autoid-1');
        });

        it('should not set id attribute on an element which already has one', function() {
            var element, id, testElement;

            testElement = document.createElement('testWithId');
            testElement.setAttribute('id', 'testId');
            document.body.appendChild(testElement);

            element = angular.element('testWithId');
            expect(element.attr('id')).toBeDefined();
            id = domService.autoId('testWithId');
            expect(id).toEqual('testId');
            expect(element.attr('id').toString()).toEqual('testId');
        });
    });

    describe('The highlight filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should set a "highlight" class on the substring passed in the HTML markup', function() {
            expect($filter('highlight')).toBeDefined();

            var string = 'hello world', result;
            result = $filter('highlight')(string, 'world');

            expect(result).toEqual('hello <span class="w20-highlight">world</span>');
        });

    });

    describe('The firstUpperCase filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should set the first letter of the input string to uppercase', function() {
            expect($filter('firstUpperCase')).toBeDefined();

            var string = 'hello world', result;
            result = $filter('firstUpperCase')(string);

            expect(result).toEqual('Hello world');
        });
    });

    describe('The trim filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should left and right trims the input string ', function() {
            expect($filter('trim')).toBeDefined();

            var string = '  hello world  ', result;
            result = $filter('trim')(string);

            expect(result).toEqual('hello world');
        });
    });

    describe('The map filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should return an array of the property values passed as a string parameter or undefined if the property does not exists', function() {
            expect($filter('map')).toBeDefined();

            var input = [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6}, {b: 1, c: 2}, 'test'],
                result;

            result = $filter('map')(input, 'a');

            expect(result).toEqual([1, 4, undefined, undefined]);
        });

        it('should return an array mapped by the function passed as argument', function() {
            expect($filter('map')).toBeDefined();

            var input = [1, 2, 3, 4, 5],
                func = function(elt) { return elt + 1; },
                result;
            result = $filter('map')(input, func);

            expect(result).toEqual([2, 3, 4, 5, 6]);

            input = ['a', 'b', 'c' ];
            func = function(elt) { return elt.toUpperCase(); };
            result = $filter('map')(input, func);

            expect(result).toEqual(['A', 'B', 'C' ]);

        });

    });

    describe('The join filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should join the input array elements as a string  delimited by the default comma', function() {
            expect($filter('join')).toBeDefined();

            var input = ['I', 'am', 'testing', 1, 'filter'], result;
            result = $filter('join')(input);

            expect(result).toEqual('I, am, testing, 1, filter');
        });

        it('should join the input array elements as a string  delimited by the first argument', function() {
            expect($filter('join')).toBeDefined();

            var input = ['I', 'am', 'testing', 1, 'filter'], result;
            result = $filter('join')(input, ' ');

            expect(result).toEqual('I am testing 1 filter');
        });
    });

    describe('The keys filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should return an array of the keys of the input object', function() {
            expect($filter('keys')).toBeDefined();

            var input = {one: 'oneVal', two: 'twoVal', three: 'threeVal'}, result;
            result = $filter('keys')(input);

            expect(result).toEqual(['one', 'two', 'three']);
        });
    });

    describe('The unique filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should return a duplicate free array of the input array', function() {
            expect($filter('unique')).toBeDefined();

            var input = [1, 2, 1, 1, 3], result;
            result = $filter('unique')(input);

            expect(result).toEqual([1, 2, 3]);

            input = ['hello', 1, 'world', 1, '!', 'hello'];
            result = $filter('unique')(input);

            expect(result).toEqual(['hello', 1, 'world', '!']);
        });
    });

    describe('The path filter', function() {
        var $rootScope,
            $filter;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function ($injector, _$rootScope_, _$filter_) {
                $rootScope = _$rootScope_;
                $filter = _$filter_;

                $rootScope.$digest();
            });
        });

        it('should resolves an url using the RequireJS loader', function() {
            expect($filter('path')).toBeDefined();

            var path = './utils.spec.js', result;
            result = $filter('path')(path);

            expect(result).toEqual('/base/modules/utils.spec.js');

        });
    });

    describe('The w20Compile directive', function() {
        var $rootScope,
            $compile,
            element;


        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function (_$rootScope_, _$compile_) {
                $rootScope = _$rootScope_;
                $compile = _$compile_;

                $rootScope.$digest();
            });
        });

        it('should sets the html evaluated from the expression, sets it as the element children and compiles it', function() {
            $rootScope.test = 'testCompiled';
            $rootScope.htmlToCompile = '<p> {{ test }} </p>';

            element = angular.element('<div data-w20-compile="htmlToCompile"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();

            expect(element.html()).toEqual('<p class="ng-binding ng-scope"> testCompiled </p>');
        });
    });

    describe('The w20IncludeReplace directive', function() {
        var $rootScope,
            $compile,
            element,
            $templateCache;

        beforeEach(function () {

            angular.mock.module('w20CoreUtils');

            angular.mock.inject(function (_$rootScope_, _$compile_, _$templateCache_) {
                $rootScope = _$rootScope_.$new();
                $compile = _$compile_;
                $templateCache = _$templateCache_;

                $rootScope.$digest();
            });
        });

        it('should include the template and be replaced by it', function() {
            $templateCache.put('templateId.html', '<p id="include"> This is the content of the template </p>');

            element = angular.element('<div id="replace" data-w20-include-replace data-ng-include="\'templateId.html\'"></div>');
            angular.element(document.body).append(element);
            $compile(element)($rootScope);
            $rootScope.$digest();

            element = angular.element('#include');
            expect(element.length).toEqual(1);
            expect(element.attr('id')).toEqual('include');
            expect(element.html()).toEqual(' This is the content of the template ');

            element = angular.element('#replace');
            expect(element.length).toBe(0);

            element = angular.element('#include');
            element.remove();
        });
    });
});
