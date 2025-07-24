'use strict';

angular.module('Soar.Patient').directive('preventiveCare', function () {
  return {
    restrict: 'E',
    scope: {
      patientPrevCareOverrides: '=?',
      patientInfo: '=?',
      editing: '=?',
      patientId: '=?',
      showDetails: '=?',
      valid: '=',
      saveFunction: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/health/preventive-care/preventive-care.html',
    controller: 'PreventiveCareDirectiveController',
  };
});
