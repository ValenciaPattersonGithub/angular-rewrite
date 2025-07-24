angular.module('Soar.Common').directive('globalLocationSelector', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Common/header/globalLocationSelector/global-location-selector.html',
    controller: 'GlobalLocationSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
