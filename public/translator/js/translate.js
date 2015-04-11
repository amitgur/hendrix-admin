/* globals $,angular,console*/

$(document).ready( function(){
	"use strict";

	// init chosen plugin in select boxes
	$(".select-chosen").each(function(){
		$(this).chosen({});
	});

	$('#translate-tab a:first').tab('show'); // Select first tab

});

var app = angular.module('translatorSoloist',['ngTagsInput','ngTable','translatorServices','ui.utils','ngSanitize'])

	// config tag input
	.config([ 'tagsInputConfigProvider', function(tagsInputConfigProvider) {
		tagsInputConfigProvider
			.setDefaults('tagsInput', {
				replaceSpacesWithDashes: false,
				addOnComma: false
			});
	}]);

angular.module('translatorServices', ['ngResource']).
	factory('TranslatePagesSrv',['$resource', function($resource){
		"use strict";
		return $resource('/translator/getPagesLanguage');
	}]).
	factory('TranslateTunesSrv', [ '$resource', function($resource) {
		"use strict";
		return $resource('/translator/getTunesLanguage');
	}]).
	factory('TranslateTuneEditPost', [ '$resource', function($resource) {
		"use strict";
		return $resource('/translator/editTunePost');
	}]).
	factory('TranslateLocalTagsSrv', [ '$resource', function($resource) {
		"use strict";
		return $resource('/translator/restLocalTags');
	}]);

