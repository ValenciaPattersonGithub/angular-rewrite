'use strict';

angular.module('Soar.BusinessCenter').directive('locationSearch', function () {
  return {
    restrict: 'E',
    scope: {
      locations: '=',
      selectedLocation: '=',
      loadingLocations: '=',
      hasChanges: '=',
    },
    templateUrl:
      'App/BusinessCenter/locations/location-search/location-search.html',
    controller: 'LocationSearchController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
