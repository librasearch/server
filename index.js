// Necessary imports
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

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

app.get('/statistics/:query', (req, res) => {

	let queryValue = req.params.query.toString();
	let currentTime = moment().unix();
	let time24prev = moment().unix() - 86400;

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader('Content-Type', 'application/json');

	MongoClient.connect(dbURL, { useNewUrlParser : true }, function (error, mng) {
		if (error) {
			throw error;
		} else {
			mng.db(dbNAME).collection("addresses").find({
				
			}, function (error, result) {
				if (error) {
					throw error;
				} else {
					mng.close();
					console.log(currentTime);
					result = JSON.stringify(result);
					res.end(result);
				}
			});
		}
	});
	
	/*if (queryValue === "uniqueAddresses") {
		res.end('woo!');
	} else {
		res.end('Your query has an error. Please try again.');
	}*/
});

app.post('/query/', (req, res) => {

	let queryValue = '';
	req.on('data', chunk => {
		queryValue += chunk.toString();
	});

	req.on('end', () => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader('Content-Type', 'application/json');
		
		if (queryValue.length == 64) {

			MongoClient.connect(dbURL, { useNewUrlParser: true}, function (error, mng) {
				if (error) {
					throw error;
				} else {
					mng.db(dbNAME).collection("addresses").findOne({
						_id: queryValue
					}, function (error, result) {
						if (error) {
							throw error;
						} else {
							let balance = 0;
							let txs = [];
							let itemsProcessed = 0;

							if (typeof (result.received) != 'undefined') {
								result.received.forEach(tx => {
									mng.db(dbNAME).collection("transactions").findOne({
										_id: Number(tx)
									}, function (error, resultTwo) {
										if (error) {
											throw error;
										} else {
											balance += resultTwo.value;
											txs.push(resultTwo);
											itemsProcessed++;
											if (itemsProcessed == result.received.length) {
												processRequest();
											}
										}
									});
								});
							} else {
								processRequest();
							}

							/* TODO: Rewrite copied function to optimize */
							function processRequest() {
								let itemsProcessed = 0;
								if (typeof (result.sent) != 'undefined') {
									result.sent.forEach(tx => {
										mng.db(dbNAME).collection("transactions").findOne({
											_id: Number(tx)
										}, function (err, result2) {
											if (err) throw err;
											balance -= result2.value;
											txs.push(result2);
											itemsProcessed++;
											if (itemsProcessed == result.sent.length) {
												prepareData();
											}
										});
									});
								} else {
									prepareData();
								}
							}

							function prepareData() {
								txs.sort(function (a, b) {
									var aNum = parseInt(a._id);
									var bNum = parseInt(b._id);
									return bNum - aNum;
								});
								returnData();
							}

							function returnData() {
								mng.close();
								res.setHeader("Access-Control-Allow-Origin", "*");
								res.end(JSON.stringify({
									balance: balance,
									txs: txs
								}));
							}
						}
					});
				}
			});
			
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

app.get('/statistics', (req, res) => {
	// Mongo retrival initiation
	MongoClient.connect(dbURL, { useNewUrlParser : true }, function(error, mng) {
		if (error) {
			throw error;
		} else {
			const requestTime = moment().unix(); // Time of query
			const requestTime24 = moment().unix() - 86400; // Time 24hrs before query
			const requestTime48 = moment().unix() - 172800; // Time 24hrs before query

			// Sent Transactions (24H)
			let currentTransactions = 0;
			let historicTransactions = 0;
			let historic48Transactions = 0;
			let ratio = 0;
			mng.db(dbNAME).collection("transactions").find({
				
			}).toArray(function (error, result) {
				if (error) {
					throw error;
				} else {
					mng.close();

					// Get currentTransactions
					currentTransactions = result.length;
					console.log(currentTransactions);

					// Get currentTransactions - 24h
					for (let i = 0; i < result.length; i++) {
						if (result[i].time < requestTime24) {
							historicTransactions++;
						}
					}

					// Get currentTransactions - 48h
					for (let i = 0; i < result.length; i++) {
						if (result[i].time < requestTime48) {
							historic48Transactions++;
						}
					}

					// Get ratio
					ratio = (currentTransactions - historicTransactions) / (historicTransactions - historic48Transactions); 
					console.log(currentTransactions, historicTransactions, historic48Transactions, ratio);
					res.send('test');
				}
			});
			/*mng.db(dbNAME).collection("transactions").find({
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
			});*/

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

app.listen(port);
