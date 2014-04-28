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

		d3.select(self.frameElement).style("height", diameter + "px");

        scope.$watch('data', function(dat) {
            console.log("an element within `nodes` changed!");
            console.log(dat);

            update_graph(dat);
        }, true);

        function update_graph(dat) {
            if (dat.nodes)
                if (dat.edges) {
                    nclone = clone(dat.nodes);
                    lclone = clone(dat.edges);

                    var nodes = cluster.nodes(packageHierarchy(nclone));
                    var links = treatLinks(lclone, nodes);

                    var l = svg.selectAll(".link")
                        .data(bundle(links))

                    //Update
                    l.transition().attr("d", line);

                    l.enter().append("path")
                        .attr("class", "link")
                        .attr("d", line);

                    l.exit().remove();

                    var n = svg.selectAll(".node")
                        .data(nodes.filter(function (n) {
                            return !n.children;
                        }))

                    n.enter()
                        .append("g")
                        .attr("class", "node")
                        .append("text")
                        .attr("dx", function (d) {
                            return d.x < 180 ? 8 : -8;
                        })
                        .attr("dy", ".31em")
                        .attr("text-anchor", function (d) {
                            return d.x < 180 ? "start" : "end";
                        })
                        .attr("transform", function (d) {
                            return d.x < 180 ? null : "rotate(180)";
                        })
                        .text(function (d) {
                            return d.key;
                        });

                    n.exit().remove();

                    n.transition().attr("transform", function (d) {
                        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    })

                }
        };

        function clone(obj) {
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        }

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

		  if(classes) {
              classes.forEach(function(d) {
                  find(d.text, d);
              });
          }

		  return map[""];
		}

		function treatLinks(links, nodes) {
		  var imports = [];
		  var map = {};

		  nodes.forEach( function(d) {
		    map[d._id] = d;
		  });

		  links.forEach( function(d) {
		  	var e = {};
			e.source = map[d.n_id_orig];
			e.target = map[d.n_id_dest]
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
	$scope.info = {}
    $scope.info.formNode = {};
	$scope.info.formED = {};
	$scope.info.newconnobj = {};
	$scope.info.edges = {};

	// when landing on the page, get all nodes and show them
	$http.get('/api/nodes')
		.success(function(data) {
			$scope.info.nodes = data;
			console.log(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when landing on the page, get all ed descriptions and show them
	$http.get('/api/edgedesc')
		.success(function(data) {
			$scope.info.edgedesc = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	$http.get('/api/edges')
		.success(function(data) {
			$scope.info.edges = $scope.enrichEdges(data);
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
				$scope.info.nodes = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a node after checking it
	$scope.deleteNode = function(id) {
		$http.delete('/api/nodes/' + id)
			.success(function(data) {
				$scope.info.nodes = data;
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
				$scope.info.edgedesc = data;
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
		$http.post('/api/edges', $scope.info.newconnobj)
			.success(function(data) {
				$('input').val('');
				$scope.info.edges = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete an edge description after checking it
	$scope.deleteEdge = function(id) {
		$http.delete('/api/edges/' + id)
			.success(function(data) {
				$scope.info.edges = $scope.enrichEdges(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete an edge description after checking it
	$scope.deleteED = function(id) {
		$http.delete('/api/edgedesc/' + id)
			.success(function(data) {
				$scope.info.edgedesc = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};


    $scope.initd3 = function() {

    }

}
