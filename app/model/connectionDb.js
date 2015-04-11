/*jslint node: true */

var
	mongoose = require('mongoose'),
	config = require('../../config/config')(),
	connectionDb;


module.exports = connectionDb = mongoose.createConnection(config.db);
connectionDb.on('connected', function() {
	console.log('Mongoose connected to bandpad Db');
});

