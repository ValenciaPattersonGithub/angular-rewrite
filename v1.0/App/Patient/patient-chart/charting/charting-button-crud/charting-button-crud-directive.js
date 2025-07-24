'use strict';

angular.module('Soar.Patient').directive('chartingButtonCrud', function () {
  return {
    restrict: 'E',
    scope: {
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/charting/charting-button-crud/charting-button-crud.html',
    controller: 'ChartingButtonCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
