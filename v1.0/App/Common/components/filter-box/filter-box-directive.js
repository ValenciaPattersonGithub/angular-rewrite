'use strict';

angular.module('common.directives').directive('filterBox', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      filterFunction: '=',
      filterObject: '=',
      filterTemplate: '=',
      list1: '=',
      list2: '=',
      originalFilterObject: '=',
      backupItems: '=?',
    },
    templateUrl: 'App/Common/components/filter-box/filter-box.html',
    controller: 'FilterBoxController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
