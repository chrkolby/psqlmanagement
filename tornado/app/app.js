var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "app/views/home.html"
    })
	.when("/home", {
        templateUrl : "app/views/home.html"
    })
    .when("/manage", {
        templateUrl : "app/views/manage.html",
		controller: 'manageController'
    })
	 .when("/accounts", {
        templateUrl : "app/views/accounts.html",
		controller: 'accountController'
    })
	.otherwise({
        templateUrl : "app/views/home.html"
    })
});

app.factory('PagerService', PagerService);

app.controller("mainController", function ($scope, $location, $http) {
	console.log('main');
	$scope.manage = false;
	$http({
		method: 'GET',
		type: 'json',
		url: 'manage/gettables'
		}).then(function successCallback(response) {
			$scope.data = response.data;
			console.log($scope.data);
			// this callback will be called asynchronously
			// when the response is available
		}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
		
});

