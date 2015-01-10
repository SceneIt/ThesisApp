angular.module('sceneIt.controllers', ['ionic.contrib.frostedGlass', 'sceneIt.filters'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('GeoLocCtrl', function($scope, $interval,$ionicModal, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $http, MapFactory) {

  $ionicModal.fromTemplateUrl('templates/comments.html', {
    scope: $scope
  }).then(function(comments) {
    $scope.commentModal = comments;
  });


  $scope.postComment = function(photoData){
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
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              MapFactory.postComment(photoData.id, photoData.userID, $scope.commentData.comment);
              $scope.showComments(photoData.id);
            }
          }
        }
      ]
    });
    commentPostPopup.then(function(res) {
      console.log('Tapped!', res);
    });


  };
  $scope.doRefresh = function(id){
    $scope.showComments(id)
    .finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
         });
  };
  $scope.showComments = function(id) {
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
  $scope.closeComments = function() {
    $scope.commentModal.hide();
  };

  var dataPoints = 0,
      currentDataPoints = 0;
  var map = L.map('map', {
    zoom: 10
  });
  var layer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/scenit.kgp870je/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  $scope.initPoints = function(){
    MapFactory.getPoints().then(function(data){

      map.addLayer(MapFactory.plotPoints(data, $scope));
    });
  };

  map.addLayer(layer);
  map.locate({setView: true, maxZoom: 16});

  $scope.initPoints();
  $interval(function(){
    MapFactory.getPoints().then(function(data){
      dataPoints = data.length;
    });
    console.log();
    if(dataPoints > currentDataPoints || dataPoints === 0 ){
      console.log('updating map');
      $scope.initPoints();
      currentDataPoints = dataPoints;
    }
  },5000);

  //calling the post photo function

  // var control = L.control.geonames({username: 'cbi.test'});
  // console.log(control);
  // map.addControl(control);

})

