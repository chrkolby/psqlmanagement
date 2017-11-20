app.controller("contentController", function ($scope, $location, $http, PagerService, TableManage, SharedService) {

	console.log("contentController");

	$scope.pager = {};
	
	$scope.search = {
		text: '',
	};
	
	console.log($scope.search.input);
	
	$scope.SearchResults = function (SearchText) {
		var table_name = TableManage.getTable();
		SharedService.getData('Table/' +  [table_name] + '?search=' + SearchText).then(function(response){
			var data = response.data;
			$scope.currentTableData = data.data;

			console.log($scope.currentTableData);
			$scope.setPage = setPage;
			setPage(1);
		});
	}
	
	$scope.activeMenu = TableManage.getTable();

	$scope.getTable = function($event, table_name){
		
		TableManage.setTable(table_name);
		console.log(TableManage.getTable());
		$scope.activeMenu = table_name;
		_init_();
	}
	
	function _init_(){
		var table_name = $scope.activeMenu;
		if(table_name){
			SharedService.getData('Table/' +  [table_name]).then(function(response){
				var data = response.data;
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
		$scope.currentTableData.sort(function(a,b) {
			return a['accid'] - b['accid'];
		});
        $scope.items = $scope.currentTableData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);

    }
	
	_init_();
});