'use strict';
angular.module('Soar.Patient').directive('roots', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      disableSelection: '=',
      activeTeeth: '=',
      data: '=',
    },
    templateUrl: 'App/Patient/patient-chart/roots/roots-compact.html',
    controller: 'RootsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
