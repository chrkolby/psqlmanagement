app.controller("exportController", function ($rootScope, $scope, $cookies, $location, $http, PagerService, SharedService, TableManage) {

	$scope.insertData = {};
	
	$scope.export = function(){
		var table_name = $scope.activeMenu;
		if(table_name){
			SharedService.getData('Export/' + table_name + '&token=' + $cookies.get('session')).then(function(response){
				console.log(response);
			});
		}
	}

	$scope.$on('TEST', function(event, data) {
        $scope.activeMenu = TableManage.getTable();
	});
});