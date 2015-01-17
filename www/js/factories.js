angular.module('sceneIt.factories', ['ngCookies'])

//BEGIN AUTH FACTORY
.factory('Auth', function($state, $rootScope, $http){
  var server = "http://mappix.azurewebsites.net";

  // verifies credentials with database, logs user in if credentials match
  var signin = function(userInfo){
    return ($http({
      method: 'POST',
      url: server + '/api/user/signin',
      data: userInfo
    })
    .then(function(res){
      $rootScope.auth.userid = res.data.userid;
      $rootScope.auth.loggedIn = true;
    }));
  };

  var signout = function(){
    $http({
      method: 'POST',
      url: server + '/api/user/logout'
    }).
    then(function(res){
      $rootScope.username = null;
    }
  );
};
  return {
    signin: signin,
    signout: signout
  };
})

// BEGIN MAP FACTORY
.factory('MapFactory', function($http, $compile){

  //getPoints function will return an array of objects
  var picserver = encodeURI('http://162.246.58.173:8000');
  var server = encodeURI('http://mappix.azurewebsites.net');

  // makes call to backend API to retreive data about pic stored in database
  var getPhotoData = function(id){
    return $http.post(picserver+'/api/photo/data/getPhotoData', {id:id})
      .success(function(data){
      return data;
    }).error(function(){
      console.log('probably getting Photo Data with id',id);
    });
  };

  // grabs all comments for image with <id> from database
  var getCommentsForPhoto = function(id){
    return $http.get(server+'/api/comments/', {params: {id: id}})
    .success(function(data){
      return data;
    });
  };

  // sends comment to database, saves photo id, userid, and comments
  var postComment = function(id, user, comment){
    return $http({
      method: 'POST',
      url: server+'/api/comments/',
      data: {photoid: id, userid: user, comment: comment}
    }).then(function(res){
        return res.data;
    });
  };

  // 
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
    });
  };

  // Returns a leaflet markergroup with markers for each image in the database
  var plotPoints = function(points, $scope){
    var markers = L.markerClusterGroup();
    var picIcon = L.Icon.extend({
      options: {
        iconSize: [40, 40],
        shadowSize: [45,51],
        shadowAnchor: [22,23.5]
      }
    });
    for(var i = 0; i < points.length; i ++){
      var html = '<div class ="pic-box" ng-click="showComments('+points[i].id+')"><h6>'+points[i].description+'</h6>' +
          '<img src = '+points[i].photoUrl+' height = "150", width = "150"></div>',
          linkFunction = $compile(angular.element(html)),
          newScope = $scope.$new(),
          picMarker = new L.marker([points[i].latitude, points[i].longitude], {
            icon: new picIcon({
              iconUrl: points[i].photoUrl,
              shadowUrl: '../img/polaroid3.png'
            })
      });
      picMarker.bindPopup(linkFunction(newScope)[0]);
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
})

//BEGIN COMMENT FACTORY
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
})

// BEGIN CAMERA FACTORY 

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
