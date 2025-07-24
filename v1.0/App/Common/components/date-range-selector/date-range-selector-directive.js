'use strict';

angular.module('common.directives').directive('dateRangeSelector', function () {
  return {
    restrict: 'E',
    scope: {
      fromValue: '=',
      toValue: '=',
      applyAction: '&',
      tzDatabaseName: '=?', // timezone database name. if null, no conversion will occur
    },
    templateUrl:
      'App/Common/components/date-range-selector/date-range-selector-template.html',
    controller: 'DateRangeSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
