'use strict';

angular.module('common.directives').directive('slideOutFilter', function () {
  return {
    restrict: 'E',
    scope: {
      filters: '=',
      applyFiltersFn: '&',
      resetFiltersFn: '&',
      hideFiltersFn: '&?',
      collapse: '=?',
      hideExpandCollapseBtn: '=',
    },
    templateUrl:
      'App/Common/components/slideout-filter/slideout-filter-template.html',
    controller: 'SlideOutFilterController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
