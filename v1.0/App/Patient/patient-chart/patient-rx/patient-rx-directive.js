'use strict';

angular.module('Soar.Patient').directive('patientRx', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      validPatientData: '=',
    },
    templateUrl: 'App/Patient/patient-chart/patient-rx/patient-rx.html',
    controller: 'PatientRxController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
