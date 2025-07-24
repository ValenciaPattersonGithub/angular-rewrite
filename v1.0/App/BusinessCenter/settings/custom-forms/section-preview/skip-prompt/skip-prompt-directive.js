'use strict';

angular.module('Soar.BusinessCenter').directive('skipPrompt', function () {
  return {
    templateUrl:
      'App/BusinessCenter/settings/custom-forms/section-preview/skip-prompt/skip-prompt.html',
    restrict: 'E',
    scope: true,
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
