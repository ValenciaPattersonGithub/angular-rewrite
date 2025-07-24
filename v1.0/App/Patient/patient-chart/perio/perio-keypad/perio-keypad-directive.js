'use strict';

angular.module('Soar.Patient').directive('perioKeypad', function () {
  return {
    scope: {
      keypadModel: '=',
    },
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-chart/perio/perio-keypad/perio-keypad.html',
    controller: 'PerioKeypadController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
