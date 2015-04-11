/*jslint node: true */ 'use strict';
/**
 * Translation utils for other models
 */

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	Language = connectionDb.model('Language'),
	log = hendrix.log;



// get all translation for language
exports.getAll = function(req,res, next) {

	getTranslate(req, res, next, "");
};


// get translate string from db
function getTranslate(req, res, next, getStr) {

	Language.findOne({ language: req.language },getStr + " -_id", function(err, lang){

		if (err) {
			return next(err);
		}
		if (!lang) {
			return next(new Error('Failed to find language ' + req.language));
		}

		req.languageStrings = lang.toObject();

		return next();
	});
}





