var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http) {
	$scope.formNode = {};
	$scope.formED = {};
	$scope.newconnobj = {};
	$scope.edges = {};

	// when landing on the page, get all nodes and show them
	$http.get('/api/nodes')
		.success(function(data) {
			$scope.nodes = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when landing on the page, get all ed descriptions and show them
	$http.get('/api/edgedesc')
		.success(function(data) {
			$scope.edgedesc = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	$http.get('/api/edges')
		.success(function(data) {
			$scope.edges = $scope.enrichEdges(data);
			console.log($scope.edges);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createNode = function() {
		$http.post('/api/nodes', $scope.formNode)
			.success(function(data) {
				$('input').val('');
				$scope.nodes = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a node after checking it
	$scope.deleteNode = function(id) {
		$http.delete('/api/nodes/' + id)
			.success(function(data) {
				$scope.nodes = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// when submitting the add form, send the text to the node API
	$scope.createED = function() {
		$http.post('/api/edgedesc', $scope.formED)
			.success(function(data) {
				$('input').val('');
				$scope.edgedesc = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$scope.enrichEdges =  function(data) {
		for (var i = 0; i < data.length; i++) {
		    console.log(data[i]);
		}
		return data;
	}
	
	// when submitting the add form, send the text to the node API
	$scope.createEdge = function() {
		$http.post('/api/edges', $scope.newconnobj)
			.success(function(data) {
				$('input').val('');
				$scope.edges = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete an edge description after checking it
	$scope.deleteEdge = function(id) {
		$http.delete('/api/edges/' + id)
			.success(function(data) {
				$scope.edges = $scope.enrichEdges(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete an edge description after checking it
	$scope.deleteED = function(id) {
		$http.delete('/api/edgedesc/' + id)
			.success(function(data) {
				$scope.edgedesc = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

}
