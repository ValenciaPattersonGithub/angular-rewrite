'use strict';

// Grid Directive
// This grid directive is restricted to an element <grid>

angular.module('common.directives').directive('grid', function () {
  return {
    restrict: 'E',
    scope: {
      id: '@',
      options: '=',
    },
    templateUrl: 'App/Common/components/grid/grid-template.html',
    controller: 'GridController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
