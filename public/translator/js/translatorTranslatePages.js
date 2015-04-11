// Translate Pages Page

app.controller('translatorTranslatePages',[ '$scope', '$resource', '$window', 'TranslatePagesSrv', function($scope, $resource, $window, TranslatePagesSrv) {
	"use strict";

	// init translated text, get it from the Language in DB
	TranslatePagesSrv.get(function(srvData){
		var lines;
		$window.translate.forEach(function(doc){
				$scope[doc.key] = srvData[doc.page][doc.key];
				lines = srvData[doc.page][doc.key].length / 25;
			// change text area by number of lines
			$('textarea[name=' + doc.key + ']').attr('rows', Math.ceil(lines));
		});
	});

	// on key change enable btn
	$scope.change = function(key) {
		// change key color
		$('#btn' + key).removeAttr('disabled').addClass('btn-primary').removeClass('btn-default');
	};

	// on button pressed update server with new word
	$scope.update = function(key) {

		var page = $('textarea[name=' + key + ']').data('page');
		var last = $('textarea[name=' + key + ']').data('last');

		// change key color

		$('#btn' + key).attr('disabled','disabled').removeClass('btn-primary').addClass('btn-default');

		// save text
		var pars = {
			key: key,
			page: page,
			last: last,
			translatedText: $scope[key]
		};

		TranslatePagesSrv.save( pars,
			function(response){
				console.log("Success updating "+ key);
			},
			function(response){
				$('#page-error-text').text("  cannot update the server, please reload the page");
				$('#page-error').show();
			});
	};
}]);

