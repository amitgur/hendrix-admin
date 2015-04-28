/**
 * Created by Amit on 14/11/2014.
 */

var
	path = require('path'),
	jade = require('jade'),
	root = path.normalize(__dirname.slice(0,__dirname.length-4)),
	appDir = path.dirname(require.main.filename),
	express = require('express'),
	debug = require('debug')('hendrix'),
	winston = require('winston'),
	Mail = require('winston-mail').Mail,
	logMode = 'consoleDebug',
	_ = require('underscore'),
	connectionDb,
	hendrixPars;

module.exports.init = function(db, pars) {

	hendrixPars = pars;

	connectionDb = db;

	// register models
	require('./../app/model/index')(pars.languagePages);

	// init log
	initLog();

}

exports.getAppName = function(){
	return hendrixPars.appName;
};

exports.getAppDesc = function(){
	return hendrixPars.appDesc;
};

exports.getConnectionDb = function(){
	return connectionDb;
};

exports.getLanguagePages = function(){
	return hendrixPars.languagePages;
}

exports.getSupportedLanguages = function(){
	return hendrixPars.supportedLanguages;
}

exports.getSupportedCountries = function(){
	return hendrixPars.supportedCountries;
}

exports.getLanguage = function(req, res, next){
	return require('./language').getLanguage(req, res, next);
}
/* check language that comes in the url and set it if it is supported
 this if for avoiding fav icon and other js css files on same route
 */
exports.getLanguageParam = function(req, res, next, id){

	// check if parameter is a language
	if (hendrixPars.supportedLanguages.hasOwnProperty(id)) {
		req.language = id;
	} else {
		req.notLanguage = true;
	}
	next();
};

/****
 * Logging
 * using "debug" from GitHub for debug messages
 * environment variable require DEBUG="hendrix"
 * On windows set it from MyComputer or setx DEBUG 'hendrix'
 * On linux use export DEBUG=hendrix
 */

// init logging mode
initLog = function() {

	if (hendrixPars.debugFlag === 'false') {
		logMode = 'logEntries';
		var filename = './log/' + hendrixPars.appName + '.log';
		var options = {
				filename: filename,
				silent: false,

				maxsize: 1000 * 1000 * 4, // 4M
				maxFiles: 3
			},
			mailOptions = {
				to: hendrixPars.debugMail,
				from: '',
				level: 'error'
			};

		console.log("starting winston logEntries service for logging at: " + filename);
		winston.add(winston.transports.File, options).
			add(Mail, mailOptions).
			remove(winston.transports.Console);
		winston.info('Init Winston Log');
	} else {
		debug("starting console debug service for logging");
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


