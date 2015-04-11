/*jslint node: true */ 'use strict';

var conf = require('../../config');

module.exports = {
	db: conf.mongoProd,
	public: '/public',
  server: conf.urlProd,
	port: conf.port
}

