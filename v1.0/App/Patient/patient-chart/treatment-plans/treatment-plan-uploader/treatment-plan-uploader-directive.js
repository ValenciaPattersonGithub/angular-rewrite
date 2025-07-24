'use strict';

angular.module('Soar.Patient').directive('treatmentPlanUploader', function () {
  return {
    restrict: 'E',
    scope: {
      close: '&',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plan-uploader/treatment-plan-uploader.html',
    controller: 'TreatmentPlanUploaderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
