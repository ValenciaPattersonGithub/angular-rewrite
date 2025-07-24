angular.module('common.directives').directive('minValue', function () {
  function isEmpty(value) {
    return (
      angular.isUndefined(value) ||
      value === '' ||
      value === null ||
      value !== value
    );
  }
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {
      scope.$watch(attr.minValue, function () {
        ctrl.$setViewValue(ctrl.$viewValue);
      });
      var minValidator = function (value) {
        var min = scope.$eval(attr.minValue) || 0;
        if (!isEmpty(value) && value < min) {
          ctrl.$setValidity('minValue', false);
          return value;
        } else {
          ctrl.$setValidity('minValue', true);
          return value;
        }
      };

      ctrl.$parsers.push(minValidator);
      ctrl.$formatters.push(minValidator);
    },
  };
});
