/*jslint node: true */ 'use strict';
/**
 * Translation utils for other models
 */

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	Language = connectionDb.model('Language'),
	log = hendrix.log,
  fs = require('fs'),
  officeGen = require('officegen');




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

exports.createXsl = function(translate){

  var xlsx = officeGen( 'xlsx' );

  xlsx.on ( 'finalize', function ( written ) {
    log ( 'Finish to create an Excel file.\nTotal bytes created: ' + written + '\n' );
  });

  xlsx.on ( 'error', function ( err ) {
    log(err);
  });

  var  sheet = xlsx.makeNewSheet ();
  sheet.name = 'BandPad site text';

  translate.forEach(function(t,index){
    sheet.data[index+1] = [];
    sheet.data[index+1][0] = t.text;
    sheet.data[index+1][3] = t.key;
  });

  var out = fs.createWriteStream ( 'out.xlsx' );

  out.on ( 'error', function ( err ) {
    log ( err );
  });

  xlsx.generate ( out );

}



