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
    '{angular}/angular',
    '{lodash}/lodash',
    '{w20-core}/modules/notifications',
    '{angular-mocks}/angular-mocks'
], function (angular, _) {
    'use strict';

    describe('The NotificationHistoryService', function () {
        var $injector,
            $rootScope,
            $compile,
            notificationHistoryService,
            stateService,
            notification = {
                type: 'info',
                content: 'Info test notification',
                link: 'http://fake.url',
                date: new Date()
            };

        beforeEach(function () {
            angular.mock.module('w20CoreNotifications');

            angular.mock.inject(function (_$injector_, _$rootScope_, _$compile_) {
                $injector = _$injector_;
                $rootScope = _$rootScope_;
                $compile = _$compile_;
                notificationHistoryService = $injector.get('NotificationHistoryService');
                stateService = $injector.get('StateService');

                stateService.state('notifications', 'history', []).value([]);

                $rootScope.$digest();
            });
        });

        it('should be able to get all notifications', function() {
            expect(notificationHistoryService.getNotifications().length).toEqual(0);
        });

        it('should be able to add a notification', function () {
            expect(notificationHistoryService.getNotifications().length).toEqual(0);
            notificationHistoryService.addNotification(notification);
            expect(notificationHistoryService.getNotifications().length).toEqual(1);
        });

        it('should be able to delete a notification', function() {
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.deleteNotification(1);
            expect(notificationHistoryService.getNotifications().length).toEqual(0);
        });

        it('should be able to get a notification by id', function() {
            notificationHistoryService.addNotification(notification);
            expect(notificationHistoryService.getNotification(1)).toBeDefined();
        });

        it('should give a unique incremental id to persisted notifications', function () {
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);

            var notifications = notificationHistoryService.getNotifications();

           expect(_.pluck(notifications, 'id')).toEqual([1, 2, 3, 4, 5]);
        });

        it('should be able to get clear all notifications', function() {
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);
            notificationHistoryService.addNotification(notification);

            notificationHistoryService.clearNotifications();

            expect(notificationHistoryService.getNotifications().length).toBe(0);
        });

    });

});