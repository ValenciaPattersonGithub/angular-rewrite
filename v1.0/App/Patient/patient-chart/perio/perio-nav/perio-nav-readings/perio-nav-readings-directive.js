'use strict';

angular.module('Soar.Patient').directive('perioNavReadings', function () {
  return {
    restrict: 'E',
    scope: {
      activeArch: '=',
      activeTooth: '=',
      arch: '=',
      chartedTeeth: '=',
      examType: '=',
      examTypeAbbrev: '=',
      keypadModel: '=',
      quadrant: '=',
      surface: '=',
      toothExam: '=',
      disable: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/perio/perio-nav/perio-nav-readings/perio-nav-readings.html',
    controller: 'PerioNavReadingsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
