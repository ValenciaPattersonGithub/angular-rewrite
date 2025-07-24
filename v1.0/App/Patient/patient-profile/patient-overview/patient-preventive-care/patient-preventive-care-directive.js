'use strict';

angular.module('Soar.Patient').directive('patientPreventiveCare', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
    },
    templateUrl:
      'App/Patient/patient-profile/patient-overview/patient-preventive-care/patient-preventive-care.html',
    controller: 'PatientPreventiveCareDirectiveController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
