'use strict';
angular.module('Soar.Patient').directive('arches', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      activeArch: '=',
    },
    templateUrl: 'App/Patient/patient-chart/arches/arches.html',
    controller: 'ArchesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
