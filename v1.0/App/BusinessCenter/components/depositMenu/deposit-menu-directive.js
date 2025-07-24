'use strict';

angular.module('common.directives').directive('depositMenu', function () {
  return {
    restrict: 'E',
    scope: {
      deposit: '=',
    },
    templateUrl: 'App/BusinessCenter/components/depositMenu/deposit-menu.html',
    controller: 'DepositMenuController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
