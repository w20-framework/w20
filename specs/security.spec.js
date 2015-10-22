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
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-mocks}/angular-mocks',
    '{w20-core}/modules/security'
], function (_, angular) {
    'use strict';

    function AuthenticationProviderMockFactory(subject) {
        return function ($q) {
            var realm;

            return {
                setConfig: function (providerConfig) {
                },

                setRealm: function (value) {
                    realm = value;
                },

                isAuthentifiable: function () {
                    return true;
                },

                authenticate: function () {
                    var deferred = $q.defer();
                    deferred.resolve({
                        realm: realm,
                        subject: subject
                    });
                    return deferred.promise;
                },

                deauthenticate: function () {
                    var deferred = $q.defer();
                    deferred.resolve(realm);
                    return deferred.promise;
                },

                refresh: function () {
                    var deferred = $q.defer();
                    deferred.resolve({
                        realm: realm,
                        subject: subject
                    });
                    return deferred.promise;
                }
            };
        };
    }

    describe('the authentication service', function () {
        var $rootScope,
            authenticationService,
            missingIdSubject = {
                type : 'user',
                principals : {
                },
                roles : []
            },
            userSubject11 = {
                id : 'Subject1Id',
                type : 'user',
                principals : {
                    principal1: 'testValue1',
                    principal2: 'testValue2'
                },
                roles : [],
                permissions : []
            },
            userSubject12 = {
                id : 'Subject1Id',
                type : 'user',
                principals : {
                    principal3: 'testValue3',
                    principal4: 'testValue4'
                },
                roles : [],
                permissions : []
            },
            userSubject21 = {
                id : 'Subject2Id',
                type : 'user',
                principals : {
                    principal1: 'testValue1',
                    principal2: 'testValue2'
                },
                roles : [],
                permissions : []
            },
            userSubject22 = {
                id : 'Subject2Id',
                type : 'terminal',
                principals : {
                    principal1: 'testValue1',
                    principal2: 'testValue2'
                },
                roles : [],
                permissions : []
            };

        beforeEach(function () {
            angular.mock.module('w20CoreSecurity', function ($provide) {
                $provide.value('$log', console);
            });

            angular.mock.inject(function ($injector, _$rootScope_) {
                $rootScope = _$rootScope_;
                authenticationService = $injector.get('AuthenticationService');
            });
        });

        it('should report that authentication is not possible without provider', function() {
            expect(authenticationService.isAuthentifiable()).toEqual(false);
        });

        it('should report that authentication is possible if at least one provider is registered', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            expect(authenticationService.isAuthentifiable()).toEqual(true);
        });

        it('should return undefined values when not authenticated', function() {
            expect(authenticationService.subjectId()).not.toBeDefined();
            expect(authenticationService.subjectType()).not.toBeDefined();
            expect(authenticationService.subjectPrincipals()).not.toBeDefined();
            expect(authenticationService.subjectPrincipal('firstName')).not.toBeDefined();
        });

        it('should be able to authenticate', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            authenticationService.authenticate().then(function(subject) {
                expect(subject).not.toBeNull();
                expect(authenticationService.subjectAuthenticated()).toEqual(true);
                expect(authenticationService.subjectId()).toEqual(userSubject11.id);
                expect(authenticationService.subjectType()).toEqual(userSubject11.type);
                expect(authenticationService.subjectPrincipals()).toEqual(userSubject11.principals);
                expect(authenticationService.subjectPrincipal('principal1')).toEqual(userSubject11.principals.principal1);
                expect(authenticationService.subjectPrincipal('principal2')).toEqual(userSubject11.principals.principal2);
                expect(authenticationService.subjectPrincipal('principal3')).not.toBeDefined();
            }, function(error) {
                expect(error).toBeNull();
            });

            $rootScope.$digest();
        });

        it('should reject subjects without id', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(missingIdSubject), {});
            authenticationService.authenticate().then(function(subject) {
                expect(subject).toBeNull();
            }, function(error) {
                expect(error.message).toEqual('Subject identifier is missing');
            });

            $rootScope.$digest();
        });

        it('should be able to merge subjects', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            authenticationService.addProvider('mock-realm2', new AuthenticationProviderMockFactory(userSubject12), {});
            authenticationService.authenticate().then(function(subject) {
                expect(subject).not.toBeNull();
                expect(authenticationService.subjectAuthenticated()).toEqual(true);
                expect(authenticationService.subjectId()).toEqual(userSubject11.id);
                expect(authenticationService.subjectType()).toEqual(userSubject11.type);
                expect(authenticationService.subjectPrincipals()).toEqual(_.extend({}, userSubject11.principals, userSubject12.principals));
            }, function(error) {
                expect(error).toBeNull();
            });

            $rootScope.$digest();
        });

        it('should reject subjects with different identifiers', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            authenticationService.addProvider('mock-realm2', new AuthenticationProviderMockFactory(userSubject21), {});
            authenticationService.authenticate().then(function(subject) {
                expect(subject).toBeNull();
            }, function(error) {
                expect(error.message).toEqual('Subject identifier mismatch between authentication providers, ' + userSubject11.id + ' != ' + userSubject21.id);
            });

            $rootScope.$digest();
        });

        it('should reject subjects with different types', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject21), {});
            authenticationService.addProvider('mock-realm2', new AuthenticationProviderMockFactory(userSubject22), {});
            authenticationService.authenticate().then(function(subject) {
                expect(subject).toBeNull();
            }, function(error) {
                expect(error.message).toEqual('Subject type mismatch between authentication providers, ' + userSubject21.type + ' != ' + userSubject22.type);
            });

            $rootScope.$digest();
        });

        it('should be able to refresh subject', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            authenticationService.authenticate().then(authenticationService.refresh).then(function(subject) {
                expect(subject).not.toBeNull();
                expect(authenticationService.subjectAuthenticated()).toEqual(true);
                expect(authenticationService.subjectId()).toEqual(userSubject11.id);
            }, function(error) {
                expect(error).toBeNull();
            });

            $rootScope.$digest();
        });

        it('should be able to deauthenticate', function() {
            authenticationService.addProvider('mock-realm1', new AuthenticationProviderMockFactory(userSubject11), {});
            authenticationService.authenticate().then(authenticationService.deauthenticate).then(function(result) {
                expect(result).toEqual(true);
                expect(authenticationService.subjectId()).not.toBeDefined();
            }, function(error) {
                expect(error).toBeNull();
            });

            $rootScope.$digest();
        });
    });

    describe('the authorization service', function () {
        var $rootScope,
            authenticationService,
            authorizationService,
            subject = {
                id : 'Subject1Id',
                type : 'user',
                principals : {
                    principal1: 'testValue1',
                    principal2: 'testValue2'
                },
                roles : [
                    {
                        name: 'ROLE1',
                        attributes: {
                            domain: 'MU'
                        },
                        permissions: [
                            [ 'test', 'zone1', 'read' ],
                            [ 'test', 'zone1', 'write' ],
                            [ 'test', 'zone2', '*' ]
                        ]
                    },
                    {
                        name: 'ROLE1',
                        attributes: {
                            domain: 'PY'
                        },
                        permissions: [
                            [ 'test', 'zone1', 'read' ],
                            [ 'test', 'zone2', 'read' ],
                            [ 'test', 'zone3', 'read' ]
                        ]
                    },
                    {
                        name: 'ROLE2',
                        attributes: {
                            domain: 'PY'
                        },
                        permissions: [
                            [ 'test', 'zone4', 'read' ]
                        ]
                    },
                    {
                        name: 'ROLE3',
                        attributes: {
                            domain: 'SX'
                        },
                        permissions: [
                            [ 'test', 'zone3', 'read' ],
                            [ 'test', 'zone4', 'read' ]
                        ]
                    },
                    {
                        name: 'ROLE4',
                        permissions: [
                            [ 'test', 'zone4', 'read' ]
                        ]
                    },
                    {
                        name: 'ROLE5',
                        attributes: {
                            other: 'value'
                        },
                        permissions: [
                            [ 'test', 'zone4', 'read' ]
                        ]
                    }
                ],
                permissions : [
                    [ 'test', 'zone1', 'print' ],
                    [ 'test', 'zone1', 'write', 'instance1' ]
                ]
            };

        beforeEach(function () {
            angular.mock.module('w20CoreSecurity', function ($provide) {
                $provide.value('$log', console);
            });

            angular.mock.inject(function ($injector, _$rootScope_) {
                $rootScope = _$rootScope_;
                authenticationService = $injector.get('AuthenticationService');
                authorizationService = $injector.get('AuthorizationService');
                authenticationService.addProvider('mock-realm', new AuthenticationProviderMockFactory(subject), {});
                authenticationService.authenticate();

                $rootScope.$digest();
            });
        });

        it('should be able to check a simple permission', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:read')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:write')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:delete')).toEqual(false);
        });

        it('should be able to check a wildcard permission', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone2:read')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone2:write')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone2:delete')).toEqual(true);
        });

        it('should be able to check for full permissions', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:*')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone2:*')).toEqual(true);
        });

        it('should be able to check for composite permissions', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1,zone2:read')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1,zone2:delete')).toEqual(false);
        });

        it('should be able to check for role and individual permissions', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:print')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:write:instance1')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:write:instance2')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:do-something-else')).toEqual(false);
        });

        it('should be able to check for role', function() {
            expect(authorizationService.hasRole('mock-realm', 'ROLE1')).toEqual(true);
        });

        it('should be able to check for role with attributes', function() {
            expect(authorizationService.hasRole('mock-realm', 'ROLE1', { domain: 'MU' })).toEqual(true);
            expect(authorizationService.hasRole('mock-realm', 'ROLE1', { domain: 'PY' })).toEqual(true);
            expect(authorizationService.hasRole('mock-realm', 'ROLE1', { domain: 'SX' })).toEqual(false);
        });

        it('should be able to check for permissions with attributes', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:read', { domain: 'MU' })).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:read', { domain: 'PY' })).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:read', { domain: 'SX' })).toEqual(false);
        });

        it('should be able to filter roles', function() {
            authorizationService.setRoleFilter([ 'ROLE2' ]);
            expect(authorizationService.hasRole('mock-realm', 'ROLE1')).toEqual(false);
            expect(authorizationService.hasRole('mock-realm', 'ROLE2')).toEqual(true);
        });

        it('should be able to filter roles', function() {
            authorizationService.setRoleFilter([ 'ROLE2' ]);
            expect(authorizationService.hasRole('mock-realm', 'ROLE1')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone3:read')).toEqual(false);
            expect(authorizationService.hasRole('mock-realm', 'ROLE2')).toEqual(true);
            expect(authorizationService.hasRole('mock-realm', 'ROLE3')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone4:read')).toEqual(true);
        });

        it('should be able to filter attributes', function() {
            authorizationService.setAttributeFilter({
                domain: 'MU'
            });
            expect(authorizationService.hasRole('mock-realm', 'ROLE1')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone1:read')).toEqual(true);
            expect(authorizationService.hasRole('mock-realm', 'ROLE2')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone3:read')).toEqual(false);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone4:read')).toEqual(true);
        });

        it('should be able to list unified roles', function() {
            expect(authorizationService.getRoles()).toEqual([ 'ROLE1', 'ROLE2', 'ROLE3', 'ROLE4', 'ROLE5' ]);
        });

        it('should be able to list unified roles', function() {
            expect(authorizationService.getAttributes()).toEqual({ domain: [ 'MU', 'PY', 'SX' ], other: [ 'value' ] });
        });

        it('should be able to merge overlapping permissions', function() {
            expect(authorizationService.hasPermission('mock-realm', 'test:zone4:read')).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone4:read', { domain: 'XX' })).toEqual(true);
            expect(authorizationService.hasPermission('mock-realm', 'test:zone4:read', { domain: '*' })).toEqual(true);
        });
    });
});