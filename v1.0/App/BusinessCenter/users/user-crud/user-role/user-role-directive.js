'use strict';

angular.module('common.directives').directive('userRole', function () {
  return {
    restrict: 'E',
    scope: {
      // Name of the form to validate role field
      formName: '=',
      // User object from crud screen to compare modification in role
      user: '=',
      // Enable or disable validation
      hasLocationErrors: '=',
      hasRoleErrors: '=',
      // Expose role id to implementor
      roleId: '=',
      // Modified role id
      updatedRoleId: '=',
      // Current practice id
      practiceId: '=',
      // indicates that roles have loaded
      rolesStatus: '=',
    },
    templateUrl: 'App/BusinessCenter/users/user-crud/user-role/user-role.html',
    controller: 'UserRoleController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
