angular.module('sceneIt.camera', [])

.controller('cameraCtrl', function($http, $scope, $rootScope, $ionicActionSheet, Session, Auth, CameraFactory){
  
  $scope.description = {
    comment: '',
    auth: $rootScope.auth
  };

  // called when user selects 'take photo' button on camera pane
  // opens action sheet to allow users to select from album or to 
  // take new picture
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
        CameraFactory.takePicture();
        return true;
      }
      if(index === 1){
        CameraFactory.selectPicture();
        return true;
      }
     }
   });
  };

  $scope.uploadData = function(){
    CameraFactory.uploadData($scope);
  };
  
});
