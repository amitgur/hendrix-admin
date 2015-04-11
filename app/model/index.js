/*jslint node: true */

module.exports = function(languagePages) {
	require('./language')(languagePages);
	require('./translate');
	require('./user');
}