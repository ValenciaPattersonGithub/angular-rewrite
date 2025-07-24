'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('sectionPreviewDirective', function () {
    return {
      templateUrl:
        'App/BusinessCenter/settings/custom-forms/section-preview/section-preview.html',
      restrict: 'E',
      scope: true,
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
