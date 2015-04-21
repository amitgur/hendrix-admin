// Bring Mongoose into the app
var log = require('./myLog').log;
module.exports = function(mongoose, dbURI){

	log('connecting to db ');
	// CONNECTION EVENTS
	// When successfully connected
	mongoose.connection.on('connected', function () {
		log('Mongoose default connection open to mongoDB');
	});

	// If the connection throws an error
	mongoose.connection.on('error',function (err) {
		log('Mongoose default connection error: ' + err);
	});

	// When the connection is disconnected
	mongoose.connection.on('disconnected', function () {
		log('Mongoose default connection disconnected');
	});

	// If the Node process ends, close the Mongoose connection
	process.on('SIGINT', function() {
		mongoose.connection.close(function () {
			log('Mongoose default connection disconnected through app termination');
			process.exit(0);
		});
	});
};