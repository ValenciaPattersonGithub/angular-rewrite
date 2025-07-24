'use strict';

angular.module('Soar.Patient').directive('chartingButtonServices', function () {
  return {
    restrict: 'E',
    scope: {
      servicesBackup: '=',
      selectedLayoutItems: '=',
      type: '@',
    },
    templateUrl:
      'App/Patient/patient-chart/charting/charting-button-crud/charting-button-services/charting-button-services.html',
    controller: 'ChartingButtonServicesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
