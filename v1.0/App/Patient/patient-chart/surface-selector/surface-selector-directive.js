'use strict';

angular.module('Soar.Patient').directive('surfaceSelector', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      disableSelection: '=',
      activeTooth: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/surface-selector/surface-selector.html',
    controller: 'SurfaceSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
