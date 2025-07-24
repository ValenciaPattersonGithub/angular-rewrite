'user strict';

angular.module('common.directives').directive('initialBadge', function () {
  return {
    restrict: 'E',
    scope: {
      person: '<',
    },
    templateUrl: 'App/Common/components/initialBadge/initialBadge.html',
    controller: 'InitialBadgeController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
