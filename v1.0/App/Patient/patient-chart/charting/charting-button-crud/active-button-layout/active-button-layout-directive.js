'use strict';

angular.module('Soar.Patient').directive('activeButtonLayout', function () {
  return {
    restrict: 'E',
    scope: {
      selectedLayoutItems: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/charting/charting-button-crud/active-button-layout/active-button-layout.html',
    controller: 'ActiveButtonLayoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
