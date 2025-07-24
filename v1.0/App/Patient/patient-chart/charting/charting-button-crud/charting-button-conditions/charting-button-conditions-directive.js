'use strict';

angular
  .module('Soar.Patient')
  .directive('chartingButtonConditions', function () {
    return {
      restrict: 'E',
      scope: {
        conditionsBackup: '=',
        selectedLayoutItems: '=',
      },
      templateUrl:
        'App/Patient/patient-chart/charting/charting-button-crud/charting-button-conditions/charting-button-conditions.html',
      controller: 'ChartingButtonConditionsController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
