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
});
