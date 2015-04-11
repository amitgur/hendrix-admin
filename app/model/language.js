/**
 * Success schema
 *
 * @type {exports|*}
 */

var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	connectionDb = require('../../lib/hendrix').getConnectionDb();


//  create language schema by language pages as defined in hendrix init
module.exports = function(languagePages){

	var schemaObj = {};

	schemaObj.language = {type: String, unique: true};

	languagePages.forEach(function(page){
		schemaObj[page] = Schema.Types.Mixed;
	});

	var LanguageSchema = mongoose.Schema(schemaObj);

	connectionDb.model('Language', LanguageSchema);

}



