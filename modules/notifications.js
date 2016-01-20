/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'require',
    'module',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{angular-sanitize}/angular-sanitize',

    '{w20-core}/modules/env',
    '{w20-core}/modules/ui',

    '{jgrowl}/jquery.jgrowl',
    '[css]!{jgrowl}/jquery.jgrowl'
], function (require, _module, $, _, angular) {
    'use strict';

    /**
     * @ngdoc object
     * @name w20CoreNotifications
     *
     * @description
     *
     * This module provides end-user notifications. The notifications appear on the top right of the page.
     * Several level of importance can be used : notify, warn or alert user. It is also possible to deactivate built
     * in notification to keep only those that you explicitly specify.
     *
     * Configuration
     * -------------
     *
     *      "notifications" : {
     *          // Disable built-in notifications (like login, logout, or page access error)
     *          "disableNotifications" : true|false,
     *      }
     *
     * Fragment definition sections
     * ----------------------------
     *
     * This module has no fragment definition section.
     *
     */
    var w20CoreNotifications = angular.module('w20CoreNotifications', ['w20CoreEnv', 'w20CoreUI', 'ngSanitize']),
        _config = _module && _module.config() || {};

    /**
     * @ngdoc service
     * @name w20CoreNotifications.service:NotificationHistoryService
     *
     * @description
     *
     * This service provides an API to manage persisted user notifications.
     *
     */
    w20CoreNotifications.factory('NotificationHistoryService', ['StateService', 'MenuService', function (stateService, menuService) {
        var lastId = 0,
            notificationsState = stateService.state('notifications', 'history', []),
            service = {
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationHistoryService#getNotifications
                 * @methodOf w20CoreNotifications.service:NotificationHistoryService
                 * @returns {Array} the list of notifications
                 *
                 * @description
                 *
                 * Return the entire list of notifications.
                 *
                 */
                getNotifications: function () {
                    return notificationsState.value();
                },
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationHistoryService#getNotification
                 * @methodOf w20CoreNotifications.service:NotificationHistoryService
                 * @param {Number} id The id of the required notification
                 * @returns {Array} the notification or undefined if not found.
                 *
                 * @description
                 *
                 * Return the notification or undefined if not found.
                 *
                 */
                getNotification: function (id) {
                    return _.find(notificationsState.value(), function (notification) {
                        return notification.id === id;
                    });
                },
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationHistoryService#addNotification
                 * @methodOf w20CoreNotifications.service:NotificationHistoryService
                 * @param {String} type The notification type (info, warn or alert).
                 * @param {String} content The notification content.
                 * @param {String} link The notification link (optional).
                 * @param {Date} date The notification date (optional).
                 * @returns {Number} the notification id
                 *
                 * @description
                 *
                 * Add a new notification
                 *
                 */
                addNotification: function (type, content, link, date) {
                    var notification = {
                        id: ++lastId,
                        type: type,
                        content: content,
                        link: link,
                        date: date || new Date()
                    };

                    notificationsState.value().push(notification);
                    notificationsState.save();

                    return notification.id;
                },
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationHistoryService#clearNotifications
                 * @methodOf w20CoreNotifications.service:NotificationHistoryService
                 *
                 * @description
                 *
                 * Delete all notifications in the history.
                 *
                 */
                clearNotifications: function () {
                    notificationsState.value([]);
                },
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationHistoryService#deleteNotification
                 * @methodOf w20CoreNotifications.service:NotificationHistoryService
                 * @param {Number} id of the notification to delete
                 *
                 * @description
                 *
                 * Delete the specified notification by id.
                 *
                 */
                deleteNotification: function (id) {
                    _.remove(notificationsState.value(), function (notification) {
                        return notification.id === id;
                    });
                    notificationsState.save();
                }
            };

        menuService.registerSectionType('w20-notifications', {
            icon: 'fa fa-bell',
            alertCountFn: function () {
                return service.getNotifications().length;
            }
        });

        return service;
    }]);

    /**
     * @ngdoc service
     * @name w20CoreNotifications.service:NotificationService
     *
     * @description
     *
     * This service provides an API to display notifications to the end-user. Three severities are available (normal,
     * warning and alert). Notifications can be internal to the window or be displayed as system notifications by the
     * browser.
     *
     */
    w20CoreNotifications.factory('NotificationService', ['ApplicationService', 'NotificationHistoryService', 'CultureService', '$window',
        function (applicationService, notificationHistoryService, cultureService, $window) {

            var checkSystemNotificationsPermission = function (callback) {
                if (!($window.Notification)) {
                    return false;
                }

                if ($window.Notification.permission !== 'granted') {
                    $window.Notification.requestPermission(function (permission) {
                        if (!('permission' in $window.Notification)) {
                            $window.Notification.permission = permission;
                        }

                        if (permission === 'granted') {
                            callback();
                            return true;
                        } else {
                            return false;
                        }
                    });
                } else {
                    callback();
                    return true;
                }
            };

            var growl = function (text, options, icon, headerclass, system) {
                var updatedOptions = $.extend({}, options);
                updatedOptions.header = '<i class="' + icon + ' icon-white"></i> <span class="' + headerclass + '">' + updatedOptions.header + '</span>';

                if (system) {
                    if (!checkSystemNotificationsPermission(function () {
                            new $window.Notification(options.header, { /* jshint nonew:false */
                                body: text,
                                icon: require.toUrl('{w20-core}/images/notifications/' + icon + '.png')
                            });
                        })) {
                        $.jGrowl(text, updatedOptions);
                    }
                } else {
                    $.jGrowl(text, updatedOptions);
                }
            };

            return {
                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationService#notify
                 * @methodOf w20CoreNotifications.service:NotificationService
                 * @param {String} text The text to display in the notification
                 * @param {Boolean} system True if the notification should be a system one, false otherwise.
                 * @param {Object} options The options object to pass to the underlying implementation (jGrowl).
                 * @param {Boolean} persistent Should the notification be persisted.
                 *
                 * @description
                 *
                 * Display a normal notification with the specified parameters.
                 *
                 */
                notify: function (text, system, options, persistent) {
                    growl(text, _.extend({
                        header: cultureService.localize('w20.core.notifications.severity.notification'),
                        life: 3000
                    }, _config.options && _config.options.notify || {}, options), 'icon-info-sign', 'jGrowl-notification', system);

                    if (persistent) {
                        notificationHistoryService.addNotification('info', text);
                    }
                },

                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationService#warn
                 * @methodOf w20CoreNotifications.service:NotificationService
                 * @param {String} text The text to display in the notification
                 * @param {Boolean} system True if the notification should be a system one, false otherwise.
                 * @param {Object} options The options object to pass to the underlying implementation (jGrowl).
                 * @param {Boolean} persistent Should the notification be persisted.
                 *
                 * @description
                 *
                 * Display a warning notification with the specified parameters.
                 *
                 */
                warn: function (text, system, options, persistent) {
                    growl(text, _.extend({
                        header: cultureService.localize('w20.core.notifications.severity.warning'),
                        life: 10000
                    }, _config.options && _config.options.warn || {}, options), 'icon-warning-sign', 'jGrowl-warning', system);

                    if (persistent) {
                        notificationHistoryService.addNotification('warn', text);
                    }
                },

                /**
                 * @ngdoc function
                 * @name w20CoreNotifications.service:NotificationService#alert
                 * @methodOf w20CoreNotifications.service:NotificationService
                 * @param {String} text The text to display in the notification
                 * @param {Boolean} system True if the notification should be a system one, false otherwise.
                 * @param {Object} options The options object to pass to the underlying implementation (jGrowl).
                 * @param {Boolean} persistent Should the notification be persisted.
                 *
                 * @description
                 *
                 * Display an alert notification with the specified parameters.
                 *
                 */
                alert: function (text, system, options, persistent) {
                    growl(text, _.extend({
                        header: cultureService.localize('w20.core.notifications.severity.alert'),
                        sticky: true
                    }, _config.options && _config.options.alert || {}, options), 'icon-exclamation-sign', 'jGrowl-alert', system);

                    if (persistent) {
                        notificationHistoryService.addNotification('alert', text);
                    }
                }
            };
        }]);

    w20CoreNotifications.run(['NotificationService', 'EventService', 'CultureService', function (notificationService, eventService, cultureService) {
        $.jGrowl.defaults.closerTemplate = '<div>' + cultureService.localize('w20.core.notifications.closeall') + '</div>';
        $.jGrowl.defaults.position = _config.position || 'bottom-right';
        $.jGrowl.defaults.pool = _config.limit || 0;

        // Add route change notifications
        if (!_config.disableNotifications) {
            eventService.on('$routeChangeError', ['CultureService', 'NotificationService', '$args', function (cultureService, notificationService, $args) {
                var reason = cultureService.localize('w20.core.notifications.route.error.reason.unknown'),
                    current = $args[0], rejection = $args[2];

                if (typeof rejection === 'object') {
                    if (typeof rejection.status !== 'undefined') {
                        if (rejection.status === 404) {
                            reason = cultureService.localize('w20.core.notifications.route.error.reason.notfound');
                        } else if (rejection.status === 403) {
                            reason = cultureService.localize('w20.core.notifications.route.error.reason.forbidden');
                        } else {
                            reason = cultureService.localize('w20.core.notifications.route.error.reason.httpstatus', [rejection.status]);
                        }
                    }
                } else if (typeof rejection === 'string') {
                    reason = cultureService.localize('w20.core.notifications.route.error.reason.' + rejection);
                }

                notificationService.warn(cultureService.localize('w20.core.notifications.route.error', [cultureService.displayName(current.$$route), reason]));
            }]);

            eventService.on('w20.security.authenticated', ['CultureService', 'AuthenticationService', 'NotificationService', '$args', function (cultureService, authenticationService, notificationService, $args) {
                notificationService.notify(cultureService.localize('w20.core.notifications.login.authenticated', [$args[0].id]));
            }]);

            eventService.on('w20.security.deauthenticated', ['CultureService', 'NotificationService', function (cultureService, notificationService) {
                notificationService.notify(cultureService.localize('w20.core.notifications.login.deauthenticated'));
            }]);

            eventService.on('w20.security.failed-authentication', ['CultureService', 'NotificationService', function (cultureService, notificationService) {
                notificationService.warn(cultureService.localize('w20.core.notifications.login.failed'));
            }]);
        }
    }]);

    return {
        angularModules: ['w20CoreNotifications']
    };
});
