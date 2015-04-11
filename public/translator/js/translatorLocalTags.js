/* globals app,confirm,prompt,common */

app.controller('translatorLocalTags',['$scope', '$window','$filter', 'ngTableParams', 'TranslateLocalTagsSrv', function($scope, $window,  $filter, ngTableParams, TranslateLocalTagsSrv ) {
    "use strict";

    // inner function
    function deleteTag(tag,tagText){
        TranslateLocalTagsSrv.delete({
            tag:tag,
            text: tagText
        }, function(response) {
            if (response.status === 'ok') {
                // refresh the page
                $(window).scrollTop(0);
                $window.location.reload(true);
            } else {
                console.log("error deleting tag: " + tagText);
            }
        });
    }

    // remove tags
    $scope.removeTag = function(tag, tagText){

        // un escape
        tag = common.tagEscape(tag);
        tagText = common.tagEscape(tagText);

        var conf = confirm("Are you sure you want to delete this tag ?");

        if (conf) {
            // delete tag
            TranslateLocalTagsSrv.get({
                tag:tag,
                text: tagText
            }, function(response){
                if (response.status === 'tagWithTunes') {
                    setTimeout(function() {
                        var msg = "There are tunes with that tag!: ";
                        response.tunes.forEach(function (tune) {
                            msg += tune + ',';
                        });
                        var confDel = confirm(msg);

                        if (confDel) {
                            deleteTag(tag,tagText);                        }
                    },1000);
                } else if (response.status === 'canDelete') {
                    deleteTag(tag,tagText);
                }
            });
        }
    };

    // edit tags

    $scope.editTag = function(tag,tagText) {

        // un escape
        tag = common.tagEscape(tag);
        tagText = common.tagEscape(tagText);

        var newText = prompt("Please enter new tag", "");
        if (newText) {
            // update tag
            TranslateLocalTagsSrv.save({
                tag: tag,
                text: tagText,
                newText: newText
            }, function (response) {
                if (response.status === 'ok') {

                    // refresh the page
                    $(window).scrollTop(0);
                    $window.location.reload();
                }
            });
            console.log("updating tag: " + tag);
        }
    };


    var data = $window.allLanguageTags.map(function(tag){
        tag.text = common.tagUnEscape(tag.text);
        return (tag);
    });

    $scope.tableParams = new ngTableParams({
        page: 1,   // show first page
        count: 50, // count per page
        sorting: {
            tags: 'asc' // initial sorting
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