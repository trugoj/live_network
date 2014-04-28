var myApp = angular.module('myApp', []);

myApp.directive('helloWorld', function(){
  function link(scope, element, attr){
  	element.text("hello world!");
	}
  return {
  	link: link,
 	restrict: 'E'
	}
});

myApp.directive('donutChart', function(){
  function link(scope, element, attr){
	
	var color = d3.scale.category10();
	var data = scope.data;
	var width = 300;
	var height = 300;
	var min = Math.min(width, height);
	var svg = d3.select(element[0]).append('svg');
	var pie = d3.layout.pie().sort(null);
	var arc = d3.svg.arc()
		.outerRadius(min / 2 * 0.9)
		.innerRadius(min / 2 * 0.5);
	
	svg.attr({width: width, height: height});
	
	var g = svg.append('g')
	// center the donut chart
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
	// add the <path>s for each arc slice
	g.selectAll('path').data(pie(data))
		.enter().append('path')
		.style('stroke', 'white')
		.attr('d', arc)
		.attr('fill', function(d, i){ return color(i) });
	}
  return {
  	link: link,
 	restrict: 'E',
	scope: { data: '=' }
	}
});

myApp.directive('cluster', function(){
	function link(scope, element, attr){
		
	var radius = 960 / 2;
	var data = scope.data;

	var data = {
		  "nodes": [
		    {
		      "name": "AS&T",
		      "id": "id_1"
		    },
		    {
		      "name": "Casualty R&D",
		      "id": "id_2"
		    },
		    {
		      "name": "Cat Modelling",
		      "id": "id_3"
		    }
		  ],
		  "links": [
		    {
		      "source": "id_1",
		      "target": "id_2",
		      "group": "first"
		    },
		    {
		      "source": "id_1",
		      "target": "id_3",
		      "group": "second"
		    }
		  ]
		}

	var cluster = d3.layout.cluster()
	    .size([360, radius - 120]);

	var diagonal = d3.svg.diagonal.radial()
	    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

	var svg = d3.select(element[0]).append("svg")
	    .attr("width", radius * 2)
	    .attr("height", radius * 2)
	  .append("g")
	    .attr("transform", "translate(" + radius + "," + radius + ")");

	var n2 = cluster.nodes( data.nodes );
	
	d3.json("flare3.json", function(error, root) {
	  var nodes = cluster.nodes(root);

	  var link = svg.selectAll("path.link")
	      .data(cluster.links(nodes))
	    .enter().append("path")
	      .attr("class", "link")
	      .attr("d", diagonal);

	  var node = svg.selectAll("g.node")
	      .data(nodes.filter(function(n) { return !n.children; }))
	    .enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

	  node.append("circle")
	      .attr("r", 4.5);

	  node.append("text")
	      .attr("dy", ".31em")
	      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
	      .text(function(d) { return d.name; });
	});

	d3.select(self.frameElement).style("height", radius * 2 + "px");	
		
	}
  return {
  	link: link,
 	restrict: 'E',
	scope: { data: '=' }
	}
});

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
