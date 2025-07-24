'use strict';

angular.module('Soar.Patient').directive('patientDocumentsTile', function () {
  return {
    restrict: 'E',
    scope: {
      patientDocument: '=',
      tileIndex: '=',
      showDate: '@',
    },
    controller: 'PatientDocumentsTileController',
    templateUrl:
      'App/Patient/patient-chart/patient-documents/patient-documents-tile/patient-documents-tile.html',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
