/*
 * Copyright (c) 2013-2017, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


/**
 * Security Module
 * 
 * Creates the security modules with its dependencies 
 * 
 * Adds a method to register new authentication provider
 * 
 */
define([ '{angular}/angular' ], function(angular) {
    var w20CoreSecurity = angular.module('w20CoreSecurity', [ 'w20CoreEnv', 'ngResource' ]);

    function registerSecurityProvider(provider,providerFn) {
        w20CoreSecurity.factory(provider,providerFn);
    }

    return {
        registerSecurityProvider: registerSecurityProvider
    }
});
