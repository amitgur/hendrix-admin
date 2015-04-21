/*jslint node: true */ 'use strict';

// interface to logging

var
	debug = require('debug')('hendrix'),
	winston = require('winston'),
	Mail = require('winston-mail').Mail,
	logMode = 'consoleDebug';

/****
 * using debug from GitHub for debug messages
 * environment variable require DEBUG="soloist"
 * On windows set it from MyComputer or setx DEBUG 'soloist'
 * On linux use export DEBUG=soloist
 */

// init logging mode
module.exports.initLog = function() {

	if (process.env.SOLOIST_DEBUG === 'false') {
		logMode = 'logEntries';
		var filename = './log/' + process.env.SOLOIST_ENV + '.log';
		var options = {
				filename: filename,
				silent: false,

				maxsize: 1000 * 1000 * 4, // 4M
				maxFiles: 3
			},
			mailOptions = {
				to: "bandpad.co@gmail.com",
				from: "admin@bandpad.co",
				level: 'error'
			};

		console.log("starting winston logEntries service for logging at: " + filename);
		winston.add(winston.transports.File, options).
			add(Mail, mailOptions).
			remove(winston.transports.Console);
		winston.info('Init Winston Log');
	} else {
		console.log("starting consoleDebug service for logging");
	}

};

// errorType can be 'info' or 'error'
module.exports.log = function(str, errorType) {

	// on production and no debug use logs

	if (logMode === 'logEntries') {

		if (winston.hasOwnProperty(errorType)) {
			winston[errorType](str);
		} else {
			winston.info(str);
		}

	} else {
		debug(str);
	}
};

