app.controller("manageController", function ($scope, $location, $http) {
    $scope.$parent.manage = true;
	$scope.searchText = 'J25 S29';
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
			console.log($scope.currentKeys);
			console.log($scope.currentTableData);
			// this callback will be called asynchronously
			// when the response is available
		}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
	}
});