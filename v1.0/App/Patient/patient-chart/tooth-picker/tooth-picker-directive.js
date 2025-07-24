'use strict';

angular.module('Soar.Patient').directive('toothPicker', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTeeth: '=',
      multiSelectEnabled: '=',
      activeTeeth: '=',
    },
    templateUrl: 'App/Patient/patient-chart/tooth-picker/tooth-picker.html',
    controller: 'ToothPickerController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
