'use strict';

angular.module('Soar.Patient').directive('treatmentPlansTile', function () {
  return {
    restrict: 'E',
    scope: {
      txPlan: '=',
      activePlan: '=',
      viewSettings: '=',
      patientInfo: '=',
      timelineView: '@?',
      tileIndex: '=?',
      showDate: '@?',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plans-tile/treatment-plans-tile.html',
    controller: 'TreatmentPlansTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
