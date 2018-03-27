app.controller("structureController", function ($rootScope, $scope, $cookies, $location, $http, PagerService, TableManage, SharedService) {

	console.log("structureController");

	$scope.pager = {};
	
	$scope.activeMenu = TableManage.getTable();

	$scope.$on('TEST', function(event, data) {
        $scope.activeMenu = TableManage.getTable();
		console.log(Date.now());
		_init_();
	});
	
	function _init_(){
		var table_name = $scope.activeMenu;
		if(table_name){
			console.log("INIT");
			SharedService.getData('Schema/' +  [table_name] + '&token=' + $cookies.get('session')).then(function(response){
				var data = response.data;
				
				console.log(response);
				
				if(data.status == 500){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				$scope.currentTableData = data.data;
				
				TableManage.setTableContent(data.data);
				
				console.log(TableManage.getTableContent());
				
				$scope.currentKeys = Object.keys($scope.currentTableData[0]);
				$scope.setPage = setPage;
				setPage(1);
			});
		}
	}
	
	function setPage(page) {
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
        $scope.pager = PagerService.GetPager($scope.currentTableData.length, page);

        $scope.items = $scope.currentTableData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);

    }
	
	_init_();
});