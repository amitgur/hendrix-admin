/*jslint node: true */ 'use strict';

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	User = connectionDb.model('User'),
	log = hendrix.log,
	_ = require('underscore');

// Sign in
exports.signIn = function(req, res) {

	res.render('admin/signIn',{
		message: req.message,
		messageType: req.messageType,
	});
};

// Admin Sign Up
exports.signUp = function(req, res) {

	res.render('admin/signUp', {
		message: req.message,
		messageType: req.messageType
	});

};

// SignUp Admin Post
exports.postSignUp = function(req, res, next) {

	if (req.body.magicword !== process.env.MAGIC_WORD) {
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
			return res.redirect('admin/signUp');
		}
		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}
			return res.redirect('/admin');
		});
	});
};

// sign out from admin
exports.signOut = function(req, res) {
	req.logout();
	res.redirect('/admin');
};

exports.authenticateAdmin = function(req, res, next) {

	var err;

	if (!req.user) {
		err = new Error("User must log in to this page");
		err.httpCode = 403;
		return next(err);
	}
	req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 60; // 2 month session

	if (req.user.profile !== 'admin'){
		req.logout();
		err = new Error("User is not administrator");
		err.httpCode = 403;
		return next(err);
	}

	// log("Authenticate administrator " + req.user.username);
	return next();
};

// get message from flash to req.message and req.messageType
exports.fetchMessage = function(req, res, next){

	// get flash message
	var msg = req.flash();
	if (msg.hasOwnProperty('error')) {
		req.message = "   " + msg.error[0];
		req.messageType = 'error';
	} else if (msg.hasOwnProperty('info')) {
		req.message = "   " + msg.info[0];
		req.messageType = 'info';
	}	else {
		req.message = null;
	}

	return next();
}
// root directory for admin
exports.root = function(req, res) {

	var user;
	// admin root only shows name if exist
	if (req.user && req.user.profile === 'admin') {
		user = req.user.username;
	} else {
		user = null;
	}

	res.render('admin/index', {
		username: user,
		appDesc: require('../../../lib/hendrix').getAppDesc(),
		message: req.message,
		messageType: req.messageType
	});
};



