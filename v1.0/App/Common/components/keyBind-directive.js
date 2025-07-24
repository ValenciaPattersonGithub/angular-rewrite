'use strict';

angular.module('common.directives').directive('keyBind', [
  'KeyCodes',
  function (keyCodes) {
    function map(obj) {
      var mapped = {};
      for (var key in obj) {
        var action = obj[key];
        if (keyCodes.hasOwnProperty(key)) {
          mapped[keyCodes[key]] = action;
        }
      }
      return mapped;
    }

    return function (scope, element, attrs) {
      var bindings = map(scope.$eval(attrs.keyBind));
      element.bind('keydown keypress', function (event) {
        if (bindings.hasOwnProperty(event.which)) {
          scope.$apply(function () {
            scope.$eval(bindings[event.which]);
          });
        }
      });
    };
  },
]);
