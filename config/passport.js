/*jslint node: true */ 'use strict';

var
  LocalStrategy = require('passport-local').Strategy,
  log = require('../lib/hendrix').log;



module.exports = function(passport) {

  var
    connectionDb = require('../app/model/connectionDb'),
    Users = connectionDb.model('User');

  // Serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Users.findOne({
      _id: id
    }, '-salt -hashed_password', function(err, user) {
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy(	function(username, password, done) {
      Users.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'passportUnknownUsername'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'passportInvalidPassword'
          });
        }
        return done(null, user);
      });
    }
  ));
};

module.exports.getUser = function(username, password, done) {

	var
		connectionDb = require('../app/model/connectionDb'),
		Users = connectionDb.model('User');

	Users.findOne({
		username: username
	}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, {
				message: 'passportUnknownUsername'
			});
		}
		if (!user.authenticate(password)) {
			return done(null, false, {
				message: 'passportInvalidPassword'
			});
		}
		return done(null, user);
	});
}

