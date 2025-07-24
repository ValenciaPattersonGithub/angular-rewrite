'use strict';

// Need to handle loading, and error handling here.

angular.module('Soar.Widget').directive('soarWidget', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      hideWidget: '=',
    },
    templateUrl: 'App/Widget/directives/soar-widget.html',
    controller: 'SoarWidgetController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
