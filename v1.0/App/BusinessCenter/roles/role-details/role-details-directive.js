'use strict';

angular.module('Soar.BusinessCenter').directive('roleDetails', function () {
  return {
    restrict: 'E',
    scope: {
      roleId: '=',
    },
    templateUrl: 'App/BusinessCenter/roles/role-details/role-details.html',
    controller: 'RoleDetailsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
