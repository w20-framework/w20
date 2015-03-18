define([ '{w20-core}/libext/angular/angular', '{w20-core}/libext/angular/angular-resource' ], function() {
	var module = angular.module('content', [ 'ngResource' ]);

	module.factory('ContentService', function() {
		// Service private bits go here
		
		return {
			// Service public interface goes here
		};
	});

	module.controller('ContentController', [ '$scope', 'ContentService', function($scope, contentService) {
		$scope.users = [ {
			firstName : "Robert",
			lastName : "SMITH"
		}, {
			firstName : "Mary",
			lastName : "POPPINS"
		}, {
			firstName : "John",
			lastName : "CONNOR"
		} ];
	} ]);

	return {
		angularModules : [ 'content' ]
	};
});
