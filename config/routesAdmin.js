/*jslint node: true */ 'use strict';
var
	log = require('../lib/hendrix').log;

module.exports = function(app, passport) {

	log("Staring admin routes..");

	/************
	 * Home route
	 * Sign in user with the local-passort, setting up session
	 * using custom callback http://passportjs.org/guide/authenticate/
	 */
		// login from translator root form

	app.post('/admin/login',
		passport.authenticate('local',{
			failureFlash: true,
			failureRedirect: '/admin/signIn'
		}),
		function(req, res, next) {
			if (req.user.profile !== 'admin' ){
				req.logout();
				var err = new Error("User is not Administrator");
				err.httpCode = 403;
				return next(err);
			} else {
				log("Login admin: " + req.user.username,'info');
				res.redirect('/admin');
			}
		});



	/**************
	 * Admin Routes
	 **************/
	var
		adminCtrl = require('../app/controllers/admin/adminCtrl'),
    adminTranslateCtrl = require('../app/controllers/admin/adminTranslateCtrl'),
		logCtrl = require('../app/controllers/log/logCtrl');


// login
	app.get('/admin/signUp', adminCtrl.fetchMessage, adminCtrl.signUp);
	app.get('/admin/signOut', adminCtrl.signOut);
	app.get('/admin/signIn', adminCtrl.fetchMessage, adminCtrl.signIn);

	//Post for sign up
	app.post('/admin/postSignUp', adminCtrl.postSignUp);

	/***********
	 * Translate
	 ***********/

		// update translate
	app.param('editTranslateId', adminTranslateCtrl.getTranslate);
	app.get('/admin/translate/edit/:editTranslateId',
		adminCtrl.authenticateAdmin,
		adminCtrl.fetchMessage,
		adminTranslateCtrl.edit);

	app.post('/admin/translate/editPost/addOrUpdatePost',
		adminCtrl.authenticateAdmin,
		adminTranslateCtrl.addOrUpdatePost);

	// add translate
	app.get('/admin/translate/add',
		adminCtrl.authenticateAdmin,
		adminCtrl.fetchMessage,
		adminTranslateCtrl.add);

	app.post('/admin/translate/addOrUpdatePost',
		adminCtrl.authenticateAdmin,
		adminTranslateCtrl.addOrUpdatePost);

	// remove translate
	app.param('removeTranslateId',adminTranslateCtrl.getTranslate);
	app.get('/admin/translate/remove/:removeTranslateId',
		adminCtrl.authenticateAdmin,
		adminCtrl.fetchMessage,
		adminTranslateCtrl.remove);

	app.get('/admin/translate/list',
		adminCtrl.authenticateAdmin,
		adminCtrl.fetchMessage,
		adminTranslateCtrl.list);


  /*******************
	 * Admin operations
	 */

		// Admin home
	app.get('/admin/',
		adminCtrl.fetchMessage,
		adminCtrl.root
	);

	/**************
	 * Logging
	 */

	app.get('/admin/system/log',
		adminCtrl.authenticateAdmin,
		adminCtrl.fetchMessage,
		logCtrl.logRender);
};

