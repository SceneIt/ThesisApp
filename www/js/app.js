angular.module('sceneIt', [
  'ionic',
  'ngCordova',
  'sceneIt.controllers',
  'sceneIt.listView',
  'sceneIt.map',
  'sceneIt.camera',
  'sceneIt.cameraFac',
  'sceneIt.CommentFact',
  'sceneIt.MapFact',
  'sceneIt.AuthFact'
])

.run(function($ionicPlatform, $http, $rootScope) {
  $rootScope.auth = {loggedIn: false, userid: null};

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('app.camera', {
    url: "/camera",
    views: {
      'menuContent': {
        templateUrl: "templates/camera.html",
        controller: 'cameraCtrl'
      }
    }
  })
  // browse map state
  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html",
        controller: 'mapCtrl'
      }
    }
  })
  .state('app.listView', {
    url: "/listView",
    views: {
      'menuContent': {
        templateUrl: "templates/listView.html",
        controller: 'listViewCtrl'
      }
    }
  })
  .state('app.home', {
    url: "/home",
    views: {
      'menuContent': {
        templateUrl: "templates/home.html"
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log("navigator.geolocation works well");
    console.log(navigator.camera);
}

