'use strict';

angular.module('Soar.Patient').directive('patientConditionTile', function () {
  return {
    restrict: 'E',
    scope: {
      patientCondition: '=',
      tileIndex: '=',
      showDate: '@',
    },
    templateUrl:
      'App/Patient/patient-conditions/patient-condition-tile/patient-condition-tile.html',
    controller: 'PatientConditionTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
