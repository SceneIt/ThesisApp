// Angular filter that uses moment js to return time in "from now" format
// ie: 1hr ago, about 5 days ago

angular.module('sceneIt.filters',[]).filter('fromNow', function() {
      return function(date) {
        return moment(date).fromNow();
      };
});
