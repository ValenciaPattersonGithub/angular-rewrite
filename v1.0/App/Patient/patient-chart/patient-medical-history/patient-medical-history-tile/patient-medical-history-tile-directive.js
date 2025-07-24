'use strict';

angular
  .module('Soar.Patient')
  .directive('patientMedicalHistoryTile', function () {
    return {
      restrict: 'E',
      scope: {
        patientMedicalHistoryForm: '=',
        tileIndex: '=',
        showDate: '@',
        personId: '=',
        viewSettings: '=',
      },
      controller: 'PatientMedicalHistoryTileController',
      templateUrl:
        'App/Patient/patient-chart/patient-medical-history/patient-medical-history-tile/patient-medical-history-tile.html',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
