'use strict';

angular.module('Soar.Patient').directive('patientPerio', function () {
  return {
    scope: {
      activeDataPoints: '=',
      hasPerioExams: '=',
      patient: '=',
      perioGraphActive: '=',
      personId: '=',
      teethState: '=',
      getUsersPerioExamSettings: '=',
      perioExamHeaders: '=',
    },
    restrict: 'E',
    templateUrl: 'App/Patient/patient-chart/perio/perio.html',
    controller: 'PatientPerioController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
