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
    '{w20-core}/modules/env',
    '{w20-core}/modules/culture',
    '{angular-ui-grid}/ui-grid'
], function (module, angular) {
    'use strict';
    var w20UIGrid = angular.module('w20UIGrid', ['ui.grid.pagination', 'ui.grid', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.autoResize', 'w20CoreEnv', 'w20CoreCulture']);

    w20UIGrid.run(['i18nService', 'EventService', 'CultureService', function (i18nService, eventService, cultureService) {
        function applyCulture(culture) {
            i18nService.add(culture.name, culture.messages['w20.ui.grid']);
            i18nService.setCurrentLang(culture.name);
        }

        eventService.on('w20.culture.culture-changed', function (newCulture) {
            applyCulture(newCulture);
        });

        applyCulture(cultureService.culture());
    }]);

    return {
        angularModules: ['w20UIGrid']
    };
});