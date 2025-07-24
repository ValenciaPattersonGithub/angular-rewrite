'use strict';

angular.module('common.directives').directive('slidePanel', function () {
  return {
    restrict: 'E',
    scope: {
      bodyTemplate: '=',
    },
    templateUrl: 'App/Common/components/slidePanel/slidePanel.html',
    controller: 'SlidePanelController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
