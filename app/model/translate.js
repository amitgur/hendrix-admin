/**
 * Translate schema
 *
 * @type {exports|*}
 */


var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	connectionDb = require('../../lib/hendrix').getConnectionDb();

var TranslateSchema = mongoose.Schema({

	key: {type: String, unique: true},
	language: String,
	page: {type: String},
	text: String,
	translatedText: Schema.Types.Mixed,
	lastTranslate: String,
	description: String,
	exampleLink: String,
	examplePicture: String,
	translator: Schema.Types.Mixed

});

module.exports = connectionDb.model('Translate', TranslateSchema);
module.exports.TranslateArchive = connectionDb.model('TranslateArchive', TranslateSchema);
