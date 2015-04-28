/*jslint node: true */ 'use strict';

/***********************
 * Logging and Analytics
 */

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	log = hendrix.log,
	winston = require('winston'),
	time = require('time');

var t = 0;

// init ipDay on startup
var ipDay = new time.Date();
ipDay.setTimezone("Asia/Jerusalem");
ipDay = ipDay.getDate();
log("Initialize ipDay to: " + ipDay);

/********************************
 * DayStat
 * pages - score page counter by country
 * users - users counter by country, not counting crawlers
 *
 */

// render log page
exports.logRender = function(req,res,next) {

	var options = {

		// number of results
		limit: 1024,

		start: 0,
		order: 'desc'
	};

	winston.query(options, function (err, results) {

		if (err) {
			return next(err);
		}

		var pars = {
			username: req.user.username,
			message:	req.message,
			messageType:	req.messageType
		};

		if ( results.hasOwnProperty('file')) {
			results.file.forEach(function(entry){
				if (entry.level === 'error') {
					entry.level = 'danger';
				}
				entry.timestamp  = convertTime(entry.timestamp);
			});
			pars.log =  results.file;
		} else {
			return next(new Error('Working on console errors only'));
		}

		res.render('admin/logs/log.jade', pars);
	});
};


// convert unix string date to log display
function convertTime(date){

	var d = new time.Date(date);

	d.setTimezone("Asia/Jerusalem");

	var str = d.getDate() + "/" + (d.getMonth()+1) + " - " +  d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

	return str;
}

// render log page
exports.logTest = function(req,res,next) {

	log("testing message" + t);
	t++;
	res.send('OK');

};

// render log page
exports.logTestCritical = function(req,res,next) {

	log("testing critical message" + t);
	t++;
	t.info.stam = 10;
	res.send('OK');

};
