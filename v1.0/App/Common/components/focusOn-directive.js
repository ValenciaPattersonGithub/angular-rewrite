'use strict';

angular.module('common.directives').directive('focusOn', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem, attr) {
        scope.$watch(attr.focusOn, function (value) {
          if (value) {
            $timeout(function () {
              elem[0].focus();
            }, 0);
          }
        });
      },
    };
  },
]);
