'use strict';

angular.module('common.directives').directive('boxSelectorItem', function () {
  return {
    restrict: 'E',
    scope: {
      item: '=?',
    },
    template: '<ng-include src="getTemplateUrl()"/>',
    controller: 'BoxSelectorItemController',
    link: function link(scope, element, attrs) {
      scope.getTemplateUrl = function () {
        if (attrs.templateUrl) {
          scope.element = element;
          return attrs.templateUrl;
        }
      };
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
