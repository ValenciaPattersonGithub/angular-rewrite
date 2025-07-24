'use strict';

angular.module('Soar.Patient').directive('heightWeight', function () {
  return {
    restrict: 'E',
    scope: {
      patientInfo: '=',
      additionalData: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/health/height-weight/height-weight.html',
    controller: 'HeightWeightController',
  };
});
