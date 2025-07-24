'use strict';
angular.module('common.directives').directive('validEmail', function () {
  return {
    require: 'ngModel',
    // email address max length must be less than or equal to 256
    // scope is an Angular scope object.
    // element is the jqLite-wrapped element that this directive matches.
    // attrs is a hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
    // controller
    scope: {
      validEmailRequired: '=',
      tenant: '=',
    },
    link: function (scope, element, attrs, controller) {
      controller.$parsers.unshift(function (viewValue) {
        // cases where viewValue is undefined assign empty string
        if (!viewValue) {
          if (!scope.validEmailRequired) {
            viewValue = '';
          } else {
            controller.$setValidity('validEmail', false);
            return viewValue;
          }
        }

        // if a tenant is passed, append it to the view value before testing against the regex
        if (scope.tenant) {
          viewValue = viewValue + '@' + scope.tenant;
        }

        var validLength = viewValue.length <= 256;
        var emailPattern =
          /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if (
          validLength &&
          (emailPattern.test(viewValue) || viewValue.length == 0)
        ) {
          controller.$setValidity('validEmail', true);
        } else {
          controller.$setValidity('validEmail', false);
        }
        return viewValue;
      });
    },
  };
});
