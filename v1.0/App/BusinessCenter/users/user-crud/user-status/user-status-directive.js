'use strict';

angular.module('Soar.BusinessCenter').directive('userStatus', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/BusinessCenter/users/user-crud/user-status/user-status.html',
    scope: {
      user: '=',
      hasErrors: '=',
      update: '&',
      refreshHistory: '=',
      showToggle: '=',
    },
    controller: 'UserStatusController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
