/*jslint node: true */ 'use strict';

var
	requestIp = require('request-ip'),
	hendrix = require('./hendrix'),
	supportedCountries = hendrix.getSupportedCountries(),
	geoIp = require('geoip-lite'),
	log = hendrix.log;

/**
 * Set user language cookie
 */
exports.setLanguageCookie = function setCookie(res, par) {
	res.cookie('hendrix_language', par, { maxAge: 1000 * 60 * 60 * 24 * 365 }); // one year
};

/**
 * Get language for request
 * 1. if user have language, return that language
 * 2. else if there is cookie language use it, setting the cookie is done by select on browser
 * 3. else call rest service and get the language
 */
exports.getLanguage = function (req, res, next) {

  //  log("getLanguage: " + req.protocol + '://' + req.get('host') + req.originalUrl);

	// if language already detected.. return (xx unknown language from phonegap)
	if (req.language && req.language !== 'xx') {
		// log("found language in reg: " + req.language);
		return next();
	}

	// check if user logged in
	if (req.user) {

		req.language = req.user.language;
		log("Using user language: " + req.language);
		return next();

	} else { // no log in

		// first checking for language cookie, this cookie is set on the first visit
		if (!req.cookies.hendrix_language) {

			var clientIp = requestIp.getClientIp(req); // on localhost > 127.0.0.1
			req.language = getLanguageByIp(clientIp);

			// set cookie for next time
			exports.setLanguageCookie(res, req.language);
			// log("Language detected and set to cookie: " + req.language);
			return next();

		} else {

			// get language from cookie
			req.language = req.cookies.hendrix_language;
			// log("Setting language by cookie: " + req.language);
			return next();
		}
	}
};


// find counties and update database
function getLanguageByIp(ip){

	// get the country
	var geo = geoIp.lookup(ip);

	if (geo){
		if (supportedCountries.hasOwnProperty(geo.country)){
			// log("Country detected: " + geo.country + " ip: " + ip);
			return(supportedCountries[geo.country]);
		} else {
			// log("Country: " + geo.country + " not supported");
			return("en");
		}
	} else {
		log("Country cannot be found for ip " + ip);
		return("en");
	}
}
