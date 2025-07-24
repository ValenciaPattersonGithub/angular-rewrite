'use strict';

angular.module('Soar.Patient').directive('perioChart', function () {
  return {
    restrict: 'E',
    scope: {
      activeDataPoints: '=',
      arch: '@',
      rawExam: '=',
    },
    templateUrl: 'App/Patient/patient-chart/perio/perio-chart/perio-chart.html',
    controller: 'PerioChartController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
