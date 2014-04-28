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
		
	var data = {
		  "nodes": [
		    {
		      "name": "root.AS&T",
		      "id": "id_1"
		    },
		    {
		      "name": "root.Casualty R&D",
		      "id": "id_2"
		    },
		    {
		      "name": "root.Cat Modelling",
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

		var diameter = 500,
		    radius = diameter / 2,
		    innerRadius = radius - 60;

		var cluster = d3.layout.cluster()
		    .size([360, innerRadius])
		    .sort(null)
		    .value(function(d) { return d.size; });

		var bundle = d3.layout.bundle();

		var line = d3.svg.line.radial()
		    .interpolate("bundle")
		    .tension(.85)
		    .radius(function(d) { return d.y; })
		    .angle(function(d) { return d.x / 180 * Math.PI; });

		var svg = d3.select(element[0]).append("svg")
		    .attr("width", diameter)
		    .attr("height", diameter)
		  .append("g")
		    .attr("transform", "translate(" + radius + "," + radius + ")");

		//var n2 = scope.data.nodes;
		
		// d3.json("readme-flare-imports-2.json", function(error, classes) {
		  var nodes = cluster.nodes(packageHierarchy(data.nodes));
		  var links = treatLinks(data.links, nodes);

		  svg.selectAll(".link")
		      .data(bundle(links))
		    .enter().append("path")
		      .attr("class", "link")
		      .attr("d", line);

		  svg.selectAll(".node")
		      .data(nodes.filter(function(n) { return !n.children; }))
		    .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
		    .append("text")
		      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
		      .attr("dy", ".31em")
		      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
		      .text(function(d) { return d.key; });
		// });

		d3.select(self.frameElement).style("height", diameter + "px");

		// Lazily construct the package hierarchy from class names.
		function packageHierarchy(classes) {
		  var map = {};

		  function find(name, data) {
		    var node = map[name], i;
		    if (!node) {
		      node = map[name] = data || {name: name, children: []};
		      if (name.length) {
			node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
			node.parent.children.push(node);
			node.key = name.substring(i + 1);
		      }
		    }
		    return node;
		  }

		  classes.forEach(function(d) {
		    find(d.name, d);
		  });

		  return map[""];
		}

		function treatLinks(links, nodes) {
		  var imports = [];
		  var map = {};

		  nodes.forEach( function(d) {
		    map[d.id] = d;
		  });

		  links.forEach( function(d) {
		  	var e = {};
			e.source = map[d.source];
			e.target = map[d.target]
			imports.push(e);
		  });

		  return imports;
		}
		
		// Return a list of imports for the given array of nodes.
		function packageImports(nodes) {
		  var map = {},
		      imports = [];

		  // Compute a map from name to node.
		  nodes.forEach(function(d) {
		    map[d.name] = d;
		  });

		  // For each import, construct a link from the source to target node.
		  nodes.forEach(function(d) {
		    if (d.imports) d.imports.forEach(function(i) {
		      imports.push({source: map[d.name], target: map[i]});
		    });
		  });

		  return imports;
		}


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
