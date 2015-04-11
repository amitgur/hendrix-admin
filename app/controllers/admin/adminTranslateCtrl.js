/*jslint node: true */ 'use strict';

/**
 * Translate Controller
 */

var
	hendrix = require('../../../lib/hendrix'),
	connectionDb = hendrix.getConnectionDb(),
	Translate = connectionDb.model('Translate'),
	TranslateArchive = connectionDb.model('TranslateArchive'),
	Language = connectionDb.model('Language'),
	supportedLanguages = hendrix.getSupportedLanguages(),
	log = hendrix.log;



// List all translate docs
exports.list = function(req, res, next) {


	Translate.find().select('key page text').exec( function (err, list) {

		if (err) {
			return next(err) ;
		}

		res.render('admin/translate/list.jade', {
				translateList: list,
				pages: hendrix.getLanguagePages(),
				username: req.user.username,
				message: req.message,
				messageType: req.messageType

			}
		);
	});
};

// edit translate
exports.edit = function(req,res, next) {

	res.render('admin/translate/addOrUpdate.jade', {
		translate: req.translate,
		title: "Edit translate",
		disabled: true,
		username: req.user.username

	});
};

// add translate
exports.add = function(req,res, next) {

	res.render('admin/translate/addOrUpdate.jade', {
			translate: {},
			title: "Add translate",
			disabled: false,
			username: req.user.username
		}
	);
};



// add or update post
exports.addOrUpdatePost = function(req,res, next) {

	var
		doc = req.body,
		id = req.body._id;

	// check if values exist in body
	var values = ['page', 'key', 'text'];

	for (var i=0 ; i<values.length ; i++)	{
		if (!doc.hasOwnProperty(values[i])) {
			return next(new Error("New translate has no " + values[i] +" value"));
		}
	};

	delete doc._id;

	if (id) { // update

		Translate
			.findByIdAndUpdate(	id,	doc, { upsert: true }, function(err, result){
				if (err) {
					return next(err);
				}
				req.flash('info', "Updated translate document, key is " + result.key);
				res.redirect('/admin/translate/list');
			});
	} else { // add

		// add all words to language in db
		insertLanguagePages(req, res, doc, function(err, pages){

			if (err) {
				req.flash('error', err);
			} else {

				// save new translated text as english in all translate pages
				doc.translator = {};
				doc.translatedText = {};

				for (var language in supportedLanguages){
					doc.translatedText[language] = doc.text;
					doc.translator[language] = {
						name: "Not set",
						last: "",
						date: 0
					};
				};

				var newTranslate  = new Translate(doc);
				newTranslate.save(	function(err, result){
					if (err) {
						return next(err);
					}

					req.flash('info', "Added new translate document, key is " + doc.key);
					res.redirect('/admin/translate/list');

				});
			}

		});
	}
};

// remove translate doc by moving it to archive
exports.remove = function(req, res, next) {

	// save xml data to archive
	var record = new TranslateArchive(req.translate);

	record.save(function(err) {

		if (err) {
			return next(err);
		}
	});

	log("Removing Translate: " + req.translateId);

	// remove all words to language in db
	removeLanguagePages(req, res, req.translate.page, req.translate.key, req.translate.text, function(err, pages){
		if (err) {
			req.flash('error', err);
		}
	});

	// remove translate

	Translate.findByIdAndRemove(req.translateId, function(err) {

		if (err) {
			return next(err);
		} else {
			log("Remove translateId id: " + req.translateId);
			req.flash('info', "Remove translate: " + req.translate.key);
			return res.redirect('/admin/translate/list');
		}
	});
};


// get translate doc by id
exports.getTranslate = function(req,res, next, id) {

	req.translateId = id;

	Translate
		.findOne({
			_id: id
		})
		.exec(function(err, translate) {
			if (err) {
				return next(err);
			}
			if (!translate) {
				return next(new Error('Failed to load Translate ' + id));
			}
			req.translate = translate;
			next();
		});
};

// insert one word in all pages by: page, key, text
function insertLanguagePages(req, res, doc, callback ) {

	// update pages in all languages
	var select = {'$set':{}};

	// add current word
	select.$set[doc.page + '.' + doc.key] = doc.text;

	Language.update( {}, select, {upsert:true, multi:true}, function(err,result){

		if (err)  {
			callback(err);
		}
		return callback(null);
	});
}


// remove one word in all pages by: page, key, text
function removeLanguagePages(req, res, page, key, text, callback ) {

	Language.find({}, page + " language -_id", function(err, pages){

		if (err) {
			return callback(err, null);
		}

		if (!pages[0].toObject().hasOwnProperty(page)) {
			return callback('Failed to find page ' + page, null);
		}
		var cbError = null;

		// update pages in all languages
		pages.forEach(function(doc, index){

			doc = doc.toObject();

			// remove current word
			delete doc[page][key];

			Language.update( { language: doc.language }, { $set: doc}, function(err,result){
				if (err)  {
					cbError =  'Error updating language page :' + err;
				} else if (!result) {
					cbError =  'Error finding language page :' + page;
				}
				// return on the last callback
				if (index === (pages.length-1)) {
					return callback(cbError, pages);
				}
			});
		});
	});
}

