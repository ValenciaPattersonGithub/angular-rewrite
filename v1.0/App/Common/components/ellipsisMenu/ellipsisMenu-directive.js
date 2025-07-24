'use strict';

angular.module('common.directives').directive('ellipsisMenu', function () {
  return {
    restrict: 'E',
    scope: {
      callFunction: '&',
      menuActions: '=',
      menuDisabled: '=?',
      param: '=?',
      menuTabindex: '=?',
    },
    templateUrl: 'App/Common/components/ellipsisMenu/ellipsisMenu.html',
    controller: 'EllipsisMenuController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
