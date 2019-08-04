// Necessary imports
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

// Express Initialization
const app = express();
const port = 3000;

// Static declarations
const dbURL = 'mongodb://localhost:27017/';
const dbNAME = 'libra-local';

// Latest transactions
app.get('/latest', (req, res) => {
	// Mongo retrieval and output
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng) {
		if (error) {
			throw error;
		} else {
			mng.db(dbNAME).collection("transactions").find({}).sort({
				_id: -1 // Reverse order retrieval
			}).limit(15/*use req.query.limit*/).toArray(function (error, result) {
				if (error) {
					throw error;
				} else {
					cleanedResult = JSON.stringify(result);
					res.setHeader("Access-Control-Allow-Origin", "*");
					res.setHeader('Content-Type', 'application/json');
					res.end(cleanedResult);
				}
				mng.close();
			});
		}
	});
});

app.get('/statistics', (req, res) => {
	res.send('stats');
});

app.post('/query/:value', (req, res) => {

	// Get value of query.
	const queryValue = req.params;
	res.send(queryValue);

	if (queryValue.length == 64) {

		res.send('address');

	} else if (queryValue.length < 32) {

		res.send('version number');

	} else {
		res.send('Your query has an error. Please try again.');
	}
});
/*
Transactional query
app.get('/transaction/{}', (req, res) => {
	res.send('stats');
});

Address query
app.get('/address/{}', (req, res) => {
	res.send('stats');
});
*/

app.listen(port);
