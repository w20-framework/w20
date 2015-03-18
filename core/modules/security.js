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
    'require',
    'w20',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-resource}/angular-resource'
], function (module, require, w20, $, _, angular) {
    'use strict';

    /**
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
     * @name w20CoreSecurity
     * @module
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
     * The AuthenticationService provides an API to authenticate and deauthenticate a subject, as well as query its
     * various properties.
     *
     * @name AuthenticationService
     * @memberOf w20CoreSecurity
     * @w20doc service
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
             * Add an authentication provider which can then be used by any security realm definition.
             *
             * @name AuthenticationService#addProvider
             * @memberOf AuthenticationService
             * @function
             */
            addProvider: function (realm, providerFactory, config) {
                var provider = $injector.invoke(providerFactory);
                provider.setConfig(config);
                provider.setRealm(realm);
                authProviders.push(provider);
            },

            /**
             * Retrieve the identifier of the currently authenticated subject.
             *
             * @name AuthenticationService#subjectId
             * @memberOf AuthenticationService
             * @function
             * @returns {String} The subject identifier or undefined if no subject is currently authenticated.
             */
            subjectId: function () {
                if (currentSubject !== null) {
                    return currentSubject.id;
                } else {
                    return undefined;
                }
            },

            /**
             * Retrieve the type of the currently authenticated subject.
             *
             * @name AuthenticationService#subjectType
             * @memberOf AuthenticationService
             * @function
             * @returns {String} The subject type or undefined if no subject is currently authenticated.
             */
            subjectType: function () {
                if (currentSubject !== null) {
                    return currentSubject.type;
                } else {
                    return undefined;
                }
            },

            /**
             * Retrieve the alls the principals of the currently authenticated subject.
             *
             * @name AuthenticationService#subjectPrincipals
             * @memberOf AuthenticationService
             * @function
             * @returns {String} The subject principals or undefined if no subject is currently authenticated.
             */
            subjectPrincipals: function () {
                if (currentSubject !== null) {
                    return currentSubject.principals;
                } else {
                    return undefined;
                }
            },

            /**
             * Retrieve the specified principal value of the currently authenticated subject.
             *
             * @name AuthenticationService#subjectPrincipal
             * @memberOf AuthenticationService
             * @function
             * @param {String} name The name of the principal value.
             * @returns {String} The specified principal value or undefined if no subject is currently authenticated or the specified principal doesn't exists.
             */
            subjectPrincipal: function (name) {
                if (currentSubject !== null && typeof currentSubject.principals !== 'undefined') {
                    return currentSubject.principals[name];
                } else {
                    return undefined;
                }
            },

            /**
             * Return if the subject is authenticated.
             *
             * @name AuthenticationService#subjectAuthenticated
             * @memberOf AuthenticationService
             * @function
             * @returns {Boolean} True if the subject is currently authenticated, false otherwise.
             */
            subjectAuthenticated: function () {
                return currentSubject !== null;
            },

            /**
             * Return if a subject is authentifiable (i.e. all authentication providers can authenticate a subject).
             *
             * @name AuthenticationService#isAuthentifiable
             * @memberOf AuthenticationService
             * @function
             * @returns {Boolean} True if the subject is currently authentifiable, false otherwise.
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
             * Authenticate the subject corresponding to the specified credentials through all the configured
             * security realms.
             *
             * @name AuthenticationService#authenticate
             * @memberOf AuthenticationService
             * @function
             * @param {Object} credentials The credentials object passed to authentication providers to authenticate the subject.
             * @returns {Object} A promise that will be resolved upon successful subject authentication, or rejected otherwise.
             */
            authenticate: function (credentials) {
                if (authProviders.length === 0) {
                    return $q.reject('No realm to authenticate');
                }

                deferred = $q.all(authProviders.map(function (provider) {
                    return provider.authenticate(credentials);
                }).concat(deferred === null ? [] : [ deferred ])).then(function (subjects) {
                    authorizationService.clear();
                    currentSubject = processSubjects(subjects);
                    authorizationService.seal();

                    deferred = null;

                    $log.info('subject ' + currentSubject.id + ' authenticated on realm(s): ' + subjects.map(function (elt) {
                        return elt.realm;
                    }));

                    /**
                     * This event is emitted after successful subject authentication.
                     *
                     * @name w20.security.authenticated
                     * @w20doc event
                     * @memberOf w20CoreSecurity
                     * @argument {Object} The authenticated subject definition.
                     */
                    eventService.emit('w20.security.authenticated', currentSubject);

                    return currentSubject;
                }, function (realms) {
                    currentSubject = null;
                    authorizationService.clear();

                    deferred = null;

                    $log.error('Failed to authenticate on realm(s): ' + realms);

                    /**
                     * This event is emitted after unsuccessful subject authentication.
                     *
                     * @name w20.security.failed-authentication
                     * @w20doc event
                     * @memberOf w20CoreSecurity
                     * @argument {String} The authenticated subject identifier.
                     */
                    eventService.emit('w20.security.failed-authentication');

                    return $q.reject('Failed to authenticate on realm(s): ' + realms);
                });

                return deferred;
            },

            /**
             * Deauthenticate the currently authenticated subject.
             *
             * @name AuthenticationService#deauthenticate
             * @memberOf AuthenticationService
             * @function
             * @returns {Object} A promise that will be resolved upon successful subject deauthentication, or rejected otherwise.
             */
            deauthenticate: function () {
                deferred = $q.all(authProviders.map(function (provider) {
                    return provider.deauthenticate();
                }).concat(deferred === null ? [] : [ deferred ])).then(function (realms) {
                    currentSubject = null;
                    authorizationService.clear();

                    deferred = null;

                    $log.info('subject deauthenticated from realm(s): ' + realms);

                    /**
                     * This event is emitted after the subject deauthentication.
                     *
                     * @name w20.security.deauthenticated
                     * @w20doc event
                     * @memberOf w20CoreSecurity
                     * @argument {String} The deauthenticated subject identifier.
                     * @argument {Boolean} The subject is cleanly deauthenticated.
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
             * Refresh the currently connected subject by deauthenticating and reauthenticating it in a row.
             *
             * @name AuthenticationService#refresh
             * @memberOf AuthenticationService
             * @function
             * @returns {Object} A promise that will be resolved upon successful subject refresh, or rejected otherwise.
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
                }).concat(deferred === null ? [] : [ deferred ])).then(function (subjects) {
                    authorizationService.clear();
                    currentSubject = processSubjects(subjects);
                    authorizationService.seal();

                    deferred = null;

                    $log.info('subject ' + currentSubject.id + ' refreshed on realm(s): ' + subjects.map(function (elt) {
                        return elt.realm;
                    }));

                    /**
                     * This event is emitted after successful subject refresh.
                     *
                     * @name w20.security.refreshed
                     * @w20doc event
                     * @memberOf w20CoreSecurity
                     * @argument {Object} The authenticated subject definition.
                     */
                    eventService.emit('w20.security.refreshed', currentSubject);
                }, function (realms) {
                    deferred = null;

                    $log.error('failed to refresh subject ' + currentSubject.id + ' on realm(s): ' + realms);

                    /**
                     * This event is emitted after unsuccessful subject refresh.
                     *
                     * @name w20.security.failed-refresh
                     * @w20doc event
                     * @memberOf w20CoreSecurity
                     * @argument {String} The authenticated subject identifier.
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
     * The AuthorizationService provides an API to check for currently authenticated subject authorizations.
     *
     * @name AuthorizationService
     * @memberOf w20CoreSecurity
     * @w20doc service
     */
    w20CoreSecurity.factory('AuthorizationService', [ '$log', 'StateService', 'EventService', function ($log, stateService, eventService) {
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
                destination[key] = _.union(destination[key] || [], value instanceof Array ? value : [ value ]);
            });

            _.each(destination, function (value, key) {
                if (!source || !source[key]) {
                    destination[key] = _.union(destination[key] || [], [ '*' ]);
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

                        node.$roles = _.union(node.$roles, [ role ]);

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
            return !(_.keys(attributeFilter).length > 0 && !_.find(attributeFilter, function(valueToCheck, attributeToCheck) {
                if (attributes && attributes[attributeToCheck]) {
                    return _.contains(attributes[attributeToCheck], '*') || _.contains(attributes[attributeToCheck], valueToCheck);
                } else {
                    return true;
                }
            }));
        }

        return {
            getRoles: function() {
                return _.keys(unifiedRoles);
            },

            getAttributes: function() {
                var result = {};
                _.each(unifiedRoles, function(unifiedRole) {
                    _.each(unifiedRole.$attributes, function(values, attribute) {
                        result[attribute] = _.union(result[attribute] || {}, _.filter(values, function(elt) {
                            return elt !== '*';
                        }));
                    });
                });
                return result;
            },

            setRoleFilter: function(value) {
                var invalidRoles = _.difference(value, this.getRoles());

                if (invalidRoles.length > 0) {
                    throw Error('Unable to restrict security roles to ' + angular.toJson(invalidRoles));
                }

                roleFilter = value;

                if (config.persistentRestrictions) {
                    roleRestrictionsState.value(value);
                }

                eventService.emit('w20.security.role-filter-changed', value);

                if (value.length === 0) {
                    $log.info('no security role restriction');
                } else {
                    $log.info('security role(s) restricted to: ' + angular.toJson(value));
                }
            },

            getRoleFilter: function() {
                return roleFilter;
            },

            setAttributeFilter: function(value) {
                var validAttributes = this.getAttributes(),
                    invalidAttributes = {};

                _.each(value, function(attrValue, attrName) {
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

                eventService.emit('w20.security.attribute-filter-changed', value);

                if (_.size(value) === 0) {
                    $log.info('no security attribute restriction');
                } else {
                    $log.info('security attribute(s) restricted to: ' + angular.toJson(value));
                }
            },

            getAttributeFilter: function() {
                return attributeFilter;
            },

            /**
             * Check if the currently authenticated subject has the specified role with the specified attributes in the
             * specified realm.
             *
             * @name AuthorizationService#hasRole
             * @memberOf AuthorizationService
             * @param {String} realm The realm the check is made against.
             * @param {String} role The role to check.
             * @param {Object} attributes The optional attributes object to further check on the role.
             * @function
             * @returns {Boolean} True if the subject has the role, false otherwise.
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
             * Check if the currently authenticated subject has the specified permission with the specified attributes in the
             * specified realm.
             *
             * @name AuthorizationService#hasPermission
             * @memberOf AuthorizationService
             * @function
             * @param {String} realm The realm the check is made against.
             * @param {String[]} permission The permission to check (as an array of strings or as a ":" delimited unique string).
             * @param {Object} attributes The optional attributes object to further check on the permission.
             * @returns {Boolean} True if the subject has the permission, false otherwise.
             */
            hasPermission: function (realm, permission, attributes) {
                function check(parent, values) {
                    if (typeof parent === 'undefined') {
                        return false;
                    }

                    if (values.length === 0) {
                        var result = _.any(parent.$roles, function(role) {
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

            clear: function() {
                currentRoles = {};
                unifiedRoles = {};
                currentPermissions = {};
                roleFilter = [];
                attributeFilter = {};
                sealed = false;
            },

            addSubjectAuthorizations: function(realm, subject) {
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

            seal: function() {
                if (sealed) {
                    throw new Error('AuthorizationService is already sealed');
                }

                if (config.roleMapping) {
                    _.each(config.roleMapping, function (definition, name) {
                        var mergedAttributes = {};

                        if (_.all(definition, function(role, realm) {
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
                    _.each(currentRoles[_.keys(currentRoles)[0]], function(roleDefinition, roleName) {
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
     * The SecurityExpressionService provides an API to evaluate a security expression.
     *
     * @name SecurityExpressionService
     * @memberOf w20CoreSecurity
     * @w20doc service
     */
    w20CoreSecurity.factory('SecurityExpressionService', [ '$interpolate', 'AuthenticationService', 'AuthorizationService', function ($interpolate, authenticationService, authorizationService) {
        var cache = {};

        return {
            /**
             * Evaluates the specified security expression to a boolean.
             *
             * @name SecurityExpressionService#evaluate
             * @memberOf SecurityExpressionService
             * @function
             * @param {String} expression The security expression.
             * @param {Object} locals The local variables accessible in the expression.
             * @returns {Boolean} True if the specified expression evaluates to true, false otherwise.
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
     * The w20Security directive hides the element when the specified security expression evaluates to
     * false:
     *
     *      <div data-w20-security="hasRole('realm1', 'role1')">
     *          ...
     *      </div>
     *
     * @name w20Security
     * @memberOf w20CoreSecurity
     * @w20doc directive
     */
    w20CoreSecurity.directive('w20Security', [ 'SecurityExpressionService', function (securityExpressionService) {
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

    w20CoreSecurity.run([ 'AuthenticationService', 'ApplicationService', 'EventService', '$location', function (authenticationService, applicationService, eventService, $location) {
        if (typeof config.redirectAfterLogin === 'string') {
            eventService.on('w20.security.authenticated', function () {
                $location.path(config.redirectAfterLogin);
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
