'use strict';

angular.module('common.directives').directive('roleInfo', function () {
  return {
    restrict: 'E',
    scope: {
      locations: '=',
      roles: '=',
      frmUserCrud: '=',
      validForm: '=',
    },
    require: ['^form', 'ngModel'],
    templateUrl: 'App/Common/components/roleInfo/roleInfo.html',
    controller: 'RoleInfoController',
    link: function (scope, element, attrs, ctrls) {
      scope.form = ctrls[0];
      var ngModel = ctrls[1];

      if (attrs.required !== undefined) {
        // If attribute required exists
        // ng-required takes a boolean
        scope.required = true;
      }

      scope.$watch('inpRoleType', function () {
        ngModel.$setViewValue(scope.roles.type);
      });
    },
  };
});
