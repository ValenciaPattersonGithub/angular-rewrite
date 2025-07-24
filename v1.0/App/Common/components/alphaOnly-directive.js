'use strict';

angular.module('common.directives').directive('alphaOnly', function () {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attr, ctrl) {
      scope.handleKeydownEvent = function (e) {
        // Allow: backspace, delete, tab, escape, enter and space
        if (
          $.inArray(e.keyCode, [46, 8, 9, 27, 13, 32]) !== -1 ||
          // Allow: Ctrl+A
          (e.keyCode == 65 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39) ||
          // Allow: letters
          (e.keyCode >= 65 && e.keyCode <= 90) ||
          // Allow: dash and apostrophe and period (173 is dash on Firefox and some browsers)
          (!e.shiftKey &&
            (e.keyCode == 189 ||
              e.keyCode == 173 ||
              e.keyCode == 190 ||
              e.keyCode == 222))
        ) {
          // let it happen, don't do anything
          return;
        }
        // Ensure that it is a number and stop the keypress
        if (
          (e.shiftKey || e.keyCode >= 48 || e.keyCode <= 57) &&
          (e.keyCode >= 96 || e.keyCode <= 105)
        ) {
          e.preventDefault();
        }
      };

      $(elem).keydown(scope.handleKeydownEvent);

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
