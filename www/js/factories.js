angular.module('sceneIt.factories', ['ngCookies'])

.factory('Session', function(){
  var _username = null;

  var setUsername = function(usernameIN){
    _username = usernameIN;
    return _username;
  };

  var username = function(){
    return _username;
  };

  var create = function(usernameCreate){
    _username = usernameCreate;
  };

  var destroy = function(){
    _username = null;
  };

  return {
    create: create,
    setUsername: setUsername,
    destroy: destroy,
    username: username,
    _username: _username
  };
})

.factory('Auth', function($state, $rootScope, $http, $window, $location, $cookies, Session){
  var server = "http://corruptflamingo-staging.azurewebsites.net";
  // var server = "http://localhost:8000";
  // var userInfo = {
  //   username: 'username',
  //   password: 'password',
  //   email: 'email'
  // };

  //Keep state when refreshed
  function init() {
    if ($cookies["userID"]) {
      Session.create($cookies.userID);
    }
  }

  init();

  var isAuthenticated = function(){
    return !!Session.username();
  };

  var signup = function(user){
    $http({
      method: 'POST',
      url: server + '/api/user/signup',
      data: user
    })
    .then(function(res){
      Session.create(res.data.username);
      $state.go('app.browse');
    });
  };

  var signin = function(userInfo){
    return ($http({
      method: 'POST',
      url: server + '/api/user/signin',
      data: userInfo
    })
    .then(function(res){
      console.log(res);
      console.log('signed in res:',res.data.username);
      Session.create(res.data.username);
      console.log(res.data);
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
    var userInfo = {
      username: 'username',
      password: 'password',
      email: 'email'
    };
      $rootScope.username = null;
      Session.destroy();
      $location.path('/signin');
      console.log('res',res, Session.username(), $cookies.userID);
    }
  );
};
  return {
    // userInfo: userInfo,
    signin: signin,
    signup: signup,
    signout: signout,
    isAuthenticated: isAuthenticated

  };
})

.factory('MapFactory', function($http, $compile){

  //getPoints function will return an array of objects
  var picserver = encodeURI('http://162.246.58.173:8000');
  var server = encodeURI('http://mappix.azurewebsites.net');

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
    });
  };

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
      // picMarker.click(console.log("test"+points[i].description+'photoURL'+points[i].photoUrl));
      markers.addLayer(picMarker);
    }
    return markers;
  };
  return {
    // getLocation: getLocation,
    getPhotoData: getPhotoData,
    getCommentsForPhoto: getCommentsForPhoto,
    postComment: postComment,
    getPoints : getPoints,
    postPhotos : postPhotos,
    plotPoints : plotPoints
  };
})
.factory('commentFactory', function($ionicLoading, $ionicPopup, MapFactory){
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
    commentPostPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  };
  return {
    showComments: showComments,
    postComment: postComment
  };
});
