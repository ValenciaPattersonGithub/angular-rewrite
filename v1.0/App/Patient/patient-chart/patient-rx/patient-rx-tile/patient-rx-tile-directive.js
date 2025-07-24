'use strict';

angular.module('Soar.Patient').directive('patientRxTile', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      tileData: '=',
      timelineView: '@?',
      showDate: '@?',
      activateTab: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-rx/patient-rx-tile/patient-rx-tile.html',
    controller: 'PatientRxTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
