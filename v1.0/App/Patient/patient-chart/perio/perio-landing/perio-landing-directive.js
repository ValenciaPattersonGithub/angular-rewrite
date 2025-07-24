'use strict';

angular.module('Soar.Patient').directive('perioLanding', function () {
  return {
    restrict: 'E',
    scope: {
      hasPerioExams: '=',
      showPerioNav: '=',
      perioGraphActive: '=',
      perioExamHeaders: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/perio/perio-landing/perio-landing.html',
    controller: 'PerioLandingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
