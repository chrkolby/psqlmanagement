var app = angular.module('myApp', ['ngRoute', 'ngResource', 'ngCookies']);

 app.config(function($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix('');
	$routeProvider
	.when("/", {
        templateUrl : "app/views/content.html",
		controller: 'contentController'
    })
	.when("/log", {
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
	.when("/SQL", {
        templateUrl : "app/views/SQL.html",
		controller: 'SQLController'
    })
	.when("/Insert", {
        templateUrl : "app/views/insert.html",
		controller: 'insertController'
    })
	.when("/newtable", {
        templateUrl : "app/views/newtable.html",
		controller: 'newtableController'
    })
	.when("/Export", {
        templateUrl : "app/views/export.html",
		controller: 'exportController'
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



app.controller("mainController", function ($scope, $location, $http, $cookies, TableManage, SharedService) {
	console.log($scope.API);
	
	SharedService.setBaseUrl($scope.API);
	
	console.log('mainController');
	$scope.overlay = false;
	$scope.manage = false;
	$scope.user = {};
	$scope.newuser = {};
	$scope.error = {};
	$scope.info = {"type" : "login"};
	
	$scope.setActive = function(item){
		$scope.activeMenuTop = item;
	}
	
	$scope.getTable = function($event, table_name){
		TableManage.setTable(table_name);
		$scope.$broadcast('TEST');
		$scope.activeMenu = table_name;
	}
	
	$scope.newTable = function(){
		$scope.activeMenu = "newtable";
	}
	
	$scope.formlogin = function(){
		$scope.info.type = "login";
	}
	
	$scope.formregister = function(){
		$scope.info.type = "register";
	}
	
	$scope.register = function(newuser){
		
		$scope.overlay = true;
		
		
		
		if(newuser.password != newuser.confpassword){
			
			$scope.info.status = false;
			$scope.passwordMatch = false;
		}
		
		else{
			
			$scope.passwordMatch = true;
			
			$http({
				method: 'POST',
				type: 'json',
				url: 'Register',
				data: newuser
			}).then(function successCallback(response) {
					$scope.info.status = true
					console.log(response);
					$scope.info.message = response.data;
					$scope.overlay = false;
				}, function errorCallback(response) {
			});
		}
			
	}
	
	$scope.login = function (user) {
		$scope.overlay = true;
		$http({
			method: 'POST',
			type: 'json',
			url: 'Login',
			data: user
		}).then(function successCallback(response) {
				$scope.overlay = false;
				if(response.data['status'] = 200){
					console.log(response);
					$cookies.put('session', response.data['data']['token']);
					$location.path("/");
				}
			}, function errorCallback(response) {
		});
	}
		
});

app.run(['$rootScope', '$location', '$cookies', '$http',
    function ($rootScope, $location, $cookies, $http) {
 
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
			$rootScope.currentUser = $cookies.get('session');
			console.log($rootScope.currentUser);
			if(!$rootScope.currentUser){
				$location.path('/log');
				$rootScope.logged = false;
			}
			else{
				$rootScope.logged = true;
			}
        });
    }]);
