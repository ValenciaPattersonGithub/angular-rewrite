'use strict';

angular.module('Soar.Common').directive('rotSelector', function () {
  return {
    restrict: 'E',
    scope: {
      selected: '=',
    },
    templateUrl: 'App/Common/components/rotSelector/rotSelector.html',
    controller: 'RotSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
