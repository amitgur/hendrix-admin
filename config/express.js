/*jslint node: true */ 'use strict';

/**
 * Initialize application express middlewares and environment
 */

var
	express = require('express'),

	compression = require('compression'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon'),
	session = require('express-session'),
	path = require('path'),
	cors = require('cors'),

	mongoStore = require('connect-mongo')(session),
	flash = require('connect-flash'),
	config = require('./config')(),
	log = require('../lib/hendrix').log,
	connectionDb = require('../app/model/connectionDb');

module.exports = function(app, passport) {

	if (process.env.NODE_ENV === 'development' || process.env.SOLOIST_DEBUG === 'true') {

		// Show stack on errors
		app.set('showStackError', true);
		/*
		 The app.locals.pretty = true line causes Jade to render templates with indentation and newlines.
		 otherwise it spits out a single line of HTML. http://dailyjs.com/2012/09/13/express-3-csrf-tutorial/
		 */
		app.locals.pretty = true;

	} else {
		app.set('showStackError', true);

		// this with false cause bad positioning in jukebox
		app.locals.pretty = true;
	}

	// todo: remove cors before production
	app.use(cors());

	// compress all requests
	app.use(compression());

	app.set('views',  path.normalize(__dirname + '/..') + '/app/views');
	app.engine('jade', require('jade').__express);
	app.set('view engine', 'jade');

	app.use(cookieParser());

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

  app.use(session({
		resave: true,
    saveUninitialized: true,
		secret: 'MaZeMeshane',
		store: new mongoStore({
			db: connectionDb.db,
			collection: 'sessions',
      ttl: 1 * 24 * 60 * 60 // = 14 days. Default
		})
	}));

	// flash messages
	app.use(flash());

	// Use passport session
	app.use(passport.initialize());
	app.use(passport.session());

  // add admin routes
  require('../config/routesAdmin')(app, passport);

  // add translator routes
  require('../config/routesTranslator')(app, passport);

  // add static
  app.use('/admin', express.static('./public'));

  /*****
	 * Error Handling
	 */

	app.use(function(err, req, res, next) {

		var stack = null, pars = {};

  	var user;

		if (req.user) {
			user = req.user.username;
		} else {
			user = 'NoUser';
		}

		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		// show stack error only in develop
		stack = err.stack;
		log("Error in Application, User: " + user +
			" Url: " + fullUrl + " ip: " + ip + " , code " +	err.httpCode +
			"\n\nMessage: " + err.message +
			"\n\n\n" + stack, 'error');

		if(/application\/json/.test(req.get('Accept'))) {

			// json format
			if (err.httpCode === 403) {
				res.status(403).json({ message: "403 - unauthorized: " + err.message });
			} else {
				res.status(500).json({ message: "500 - Error: " + err.message , stack: stack});
			}

		} else {
			// Unauthorized
			if (err.httpCode === 403) {
				res.status(403).render('403', {
					message: err.message
				});
			} else {
				// Error page
				res.status(500).render('500', {
					message: err.message,
					error: stack
				} );
			}
		}
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res, next) {

		var pars = {};

		if(/application\/json/.test(req.get('Accept'))) {

			// response in json format
			var url =  req.protocol + '://' + req.get('host') + req.originalUrl;
			res.status(404).json('404', { message: "404 - Cannot find URL - " + url });

		} else { // response is html

      var pars = {
        url: req.originalUrl
      };

			res.status(404).render('404.jade', pars);
		}

	});
//	});
};
