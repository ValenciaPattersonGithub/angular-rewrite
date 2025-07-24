'use strict';

angular.module('Soar.Patient').directive('patientEncounterEstins', function () {
  return {
    restrict: 'E',
    scope: {
      serviceTransaction: '=?',
      service: '=?',
      closeAll: '=?',
      recalculate: '=?',
      hasPatientBenefitPlan: '=?',
      popOverPlacement: '=?',
    },
    templateUrl:
      'App/Patient/patient-account/patient-encounter/patient-encounter-estins/patient-encounter-estins.html',
    controller: 'PatientEncounterEstinsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
