'use strict';

angular.module('Soar.Patient').directive('treatmentPlanEstins', function () {
  return {
    restrict: 'E',
    scope: {
      serviceTransaction: '=?',
      closeAll: '=?',
      recalculate: '=?',
      hasPatientBenefitPlan: '=?',
      patientBenefitPlans: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plan-estins/treatment-plan-estins.html',
    controller: 'TreatmentPlanEstinsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
