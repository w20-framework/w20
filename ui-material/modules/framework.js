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

    '{angular-material}/angular-material',

    '{w20-core}/modules/env',
    '{w20-core}/modules/culture',
    '{w20-core}/modules/security'

], function (require, module, $, _, angular) {
    'use strict';

    var w20CSSFramework = angular.module('w20CSSFramework', ['ngMaterial', 'w20CoreEnv', 'w20CoreSecurity', 'w20CoreCulture']);

    return {
        angularModules: ['w20CSSFramework'],
        get name () {
            return 'material';
        }
    };
});