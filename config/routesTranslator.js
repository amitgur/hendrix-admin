/*jslint node: true */ 'use strict';
var
	log = require('../lib/hendrix').log;


module.exports = function(app, passport) {

	log("Staring translator routes..");

	// login from translator root form
	app.post('/translator/login',
		passport.authenticate('local',{
			failureFlash: true,
			failureRedirect: '/translator'
		}),
		function(req, res, next) {
			if (req.user.profile !== 'admin' && req.user.profile !=='translator'){
				req.logout();
				var err = new Error("User is not a Translator");
				err.httpCode = 403;
				return next(err);
			} else {
				log("Login: " + req.user.username);
				res.redirect('/translator');
			}
		});

	/**************
	 * Translator Routes
	 **************/

	var translatorCtrl = require('../app/controllers/translator/translatorCtrl');
	var adminCtrl = require('../app/controllers/admin/adminCtrl');
	var translateUtilsCtrl = require('../app/controllers/translator/translateUtilsCtrl');
	var logCtrl = require('../app/controllers/log/logCtrl');


	// login
	app.get('/translator/signUp', adminCtrl.fetchMessage, translatorCtrl.signUp);
	app.get('/translator/signOut', translatorCtrl.signOut);
	// sign in is part of the root page
	//Post for sign up
	app.post('/translator/postSignUp', translatorCtrl.postSignUp);

	// translate pages
	app.get('/translator/translatePages',
		translatorCtrl.authenticateTranslator,
		adminCtrl.fetchMessage,
		translatorCtrl.translatePages);

	// translate pages
	app.get('/translator/translatePrint',
		translatorCtrl.authenticateTranslator,
		adminCtrl.fetchMessage,
		translatorCtrl.translatePrint);

	/******************************
	 * REST API for translator page
	 */

		// translate tunes
		// get all translate strings
	app.get('/translator/getPagesLanguage',
		translatorCtrl.authenticateTranslator,
		adminCtrl.fetchMessage,
		translateUtilsCtrl.getAll,
		function(req,res){
			res.json( req.languageStrings );
		}
	);

	// update one word only
	app.post('/translator/getPagesLanguage',
		translatorCtrl.authenticateTranslator,
		adminCtrl.updateLanguageVersion,
		translatorCtrl.updateTranslatorWord,
		translatorCtrl.updateLanguageWord,
		function(req,res){ // return ok
			res.json({status: "ok"});
		}
	);

	// translator home
	app.get('/translator',
		adminCtrl.fetchMessage,
		translatorCtrl.root);

}