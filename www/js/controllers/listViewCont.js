angular.module('sceneIt.listView', ['sceneIt.filters'])

.controller('listViewCtrl', function($scope, $ionicModal, $ionicLoading, MapFactory, commentFactory, $rootScope){
  // Results array to be populated with picture points in order of distance from users current location
  // to be displayed by listView template
  $scope.results = [];

  // Sets up Ionic Modal for comments popup
  $ionicModal.fromTemplateUrl('templates/comments.html', {
    scope: $scope
  }).then(function(comments) {
    $scope.commentModal = comments;
  });

  // Grabs the current location of user, passes data to listPictures function
  var getLocation = function() {
    $ionicLoading.show({
      template: "Loading current location..."
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(listPictures);
    } else {
        $ionicLoading.hide();
        alert('Error grabbing location, please try again');
    }
  };

  // Called by getLocation function, uses geolocation data provided to sort images by distance,
  // from closests to farthest
  var listPictures = function(positions){
    $ionicLoading.show({
      template: "loading images..."
    });
    MapFactory.getPoints()
      .then(function(data){
        var dataOrder = geolib.orderByDistance({latitude:positions.coords.latitude, longitude:positions.coords.longitude}, data);
        for(var i = 0; i < dataOrder.length; i++){
            // populates results array, geolib library returns distance in meters, this also converts
            // data to miles before pushing data over 
          $scope.results.push([data[dataOrder[i].key],(dataOrder[i].distance*0.000621371192).toFixed(2)]);
          $ionicLoading.hide();
        }
        console.log($scope.results);
      });
  };

  $scope.showComments = function(id){
    commentFactory.showComments(id, $scope);
  };

  $scope.postComment = function(photoData){
    commentFactory.postComment(photoData, $scope);
  };

  $scope.closeComments = function() {
    $scope.commentModal.hide();
  };

  // Called when user uses 'pull to refresh' on list view page 
  $scope.doRefresh = function(){
    getLocation();
       // Stop the ion-refresher from spinning
     $scope.$broadcast('scroll.refreshComplete');
  };
  //Initial call to load pictures on controller load
  getLocation();
});
