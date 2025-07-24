'use strict';

angular
  .module('common.directives')
  .directive('numberRangeSelector', function () {
    return {
      restrict: 'E',
      scope: {
        fromValue: '=',
        toValue: '=',
        applyAction: '&',
      },
      templateUrl:
        'App/Common/components/number-range-selector/number-range-selector-template.html',
      controller: 'NumberRangeSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
