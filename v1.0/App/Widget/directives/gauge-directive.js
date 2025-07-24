'use strict';

// data will contain the list of data to be displayed

angular.module('Soar.Widget').directive('gauge', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      drilldown: '=',
    },
    templateUrl: 'App/Widget/directives/gauge.html',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
