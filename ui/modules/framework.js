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
    'module'
], function (module) {
    'use strict';

    var moduleConfig = module && module.config() || {},
        loadBootstrap = true;

    if (typeof moduleConfig.bootstrap !== 'undefined') {
        loadBootstrap = moduleConfig.bootstrap;
    }

    return {
        get bootstrap() {
            return loadBootstrap;
        },
        load: function (id, require, load, config) {
            if (config.isBuild) {
                load();
            } else {
                if (loadBootstrap) {
                    require([id], load);
                } else {
                    load();
                }
            }
        }
    };
});