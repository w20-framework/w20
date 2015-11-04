define([
	'{angular}/angular/angular',
	'{angular-resource}/angular-resource'

], function (angular) {
	'use strict';

	var module = angular.module('content', [ 'ngResource' ]);

	module.factory('ContentService', function() {
		// Service private bits go here
		
		return {
			// Service public interface goes here
		};
	});

	module.controller('ContentController', [ '$scope', 'ContentService', function($scope, contentService) {
		$scope.users = [ {
			firstName : 'Robert',
			lastName : 'SMITH'
		}, {
			firstName : 'Mary',
			lastName : 'POPPINS'
		}, {
			firstName : 'John',
			lastName : 'CONNOR'
		} ];
	} ]);

	return {
		angularModules : [ 'content' ]
	};
});
