'use strict';

angular
  .module('Soar.Patient')
  .directive('medicalHistoryPrintDirective', function () {
    return {
      constroller: 'MedicalHistoryPrintController',
      templateUrl:
        'App/Patient/patient-chart/health/medical-history/medical-history-pritn/medical-history-pritn.html',
      restrict: 'E',
      scope: {},
    };
  });
