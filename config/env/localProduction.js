/*jslint node: true */ 'use strict';

var conf = require('../../config');

module.exports = {
	db: conf.mongoProd,
	public: '/public',
	server: conf.urlDev,
	port: conf.port
}