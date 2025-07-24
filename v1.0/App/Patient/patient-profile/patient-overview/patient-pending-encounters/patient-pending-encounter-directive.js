'use strict';

angular
  .module('Soar.Patient')
  .directive('patientPendingEncounter', function () {
    return {
      restrict: 'E',
      scope: {
        patient: '=',
      },
      templateUrl:
        'App/Patient/patient-profile/patient-overview/patient-pending-encounters/patient-pending-encounter.html',
      controller: 'PatientPendingEncounterController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
