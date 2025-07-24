'use strict';

angular.module('Soar.Patient').directive('patientEncounterCharge', function () {
  return {
    restrict: 'E',
    scope: {
      serviceTransaction: '=?',
      closeAll: '=?',
      recalculate: '=?',
      save: '=?',
    },
    templateUrl:
      'App/Patient/patient-account/patient-encounter/patient-encounter-charge/patient-encounter-charge.html',
    controller: 'PatientEncounterChargeController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
