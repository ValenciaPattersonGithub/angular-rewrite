'use strict';

angular.module('Soar.BusinessCenter').directive('sectionHeader', function () {
  return {
    restrict: 'E',
    scope: true,
    templateUrl:
      'App/BusinessCenter/settings/custom-forms/section-crud/section-header/section-header.html',
    controller: 'SectionHeaderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
