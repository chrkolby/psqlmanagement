app.controller("SQLController", function ($rootScope, $scope, $cookies, $location, $http, PagerService, TableManage, SharedService) {
	
	init();
	$scope.pager = {};
	$scope.activeMenu = TableManage.getTable();

	$scope.info = {"feedback" : false};
	
	$scope.$on('TEST', function(event, data) {
        $scope.activeMenu = TableManage.getTable();

		init();
	});
	
	$scope.go = function(sql){
		var table_name = $scope.activeMenu;
		var data = {
			'type':'free',
			'data':sql
		};
		if(sql){
			SharedService.addData('Table/' +  [table_name] + '&token=' + $cookies.get('session'), data).then(function(response){
				console.log(response);
				if(response.status == 500){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				
				if(response.status == 400){
					$scope.info.feedback = true;
					$scope.info.message = response.message;
				}
				else{
					if(response.data != "No data"){
						$scope.currentTableData = response.data;
						TableManage.setTableContent(response.data);
					
						$scope.currentKeys = Object.keys($scope.currentTableData[0]);
						$scope.currentSort = "asc";
						$scope.setPage = setPage;
						setPage(1);
					}
					$scope.sql = "";
					$scope.info.feedback = false;
					$scope.info.message = "";
				}
			});
		}
		console.log(sql);
	}
	
	function init(){
		var table_name = $scope.activeMenu;
		if(table_name){
			SharedService.getData('Schema/' +  [table_name] + '&token=' + $cookies.get('session')).then(function(response){
				var data = response.data;
				console.log(data);
				if(data.status == 500){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				console.log(data.data);
				$scope.columns = [];
				data.data.forEach(function(element){
					if(element['character_maximum_length'] == null){
						var string = element['column_name'] + "(" + element['data_type'] + ")";
					}
					else{
						var string = element['column_name'] + "(" + element['data_type'] + "(" + element['character_maximum_length'] + "))";
					}
					$scope.columns.push(string);
					console.log(element);
				});
				console.log($scope.columns);
				
			});
		}
	}
	
	function setPage(page, sort=null) {
		$scope.selected = [];
		if ((page < 1 || page > $scope.pager.totalPages) && ($scope.currentTableData.length == 0 || page > 1)) {
            return;
        }
        $scope.pager = PagerService.GetPager($scope.currentTableData.length, page);
		if(!sort){
			var firstKey = Object.keys($scope.currentTableData[0])[0];
			$scope.currentKey = firstKey;
		}
		if($scope.currentSort == "asc"){
			$scope.currentTableData.sort(compareAsc);
		}
		
		else{
			$scope.currentTableData.sort(compareDesc);
		}
		
        $scope.items = $scope.currentTableData.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);

    }
	
	function compareDesc(a, b){
		if(a[$scope.currentKey] > b[$scope.currentKey]){
			return -1;
		}
		if(a[$scope.currentKey] < b[$scope.currentKey]){
			return 1;
		}
		return 0;
	}
	
	function compareAsc(a, b){
		if(a[$scope.currentKey] < b[$scope.currentKey]){
			return -1;
		}
		if(a[$scope.currentKey] > b[$scope.currentKey]){
			return 1;
		}
		return 0;
	}
	
});