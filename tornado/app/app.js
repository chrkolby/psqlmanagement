var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "app/views/login.html",
		controller: 'mainController'
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
});

app.factory('PagerService', PagerService);

app.controller("tableController", function ($scope, $location, $http) {
	console.log('tableController');
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

app.controller("mainController", function ($scope, $location, $http) {
	console.log('mainController');
	$scope.manage = false;
	/*$http({
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
		*/
	$scope.login = function (user) {
		$http({
			method: 'POST',
			type: 'json',
			url: 'Login',
			data: user
		}).then(function successCallback(response) {
				console.log(response.data);
				if(response.data['Connected']){
					$location.path( "/manage" );
				}
			}, function errorCallback(response) {
		});
	}
		
});

