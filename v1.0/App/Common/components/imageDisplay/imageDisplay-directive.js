'use strict';
angular.module('common.directives').directive('imageDisplay', [
  function () {
    return {
      templateUrl: 'App/Common/components/imageDisplay/imageDisplay.html',
      replace: true,
      scope: {
        currentImage: '=',
        defaultImage: '@',
        editMode: '=',
        confirmedChange: '=',
      },
      restrict: 'E',
      controller: 'ImageDisplayController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
