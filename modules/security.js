/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'module',
    'require',
    'w20',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-resource}/angular-resource'
], function (module, require, w20, $, _, angular) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreSecurity
     *
     * @description
     *
     * This module provides authentication and authorization functions through realms. A realm is a security domain
     * where a subject has some attributes and permissions. A subject may have different permissions in different realms.
     * A permission check is always done in a specific realm and valid only for this realm. Realms are declared in
     * fragments and are named with the fragment identifier.
     *
     * Authentication is handled through authentication providers. You can register additional providers with the API.
     *
     * SimpleAuthentication provider is built-in.
     *
     * Configuration
     * -------------
     *
     *      "security" : {
     *          // Automatically log in user on application initialization (possibly asking for credentials)
     *          "autoLogin" : true|false
     *
     *          // If present this parameter change the current view to the one at the specified route path
     *          // after logout
     *          "redirectAfterLogout": "path/to/route/after/logout",
     *
     *          // If present this parameter change the current view to the one at the specified route path
     *          // after login
     *          "redirectAfterLogin": "path/to/route/after/login"
     *      }
     *
     * Fragment definition sections
     * ----------------------------
     *
     * The "security" fragment definition section defines a security realm named as the fragment identifier.
     *
     *      "security" : {
     *          "provider" : "Name of the authentication provider",
     *          "config" : {
     *              ... // Provider-specific configuration
     *          }
     *      }
     *
     */
    var w20CoreSecurity = angular.module('w20CoreSecurity', ['w20CoreEnv', 'ngResource']),
        config = module && module.config() || {},
        allProviders = {},
        allRealms = {};

    var SimpleAuthenticationProvider = ['$resource', '$q', function ($resource, $q) {
        var AuthenticationResource, AuthorizationsResource, realm;

        return {
            setConfig: function (providerConfig) {
                if (typeof providerConfig.authentication === 'undefined') {
                    throw new Error('Authentication URL is required for BasicAuthentication provider, got undefined');
                }

                AuthenticationResource = $resource(require.toUrl(providerConfig.authentication).replace(/:(?!\/\/)/, '\\:'));

                if (typeof providerConfig.authorizations === 'undefined') {
                    throw new Error('Authorizations URL is required for BasicAuthentication provider, got undefined');
                }

                AuthorizationsResource = $resource(require.toUrl(providerConfig.authorizations).replace(/:(?!\/\/)/, '\\:'));
            },

            setRealm: function (value) {
                realm = value;
            },

            isAuthentifiable: function () {
                return true;
            },

            authenticate: function (credentials) {
                var deferred = $q.defer();
                AuthenticationResource.get(credentials || {}, function () {
                    AuthorizationsResource.get({}, function (subject) {
                        deferred.resolve({
                            realm: realm,
                            subject: subject
                        });
                    }, function () {
                        deferred.reject(realm);
                    });
                }, function () {
                    deferred.reject(realm);
                });

                return deferred.promise;
            },

            deauthenticate: function () {
                var deferred = $q.defer();
                AuthenticationResource.remove(function () {
                    deferred.resolve(realm);
                }, function () {
                    deferred.reject(realm);
                });

                return deferred.promise;
            },

            refresh: function () {
                var deferred = $q.defer();
                AuthorizationsResource.get({}, function (subject) {
                    deferred.resolve({
                        realm: realm,
                        subject: subject
                    });
                }, function () {
                    deferred.reject(realm);
                });

                return deferred.promise;
            }
        };
    }];

    // $http security defaults
    w20CoreSecurity.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common.withCredentials = !!w20.corsWithCredentials;
    }]);

    /**
     * @ngdoc service
     * @name w20CoreSecurity.service:AuthenticationService
     *
     * @description
     *
     * The AuthenticationService provides an API to authenticate and deauthenticate a subject, as well as query its
     * various properties.
     *
     */
    w20CoreSecurity.factory('AuthenticationService', ['$log', '$injector', '$q', 'EventService', 'AuthorizationService', function ($log, $injector, $q, eventService, authorizationService) {
        var authProviders = [],
            currentSubject = null,
            deferred = null;

        function processSubjects(subjects) {
            return subjects.reduce(function (previous, current) {
                if (!current.subject || !current.subject.id) {
                    throw new Error('Subject identifier is missing');
                }

                if (typeof previous.id !== 'undefined' && previous.id !== current.subject.id) {
                    throw new Error('Subject identifier mismatch between authentication providers, ' + previous.id + ' != ' + current.subject.id);
                }

                if (typeof previous.type !== 'undefined' && previous.type !== current.subject.type) {
                    throw new Error('Subject type mismatch between authentication providers, ' + previous.type + ' != ' + current.subject.type);
                }

                authorizationService.addSubjectAuthorizations(current.realm, current.subject);

                return _.merge(previous, {
                    id: current.subject.id,
                    type: current.subject.type,
                    principals: current.subject.principals
                });
            }, {});
        }

        return {
            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#addProvider
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @param {String} realm The realm
             * @param {Object} providerFactory An injectable AngularJS factory that act as a provider for authentication.
             * This factory should return an object with a setConfig(config) and setRealm(realm) methods.
             * @param {Object} config A configuration object with a **authorization** property url and a **authentication** property url
             *
             * @description
             *
             * Add an authentication provider which can then be used by any security realm definition.
             *
             */
            addProvider: function (realm, providerFactory, config) {
                var provider = $injector.invoke(providerFactory);
                provider.setConfig(config);
                provider.setRealm(realm);
                authProviders.push(provider);
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#subjectId
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {String} The subject identifier or undefined if no subject is currently authenticated.
             *
             * @description
             *
             * Retrieve the identifier of the currently authenticated subject.
             *
             */
            subjectId: function () {
                if (currentSubject !== null) {
                    return currentSubject.id;
                } else {
                    return undefined;
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#subjectType
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {String} The subject type or undefined if no subject is currently authenticated.
             *
             * @description
             *
             * Retrieve the type of the currently authenticated subject.
             *
             */
            subjectType: function () {
                if (currentSubject !== null) {
                    return currentSubject.type;
                } else {
                    return undefined;
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#subjectPrincipals
             * @methodOf w20CoreSecurity.service:AuthenticationService
             *
             * @description
             *
             * Retrieve all the the principals of the currently authenticated subject.
             *
             */
            subjectPrincipals: function () {
                if (currentSubject !== null) {
                    return currentSubject.principals;
                } else {
                    return undefined;
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#subjectPrincipal
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @param {String} name The name of the principal value.
             * @returns {String} The specified principal value or undefined if no subject is currently authenticated or the specified principal doesn't exists.
             *
             * @description
             *
             * Retrieve the specified principal value of the currently authenticated subject.
             *
             */
            subjectPrincipal: function (name) {
                if (currentSubject !== null && typeof currentSubject.principals !== 'undefined') {
                    return currentSubject.principals[name];
                } else {
                    return undefined;
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#subjectAuthenticated
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {Boolean} True if the subject is currently authenticated, false otherwise.
             *
             * @description
             *
             * Return if the subject is authenticated.
             *
             */
            subjectAuthenticated: function () {
                return currentSubject !== null;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#isAuthentifiable
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {Boolean} True if the subject is currently authentifiable, false otherwise.
             *
             * @description
             *
             * Return if a subject is authentifiable (i.e. all authentication providers can authenticate a subject).
             *
             */
            isAuthentifiable: function () {
                if (authProviders.length === 0) {
                    return false;
                }

                return _.all(authProviders, function (provider) {
                    return provider.isAuthentifiable();
                });
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#authenticate
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @param {Object} credentials The credentials object passed to authentication providers to authenticate the subject.
             * @returns {Object} A promise that will be resolved upon successful subject authentication, or rejected otherwise.
             *
             * @description
             *
             * Authenticate the subject corresponding to the specified credentials through all the configured security realms.
             */
            authenticate: function (credentials) {
                if (authProviders.length === 0) {
                    return $q.reject('No realm to authenticate');
                }

                deferred = $q.all(authProviders.map(function (provider) {
                    return provider.authenticate(credentials);
                }).concat(deferred === null ? [] : [deferred])).then(function (subjects) {
                    authorizationService.clear();
                    currentSubject = processSubjects(subjects);
                    authorizationService.seal();

                    deferred = null;

                    $log.info('subject ' + currentSubject.id + ' authenticated on realm(s): ' + subjects.map(function (elt) {
                            return elt.realm;
                        }));

                    /**
                     * @ngdoc event
                     * @name w20CoreSecurity.service:AuthenticationService#w20\.security\.authenticated
                     * @eventOf w20CoreSecurity.service:AuthenticationService
                     * @eventType emitted on root scope
                     * @param {Object} The authenticated subject definition.
                     *
                     * @description
                     *
                     * This event is emitted after successful subject authentication.
                     *
                     */
                    eventService.emit('w20.security.authenticated', currentSubject);

                    return currentSubject;
                }, function (realms) {
                    currentSubject = null;
                    authorizationService.clear();

                    deferred = null;

                    $log.error('Failed to authenticate on realm(s): ' + realms);

                    /**
                     * @ngdoc event
                     * @name w20CoreSecurity.service:AuthenticationService#w20\.security\.failed-authentication
                     * @eventOf w20CoreSecurity.service:AuthenticationService
                     * @eventType emitted on root scope
                     * @param {String} id The authenticated subject identifier.
                     *
                     * @description
                     *
                     * This event is emitted after unsuccessful subject authentication.
                     *
                     */
                    eventService.emit('w20.security.failed-authentication');

                    return $q.reject('Failed to authenticate on realm(s): ' + realms);
                });

                return deferred;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#deauthenticate
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {Object} A promise that will be resolved upon successful subject deauthentication, or rejected otherwise.
             *
             * @description
             *
             * Deauthenticate the currently authenticated subject.
             *
             */
            deauthenticate: function () {
                deferred = $q.all(authProviders.map(function (provider) {
                    return provider.deauthenticate();
                }).concat(deferred === null ? [] : [deferred])).then(function (realms) {
                    currentSubject = null;
                    authorizationService.clear();

                    deferred = null;

                    $log.info('subject deauthenticated from realm(s): ' + realms);

                    /**
                     * @ngdoc event
                     * @name w20CoreSecurity.service:AuthenticationService#w20\.security\.deauthenticated
                     * @eventOf w20CoreSecurity.service:AuthenticationService
                     * @eventType emitted on root scope
                     * @param {String} id The deauthenticated subject identifier.
                     * @param {Boolean} The subject is cleanly deauthenticated.
                     *
                     * @description
                     *
                     * This event is emitted after the subject deauthentication.
                     *
                     */
                    eventService.emit('w20.security.deauthenticated', true);

                    return true;
                }, function (realms) {
                    currentSubject = null;
                    authorizationService.clear();

                    deferred = null;

                    $log.error('subject failed to deauthenticate from realm(s): ' + realms);

                    eventService.emit('w20.security.deauthenticated', false);
                });

                return deferred;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthenticationService#refresh
             * @methodOf w20CoreSecurity.service:AuthenticationService
             * @returns {Object} A promise that will be resolved upon successful subject refresh, or rejected otherwise.
             *
             * @description
             *
             * Refresh the currently connected subject by deauthenticating and reauthenticating it in a row.
             *
             */
            refresh: function () {
                if (!currentSubject) {
                    return $q.reject('No subject to refresh');
                }

                if (authProviders.length === 0) {
                    return $q.reject('No realm to refresh');
                }

                deferred = $q.all(authProviders.map(function (provider) {
                    return provider.refresh();
                }).concat(deferred === null ? [] : [deferred])).then(function (subjects) {
                    authorizationService.clear();
                    currentSubject = processSubjects(subjects);
                    authorizationService.seal();

                    deferred = null;

                    $log.info('subject ' + currentSubject.id + ' refreshed on realm(s): ' + subjects.map(function (elt) {
                            return elt.realm;
                        }));

                    /**
                     * @ngdoc event
                     * @name w20CoreSecurity.service:AuthenticationService#w20\.security\.refreshed
                     * @eventOf w20CoreSecurity.service:AuthenticationService
                     * @eventType emitted on root scope
                     * @param {Object} The authenticated subject definition.
                     *
                     * @description
                     *
                     * This event is emitted after successful subject refresh.
                     *
                     */
                    eventService.emit('w20.security.refreshed', currentSubject);
                }, function (realms) {
                    deferred = null;

                    $log.error('failed to refresh subject ' + currentSubject.id + ' on realm(s): ' + realms);

                    /**
                     * @ngdoc event
                     * @name w20CoreSecurity.service:AuthenticationService#w20\.security\.failed-refresh
                     * @eventOf w20CoreSecurity.service:AuthenticationService
                     * @eventType emitted on root scope
                     * @param {String} The authenticated subject identifier.
                     *
                     * @description
                     *
                     * This event is emitted after unsuccessful subject refresh.
                     *
                     */
                    eventService.emit('w20.security.failed-refresh');

                    return $q.reject('Failed to refresh subject ' + currentSubject.id + ' on realm(s): ' + realms);
                });

                return deferred;
            },

            currentOperationDeferred: function () {
                return deferred;
            }
        };
    }]);

    /**
     * @ngdoc service
     * @name w20CoreSecurity.service:AuthorizationService
     *
     * @description
     *
     * The AuthorizationService provides an API to check for currently authenticated subject authorizations.
     *
     */
    w20CoreSecurity.factory('AuthorizationService', ['$log', 'StateService', 'EventService', function ($log, stateService, eventService) {
        var currentRoles = {},
            currentPermissions = {},
            unifiedRoles = {},
            roleFilter = [],
            attributeFilter = {},
            roleRestrictionsState = stateService.state('w20-security', 'role-restrictions', []),
            attributeRestrictionsState = stateService.state('w20-security', 'attribute-restrictions', {}),
            sealed = false;

        function mergeAttributes(destination, source) {
            _.each(source, function (value, key) {
                destination[key] = _.union(destination[key] || [], value instanceof Array ? value : [value]);
            });

            _.each(destination, function (value, key) {
                if (!source || !source[key]) {
                    destination[key] = _.union(destination[key] || [], ['*']);
                }
            });
        }

        function mergePermissions(destination, source, attributes, role) {
            _.each(source, function (values) {
                function mergePermission(parent, values) {
                    _.each(values.shift().split(','), function (value) {
                        var node = parent[value];

                        if (typeof node === 'undefined') {
                            node = parent[value] = {};
                        }

                        node.$roles = _.union(node.$roles, [role]);

                        if (typeof node.$attributes === 'undefined') {
                            node.$attributes = {};
                        }

                        mergeAttributes(node.$attributes, attributes);

                        if (values.length > 0) {
                            mergePermission(node, values.slice(0));
                        }
                    });
                }

                if (values.length > 0) {
                    mergePermission(destination, values.slice(0));
                }
            });
        }

        function checkWithRoleFilter(unifiedRole) {
            return !(roleFilter.length > 0 && !_.find(roleFilter, function (roleToCheck) {
                return unifiedRole === roleToCheck;
            }));
        }

        function checkWithAttributeFilter(attributes) {
            return !(_.keys(attributeFilter).length > 0 && !_.find(attributeFilter, function (valueToCheck, attributeToCheck) {
                if (attributes && attributes[attributeToCheck]) {
                    return _.contains(attributes[attributeToCheck], '*') || _.contains(attributes[attributeToCheck], valueToCheck);
                } else {
                    return true;
                }
            }));
        }

        return {
            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#getRoles
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @returns {Array} a list of roles
             *
             * @description
             *
             * Get every available roles
             */
            getRoles: function () {
                return _.keys(unifiedRoles);
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#getAttributes
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @returns {Object} a map of attributes to their values
             *
             * @description
             *
             * Get every attributes and their associated value
             */
            getAttributes: function () {
                var result = {};
                _.each(unifiedRoles, function (unifiedRole) {
                    _.each(unifiedRole.$attributes, function (values, attribute) {
                        result[attribute] = _.union(result[attribute] || {}, _.filter(values, function (elt) {
                            return elt !== '*';
                        }));
                    });
                });
                return result;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#setRoleFilter
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @param {Array} value a list of role to restrict to. If this list is not a subset of the list returned by
             * getRoles() an error is thrown
             *
             * @description
             *
             * Allow to restrict user roles by setting a filter of roles
             */
            setRoleFilter: function (value) {
                var invalidRoles = _.difference(value, this.getRoles());

                if (invalidRoles.length > 0) {
                    throw Error('Unable to restrict security roles to ' + angular.toJson(invalidRoles));
                }

                roleFilter = value;

                if (config.persistentRestrictions) {
                    roleRestrictionsState.value(value);
                }

                /**
                 * @ngdoc event
                 * @name w20CoreSecurity.service:AuthorizationService#w20\.security\.role-filter-changed
                 * @eventOf w20CoreSecurity.service:AuthorizationService
                 * @eventType emitted on root scope
                 * @param {Array} the new list of roles of the user
                 *
                 * @description
                 *
                 * This event is emitted when user roles are filtered
                 */
                eventService.emit('w20.security.role-filter-changed', value);

                if (value.length === 0) {
                    $log.info('no security role restriction');
                } else {
                    $log.info('security role(s) restricted to: ' + angular.toJson(value));
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#getRoleFilter
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @returns {Array} the list of filtered roles
             *
             * @description
             *
             * Get the role filter
             */
            getRoleFilter: function () {
                return roleFilter;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#setAttributeFilter
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @param {Object} value A subset of the result of getAttributes() which will restrict the user security attributes to it
             *
             * @description
             *
             * Allow to restrict user security attributes
             */
            setAttributeFilter: function (value) {
                var validAttributes = this.getAttributes(),
                    invalidAttributes = {};

                _.each(value, function (attrValue, attrName) {
                    if (!_.contains(validAttributes[attrName], attrValue)) {
                        invalidAttributes[attrName] = attrValue;
                    }
                });

                if (_.size(invalidAttributes) > 0) {
                    throw Error('Unable to restrict security attributes to ' + angular.toJson(invalidAttributes));
                }

                attributeFilter = value;

                if (config.persistentRestrictions) {
                    attributeRestrictionsState.value(value);
                }
                /**
                 * @ngdoc event
                 * @name w20CoreSecurity.service:AuthorizationService#w20\.security\.attribute-filter-changed
                 * @eventOf w20CoreSecurity.service:AuthorizationService
                 * @eventType emitted on root scope
                 * @param {Object} the new map of security attributes
                 *
                 * @description
                 *
                 * This event is emitted when user roles are filtered
                 */
                eventService.emit('w20.security.attribute-filter-changed', value);

                if (_.size(value) === 0) {
                    $log.info('no security attribute restriction');
                } else {
                    $log.info('security attribute(s) restricted to: ' + angular.toJson(value));
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#getAttributeFilter
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @returns {Object} the attribute filter
             *
             * @description
             *
             * Get the security attribute filter
             */
            getAttributeFilter: function () {
                return attributeFilter;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#hasRole
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @param {String} realm The realm the check is made against.
             * @param {String} role The role to check.
             * @param {Object} attributes The optional attributes object to further check on the role.
             * @returns {Boolean} True if the subject has the role, false otherwise.
             *
             * @description
             *
             * Check if the currently authenticated subject has the specified role with the specified attributes in the
             * specified realm.
             *
             */
            hasRole: function (realm, role, attributes) {
                var realmRoles = currentRoles[realm];
                if (typeof realmRoles === 'undefined') {
                    return false;
                }

                var roleDefinition = realmRoles[role];
                if (typeof roleDefinition === 'undefined') {
                    return false;
                }

                if (!checkWithRoleFilter(roleDefinition.$unifiedRole)) {
                    return false;
                }

                if (!checkWithAttributeFilter(roleDefinition.$attributes)) {
                    return false;
                }

                if (typeof attributes !== 'undefined') {
                    return _.all(attributes, function (value, attribute) {
                        return _.contains(roleDefinition.$attributes[attribute], value);
                    });
                } else {
                    return true;
                }
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#hasPermission
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @param {String} realm The realm the check is made against.
             * @param {String[]} permission The permission to check (as an array of strings or as a ":" delimited unique string).
             * @param {Object} attributes The optional attributes object to further check on the permission.
             * @returns {Boolean} True if the subject has the permission, false otherwise.
             *
             * @description
             *
             * Check if the currently authenticated subject has the specified permission with the specified attributes in the
             * specified realm.
             *
             */
            hasPermission: function (realm, permission, attributes) {
                function check(parent, values) {
                    if (typeof parent === 'undefined') {
                        return false;
                    }

                    if (values.length === 0) {
                        var result = _.any(parent.$roles, function (role) {
                                return checkWithRoleFilter(currentRoles[realm][role] && currentRoles[realm][role].$unifiedRole);
                            }) && checkWithAttributeFilter(parent.$attributes);

                        if (typeof attributes === 'undefined') {
                            return result; // no attribute check, return the result as-is
                        } else {
                            return result && _.all(attributes, function (value, attribute) {
                                    return _.contains(parent.$attributes[attribute], '*') || _.contains(parent.$attributes[attribute], value);
                                });
                        }
                    }

                    return _.all(values.shift().split(','), function (value) {
                        if (value.indexOf('$') === 0) {
                            throw new Error('permissions cannot start with a $');
                        }

                        return check(parent['*'], values.slice(0)) || check(parent[value], values.slice(0));
                    });
                }

                var realmPermissions = currentPermissions[realm];
                if (typeof realmPermissions === 'undefined') {
                    return false;
                }

                if (typeof permission === 'string') {
                    permission = permission.split(':');
                }

                return check(realmPermissions, permission.slice(0));
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#clear
             * @methodOf w20CoreSecurity.service:AuthorizationService
             *
             * @description
             *
             * Clear every roles and authorizations
             *
             */
            clear: function () {
                currentRoles = {};
                unifiedRoles = {};
                currentPermissions = {};
                roleFilter = [];
                attributeFilter = {};
                sealed = false;
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#addSubjectAuthorizations
             * @methodOf w20CoreSecurity.service:AuthorizationService
             * @param {String} realm The realm to add permission into
             * @param {String} subject The subject
             *
             * @description
             *
             * Merge subject permissions to realm permissions
             *
             */
            addSubjectAuthorizations: function (realm, subject) {
                if (sealed) {
                    throw new Error('AuthorizationService is sealed, cannot add further subject authorizations');
                }

                var realmPermissions = currentPermissions[realm],
                    realmRoles = currentRoles[realm];

                if (typeof realmPermissions === 'undefined') {
                    realmPermissions = currentPermissions[realm] = {};
                }

                if (typeof realmRoles === 'undefined') {
                    realmRoles = currentRoles[realm] = {};
                }

                // Parse roles
                _.each(subject.roles, function (roleDefinition) {
                    if (typeof roleDefinition.name === 'undefined') {
                        throw new Error('A role definition must have a name attribute, got undefined');
                    }

                    // Merge roles permissions to realm permissions
                    mergePermissions(realmPermissions, roleDefinition.permissions, roleDefinition.attributes, roleDefinition.name);

                    if (typeof realmRoles[roleDefinition.name] === 'undefined') {
                        realmRoles[roleDefinition.name] = {
                            $attributes: {}
                        };
                    }

                    mergeAttributes(realmRoles[roleDefinition.name].$attributes, roleDefinition.attributes);
                });

                // Merge subject permissions to realm permissions
                mergePermissions(realmPermissions, subject.permissions);
            },

            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:AuthorizationService#seal
             * @methodOf w20CoreSecurity.service:AuthorizationService
             *
             * @description
             *
             * Seal the AuthorizationService (an object sealed cannot be modified)
             *
             */
            seal: function () {
                if (sealed) {
                    throw new Error('AuthorizationService is already sealed');
                }

                if (config.roleMapping) {
                    _.each(config.roleMapping, function (definition, name) {
                        var mergedAttributes = {};

                        if (_.all(definition, function (role, realm) {
                                var realRole = currentRoles[realm] && currentRoles[realm][role];
                                if (realRole) {
                                    _.map(realRole.$attributes, function (values, attribute) {
                                        mergedAttributes[attribute] = _.union(values, mergedAttributes[attribute] || []);
                                    });

                                    realRole.$unifiedRole = name;

                                    return true;
                                } else {
                                    return false;
                                }
                            })) {
                            unifiedRoles[name] = {
                                $attributes: mergedAttributes
                            };
                        }
                    });
                } else if (_.keys(currentRoles).length === 1) {
                    _.each(currentRoles[_.keys(currentRoles)[0]], function (roleDefinition, roleName) {
                        unifiedRoles[roleName] = {
                            $attributes: roleDefinition.$attributes
                        };
                        roleDefinition.$unifiedRole = roleName;
                    });
                }

                if (config.persistentRestrictions) {
                    var roleRestrictions = roleRestrictionsState.value();
                    if (roleRestrictions.length > 0) {
                        try {
                            this.setRoleFilter(roleRestrictions);
                        } catch (e) {
                            $log.warn('unable to restore security role restrictions, they have been reset');
                            this.setRoleFilter([]);
                        }
                    }

                    var attributeRestrictions = attributeRestrictionsState.value();
                    if (_.size(attributeRestrictions) > 0) {
                        try {
                            this.setAttributeFilter(attributeRestrictions);
                        } catch (e) {
                            $log.warn('unable to restore security attribute restrictions, they have been reset');
                            this.setAttributeFilter({});
                        }
                    }
                }

                sealed = true;
            }
        };
    }]);

    /**
     * @ngdoc service
     * @name w20CoreSecurity.service:SecurityExpressionService
     *
     * @description
     *
     * The SecurityExpressionService provides an API to evaluate a security expression.
     *
     */
    w20CoreSecurity.factory('SecurityExpressionService', ['$interpolate', 'AuthenticationService', 'AuthorizationService', function ($interpolate, authenticationService, authorizationService) {
        var cache = {};

        return {
            /**
             * @ngdoc function
             * @name w20CoreSecurity.service:SecurityExpressionService#evaluate
             * @methodOf w20CoreSecurity.service:SecurityExpressionService
             * @param {String} expression The security expression.
             * @param {Object} locals The local variables accessible in the expression.
             * @returns {Boolean} True if the specified expression evaluates to true, false otherwise.
             *
             * @description
             *
             * Evaluates the specified security expression to a boolean.
             *
             */
            evaluate: function (expression, locals) {
                var interpolationFn = cache[expression];
                if (typeof interpolationFn === 'undefined') {
                    interpolationFn = cache[expression] = $interpolate('{{ ' + expression + ' }}');
                }

                var result = interpolationFn(_.extend({}, locals, {
                    hasPermission: authorizationService.hasPermission,
                    hasRole: authorizationService.hasRole,
                    isAuthenticated: authenticationService.subjectAuthenticated,
                    principal: authenticationService.subjectPrincipal
                }));

                if (typeof result === 'boolean') {
                    return result;
                } else {
                    return result.toString() === 'true';
                }
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name w20CoreSecurity.directive:w20Security
     * @restrict A
     *
     * @description
     *
     * The w20Security directive hides the element when the specified security expression evaluates to
     * false.
     *
     * @example
     *
     * ```
     *      <div data-w20-security="hasRole('realm1', 'role1')">
     *          ...
     *      </div>
     *```
     */
    w20CoreSecurity.directive('w20Security', ['SecurityExpressionService', function (securityExpressionService) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, iElement, iAttrs) {
                scope.$watch(function () {
                    return securityExpressionService.evaluate(iAttrs.w20Security, scope);
                }, function (value) {
                    iElement.css('display', value ? '' : 'none');
                });
            }
        };
    }]);

    w20CoreSecurity.run(['AuthenticationService', 'ApplicationService', 'EventService', 'StateService', '$location',
        function (authenticationService, applicationService, eventService, stateService, $location) {

            function inBrowserSession (state) {
                var sessionState = stateService.state('session', 'isActive', false, true);
                return typeof state !== 'boolean' ? sessionState.value() : sessionState.value(state);
            }

            var notInBrowserSession = !inBrowserSession();

            if (typeof config.redirectAfterLogin === 'string') {
                eventService.on('w20.security.authenticated', function () {
                    if (notInBrowserSession) {
                        $location.path(config.redirectAfterLogin);
                        inBrowserSession(true);
                    }
                });
            }

            if (typeof config.redirectAfterLogout === 'string') {
                eventService.on('w20.security.deauthenticated', function () {
                    $location.path(config.redirectAfterLogout);
                });
            }

            _.each(allRealms, function (definition, realm) {
                var providerFactory = allProviders[definition.provider];
                if (typeof providerFactory === 'undefined') {
                    throw new Error('Unknown authentication provider ' + definition.provider);
                }

                authenticationService.addProvider(realm, providerFactory, definition.config);
            });

            if (config.autoLogin) {
                authenticationService.authenticate();
            }
        }]);

    return {
        angularModules: ['w20CoreSecurity'],
        lifecycle: {
            pre: function (modules, fragments, callback) {
                allProviders.SimpleAuthentication = SimpleAuthenticationProvider;
                allProviders.BasicAuthentication = SimpleAuthenticationProvider;

                // Collect fragment security realms
                _.each(fragments, function (fragment, id) {
                    if (typeof fragment.definition.security !== 'undefined') {
                        allRealms[id] = fragment.definition.security;
                    }
                });

                callback(module);
            }
        }
    };
});
