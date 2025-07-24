'use strict';

angular
  .module('Soar.Patient')
  .directive('patientAccountInsuranceAdjustedEstimate', function () {
    return {
      restrict: 'E',
      scope: {
        person: '=',
        adjEstimateLoading: '=',
        adjustedEstIns: '=',
        providers: '=',
      },
      templateUrl:
        'App/Patient/patient-account-summary/patient-account-insurance-adjusted-estimate/patient-account-insurance-adjusted-estimate.html',
      controller: 'PatientAccountInsuranceAdjustedEstimateController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
