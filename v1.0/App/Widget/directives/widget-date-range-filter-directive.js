'use strict';

angular.module('Soar.Widget').directive('widgetDateRangeFilter', function () {
  return {
    retrict: 'E',
    scope: {
      dateFilter: '=',
      options: '=',
      fromDate: '=',
      toDate: '=',
      onChange: '=?',
      onClear: '=?',
    },
    templateUrl: 'App/Widget/directives/widget-date-range-filter.html',
    controller: 'WidgetDateRangeFilterController',
    link: function (scope, element, attrs) {
      element.on('$destroy', function () {
        scope.$destroy();
      });

      if (!attrs.onChange) {
        scope.onChange = function (dateOption) {};
      }
    },
  };
});
