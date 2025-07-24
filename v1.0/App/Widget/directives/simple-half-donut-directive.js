'use strict';

// data will contain the list of data to be displayed

angular.module('Soar.Widget').directive('simpleHalfDonut', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      tooltip: '=',
      drilldown: '=',
    },
    templateUrl: 'App/Widget/directives/simple-half-donut.html',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
