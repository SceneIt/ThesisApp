angular.module('sceneIt.map', [])

.controller('mapCtrl', function($scope, $rootScope, $interval,$ionicModal, $http, MapFactory, Auth, commentFactory){

    $ionicModal.fromTemplateUrl('templates/comments.html', {
      scope: $scope
    }).then(function(comments) {
      $scope.commentModal = comments;
    });

//Comments section, handled by commentFactory 
    $scope.showComments = function(id) {
      commentFactory.showComments(id, $scope);
    };

    $scope.postComment = function(photoData){
      commentFactory.postComment(photoData, $scope);
    };

    $scope.closeComments = function() {
      $scope.commentModal.hide();
    };

    // called when user 'pulls to refresh' on comment view
    $scope.doRefresh = function(id){
      $scope.showComments(id)
      .finally(function() {
         // Stop the ion-refresher from spinning
         $scope.$broadcast('scroll.refreshComplete');
       });
    };

  // Begin map plotting

  // Map plotting and refreshing variable declarations 
  var dataPoints = 0,
      currentDataPoints = 0,
       map = L.map('map', {
        zoom: 10,
        zoomControl:false
      }),
     layer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/mochicat8.kmifnp9g/{z}/{x}/{y}.png',{
       attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
     }),

  // adds map base layer

  // Map location search bar
    searchControl = new L.esri.Controls.Geosearch({
      position:'topright',
      expanded:true,
      collapseAfterResult:false,
      title: 'Teleport Me To'
    }).addTo(map);

  // appends initial map layer to view
  map.addLayer(layer);

  // Finds users current location and centers map 
  map.locate({setView: true, maxZoom: 16});

  // function to grab geolocation cluster markers from MapFactory and adds as layer to map
  var initPoints = function(){
    MapFactory.getPoints().then(function(data){
      map.addLayer(MapFactory.plotPoints(data, $scope));
    });
  };

  //initial call to plot database points on load
  initPoints();

  //checks for new points every 5s, plots points if new data points are found
  $interval(function(){
    MapFactory.getPoints().then(function(data){
      dataPoints = data.length;
    });
    if(dataPoints > currentDataPoints || dataPoints === 0 ){
      initPoints();
      currentDataPoints = dataPoints;
    }
  },5000);

});
