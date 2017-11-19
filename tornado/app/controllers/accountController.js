app.controller("accountController", function ($scope, $location, $http) {
	$scope.$parent.manage = false;
	console.log($scope.accounts);
	$http({
		method: 'GET',
		type: 'json',
		url: 'accounts/getaccs'
		}).then(function successCallback(response) {
			$scope.accounts = response.data;
			console.log($scope.accounts);
			// this callback will be called asynchronously
			// when the response is available
		}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
		});
		
	$scope.remove = function(id){
		var index = $scope.accounts.findIndex(function(element){
			
			if(element['accid'] == id){
				return element;
			}});
		
		$scope.accounts.splice(index,1);
	}

});