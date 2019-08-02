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
	// Access 'limit' query parameter
	if (req.query.limit != undefined) {
		const limit = req.query.limit;
	} else {
		const limit = 100;
	}

	// Mongo retrieval and output
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng) {
		if (error) {
			throw error;
		} else {
			mng.db(dbNAME).collection("transactions").find({}).sort({
				_id: -1 // Reverse order retrieval
			}).limit(limit).toArray(function (error, result) {
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

app.listen(port);
