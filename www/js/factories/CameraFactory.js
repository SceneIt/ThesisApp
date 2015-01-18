angular.module('sceneIt.cameraFac', ['ngCookies'])

.factory('CameraFactory', function($http, $cordovaFile, $ionicLoading, $cordovaProgress){

  var imageData;
  var cameraOptions = {
    quality: 80,
    encodingType: Camera.EncodingType.JPEG,
    saveToPhotoAlbum: true,
    correctOrientation: true,
    targetWidth: 720,
    targetHeight: 720
  };

  // selected from Action sheet in camera pane, 
  // uses camera to take picture and calls grabPicture function
  // to process taken image
  var takePicture = function(){
    cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
    cameraOptions.destinationType = Camera.DestinationType.FILE_URI;
    grabPicture();
  };

  // selected from Action sheet in camera pane,
  // provides photo album to select existing picture to upload
  // calls grabPicture function process selected image
  var selectPicture = function(){
    cameraOptions.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    cameraOptions.destinationType = Camera.DestinationType.NATIVE_URI;
    grabPicture();
  };

  // appends selected or taken image to preview div on camera pane,
  // assigns returned imageURI to imageData variable for uploadData to
  // send image to server
  var grabPicture = function(){
    navigator.camera.getPicture(function(imageURI) {
      var image = document.getElementById('preview');
      imageData = imageURI;
      image.src = imageData;

    }, function(err) {
      console.log('camera error');
    }, cameraOptions);
  };

  // Sends image description data along with image data to backend picture service
  // displays 'uploading' and 'success' screens as picture is being sent, alerts with error
  // if upload fails
  var uploadData = function($scope){
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
      data: {
        desc: $scope.description
      }
    };

    // Sends comment first, on success, sends image
    if($scope.description){
      $http(req).success(function(){
      
        var success = function (r) {
          $ionicLoading.hide();
          $cordovaProgress.showSuccess(true, "Success!");
          $timeout($cordovaProgress.hide, 2000);
        };

        var fail = function (error) {
          $ionicLoading.hide();
          alert('upload Fail, please try again');
        };

        var options = new FileUploadOptions();
        options.mimeType = "image/JPEG";

        var ft = new FileTransfer();
        ft.upload(imageData, picserver, success, fail, options);
      });
    }
  };
  return {
    takePicture: takePicture,
    selectPicture: selectPicture,
    grabPicture: grabPicture,
    uploadData: uploadData
  };
});
