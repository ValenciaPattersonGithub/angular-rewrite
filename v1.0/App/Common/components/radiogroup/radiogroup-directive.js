'use strict';

angular.module('common.directives').directive('radiogroup', function () {
  return {
    restrict: 'E',
    scope: {
      uniqueId: '@',
      value: '=',
      options: '=' /** expect an array */,
      labels: '=?' /** expect an array */,
      changeFunction: '&?',
      disabled: '=?',
    },
    templateUrl: 'App/Common/components/radiogroup/radiogroup.html',
    controller: 'RadiogroupController',
    link: function link(scope, elem, attr) {
      // grabs tabindex form parent element to keep fluid tabbing through page
      scope.tabIndex = elem.attr('tabindex');
      // removes parent tab index, no longer necessary
      elem.attr('tabindex', '');

      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
