'use strict';

angular.module('Soar.Patient').directive('perioReadings', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      exam: '=',
      quadrant: '=',
      examType: '@',
      examTitle: '=',
      disabledInputs: '=?',
      queue: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/perio/perio-readings/perio-readings.html',
    controller: 'PerioReadingsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
