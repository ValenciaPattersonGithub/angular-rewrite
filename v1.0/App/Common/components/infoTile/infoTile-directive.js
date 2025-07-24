'use strict';

angular.module('common.directives').directive('infoTile', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: 'App/Common/components/infoTile/infoTile.html',
    controller: 'InfoTileController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
