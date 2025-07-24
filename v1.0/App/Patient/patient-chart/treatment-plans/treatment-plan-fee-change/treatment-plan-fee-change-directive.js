'use strict';

angular.module('Soar.Patient').directive('treatmentPlanFeeChange', function () {
  return {
    restrict: 'E',
    scope: {
      serviceTransaction: '=?',
      closeAll: '=?',
      recalculate: '=?',
      save: '=?',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plan-fee-change/treatment-plan-fee-change.html',
    controller: 'TreatmentPlanFeeChangeController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
