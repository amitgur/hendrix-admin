/*jslint node: true */

/**
 * Module dependencies.
 */
var express = require('express'),
  passportClass = require('passport').Passport,
  passport = new passportClass(),
  hendrix = require('./lib/hendrix'),
  log = hendrix.log,
  bandpadConfig = require('../winter-bandpad/public/js/localConfig');


// Application environment default is develop
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// connect and init models
var connectionDb = require('./app/model/connectionDb.js');

// module.exports = connectionDb = mongoose.createConnection(config.db);

// init hendrix framework
hendrix.init(connectionDb, {

  debugFlag: process.env.SOLOIST_DEBUG,

  debugMail: 'bandpad.co@gmail.com',

  appName: bandpadConfig.APPNAME,

  appDesc: bandpadConfig.APPDESC,

  languagePages: bandpadConfig.languagePages,

  supportedLanguages: bandpadConfig.supportedLanguages,

  supportedCountries: bandpadConfig.supportedCountry
});

// Initialise passport
require('./config/passport')(passport);

// Init express
var app = express();

log('Loading ' + hendrix.getAppName());

// Start the app by listening on <port>
var port = require('./config').port;

// Express settings
require('./config/express')(app, passport);

log( "Express server listening on port " + port + " env: " + process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.listen(port);
} else {
  // localhost ip will prevent accessing through ip:port
  app.listen(port, '127.0.0.1');
}

//expose app
exports = module.exports = app;




