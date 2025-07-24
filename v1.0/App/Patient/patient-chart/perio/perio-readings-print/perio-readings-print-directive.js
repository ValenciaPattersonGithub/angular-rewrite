'use strict';

angular.module('Soar.Patient').directive('perioReadingsPrint', function () {
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
      'App/Patient/patient-chart/perio/perio-readings-print/perio-readings-print.html',
    controller: 'PerioReadingsPrintController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
