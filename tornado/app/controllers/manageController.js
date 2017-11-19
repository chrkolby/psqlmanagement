app.controller("manageController", function ($scope, $location, $http, PagerService) {
    $scope.$parent.manage = true;
	$scope.searchText = 'J25 S29';
	$scope.currentTableData = [];
	$scope.pager = {};
	
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
		
	$scope.$parent.getTable = function(table_name){
		var data = {"table_name":table_name};
		$http({
		method: 'POST',
		type: 'json',
		url: 'manage/gettablecontent',
		data: data
		}).then(function successCallback(response) {
			$scope.currentTableData = response.data;
			$scope.currentKeys = Object.keys($scope.currentTableData[0]);
			$scope.currentTableData.sort(function(a,b) {
				return a['accid'] - b['accid'];
			});
			$scope.setPage = setPage;
			setPage(1);
			// this callback will be called asynchronously
			// when the response is available
		}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}
	
	function setPage(page) {
		console.log(page);
        if (page < 1 || page > $scope.pager.totalPages) {
            return;
        }
		console.log(page);
        // get pager object from service
        $scope.pager = PagerService.GetPager($scope.currentTableData.length, page);
		console.log($scope.pager);
 
        // get current page of items
        $scope.items = $scope.currentTableData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
		console.log($scope.items);
    }
});