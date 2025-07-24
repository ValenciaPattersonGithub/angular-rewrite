angular.module('Soar.Patient').directive('chartBtnLayout', function () {
  return {
    restrict: 'E',
    scope: {
      activeUrl: '=',
      disableTabs: '=?',
    },
    templateUrl:
      'App/Patient/patient-chart/chart-button-layout/chart-button-layout.html',
    controller: 'ChartButtonLayoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
