/* globals $,console,tune */

$(document).ready( function() {
	"use strict";

// init chosen plugin in select boxes
	$(".select-chosen").each(function () {
		$(this).chosen({});
	});
});