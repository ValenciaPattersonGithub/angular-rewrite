'use strict';

// Grid Cell Directive
// This grid cell directive is restricted to an attribute <div grid-cell="templateName">

angular.module('common.directives').directive('gridCell', [
  '$compile',
  function ($compile) {
    var link = function (scope, element, attrs) {
      scope.$watch(attrs.gridCell, function (newValue, oldValue) {
        element.html(newValue);
        $compile(element.contents())(scope);
      });

      scope.$on('$destroy', function scopeDestroyed(event) {
        for (var scopeItem in scope) {
          if (
            scopeItem &&
            scope.hasOwnProperty(scopeItem) &&
            !scopeItem.startsWith('$')
          ) {
            scope[scopeItem] = null;
          }
        }

        if (scope.$$watchers && scope.$$watchers.length) {
          for (var i = 0; i < scope.$$watchers.length; i++) {
            scope.$$watchers[i].fn = null;
          }
        }

        scope.$$watchers = [];
        scope.$$listeners.$destroy = null;
        scope.$$listeners = {};
      });
    };

    return {
      restrict: 'A',
      link: link,
    };
  },
]);
