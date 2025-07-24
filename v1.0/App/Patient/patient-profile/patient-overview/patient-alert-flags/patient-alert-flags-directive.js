'use strict';

angular.module('Soar.Patient').directive('patientAlertFlags', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
    },
    templateUrl:
      'App/Patient/patient-profile/patient-overview/patient-alert-flags/patient-alert-flags.html',
    controller: 'PatientAlertFlagController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
