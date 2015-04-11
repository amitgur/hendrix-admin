/**
 * Schema for User
 * @type {exports|*}
 */


var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	connectionDb = require('./connectionDb'),
	crypto = require('crypto'),
	_ = require('underscore');


/**
 * User Schema
 */
var UserSchema = new Schema({
	name: String,
	username: {
		type: String,
		unique: true
	},

  hashed_password: String,
	salt: String,
	language: {type: String, default: "en"},
	country: {type: String, default: ""},
	profile: {type: String, default: "user"}
});

/**
 * Virtual
 */
UserSchema.virtual('password').set(function (password) {

	this._password = password;
	this.salt = this.makeSalt();
	this.hashed_password = this.encryptPassword(password);

}).get(function () {
	return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function (value) {
	return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function (name) {
	return name.length;
}, 'Name cannot be blank');

UserSchema.path('username').validate(function (username) {
	return username.length;
}, 'username cannot be blank');

UserSchema.path('username').validate(function (username) {
	return username.length;
}, 'username cannot be blank');

UserSchema.path('hashed_password').validate(function (hashed_password) {
	return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
	if (!this.isNew) return next();

	if (!validatePresenceOf(this.password)) {
		next(new Error('Invalid password'));
	}
	else {
		next();
	}
});

/**
 * Methods
 */
UserSchema.methods = {
	/**
	 * Authenticate - check if the passwords are the same
	 *
	 * @param {String} plainText
	 * @return {Boolean}
	 * @api public
	 */
	authenticate: function (plainText) {

		var auth = this.encryptPassword(plainText) === this.hashed_password;
		return auth;
	},

	/**
	 * Make salt
	 *
	 * @return {String}
	 * @api public
	 */
	makeSalt: function () {
		return crypto.randomBytes(16).toString('base64');
	},

	/**
	 * Create an encrypt password
	 *
	 * @param {String} password
	 * @return {String}
	 * @api public
	 */
	encryptPassword: function (password) {
		if (!password || !this.salt) return '';
		salt = new Buffer(this.salt, 'base64');
		return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	}
};

module.exports = connectionDb.model('User', UserSchema);
