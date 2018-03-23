app.controller("tableController", function ($rootScope, $scope, $location, $cookies, SharedService, TableManage) {
	console.log('tableController');
	$scope.manage = false;
	$scope.topmenu = ['Content', 'Structure', 'SQL', 'Insert', 'Export', 'Import'];

	console.log($scope.activeMenuTop);
	
	$scope.logout = function(){
		$cookies.put('user','');
		$location.path('/log');
	}
 
	SharedService.getData('Schema').then(function(response){
		var data = response.data;
		if(data.status == 500){
			$location.path('/log');
			$rootScope.logged = false;
		}
		else{
			$scope.data = (data.data);
		}
	});
});