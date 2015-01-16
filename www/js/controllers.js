angular.module('sceneIt.controllers', ['sceneIt.filters'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, Auth) {
  // Form data for the login modal


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.user = {
    username: 'username',
    password: 'password',
    email: 'email'
  };
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
    $ionicLoading.show({
      template: 'Logging in..'
    });

   // $scope.user =  Auth.userInfo;

  Auth.signin($scope.user)
    .finally(function(){
      $ionicLoading.hide();
      $scope.modal.hide();
    });

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
  };

  $scope.signOut = function(){
    console.log('signing out');
    Auth.signout();
  };
})

.controller('mapCtrl', function($scope, $rootScope, $interval,$ionicModal, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $http, MapFactory, Auth, commentFactory) {
  console.log($rootScope.auth);

  $ionicModal.fromTemplateUrl('templates/comments.html', {
    scope: $scope
  }).then(function(comments) {
    $scope.commentModal = comments;
  });

  $scope.showComments = function(id) {
    commentFactory.showComments(id, $scope);
  };

  $scope.postComment = function(photoData){
    commentFactory.postComment(photoData, $scope);
  };
  $scope.doRefresh = function(id){
    $scope.showComments(id)
    .finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
         });
  };

  $scope.closeComments = function() {
    $scope.commentModal.hide();
  };

  var dataPoints = 0,
      currentDataPoints = 0;
  var map = L.map('map', {
    zoom: 10,
    zoomControl:false
  });
  var layer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/mochicat8.kmifnp9g/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

var searchControl = new L.esri.Controls.Geosearch({position:'topright', expanded:true, collapseAfterResult:false, title: 'Teleport Me To'}).addTo(map);

  $scope.initPoints = function(){
    MapFactory.getPoints().then(function(data){
      // console.log('updating map', mainLayer);
      // if(mainLayer){
      //   console.log('remove layer');
      // }
      console.log(map.hasLayer(mainLayer));
      // map.removeLayer(mainLayer);
      var plotLayer = MapFactory.plotPoints(data, $scope);
      var mainLayer = map.addLayer(plotLayer);
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

.controller('cameraCtrl', function($http, $scope, $rootScope, $cordovaProgress, $ionicActionSheet, $timeout, $cordovaFile, $ionicLoading, Session, Auth) {
  $scope.description = {};
  $scope.description.comment = '';
  $scope.description.auth = $rootScope.auth;

  console.log($scope.description.username);

  $scope.showCameraSelect = function() {
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
      if(index === 0){
        $scope.takePicture();
        return true;
      }
      if(index === 1){
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
  };




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
    };
    if($scope.description){
      $http(req).success(function(){
      //  alert('sending image');
      
        var win = function (r) {
          $ionicLoading.hide();
          $cordovaProgress.showSuccess(true, "Success!");
          $timeout($cordovaProgress.hide, 2000);
        },

        fail = function (error) {
          $ionicLoading.hide();
          alert('upload Fail, please try again');
        },

        options = new FileUploadOptions();
        options.mimeType = "image/JPEG";

        var ft = new FileTransfer();
        ft.upload($scope.imageData, picserver, win, fail, options);
      });
    }
  };
  
});
