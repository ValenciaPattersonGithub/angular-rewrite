'use strict';

angular.module('Soar.Patient').directive('patientAlerts', function () {
  return {
    restrict: 'E',
    scope: {
      alerts: '=',
      editing: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-alerts-sensitivities/patient-alerts-sensitivities.html',
    controller: 'PatientAlertsSensitivitiesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
