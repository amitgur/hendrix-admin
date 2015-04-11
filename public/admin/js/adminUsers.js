/* globals $,console,angular */

var app = angular.module('adminTable', ['ngTable']).
  controller('adminUserListCtrl',['$scope', '$rootScope', '$filter', '$window', 'ngTableParams',function($scope, $rootScope, $filter, $window, ngTableParams) {
    "use strict";

    var data = [], i = 0;

    $scope.confirmTeacher = function(email, name) {
      var conf = confirm("Are you sure you want to confirm " + name + " ?");
      if (conf) {

        // confirm teacher
        var pars = {
          email: email,
          name:name
        };

        $.post('/admin/confirmTeacher', pars, function (data) {

          if (data.status === 'ok') {
            // reload location from the server
            $window.location.reload(true);
          } else {
            alert("Error on server post, check the console");
            console.log(data.message);
          }

        }).error(function (data) {
          if (data.responseJSON) {
            alert(data.responseJSON.message + '\n\n' + data.responseJSON.stack);
          } else {
            alert(data.responseText);
          }
        });
      }
    };

    while($rootScope.dataList.hasOwnProperty(i.toString())) {

	    var exp = ($rootScope.dataList[i].payment) ?
		    $rootScope.dataList[i].payment.expired : "Not payed",paymentExpired;

	    if (exp !== 'Not payed') {
		    exp = new Date(exp);
		    paymentExpired = exp.getDate().toString() + '-' + (exp.getMonth() + 1) + '-' + exp.getFullYear();
	    } else {
		    paymentExpired = "Not payed";
	    }

     data.push({
        name:  $rootScope.dataList[i].name,
        email:$rootScope.dataList[i].username,
        teacherKey:$rootScope.dataList[i].teacherKey,
	      paymentExpired:paymentExpired,
        paymentType : $rootScope.dataList[i].paymentType,
        confirmed:$rootScope.dataList[i].confirmed,
        waitForConfirm:$rootScope.dataList[i].waitForConfirm
      });
      i++;
    }

    $scope.tableParams = new ngTableParams({
      page: 1,   // show first page
      count: 50, // count per page
      sorting: {
        name: 'asc' // initial sorting
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