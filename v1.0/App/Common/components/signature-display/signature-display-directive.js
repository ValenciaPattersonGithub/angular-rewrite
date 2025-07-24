'use strict';

angular.module('Soar.Common').directive('signatureDisplay', function () {
  return {
    restrict: 'E',
    scope: {
      fileAllocationId: '=',
      sigTitle: '=',
    },
    templateUrl:
      'App/Common/components/signature-display/signature-display.html',
    controller: 'SignatureDisplayController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
