define([
    'require',
    '{angular}/angular/angular',
    '{w20-core}/modules/culture',
    '{angular-resource}/angular-resource'
], function (require, angular) {
    'use strict';

    // Angular module declaration with a dependency on ngResource (because we use $resource in this module)
    var module = angular.module('user', [ 'ngResource', 'w20CoreCulture' ]);

    module.factory('UsersService', [ '$resource', function($resource) {
        // Service private bits go here

        return {
            usersResource: $resource(require.toUrl('{basic}/data/users.json'))
        };
    }]);

    module.controller('UserController', [ '$scope', 'UsersService', function ($scope, usersService) {
        var userId = 0, // User id sequence (private variable : not in scope)
            Users = usersService.usersResource; // Users resource (private variable : not in scope)

        // User array initialization
        $scope.users = [];

        // Options for the grid view
        $scope.gridOptions = {
            data: 'users',
            enableSorting: true,
            enableFiltering: true,
            columnDefs: [
                { displayName: 'tutorial.user.firstname', field: 'firstName', headerCellFilter: 'localize' },
                { displayName: 'tutorial.user.lastname', field: 'lastName', headerCellFilter: 'localize' },
                { displayName: 'tutorial.user.genre', field: 'genre', cellFilter: 'localizeWithPrefix:\'tutorial.user.genre.\'', headerCellFilter: 'localize' }
            ]
        };

        // This function add the current entered user to the user array
        $scope.addUser = function () {
            $scope.users.push({
                id: (++userId).toString(),
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                genre: $scope.genre
            });
        };

        // This function loads users from a resource
        $scope.loadUsers = function () {
            Users.query(function (result) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].id > userId) {
                        userId = result[i].maxid;
                    }
                }
                $scope.users = result;
            });
        };

        // This function clears the user array
        $scope.clearUsers = function () {
            $scope.users = [];
            userId = 0;
        };
    } ]);

    // Expose the angular module to W20 loader
    return {
        angularModules: [ 'user' ]
    };
});