.controller('cameraCtrl', function($http, $scope, $cordovaProgress, $ionicActionSheet, $timeout, $cordovaFile, $ionicLoading) {
  
  $scope.showCameraSelect = function() {
    console.log('clicky showcamera select');
    $ionicActionSheet.show({
     buttons: [
       { text: 'Take a picture' },
       { text: 'Select from album' }
     ],
     titleText: 'Select your source',
     cancelText: 'Cancel',
     cancel: function() {
        return true;
      },
     buttonClicked: function(index) {
      if(index == 0){
        $scope.takePicture();
        return true;
      }
      if(index == 1){
        $scope.selectPicture();
        return true;
      }
     }
   });
  };


  $scope.data = '_';
  var cameraOptions = {
    quality: 80,
    encodingType: Camera.EncodingType.JPEG,
    saveToPhotoAlbum: true,
    correctOrientation: true,
    targetWidth: 720,
    targetHeight: 720
  }

  $scope.takePicture = function(){
    cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
    cameraOptions.destinationType = Camera.DestinationType.FILE_URI;
    $scope.grabPicture();
  }
  $scope.selectPicture = function(){
    cameraOptions.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    correctOrientation = true;
    cameraOptions.destinationType = Camera.DestinationType.NATIVE_URI;
    $scope.grabPicture();
  }
  $scope.grabPicture = function(){
    navigator.camera.getPicture(function(imageURI) {
      $scope.data = 'success';
      var image = document.getElementById('preview');
      $scope.imageData = imageURI;
      image.src = $scope.imageData;

    }, function(err) {
      $scope.data = 'fail';
      console.log('camera error');

    }, cameraOptions);
  }

  $scope.description = {};
  $scope.description.comment = '';

  $scope.uploadPicture = function(){
    $ionicLoading.show({
      template: 'Uploading...'
    });
    // var server = encodeURI('http://10.6.32.229:8000/photo/take');     //HackReactor test
    // var server = encodeURI('http://192.168.1.109:8000/photo/take'); //home test
    var picserver = encodeURI('http://162.246.58.173:8000/photo/take'); // vps test
    // var server = encodeURI('corruptflamingo-staging.azurewebsites.net/photo/take'); //azure staging test
    var req = {
     method: 'POST',
     url: picserver,
     headers: {
       'Content-Type': 'application/json'
     },
     data: {desc: $scope.description}
    }
    if($scope.description){
      $http(req).success(function(){
      //  alert('sending image');
      
        var win = function (r) {
          $ionicLoading.hide();
          $cordovaProgress.showSuccess(true, "Success!");
          $timeout($cordovaProgress.hide, 2000);
        }

        var fail = function (error) {
          $ionicLoading.hide();
          alert('upload Fail, please try again');
        }

        var options = new FileUploadOptions();
        options.mimeType = "image/JPEG";

        var ft = new FileTransfer();
        ft.upload($scope.imageData, picserver, win, fail, options);
      });
    }
  };
})
.factory('MapFactory', function($http, $compile){
  //getPoints function will return an array of objects
  var picserver = encodeURI('http://162.246.58.173:8000');
  var server = encodeURI('http://sceneit.azurewebsites.net/');
  var getPhotoData = function(id){
    console.log('gettin photo data with id', id);
    return $http.post(picserver+'/api/photo/data/getPhotoData', {id:id})
      .success(function(data){
      return data;
    }).error(function(){
      console.log('probably getting Photo Data with id',id);
    });
  };
  var getCommentsForPhoto = function(id){
    return $http.get(server+'/api/comments/', {params: {id: id}})
    .success(function(data){
      return data;
    });
  };
  var postComment = function(id, user, comment){
    console.log(id, user, comment);
    return $http({
      method: 'POST',
      url: server+'/api/comments/',
      data: {photoid: id, userid: user, comment: comment}
    }).then(function(res){
        return res.data;
    });
  };
  var getPoints = function(){
    return $http({
      method: 'GET',
      url: server + '/api/photo/data'
    }).then(function(res){
      return(res.data);
    });
  };
  //postPhotos function will post object into database
  var postPhotos = function(photoData){
    return $http({
      method: 'POST',
      url: picserver + 'api/photo/data',
      data: photoData
    }).then(function(res){
        console.log('uplodaded',res.data);
        return res.data;
    })
  };
  // var plotPoints = function(points){
  //   var markers = L.markerClusterGroup();
  //   var picIcon = L.Icon.extend({
  //     options: {
  //       iconSize: [40, 40]
  //     }
  //   });
  //   for(var i = 0; i < points.length; i ++){
  //     var picMarker = new L.marker([points[i].latitude, points[i].longitude], {
  //       icon: new picIcon({
  //         iconUrl: points[i].photoUrl
  //       })
  //     });
  //     picMarker.bindPopup('<h6>'+points[i].description+'</h6><p>Click for details</p><img src = '+points[i].photoUrl+' height = "150", width = "150" ng-click="comments()">')
  //     // picMarker.click(console.log("test"+points[i].description+'photoURL'+points[i].photoUrl));
  //     markers.addLayer(picMarker);
  //   };
  //   console.log();    
  //   return markers;
  // };
  var plotPoints = function(points, $scope){
    var markers = L.markerClusterGroup();
    var picIcon = L.Icon.extend({
      options: {
        iconSize: [40, 40]
      }
    });
    for(var i = 0; i < points.length; i ++){
      var html = '<div ng-click="showComments('+points[i].id+')"><h6>'+points[i].description+'</h6>' +
          '<img src = '+points[i].photoUrl+' height = "150", width = "150"></div>',
          linkFunction = $compile(angular.element(html)),
          newScope = $scope.$new(),
          picMarker = new L.marker([points[i].latitude, points[i].longitude], {
            icon: new picIcon({
              iconUrl: points[i].photoUrl
            })
      });
      picMarker.bindPopup(linkFunction(newScope)[0]);
      // picMarker.click(console.log("test"+points[i].description+'photoURL'+points[i].photoUrl));
      markers.addLayer(picMarker);
    }
    return markers;
  };
  return {
    getPhotoData: getPhotoData,
    getCommentsForPhoto: getCommentsForPhoto,
    postComment: postComment,
    getPoints : getPoints,
    postPhotos : postPhotos,
    plotPoints : plotPoints
  };
});
