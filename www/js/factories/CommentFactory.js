angular.module('sceneIt.CommentFact', [])

.factory('commentFactory', function($ionicLoading, $ionicPopup, MapFactory){

  // Shows loading screen while grabbing comments for specified photo id
  var showComments = function(id, $scope) {
    $scope.pointComment = {};
    $ionicLoading.show({
      template: 'Loading...'
    });
    MapFactory.getPhotoData(id)
      .then(function(data){
        $scope.pointComment.data = data.data;
        MapFactory.getCommentsForPhoto(id)
          .then(function(comments){
            $scope.pointComment.comments = comments;
            $ionicLoading.hide();
            $scope.commentModal.show();
          });
      });
  };

  // popup comment box for entering comments, sends comment to mapfactory for
  // api to send to backend and write to database
  var postComment = function(photoData, $scope){
    $scope.commentData = {};
    var commentPostPopup = $ionicPopup.show({
      template: '<textarea rows=2 type="text" ng-model="commentData.comment">',
      title: 'Enter your comments',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.commentData.comment) {
              //don't allow the user to submit unless comments are present
              e.preventDefault();
            } else {
              MapFactory.postComment(photoData.id, photoData.userID, $scope.commentData.comment);
              $scope.showComments(photoData.id);
            }
          }
        }
      ]
    });
  };
  return {
    showComments: showComments,
    postComment: postComment
  };
});
