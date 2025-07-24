'use strict';
// parts are renamed to stages
angular.module('Soar.Patient').directive('proposedServiceTile', function () {
  return {
    restrict: 'E',
    scope: {
      service: '=txService',
      expandView: '=',
      planStages: '=',
      stage: '=',
      stageIndex: '=',
      treatmentPlan: '=',
      actions: '=',
      servCount: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/proposed-service-tile/proposed-service-tile.html',
    controller: 'ProposedServiceTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
