'use strict';

angular.module('Soar.Patient').directive('patientServiceTile', function () {
  return {
    restrict: 'E',
    scope: {
      patientService: '=',
      tileIndex: '=',
      showDate: '@',
      patientInfo: '=',
    },
    templateUrl:
      'App/Patient/patient-services/patient-service-tile/patient-service-tile.html',
    controller: 'PatientServiceTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
