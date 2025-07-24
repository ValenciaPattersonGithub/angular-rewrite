'use strict';

angular.module('common.directives').directive('receivableMenu', function () {
  return {
    restrict: 'E',
    scope: {
      receivable: '=',
    },
    templateUrl:
      'App/BusinessCenter/components/receivableMenu/receivable-menu.html',
    controller: 'ReceivableMenuController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
