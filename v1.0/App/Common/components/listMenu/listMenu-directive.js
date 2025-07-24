'use strict';

angular.module('common.directives').directive('listMenu', function () {
  return {
    restrict: 'E',
    scope: {
      baseUrl: '@',
      menuOptions: '=',
    },
    templateUrl: 'App/Common/components/listMenu/listMenu.html',
    controller: 'ListMenuCtrl',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
