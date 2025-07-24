'use strict';

angular.module('common.directives').directive('intsOnly', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attr, ctrl) {
      scope.handleKeydownEvent = function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if (
          $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
          // Allow: Ctrl+A
          (e.keyCode == 65 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)
        ) {
          // let it happen, don't do anything
          return;
        }
        // Ensure that it is a number and stop the keypress
        if (
          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105)
        ) {
          e.preventDefault();
        }
      };

      $(elem).keydown(function (e) {
        scope.handleKeydownEvent(e);
      });

      elem.on('$destroy', function () {
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

        scope.$destroy();
      });
    },
  };
});
