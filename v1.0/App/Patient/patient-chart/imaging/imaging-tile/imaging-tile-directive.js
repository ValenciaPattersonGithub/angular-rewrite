'use strict';

angular.module('Soar.Patient').directive('patientImagingTile', function () {
  return {
    restrict: 'E',
    scope: {
      imageExam: '=',
      tileIndex: '=',
      showDate: '@?',
      toothMode: '=',
      activateTab: '=',
      patientInfo: '=',
      previewExam: '=?',
    },
    templateUrl:
      'App/Patient/patient-chart/imaging/imaging-tile/imaging-tile.html',
    controller: 'PatientImagingTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
