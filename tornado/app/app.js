var app = angular.module('myApp', ['ngRoute', 'ngResource']);

 app.config(function($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix('');
	$routeProvider
	.when("/", {
        templateUrl : "app/views/content.html",
		controller: 'contentController'
    })
	.when("/login", {
        templateUrl : "app/views/login.html",
		controller: 'mainController'
    })
    .when("/Content", {
        templateUrl : "app/views/content.html",
		controller: 'contentController'
    })
	.when("/Structure", {
        templateUrl : "app/views/content.html",
		controller: 'structureController'
    })
	 .when("/accounts", {
        templateUrl : "app/views/accounts.html",
		controller: 'accountController'
    })
	.otherwise({redirectTo:'/'});
});

app.factory('PagerService', PagerService);

app.factory("TableManage", function(){
	var currentTableContent = [];
	var currentTable = '';
	return{
		getTable:function(){
			return currentTable;
		},
		setTable:function(table){
			currentTable = table;
			return currentTable;
		},
		getTableContent:function(){
			return currentTableContent;
		},
		setTableContent:function(data){
			currentTableContent = data;
			return currentTableContent;
		}
	}
});

app.controller("mainController", function ($scope, $location, $http) {
	console.log('mainController');
	$scope.manage = false;
	$scope.activeMenuTop = '';
	
	$scope.setActive = function(item){
		$scope.activeMenuTop = item;
	}
	
	$scope.login = function (user) {
		
		SharedService.getData('gettables').then(function(response){
			var data = response.data;
			$scope.data = (data.data);
		});
		
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

