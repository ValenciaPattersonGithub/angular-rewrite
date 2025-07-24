'use strict';

angular.module('Soar.Patient').directive('perioNav', function () {
  return {
    restrict: 'E',
    scope: {
      showPerioNav: '=',
      personId: '=',
    },
    templateUrl: 'App/Patient/patient-chart/perio/perio-nav/perio-nav.html',
    controller: 'PerioNavController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
