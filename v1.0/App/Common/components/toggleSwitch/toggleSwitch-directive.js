'use strict';

angular.module('common.directives').directive('toggleSwitch', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      toggleClass: '@', // Class for the custom look/feel for the toggle (optional)
      switchId: '@', // ID for the toggle (required)
      customClass: '@', // Custom class to control the spacing (optional)
      ngModel: '=', // Model for the checkbox (required)
      trueText: '@', // Text to display on true side (required)
      falseText: '@', // Text to display on false side (required)
    },
    templateUrl: 'App/Common/components/toggleSwitch/toggleSwitch.html',
    link: function (scope, elem) {
      elem.bind('keydown', function (event) {
        if (event.which === 13 || event.which === 32) {
          scope.$apply(function () {
            var input = elem.find('input');
            input[0].checked = !input[0].checked;
            scope.ngModel = input[0].checked;
          });
        }
      });
    },
  };
});
