'use strict';

angular.module('Soar.Patient').directive('medicalHistory', function () {
  return {
    restrict: 'E',
    scope: {
      editData: '=?',
      additionalData: '=?',
      patientInfo: '=',
      id: '@',
      title: '@',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/health/medical-history/medical-history.html',
    controller: 'MedicalHistoryController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
