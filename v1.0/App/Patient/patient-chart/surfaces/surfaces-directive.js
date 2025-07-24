'use strict';
angular.module('Soar.Patient').directive('surfaces', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      surfacesValid: '=',
      disableInput: '=?',
    },
    templateUrl: 'App/Patient/patient-chart/surfaces/surfaces-compact.html',
    controller: 'SurfacesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
