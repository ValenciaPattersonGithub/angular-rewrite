'use strict';
angular.module('Soar.Patient').directive('rootSelector', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      disableSelection: '=',
      activeTooth: '=',
    },
    templateUrl: 'App/Patient/patient-chart/root-selector/root-selector.html',
    controller: 'RootSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
