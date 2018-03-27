app.controller("tableController", function ($rootScope, $scope, $location, $cookies, SharedService, TableManage) {
	console.log('tableController');
	$scope.manage = false;
	$scope.topmenu = ['Content', 'Structure', 'SQL', 'Insert', 'Export', 'Import'];

	console.log($scope.activeMenuTop);
	
	$scope.logout = function(){
		$rootScope.logged = false;
		$cookies.put('session','');
		$location.path('/log');
	}
	
	
 
	SharedService.getData('Schema?token=' + $cookies.get('session')).then(function(response){
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