/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',
    '{angular-mocks}/angular-mocks'
], function (angular) {
    'use strict';

    describe('The W20 loader', function() {

        it('should set a w20 global object', function() {
           expect(window.w20).toBeDefined();
        });

        it('should have a list of loaded fragments', function () {
            expect(window.w20.fragments['w20-core']).toBeDefined();
            expect(window.w20.fragments['fragment-test']).toBeDefined();
        });

        it('should have registered angularJS module', function () {
           expect(angular.module('test-module')).toBeDefined();
        });
    });
});
