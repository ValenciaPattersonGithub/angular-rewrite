'use strict';

angular.module('common.directives').directive('locationsSelector', function () {
  return {
    restrict: 'E',
    scope: {
      currentLocation: '=?',
      selectedLocations: '=?',
      multiSelect: '=',
      disableSelect: '=?',
    },
    templateUrl:
      'App/BusinessCenter/components/locations-selector/locations-selector.html',
    controller: 'LocationsSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
