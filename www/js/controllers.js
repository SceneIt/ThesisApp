angular.module('sceneIt.controllers', ['sceneIt.filters'])

//Base controller, handles login/auth
.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, Auth) {
  // Form data for the login modal


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.user = {
    username: '',
    password: '',
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

  Auth.signin($scope.user)
    .finally(function(){
      $ionicLoading.hide();
      $scope.modal.hide();
    });

  };

  $scope.signOut = function(){
    Auth.signout();
  };
});
