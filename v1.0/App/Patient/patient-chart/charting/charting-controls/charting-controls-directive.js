'use strict';

angular.module('Soar.Patient').directive('chartingControls', function () {
  return {
    restrict: 'E',
    scope: {
      viewSettings: '=',
      patientInfo: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/charting/charting-controls/charting-controls.html',
    controller: 'ChartingControlsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
