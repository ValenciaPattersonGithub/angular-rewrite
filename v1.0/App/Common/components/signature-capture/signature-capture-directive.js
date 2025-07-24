'use strict';

angular.module('Soar.Common').directive('signatureCapture', function () {
  return {
    restrict: 'E',
    scope: {
      patientInfo: '=',
      sigTitle: '=',
      fileAllocationId: '=',
      clearEntry: '=?',
      signatureDate: '=?',
    },
    templateUrl:
      'App/Common/components/signature-capture/signature-capture.html',
    controller: 'SignatureCaptureController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
