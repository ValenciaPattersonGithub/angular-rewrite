'use strict';
angular.module('common.directives').directive('comingSoon', [
  'localize',
  function (localize) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'App/Common/components/comingSoon/comingSoon.html ',
      scope: {
        message: '=',
      },
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
