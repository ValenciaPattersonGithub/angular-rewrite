'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('serviceCodesFilter', function () {
    return {
      transclude: true,
      restrict: 'E',
      template:
        '<filter-box data="data" filter-function="filterServiceCodes" filter-object="filterObject" ' +
        'filter-template="filterTemplate" list1="items" backup-items="originalItems"' +
        'original-filter-object="originalFilterObject" ></filter-box>',
      scope: {
        filtering: '=',
        items: '=',
        originalItems: '=',
        serviceTypes: '=',
        sortMethod: '=',
      },
      controller: 'ServiceCodesFilterController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
