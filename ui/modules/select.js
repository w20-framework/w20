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
    '{angular}/angular',
    '{angular-ui-select}/select',
    '[css]!{angular-ui-select}/select'
], function (module, angular) {
    'use strict';

    var w20UISelect = angular.module('w20UISelect', ['ui.select']);

    w20UISelect.config(['uiSelectConfig', function (uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
    }]);

    return {
        angularModules: ['w20UISelect']
    };
});