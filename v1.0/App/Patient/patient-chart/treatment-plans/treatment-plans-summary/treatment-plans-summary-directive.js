'use strict';

angular.module('Soar.Patient').directive('treatmentPlansSummary', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      allAccountMembers: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plans-summary/treatment-plans-summary.html',
    controller: 'TreatmentPlansSummary',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
