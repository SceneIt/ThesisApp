angular.module('sceneIt.AuthFact', [])

.factory('Auth', function($rootScope, $http){
  var server = "http://mappix.azurewebsites.net";

  // verifies credentials with database, logs user in if credentials match
  var signin = function(userInfo){
    return ($http({
      method: 'POST',
      url: server + '/api/user/signin',
      data: userInfo
    })
    .then(function(res){
      console.log(res);
      $rootScope.auth = {
        userid: res.data.userid,
        loggedin: true,
        username: res.data.username
      };
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
});
