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
  var userInfo = {
    username: 'username',
    password: 'password',
    email: 'email'
  };

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
      data: userInfo
    })
    .then(function(res){
      Session.create(res.data.username);
      $state.go('app.browse');
    });
  };

  var signin = function(){
    return ($http({
      method: 'POST',
      url: server + '/api/user/signin',
      data: userInfo
    })
    .then(function(res){
      console.log(res);
      Session.create(res.data.username);
      $state.go('app.browse');
    }))
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
    }
      $rootScope.username = null;
      Session.destroy();
      $location.path('/signin');
      console.log('res',res, Session.username(), $cookies.userID);
    }
  );
};
  return {
    userInfo: userInfo,
    signin: signin,
    signup: signup,
    signout: signout,
    isAuthenticated: isAuthenticated

  }
});
