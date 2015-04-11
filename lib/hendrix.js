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

// check language that comes in the url and set it if it is supported
module.exports.getLanguageParam = function(req, res, next, id){

	// check if parameter is a language
	if (hendrixPars.supportedLanguages.hasOwnProperty(id)) {
		require('./language').setLanguageCookie(res, id);
		req.language = id;
	} else {
		req.notLanguage = true;
	}
	// fav icon also go through root
	next();
};

exports.getLanguageDocs = function(language, docs, callback){

	var
		Language = connectionDb.model('Language');

	// get language parameters
	var languageSelect = {
		language: language,
		_id: false
	};

	docs.forEach(function(doc){
		languageSelect[doc] = true;
	});

	Language
		.findOne({language: language}, languageSelect).lean().exec(function (err, languageDocs) {

			if (err) {
				return callback(err);

			} else if (!languageDocs) {

				// if document doesn't exist, create it
				var instance = new Language();
				instance.language = language;
				instance.save(function (err) {
					if (err) {
						return callback(err);
					}
					return callback(null,{});
				});

			} else if (languageDocs.toString() === "{}") {
				return callback(new Error("Cannot find Language in Database (E004): " + language));
			}

			if (objectDepth(languageDocs)>1) {
				var pars = {}
				for (var page in languageDocs) {
					pars = _.extend(pars, languageDocs[page]);
				}
				return callback(null, pars);
			} else {
				return callback(null, languageDocs);
			}


		});
}
function objectDepth(object, level){

	// Returns an int of the deepest level of an object
	level = level || 1;

	var key;
	for(key in object){
		if (!object.hasOwnProperty(key)) continue;

		if(typeof object[key] == 'object'){
			level++;
			level = objectDepth(object[key], level);
		}
	}

	return level;
}



exports.getComponentLanguagePars = function(req, comp, languageDocs, callback) {

	var pars = exports.getComponentParameters(req, comp);

	exports.getLanguageDocs(pars.language, languageDocs, function (err, languageDocs) {

		if (err) {
			return callback(err);
		}

		pars = _.extend(pars, languageDocs);

		return callback(null, pars);
	});

};


exports.getComponentParameters = function(req, comp) {

	var pars = {

		// global node parameters
		dist:process.env.NODE_ENV,

		supportedLangs:  hendrixPars.supportedLanguages,

		moduleName: comp

	};

	// collect req pars
	['language', 'message', 'messageType'].forEach(function(prop){
		if (req.hasOwnProperty(prop)){
			pars[prop] = req[prop];
		}
	});

	// rtl
	if (pars.hasOwnProperty('language')){
		pars.isRtl = checkLanguageDirection(pars.language);
	}

	// js css files
	var
		jsFiles = require(appDir + '/public/' + comp + '/build/jsFiles.json'),
		cssFiles = require(appDir + '/public/' + comp + '/build/cssFiles.json');

	if (jsFiles.hasOwnProperty('files')){
		pars.jsFiles = jsFiles.files;
	}
	if (cssFiles.hasOwnProperty('files')){
		pars.cssFiles = cssFiles.files;
	}

	// user
	if (req.hasOwnProperty('user')){
		pars.user = req.user;
	} else {
		pars.user = null;
	}

	return pars;
}

exports.getAdminTopMenu = function(req){

	var html,
		pars = {
		appDesc: exports.getAppDesc(),
		message: req.message,
		messageType: req.messageType
	};

	if (req.hasOwnProperty('user')) {
		pars.username = req.user.username;
	} else {
		pars.username = null;
	}

	return jade.renderFile(root + '/app/views/admin/admin_menu.jade',pars);

};

function checkLanguageDirection(language) {

	var rtl = false
	switch (language) {
		case 'he':
			rtl = true;
			break;
		default:
			break;
	}
	return rtl;
};