// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb

var port = process.env.PORT || 8080;

// configuration ===============================================================

mongoose.connect('mongodb://localhost:27017/testdb'); 	// connect to mongoDB database on modulus.io

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.static(__dirname + '/bower_components'));
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

// define model ================================================================
var Node = mongoose.model('Node', {
	text : String
});

var EdgeDesc = mongoose.model('EdgeDesc', {
	text : String
});

var Edge = mongoose.model('Edge', {
	n_id_orig : String,
	n_id_dest : String,
	ed_id : String,
	text: String
});

// routes ======================================================================

	// api ---------------------------------------------------------------------
	// get all nodes
	app.get('/api/nodes/:node_id?', function(req, res) {

		spec = {}
		if( req.params.node_id )
		  spec._id = req.params.node_id;
		
		Node.find(spec, function(err, nodes) {
			if (err)
				res.send(err)
			res.json(nodes);
		});
	});

	app.post('/api/nodes', function(req, res) {
		Node.create({
			text : req.body.text
		}, function(err, todo) {
			if (err)
				res.send(err);
			Node.find(function(err, nodes) {
				if (err)
					res.send(err)
				res.json(nodes);
			});
		});

	});

	app.delete('/api/nodes/:node_id', function(req, res) {
		Node.remove({
			_id : req.params.node_id
		}, function(err, todo) {
			if (err)
				res.send(err);
			Node.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});

	// get all edge descriptions
	app.get('/api/edgedesc', function(req, res) {

		EdgeDesc.find(function(err, ed) {
			if (err)
				res.send(err)
			res.json(ed);
		});
	});

	app.post('/api/edgedesc', function(req, res) {
		EdgeDesc.create({
			text : req.body.text
		}, function(err, todo) {
			if (err)
				res.send(err);
			EdgeDesc.find(function(err, ed) {
				if (err)
					res.send(err)
				res.json(ed);
			});
		});

	});

	app.delete('/api/edgedesc/:ed_id', function(req, res) {
		EdgeDesc.remove({
			_id : req.params.ed_id
		}, function(err, todo) {
			if (err)
				res.send(err);
			EdgeDesc.find(function(err, ed) {
				if (err)
					res.send(err)
				res.json(ed);
			});
		});
	});

	// get all edges
	app.get('/api/edges', function(req, res) {

		Edge.find(function(err, edges) {
			if (err)
				res.send(err)
			res.json(edges);
		});
	});

	app.post('/api/edges', function(req, res) {
		console.log( req.body )
		Edge.create({
			n_id_orig : req.body.selectedNodeOrigin._id,
			n_id_dest : req.body.selectedNodeTarget._id,
			ed_id : req.body.selectedED._id,
			text: req.body.text
		}, function(err, todo) {
			if (err)
				res.send(err);
			Edge.find(function(err, edges) {
				if (err)
					res.send(err)
				res.json(edges);
			});
		});

	});

	app.delete('/api/edges/:edge_id', function(req, res) {
		Edge.remove({
			_id : req.params.edge_id
		}, function(err, todo) {
			if (err)
				res.send(err);
			Edge.find(function(err, edges) {
				if (err)
					res.send(err)
				res.json(edges);
			});
		});
	});


	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
