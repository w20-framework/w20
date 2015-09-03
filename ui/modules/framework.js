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
    '{angular}/angular'
], function (module, angular) {
    'use strict';

    function loadBootstrapFramework (id, require, load, config) {

        w20CSSFramework.requires.push('ui.bootstrap');

        w20CSSFramework.run(['EventService', 'CultureService', 'datepickerConfig', 'datepickerPopupConfig',
            function (eventService, cultureService, datepickerConfig, datepickerPopupConfig) {

            datepickerConfig.formatDay = 'dd';
            datepickerConfig.formatMonth = 'MMMM';
            datepickerConfig.formatYear = 'yyyy';
            datepickerConfig.formatDayHeader = 'ddd';
            datepickerConfig.formatDayTitle = 'MMMM yyyy';
            datepickerConfig.formatMonthTitle = 'yyyy';

            function updateDatePicker(culture) {
                datepickerPopupConfig.datepickerPopup = culture.calendars.standard.patterns.d;
                datepickerPopupConfig.currentText = cultureService.localize('w20.ui.datepicker.today');
                datepickerPopupConfig.clearText = cultureService.localize('w20.ui.datepicker.clear');
                datepickerPopupConfig.closeText = cultureService.localize('w20.ui.datepicker.close');
            }

            eventService.on('w20.culture.culture-changed', function (culture) {
                updateDatePicker(culture);
            });

            updateDatePicker(cultureService.culture());
        }]);

        require([id], load);
    }

    var w20CSSFramework = angular.module('w20CSSFramework', ['w20CoreEnv', 'w20CoreSecurity', 'w20CoreCulture']),
        moduleConfig = module && module.config() || {},
        loadBootstrap = true;

    if (typeof moduleConfig.bootstrap !== 'undefined') {
        loadBootstrap = moduleConfig.bootstrap;
    }

    return {
        angularModules: ['w20CSSFramework'],
        get bootstrap() {
            return loadBootstrap;
        },
        load: function (id, require, load, config) {
            if (config.isBuild) {
                load();
            } else {
                if (loadBootstrap) {
                    loadBootstrapFramework(id, require, load, config);
                } else {
                    load();
                }
            }
        }
    };
});