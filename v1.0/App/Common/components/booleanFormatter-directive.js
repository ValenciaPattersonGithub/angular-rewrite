angular.module('common.directives').directive('booleanFormatter', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {
      var formatter = function (value) {
        if (value === true) {
          value = 'Y';
        } else if (value === false) {
          value = 'N';
        }
        return value;
      };

      ctrl.$formatters.push(formatter);
    },
  };
});
