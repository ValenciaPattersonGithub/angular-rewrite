'use strict';

angular.module('Soar.BusinessCenter').directive('userGroups', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/BusinessCenter/users/user-crud/user-groups/user-groups.html',
    scope: {
      user: '=',
      comboBoxBlur: '&',
      setPristine: '&',
      providerError: '=?',
      hasErrors: '=?',
    },
    controller: 'UserGroupsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
