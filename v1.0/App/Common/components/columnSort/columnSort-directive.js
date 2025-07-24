'use strict';
angular.module('common.directives').directive('columnSort', [
  'localize',
  function (localize) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        col: '@',
        sortField: '=',
        asc: '=',
      },
      templateUrl: 'App/Common/components/columnSort/columnSort.html ',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
