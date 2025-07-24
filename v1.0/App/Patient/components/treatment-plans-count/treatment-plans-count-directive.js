'use strict';

angular.module('Soar.Patient').directive('treatmentPlansCount', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
    },
    templateUrl:
      'App/Patient/components/treatment-plans-count/treatment-plans-count.html',
    controller: 'TreatmentPlansCountController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
