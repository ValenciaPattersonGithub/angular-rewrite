'use strict';
angular.module('Soar.Patient').directive('quadrantsDirective', function () {
  return {
    restrict: 'E',
    scope: {
      selectedQuadrant: '=',
      disableSelection: '=',
      supernumeraryToothChartActive: '=',
      upper: '=',
    },
    templateUrl: 'App/Patient/patient-chart/quadrants/quadrants.html',
    controller: 'QuadrantsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
