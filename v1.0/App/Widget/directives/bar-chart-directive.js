'use strict';

angular.module('Soar.Widget').directive('barChart', function () {
  return {
    restrict: 'E',
    scope: {
      barChartModel: '=ngModel',
      onFilterChanged: '&?',
      showDropdown: '=?',
    },
    templateUrl: 'App/Widget/directives/bar-chart.html',
    controller: 'BarChartController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
