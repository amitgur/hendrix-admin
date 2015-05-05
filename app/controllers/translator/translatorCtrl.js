/*jslint node: true */ 'use strict';

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	User = connectionDb.model('User'),
	Translate = connectionDb.model('Translate'),
	Language = connectionDb.model('Language'),
	languages = require('languages'),
	countryCodes = require('country-data'),
	supportedLanguages = hendrix.getSupportedLanguages(),
	appDesc = hendrix.getAppDesc(),
	log = require('../../../lib/hendrix').log,
  translateUtilsCtrl = require('./translateUtilsCtrl');

/***
 * Translator Sign Up
 */
exports.signUp = function(req, res) {

	var langCodes = languages.getAllLanguageCode(),
		lang = [],countries = [];

	for (var i = 0 ; i <langCodes.length; i ++ ) {
		lang.push({
			code: langCodes[i],
			languageName: languages.getLanguageInfo(langCodes[i]).name
		});
	}

	for (var country in countryCodes.countries) {
		if (country.length === 2)
		countries.push({
			country : countryCodes.countries[country].name,
			iso: country
		});
	}

	res.render('translator/signUp', {
		languages: lang,
		countries: countries,
		message: req.message,
		messageType: req.messageType
	});
};


// SignUp Translator
exports.postSignUp = function(req, res, next) {

	if (req.body.magicword !== process.env.TRANSLATOR_MAGIC_WORD) {
		var info =
			"name: " + req.body.name +
			", username: " + req.body.username +
			", email: " + req.body.email;
		return next(new Error("Wrong magic word entered " + info));
	}

	var user = new User(req.body);
	var message = null;

	user.save(function(err) {
		if (err) {
			log("Error in create user: " + err, 'error');
			switch(err.code){
				case 11000:
				case 11001:
					message = '  Username already exists';
					break;
				default:
					message = '  Please fill all the required fields';
			}
			req.flash('error', message);
			return res.redirect('/translator/signUp');
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}
			return res.redirect('/translator');
		});
	});
};

exports.signOut = function(req, res) {
	req.logout();
	res.redirect('/translator');
};


// root directory for translator
exports.root = function(req, res) {

	var pars = {
		message: req.message,
		messageType: req.messageType,
		appDesc: appDesc
	};

	if (req.user) {
		pars.username = req.user.username;
		pars.languageDesc = supportedLanguages[req.user.language].englishName;
	}
	res.render('translator/index', pars);
};

// authenticate translator
exports.authenticateTranslator = function(req, res, next) {

	var err;

	if (!req.user) {
		err = new Error("User must log in to this page");
		err.httpCode = 403;
		return next(err);
	}

	if (req.user.profile !== 'admin' && req.user.profile !=='translator'){
		req.logout();
		err = new Error("User " + req.user.username + " must be Translator in order to login to this page");
		err.httpCode = 403;
		return next(err);
	}

	log("Authenticate Translator " + req.user.username);

	// translator language is set from his details
	req.language = req.user.language;

	return next();
};


// generate translation page for current language
exports.translatePages = function(req, res, next) {

	var language = req.user.language;

	// check if language is supported
	if (!supportedLanguages.hasOwnProperty(language)) {
		return next(new Error("Your language is not supported yet, please contact Wind Soloist Support"));
	}

	var query = {
		key : true,
		page: true,
		text: true,
        description: true,
		exampleLink: true
	};
	query['translator.' + language] = true;
	query['translatedText.' + language] = true;

	Translate.find({}, query, function(err,translate){

		// create parameters for jade
		var pars = {
			languagePages: hendrix.getLanguagePages(),
			language: language,
			languageDesc: supportedLanguages[language].englishName ,
			translate: translate,
			username: req.user.username,
			isRtl : checkLanguageDirection(language)		};

		res.render('translator/translatePages', pars);

	});
};

// generate translation page for current language
exports.translatePrint = function(req, res, next) {

	var language = req.user.language;

	// check if language is supported
	if (!supportedLanguages.hasOwnProperty(language)) {
		return next(new Error("Your language is not supported yet, please contact Wind Soloist Support"));
	}

	var query = {
		key : true,
		page: true,
		text: true,
		exampleLink: true
	};
	query['translator.' + language] = true;
	query['translatedText.' + language] = true;

	Translate.find({}, query, function(err,translate){

    if (err){
      next(err);
    }

    translateUtilsCtrl.createXsl(translate);

		// create parameters for jade
		var pars = {
			languagePages: hendrix.getLanguagePages(),
			language: language,
			languageDesc: supportedLanguages[language].englishName ,
			translate: translate,
			username: req.user.username,
			isRtl : checkLanguageDirection(language)
		};
		res.render('translator/translatePrint', pars);

	});
};

// change one documents in Translate, REST service
exports.updateTranslatorWord = function(req, res, next) {

	var query = { $set : {}};

	query.$set['translatedText.' + req.language] = req.body.translatedText;
	query.$set['translator.'+ req.language +'.date'] = new Date();
	query.$set['translator.'+ req.language + '.last'] = req.body.last;
	query.$set['translator.'+ req.language + '.name'] = req.user.username;


	// get all translate
	Translate.update(
		{	key: req.body.key },
		query,
        {upsert:true},
		function(err){
			if (err){
				return next(err);
			} else {
				next();
			}
		});
};

// change one word in Language, REST service
exports.updateLanguageWord = function(req, res, next) {

	// new word to set in db
	var newWord = req.body;

	var query = { $set : {}};

	query.$set[newWord.page + '.' + newWord.key] = newWord.translatedText;

	// update query
	Language.findOneAndUpdate(
		{	language: req.language },
		query,
        {new:true,upsert:true}, // create new if needed
		function(err,newDoc){
			if (err){
				return next(err);
			} else {
				return next();
			}
		});
};


function checkLanguageDirection(lang){
	var rtl = false;
	switch (lang) {
		case 'he':
			rtl = true;
			break;
		default:
			break;
	}
	return rtl;
}
