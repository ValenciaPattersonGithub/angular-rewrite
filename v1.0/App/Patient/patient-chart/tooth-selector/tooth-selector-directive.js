'use strict';

angular.module('Soar.Patient').directive('toothSelector', function () {
  return {
    restrict: 'E',
    scope: {
      activeTooth: '=?',
      disableSelection: '=?',
      multiselectEnabled: '=?',
      quadrantSelectionOnly: '=?',
      selectedTeeth: '=',
      template: '=',
      toggleLabel: '=',
      cancelButtonLabel: '=?',
      applyButtonLabel: '=?',
      selectedTeethChanged: '=?',
      validateSelection: '=?',
      isClinicalNote: '=?',
    },
    templateUrl: function (elem, attr) {
      if (attr.template === 'widget') {
        return 'App/Patient/patient-chart/tooth-selector/tooth-selector-widget.html';
      } else if (attr.template === 'input') {
        return 'App/Patient/patient-chart/tooth-selector/tooth-selector-input.html';
      } else {
        return 'App/Patient/patient-chart/tooth-selector/tooth-selector.html';
      }
    },
    controller: 'ToothSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
