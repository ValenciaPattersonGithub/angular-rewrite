'use strict';

angular.module('Soar.BusinessCenter').directive('userSearch', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/BusinessCenter/users/user-search/user-search.html',
    controller: 'UserSearchController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
