'use strict';

angular.module('common.directives').directive('zipField', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs, controller) {
      // manipulate input element to display dash
      var zipFieldDeregister = scope.$watch(attrs.zipField, function (nv, ov) {
        if (
          nv &&
          nv.length > 5 &&
          !nv.match('-') &&
          ((ov && !ov.match('-')) || ov == null)
        ) {
          var first = nv.substring(0, 5);
          var last = nv.substring(5, 9);
          var value = first + '-' + last;
          // HACK: Safari issue, Insert cursor moved on input, forces to reset value and start over putting cursor in right place.
          elem[0].value = '';
          elem[0].value = value;
        }
      });

      $(elem).keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter, dash and subtract
        if (
          $.inArray(e.keyCode, [46, 8, 9, 27, 13, 173]) !== -1 ||
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
          ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)) ||
          (e.shiftKey && e.keyCode == 189)
        ) {
          e.preventDefault();
        }
      });

      controller.$parsers.unshift(function (viewValue) {
        // cases where viewValue is undefined assign empty string
        if (!viewValue) {
          viewValue = '';
        }

        var validLength = viewValue.length < 11;
        var zipPattern = /^[0-9]{5}(?:-[0-9]{4})?$/;

        if (
          validLength &&
          (zipPattern.test(viewValue) || viewValue.length == 0)
        ) {
          controller.$setValidity('zipField', true);
        } else {
          controller.$setValidity('zipField', false);
        }
        return viewValue;
      });

      scope.$on('$destroy', function () {
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
      });
    },
  };
});
