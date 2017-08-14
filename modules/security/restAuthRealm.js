/*
 * Copyright (c) 2013-2017, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



/***
 * Rest Authentication module
 * 
 * Handles Rest (Programmaticaly) based authentication
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
], function( require, w20, $, _, angular, resources, securityModule) {
    'use strict';

    function RestAuthentication($resource, $window, $q, $rootScope) {
        var AuthenticationResource,
            AuthorizationsResource,
            realm,
            clearCredentials;


        return {
            setConfig: function(providerConfig) {
                clearCredentials = providerConfig.clearCredentials || true;

                //Parse configuration
                if (typeof providerConfig.loginUrl === 'undefined') {
                    throw new Error('Login URL is required for RestAuthentication provider, got undefined');
                }
                var loginUrl = require.toUrl(providerConfig.loginUrl).replace(/:(?!\/\/)/, '\\:');
                if (typeof providerConfig.logoutUrl === 'undefined') {
                    throw new Error('Logout URL is required for RestAuthentication provider, got undefined');
                }
                var logoutUrl = require.toUrl(providerConfig.logoutUrl).replace(/:(?!\/\/)/, '\\:');

                if (typeof providerConfig.authorizations === 'undefined') {
                    throw new Error('Authorizations URL is required for BasicAuthentication provider, got undefined');
                }
                var authorizationUrl = require.toUrl(providerConfig.authorizations).replace(/:(?!\/\/)/, '\\:');

                //Setup Resources
                AuthenticationResource = $resource('', {}, {
                    login: {
                        method: 'POST',
                        withCredentials: true,
                        url: loginUrl
                    },
                    logout: {
                        method: 'DELETE',
                        withCredentials: true,
                        url: logoutUrl
                    }
                });

                AuthorizationsResource = $resource(authorizationUrl, {}, {
                    getSubject: {
                        method: 'GET'
                    }
                });
            },

            setRealm: function(value) {
                realm = value;
            },

            isAuthentifiable: function() {
                return true;
            },

            authenticate: function(credentials) {
                var deferred = $q.defer();

                function isValidSubject(subject) {
                    return !(_.isNull(subject) || _.isUndefined(subject) || _.isUndefined(subject.id));
                }

                function rejectLogin() {
                    deferred.reject(realm);
                }

                function acceptLogin(subject) {
                    if (!isValidSubject(subject)) {
                        //Invalid login
                        rejectLogin();
                        return;
                    }
                    deferred.resolve({
                        realm: realm,
                        subject: subject
                    });
                }

                //Event that can be intercepted by application to show a dialog to do login again
                function requestLoginFn() {
                    $rootScope.$broadcast("LoginRequired");
                    rejectLogin();

                }

                function retrievePermissions(requestLogin) {
                    var rejectionType = rejectLogin;
                    if (requestLogin) {
                        rejectionType = requestLoginFn;
                    }
                    AuthorizationsResource.getSubject().$promise.then(acceptLogin, rejectionType);
                }

                //credentials are not set, must check if user is already logged with cookie
                if (_.isUndefined(credentials) || _.isNull(credentials)) {
                    retrievePermissions(true);
                    return deferred.promise;
                }
                function parseLoginResponse(subject) {
                    if (!isValidSubject(subject)) {
                        //Attempting to log in an already logged-in user
                        //Must resolve permissions
                        retrievePermissions(false);
                        return;
                    }
                    acceptLogin(subject);


                }
                AuthenticationResource.login(credentials, credentials).$promise
                    .then(parseLoginResponse, rejectLogin);
                return deferred.promise;


            },

            deauthenticate: function() {
                var deferred = $q.defer();
                AuthenticationResource.logout(function() {
                    if (clearCredentials) {
                        $window.document.execCommand('ClearAuthenticationCache', 'false');
                    }
                    deferred.resolve(realm);
                }, function() {
                    deferred.reject(realm);
                });

                return deferred.promise;
            },

            refresh: function() {
                var deferred = $q.defer();
                AuthorizationsResource.get({}, function(subject) {
                    deferred.resolve({
                        realm: realm,
                        subject: subject
                    });
                }, function() {
                    deferred.reject(realm);
                });

                return deferred.promise;
            }
        };
    }
    RestAuthentication.$inject = [ '$resource', '$window', '$q', '$rootScope' ];

    function restAuthProvider() {
        return RestAuthentication;
    }
    securityModule.registerSecurityProvider('restAuth', restAuthProvider);

});
