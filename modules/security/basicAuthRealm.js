/*
 * Copyright (c) 2013-2017, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



/***
 * Basic authentication module
 * 
 * Handles Browser-based authentication
 */
define([
    'module',
    'require',
    'w20',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-resource}/angular-resource',
    '{w20-core}/modules/security/securityModule'
], function(module, require, w20, $, _, angular) {
    'use strict';

    var w20CoreSecurity = angular.module('w20CoreSecurity');
   
    function BasicAuthenticationProvider($resource, $window, $q) {
        var AuthenticationResource,
            AuthorizationsResource,
            realm,
            authenticationUrl,
            clearCredentials;

        function randomString(length) {
            var chars = [];
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < length; i++) {
                chars[i] = possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return chars.join('');
        }

        return {
            setConfig : function(providerConfig) {
                clearCredentials = providerConfig.clearCredentials || true;

                if (typeof providerConfig.authentication === 'undefined') {
                    throw new Error('Authentication URL is required for BasicAuthentication provider, got undefined');
                }
                authenticationUrl = require.toUrl(providerConfig.authentication).replace(/:(?!\/\/)/, '\\:');
                AuthenticationResource = $resource(authenticationUrl);

                if (typeof providerConfig.authorizations === 'undefined') {
                    throw new Error('Authorizations URL is required for BasicAuthentication provider, got undefined');
                }
                AuthorizationsResource = $resource(require.toUrl(providerConfig.authorizations).replace(/:(?!\/\/)/, '\\:'));
            },

            setRealm : function(value) {
                realm = value;
            },

            isAuthentifiable : function() {
                return true;
            },

            authenticate : function() {
                var deferred = $q.defer();
                AuthenticationResource.get(function() {
                    AuthorizationsResource.get({}, function(subject) {
                        deferred.resolve({
                            realm : realm,
                            subject : subject
                        });
                    }, function() {
                        deferred.reject(realm);
                    });
                }, function() {
                    deferred.reject(realm);
                });

                return deferred.promise;
            },

            deauthenticate : function() {
                var deferred = $q.defer();
                AuthenticationResource.remove(function() {
                    if (clearCredentials) {
                        if (!$window.document.execCommand('ClearAuthenticationCache', 'false')) {
                            $.ajax({
                                type : 'GET',
                                url : authenticationUrl,
                                async : true,
                                username : randomString(8),
                                password : randomString(8),
                                headers : {
                                    Authorization : 'Basic ' + randomString(20)
                                }
                            });
                        }
                    }
                    deferred.resolve(realm);
                }, function() {
                    deferred.reject(realm);
                });

                return deferred.promise;
            },

            refresh : function() {
                var deferred = $q.defer();
                AuthorizationsResource.get({}, function(subject) {
                    deferred.resolve({
                        realm : realm,
                        subject : subject
                    });
                }, function() {
                    deferred.reject(realm);
                });

                return deferred.promise;
            }
        };
    }
    BasicAuthenticationProvider.$inject = [ '$resource', '$window', '$q' ];
    
    
    var basicAuthProviderFunction = function(){
        return BasicAuthenticationProvider;
    };
    
    w20CoreSecurity.factory('basicAuth', basicAuthProviderFunction);
});
