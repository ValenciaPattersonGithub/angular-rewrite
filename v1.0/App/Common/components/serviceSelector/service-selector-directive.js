'use strict';

angular.module('common.directives').directive('serviceSelector', function () {
  return {
    restrict: 'E',
    scope: {
      plannedServices: '=',
    },
    templateUrl: 'App/Common/components/serviceSelector/service-selector.html',
    controller: 'ServiceSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
