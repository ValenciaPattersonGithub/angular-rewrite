'use strict';

// Lazy Show Directive
// -------------------
// This directive is useful for when you want to have panels, tabs, or other content that you may
// not want to load right away. This will add an ng-if that keeps the element from executing until
// you activate, after that it will use ng-show to toggle visibility.

angular.module('common.directives').directive('lazyShow', [
  '$compile',
  function ($compile) {
    var link = function (scope, element, attrs) {
      if (
        typeof scope.lazyShowRun == 'undefined' ||
        scope.lazyShowRun == null
      ) {
        scope.lazyShowRun = [];
      }

      var id = scope.lazyShowRun.length + 1;

      scope.lazyShowRun[id] = false;

      scope.$watch(attrs['lazyShow'], function (value) {
        if (value) {
          scope.lazyShowRun[id] = true;
        }
      });

      element.attr('ng-if', 'lazyShowRun[' + id + ']');
      element.attr('ng-show', attrs['lazyShow']);
      element.removeAttr('lazy-show');
      element.removeAttr('data-lazy-show');

      $compile(element)(scope);
    };

    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      link: link,
    };
  },
]);
