'use strict';

angular.module('common.directives').directive('taxRate', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      taxRatePattern: '=?',
      maxDecimalLength: '@?',
    },
    link: function (scope, elem, attrs, controller) {
      // manipulate input element to display decimal
      scope.manipulateViewValue = function (viewValue) {
        if (viewValue && viewValue.length > 2 && viewValue.indexOf('.') < 0) {
          var first = viewValue.substring(0, 2);
          var last = viewValue.substring(2, 7);
          var value = first + '.' + last;
          // HACK: Safari issue, Insert cursor moved on input, forces to reset value and start over putting cursor in right place.
          elem[0].value = '';
          elem[0].value = value;
          return value;
        }
      };

      scope.handleKeydownEvent = function (e) {
        // Allow: backspace, delete, tab, escape, enter, dash, and subtract
        if (
          $.inArray(e.keyCode, [46, 8, 9, 27, 13, 173]) !== -1 ||
          // Allow: Ctrl+A
          (e.keyCode == 65 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39) ||
          // Allow: only one decimal
          ((e.keyCode == 190 || e.keyCode == 110) &&
            e.currentTarget.value.indexOf('.') === -1)
        ) {
          // let it happen, don't do anything
          return;
        }
        // Ensure that it is a number and stop the keypress
        if (
          ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)) ||
          (e.shiftKey && e.keyCode == 189)
        ) {
          e.preventDefault();
        }
      };
      $(elem).keydown(scope.handleKeydownEvent);

      scope.parser = function (viewValue) {
        // cases where viewValue is undefined assign empty string
        if (!viewValue) {
          viewValue = '';
        }
        var validLength = viewValue.length < 7;

        viewValue = scope.manipulateViewValue(viewValue) || viewValue;
        var maxDecimalLength = scope.maxDecimalLength || 3;
        if (viewValue && viewValue.indexOf('.') != -1) {
          if (viewValue.split('.')[1].length > maxDecimalLength) {
            viewValue = viewValue.substring(0, viewValue.length - 1);
            controller.$setViewValue(viewValue);
            controller.$render();
          }
        }

        var taxRatePattern = scope.taxRatePattern || /^\d{0,2}(\.\d{0,3})?$/;
        if (
          validLength &&
          (taxRatePattern.test(viewValue) || viewValue.length == 0)
        ) {
          controller.$setValidity('taxRate', true);
        } else {
          controller.$setValidity('taxRate', false);
        }
        return viewValue;
      };

      controller.$parsers.push(scope.parser);

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
          scope.$$watchers = [];
        }

        scope.$destroy();
      });
    },
  };
});
