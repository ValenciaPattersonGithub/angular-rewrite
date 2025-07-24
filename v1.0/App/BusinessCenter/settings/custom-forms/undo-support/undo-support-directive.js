'use strict';

angular.module('Soar.BusinessCenter').directive('undoSupport', function () {
  return {
    restrict: 'E',
    scope: true,
    controller: 'UndoSupportController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
