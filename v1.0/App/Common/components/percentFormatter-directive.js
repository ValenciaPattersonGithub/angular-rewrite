'use strict';

angular.module('common.directives').directive('percentFormatter', [
  '$filter',
  function ($filter) {
    // Method to round floats with no rounding errors
    // http://www.jacklmoore.com/notes/rounding-in-javascript/

    var round = function (value, decimals) {
      var roundedValue = null;

      roundedValue = Number(
        Math.round(value + 'e' + decimals) + 'e-' + decimals
      );

      return roundedValue;
    };

    var p = function (viewValue) {
      var m = viewValue.match(/^(\d+)/);
      if (m !== null) return $filter('number')(parseFloat(viewValue) / 100) * 1;
    };

    var f = function (modelValue) {
      if (modelValue !== null)
        return $filter('number')(parseFloat(modelValue) * 100) * 1;
    };

    return {
      require: 'ngModel',
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.push(p);
        ctrl.$formatters.push(f);
      },
    };
  },
]);
