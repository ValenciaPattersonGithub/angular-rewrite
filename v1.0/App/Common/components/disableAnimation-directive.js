'use strict';

angular.module('common.directives').directive('disableAnimation', [
  '$animate',
  function ($animate) {
    /* Is only called to use for ui bootstraps carousel directive */
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $attrs.$observe('disableAnimation', function (value) {
          $animate.enabled(!value, $element);
        });
      },
    };
  },
]);
