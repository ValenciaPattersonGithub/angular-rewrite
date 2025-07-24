'use strict';

angular.module('Soar.BusinessCenter').directive('businessNav', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'App/BusinessCenter/business-nav/business-nav.html',
    controller: 'BusinessNavController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
