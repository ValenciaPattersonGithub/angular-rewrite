'use strict';

// data will contain the list of data to be displayed

angular.module('Soar.Widget').directive('halfDonut', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      drilldown: '=',
    },
    templateUrl: 'App/Widget/directives/half-donut.html',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
