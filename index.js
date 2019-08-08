// Necessary imports
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

// Express Initialization
const app = express();
const port = 3000;

// Static declarations
const dbURL = 'mongodb://localhost:27017/';
const dbNAME = 'libra-local';

// TODO: Simplify this process so that latest + all are in one query simply dependent on passed request parameters.

// Latest transactions
app.get('/latest', (req, res) => {
	// Mongo retrieval and output
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng) {
		if (error) {
			throw error;
		} else {
			mng.db(dbNAME).collection("transactions").find({}).sort({
				_id: -1 // Reverse order retrieval
			}).limit(15).toArray(function (error, result) {
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

// All transactions TODO: Setup content encoding with gzip to optimize on payload size.
app.get('/all', (req, res) => {
	// Mongo retrieval and output
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng) {
		if (error) {
			throw error;
		} else {
			mng.db(dbNAME).collection("transactions").find({}).sort({
				_id: -1 // Reverse order retrieval
			}).limit(0).toArray(function (error, result) {
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

/*
app.get('/statistics', (req, res) => {
	// Mongo retrival initiation
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng, ObjectID) {
		if (error) {
			throw error;
		} else {
			const requestTime = moment().unix(); // Time of query
			const requestTime24 = moment().unix() - 86400; // Time 24hrs before query
			const requestTime48 = moment().unix() - 172800; // Time 48hrs before query

			// Sent Transactions (24H)
			mng.db(dbNAME).collection("transactions").find({
				"timestamp": {
					$lt: new Date(), 
					$gte: new Date(new Date().setDate(new Date().getDate()-1))
				}
			}).toArray(function (error, result) {
				if (error) {
					throw error;
				} else {
					count24 = result.length;
					console.log(count24);
				}
				mng.close();
			});

			// Latest version
			// Libra Volume (24H)
			// Average TX Fee (24H)
			// P2P / Mint Transactions
			// Average TPS
			// Unique Addresses
			// Total Transactions
			// Total Libra Supply
		}
	});
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
});*/

app.post('/query/', (req, res) => {

	let queryValue = '';
	req.on('data', chunk => {
		queryValue += chunk.toString();
	});

	req.on('end', () => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader('Content-Type', 'application/json');
		
		if (queryValue.length == 64) {

			res.send('address');

		} else if (queryValue.length < 32) {

			MongoClient.connect(dbURL, { useNewUrlParser : true }, function (error, mng) {
				if (error) {
					throw error;
				} else {
					mng.db(dbNAME).collection("transactions").findOne({
						_id: Number(queryValue)
					}, function (error, result) {
						if (error) {
							throw error;
						} else {
							mng.close();
							result = JSON.stringify(result);
							res.end(result);
						}
					});
				}
			});
		} else {
			res.send('Your query has an error. Please try again.');
		}
	});
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
