'use strict';

angular.module('Soar.Patient').directive('medicalHistoryCrud', function () {
  return {
    restrict: 'E',
    scope: {
      editing: '=?',
      patientInfo: '=',
      id: '@',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/health/medical-history/medical-history-crud/medical-history-crud.html',
    controller: 'MedicalHistoryCrudController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
