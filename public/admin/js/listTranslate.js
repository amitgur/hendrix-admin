$(document).ready( function(){

	$('#admin-translate-tab a').click(function (e) {
		e.preventDefault()
		$(this).tab('show');
	});

	$('#admin-translate-tab a:first').tab('show'); // Select first tab
});




var app = angular.module('adminTable', ['ngTable']).
	controller('adminListCtrl',function($scope, $rootScope, $filter, $window, ngTableParams) {

		var pagesData = {};

		// rearrange translate data by pages
		$window.pages.forEach(function(page){

			// create object of arrays per page
			pagesData[page] = [];
		});

		$rootScope.dataList.forEach(function(data){

			// push doc by their pages
			pagesData[data.page].push(data);
		});

		// create ng table
		$window.pages.forEach(function(page){

			var data = pagesData[page];

			$scope['tableParams'+page] = new ngTableParams({
				page: 1,   // show first page
				count: 50, // count per page
				sorting: {
					scoreName: 'asc' // initial sorting
				}
			},{
				total: data.length, // length of data

				getData: function($defer, params) {

					var filteredData = params.filter() ?
						$filter('filter')(data, params.filter()) :
						data;
					var orderedData = params.sorting() ?
						$filter('orderBy')(filteredData, params.orderBy()) :
						data;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});
		});

		// delete translate
		$scope.removeTranslate = function(id){

			var conf = confirm("Are you sure you want to delete this translate ?");
			if (conf) {
				console.log("deleting translate" + id );
				window.location = "/admin/translate/remove/" + id;
			}
		};


	})