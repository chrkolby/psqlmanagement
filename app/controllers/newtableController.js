app.controller("newtableController", function ($rootScope, $scope, $cookies, $location, $http, PagerService, TableManage, SharedService) {
	
	$scope.data = {};
	$scope.rows = [1,2,3,4,5];
	$scope.info = {};
	
	$scope.addrow = function(){
		$scope.rows.push($scope.rows.length+1);
	}
	
	$scope.go = function(input){
		console.log(input);
		if(input['tablename']){
			for(key in input){
				if(key != "tablename"){
					if(!input[key].length){
						input[key].length = "";
					}
				}
			}
			console.log(input);
			
			SharedService.addData('Schema' + '?token=' + $cookies.get('session'), input).then(function(response){
				if(response.status == 500){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				if(response.status == 200){
					location.reload();
				}
				$scope.info.feedback = true;
				$scope.info.message = response.message;
			});
		}
	}

});