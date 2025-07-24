'use strict';

angular.module('Soar.Patient').directive('medicalHistoryUploader', function () {
  return {
    restrict: 'E',
    scope: {
      close: '&',
    },
    templateUrl:
      'App/Patient/patient-chart/health/medical-history/medical-history-uploader/medical-history-uploader.html',
    controller: 'MedicalHistoryUploaderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
