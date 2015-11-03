/**
 * Schema for Book
 * @type {exports|*}
 */

/**
 * Module dependencies.
 */
var
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    connectionDb = require('./connectionDb');


/**
 * System Schema
 */
var SystemSchema = new Schema({
    key: {type: String, unique: true, default: 'systemDocument'},
    tunesVersion:{type: Number,default: 1},
    languageVersion:{type: Number,default: 1}
});

module.exports = connectionDb.model('System', SystemSchema);
