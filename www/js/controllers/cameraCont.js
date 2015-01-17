angular.module('sceneIt.camera', [])

.controller('cameraCtrl', function($http, $scope, $rootScope, $cordovaProgress, $ionicActionSheet, $timeout, $cordovaFile, $ionicLoading, Session, Auth){
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
