angular.module('common.directives').directive('maxValue', function () {
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
      scope.$watch(attr.maxValue, function () {
        ctrl.$setViewValue(ctrl.$viewValue);
      });
      var maxValidator = function (value) {
        var max = scope.$eval(attr.maxValue) || Infinity;
        if (!isEmpty(value) && value > max) {
          ctrl.$setValidity('maxValue', false);
          return value;
        } else {
          ctrl.$setValidity('maxValue', true);
          return value;
        }
      };
      ctrl.$parsers.push(maxValidator);
      ctrl.$formatters.push(maxValidator);
    },
  };
});
