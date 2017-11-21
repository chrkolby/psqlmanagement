app.controller("tableController", function ($scope, $location, SharedService, TableManage) {
	console.log('tableController');
	$scope.manage = false;
	$scope.topmenu = ['Content', 'Structure', 'SQL', 'Search', 'Export', 'Import'];
	console.log($scope.search);
	//$scope.activeMenu = TableManage.get();
	
	/*$scope.$watch(function() {
		return TableManage.get()
	}, function(newValue, oldValue) {
		$scope.activeMenu = newValue;
	});*/
	
	//$scope.activeMenu = TableManage.currentTable;
	console.log($scope.activeMenu);
 
	SharedService.getData('Schema?token=onetwo').then(function(response){
		var data = response.data;
		$scope.data = (data.data);
	});
});