app.controller("insertController", function ($rootScope, $scope, $cookies, $location, $http, PagerService, SharedService, TableManage) {

	init();
	
	$scope.insertData = {};

	$scope.info = {};
	
	$scope.$on('TEST', function(event, data) {
        $scope.activeMenu = TableManage.getTable();
		$scope.info = {};
		init();
	});
	
	$scope.insert = function(insertData){
		var table_name = $scope.activeMenu;
		var data = {
			'type':'insert',
			'data':insertData
			};
		SharedService.addData('Table/' +  [table_name] + '?token=' + $cookies.get('session'), data).then(function(response){
			if(response.status == 500){
				$location.path('/log');
				$rootScope.logged = false;
				return;
			}
			$scope.info.feedback = true;
			$scope.info.message = response.message;
			console.log(response);
		});
		console.log(data);
	}
	
	function init(){
		var table_name = $scope.activeMenu;
		if(table_name){
			SharedService.getData('Schema/' +  [table_name] + '?token=' + $cookies.get('session')).then(function(response){
				var data = response.data;
				console.log(data);
				if(data.status == 500){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				
				$scope.columns = [];
				data.data.forEach(function(element){
					var innerdata = {'name':element['column_name']};
					if(element['character_maximum_length'] == null){
						innerdata.type = element['data_type'];
					}
					else{
						innerdata.type = element['data_type'] + "(" + element['character_maximum_length'] + ")";
					}
					$scope.columns.push(innerdata);

				});
				
			});
		}
	}

});