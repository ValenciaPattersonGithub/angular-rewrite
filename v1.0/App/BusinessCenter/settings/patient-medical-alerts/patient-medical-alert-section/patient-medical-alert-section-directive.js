'use strict';

angular
  .module('Soar.Patient')
  .directive('patientMedicalAlertsSection', function () {
    return {
      restrict: 'E',
      scope: {
        medicalAlerts: '=',
        alertTypeId: '=',
      },
      templateUrl:
        'App/BusinessCenter/settings/patient-medical-alerts/patient-medical-alert-section/patient-medical-alert-section.html',
      controller: 'PatientMedicalAlertsSectionController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
