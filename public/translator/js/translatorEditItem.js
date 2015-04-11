app.controller('translatorTranslateEditItem',[ '$scope', '$window', 'TranslateTuneEditPost', function($scope, $window, TranslateTuneEditPost) {
    "use strict";

    // init inputs
    $window.fields.forEach(function(field) {
        $scope[field] = $window.tune['translated_'+field];
    });

    // init admin tags
    $scope.tags = $window.tune.tags;
    $scope.tagsLength = $window.tune.tags.length;

    // init language tags
    $scope.languageTags = $window.tune.languageTags.map(function(tag){
        return ({
            text: common.tagUnEscape(tag.text)
        });
    });

    // remove the chosen one from available
    // first prepare language tags in array
    var languageTags = $window.tune.languageTags.map(function(tag){
        return(tag.text);
    });
    $window.allLanguageTags.forEach(function(tag,idx) {
        if (languageTags.indexOf(tag.text) !== -1) {
            $scope['allLanguageTags_' + idx] = true;
        }
    });

    // language tag click from available tags
    $scope.tagClick = function(htmlTag){

        var foundTag = null,index = 0;

        // find that tag
        $window.allLanguageTags.forEach(function(tag,idx){
            if (tag.tag === htmlTag) {
                foundTag = tag;
                index = idx;
            }
        });
        if (foundTag === null) {
            $window.alert('Error finding tag 0002');
        }
        // add to ng-tags and change the local flag
        $scope.languageTags.push(foundTag);
        $scope['allLanguageTags_' + index] = true;
    }

    // remove tag
    $scope.tagRemoved = function(htmlTag) {
        var foundTag = null,index = 0;

        // find that tag
        $window.allLanguageTags.forEach(function(tag,idx){
            if (tag.text === htmlTag.text) {
                foundTag = tag;
                index = idx;
            }
        });
        if (foundTag === null) {
            $window.alert('Error finding tag 0003');
        }

        $scope['allLanguageTags_' + index] = false;
    };

    // post data on click with ng factory
    $scope.sendData = function (){
        var postObj = {};
        $window.fields.forEach(function(field) {
            postObj[field] = $scope[field];
        });

        postObj.languageTags = $scope.languageTags.map(function(tag){
            return common.tagEscape(tag.text);
        });
        postObj._id = $window.tune.tuneId;
        // post result
        TranslateTuneEditPost.save( postObj, function(response){
            if (response.status === 'ok') {
                $window.location='/translator/translateTunesList';
            }
        });
    };

}]);
