/* globals app */

// Tunes List
app.controller('translatorTranslateTunesList',[ '$scope', '$resource','$filter', '$window', 'ngTableParams', function($scope, $resource,  $filter, $window, ngTableParams) {
    "use strict";

    var data = $window.tunes;

    $scope.tableParams = new ngTableParams({
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
}]);

