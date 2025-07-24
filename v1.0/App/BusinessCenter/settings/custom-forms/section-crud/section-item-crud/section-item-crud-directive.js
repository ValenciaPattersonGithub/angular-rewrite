'use strict';

angular.module('Soar.BusinessCenter').directive('sectionItemCrud', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl:
      'App/BusinessCenter/settings/custom-forms/section-crud/section-item-crud/section-item-crud.html',
    controller: 'SectionItemController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
