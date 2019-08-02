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
