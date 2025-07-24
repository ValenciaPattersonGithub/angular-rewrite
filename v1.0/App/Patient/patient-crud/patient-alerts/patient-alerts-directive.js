'use strict';

angular.module('Soar.Patient').directive('patientAlertsCrud', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Patient/patient-crud/patient-alerts/patient-alerts.html',
    controller: 'PatientAlertsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
