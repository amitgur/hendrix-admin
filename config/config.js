/*jslint node: true */ 'use strict';

var _ = require('underscore');
var argv = require('optimist').argv;

// Load app configuration

module.exports = function(){

	var localConfig = {};

	process.env.MAGIC_WORD = 'Bananas';
	process.env.TRANSLATOR_MAGIC_WORD = 'PracticeIsFun';

	// NODE_ENV production or development
	// CONFIG_ENV name of config js file

	if (argv.localProduction){
		process.env.NODE_ENV = 'production';
		process.env.CONFIG_ENV = 'localProduction';

	} else if (argv.production){
		process.env.NODE_ENV = 'production';
		process.env.CONFIG_ENV = 'production';

	} else if (argv.remote) {
		process.env.NODE_ENV = 'development';
		process.env.CONFIG_ENV = 'remote';

	} else { //dev
		process.env.NODE_ENV = 'development';
		process.env.CONFIG_ENV = 'development';
	}

	// debug
	if (argv.mydebug){
		process.env.SOLOIST_DEBUG = true;
	} else {
		process.env.SOLOIST_DEBUG = false;
	}

	// get env js configuration
	var config =  _.extend(
		require(__dirname + '/../config/env/all.js'),
		require(__dirname + '/../config/env/' + process.env.CONFIG_ENV + '.js'));

	// add local configuration
	return( _.extend(config, localConfig));
};

