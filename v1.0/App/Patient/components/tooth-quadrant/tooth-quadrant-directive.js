'use strict';

angular.module('Soar.Patient').directive('toothQuadrant', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      activeTooth: '=?',
      multiselectEnabled: '=',
      quadrantSelectionOnly: '=',
      showTeethDetail: '=',
    },
    templateUrl: 'App/Patient/components/tooth-quadrant/tooth-quadrant.html',
    controller: 'ToothQuadrantController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
