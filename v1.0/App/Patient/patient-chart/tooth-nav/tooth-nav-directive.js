'use strict';

angular.module('Soar.Patient').directive('toothNav', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      disableSelection: '=',
      activeTooth: '=',
    },
    templateUrl: 'App/Patient/patient-chart/tooth-nav/tooth-nav.html',
    controller: 'ToothNavController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
