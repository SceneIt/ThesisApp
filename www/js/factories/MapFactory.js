angular.module('sceneIt.MapFact', [])


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
