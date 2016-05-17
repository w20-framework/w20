define([
    '{angular}/angular',
    '{angular-resource}/angular-resource'

], function (angular) {
    'use strict';

    var module = angular.module('test-module', ['ngResource']);

    module.controller('TestController', ['$scope', function ($scope) {
        $scope.value = 'test-value';
    }]);

    return {
        angularModules: ['test-module']
    };
});
