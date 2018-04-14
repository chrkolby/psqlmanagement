app.controller("contentController", function ($rootScope, $cookies, $scope, $location, $http, PagerService, TableManage, SharedService) {

	console.log("contentController");

	$scope.pager = {};
	
	$scope.search = {
		text: '',
	};
	
	$scope.selected = [];
	
	
	$scope.SearchResults = function (SearchText) {
		var table_name = TableManage.getTable();
		SharedService.getData('Table/' +  [table_name] + '?search=' + SearchText + '&token=' + $cookies.get('session')).then(function(response){
			var data = response.data;
			if(data.status == 401){
				$location.path('/log');
				$rootScope.logged = false;
				return;
			}
			$scope.currentTableData = data.data;

			$scope.setPage = setPage;
			setPage(1);
		});
	}
	
	$scope.$on('TEST', function(event, data) {
        $scope.activeMenu = TableManage.getTable();
		init();
	});
	
	function init(){
		var table_name = $scope.activeMenu;
		if(table_name){
			SharedService.getData('Table/' +  [table_name] + '?token=' + $cookies.get("session")).then(function(response){
				var data = response.data;
				$scope.currentTableData = data.data;
				if(data.status == 401){
					$location.path('/log');
					$rootScope.logged = false;
					return;
				}
				if(data.data){
					TableManage.setTableContent(data.data);
					
					if(data.data.length < 1){
						
						alert("Table is empty");
						$scope.setPage = setPage;
						$scope.items = null;
						//setPage(1, true);
						
					}
					else{
					
						$scope.currentKeys = Object.keys($scope.currentTableData[0]);
						$scope.currentSort = "asc";
						$scope.setPage = setPage;
						setPage(1);
						
					}
				}
			});
		}
	}
	
	$scope.edit = function(){
		items = selected();
	}
	
	$scope.delete = function(){
		var items = selected();
		var table_name = $scope.activeMenu;
		SharedService.deleteData('Table/' +  [table_name] + '?token=' + $cookies.get("session"),items).then(function(response){
			if(response.status == 401){
				$location.path('/log');
				$rootScope.logged = false;
				return;
			}
			$scope.items.forEach(function(element, index){
				if(items.includes(element)){
					$scope.currentTableData.splice($scope.currentTableData.indexOf(element), 1);
				}
			});
			$scope.setPage = setPage;
			setPage(1);
		});
	}
	
	$scope.sort = function(key, header){
		
		var keyIndex = $scope.currentKeys.indexOf(key);
		
		if($scope.currentKey == key){
			
			if($scope.currentSort == "asc"){
				$scope.currentSort = "desc";
			}
			else{
				$scope.currentSort = "asc";
			}
		}
		else{
			$scope.currentSort = "asc";
		}
		$scope.currentKey = key;
		$scope.setPage = setPage;
		setPage(1, true);
	}
	
	function selected(){
		console.log($scope.items);
		var items = []
		$scope.selected.forEach(function(element, index){
			if(element == true){
				items.push($scope.items[index]);
			}
		});
		return items;
	}
	
	function setPage(page, sort=null) {
		$scope.selected = [];
		if ((page < 1 || page > $scope.pager.totalPages) && ($scope.currentTableData.length == 0 || page > 1)) {
            return;
        }
        $scope.pager = PagerService.GetPager($scope.currentTableData.length, page);
		if($scope.currentTableData.length > 0){
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
	
	
	init();
});