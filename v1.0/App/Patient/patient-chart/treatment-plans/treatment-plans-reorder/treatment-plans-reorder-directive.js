'use strict';
// parts are renamed to stages
angular.module('Soar.Patient').directive('treatmentPlansReorder', function () {
  return {
    restrict: 'E',
    scope: {
      expandedView: '=',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plans-reorder/treatment-plans-reorder.html',
    controller: 'TreatmentPlansReorderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
