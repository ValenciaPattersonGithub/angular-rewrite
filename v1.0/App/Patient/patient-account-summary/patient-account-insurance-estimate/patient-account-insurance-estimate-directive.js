'use strict';

angular
  .module('Soar.Patient')
  .directive('patientAccountInsuranceEstimate', function () {
    return {
      restrict: 'E',
      scope: {
        person: '=',
        insEstimateLoading: '=',
        disablePayments: '=',
        paymentFunction: '&',
        insuranceEstimate: '=',
      },
      templateUrl:
        'App/Patient/patient-account-summary/patient-account-insurance-estimate/patient-account-insurance-estimate.html',
      controller: 'PatientAccountInsuranceEstimateController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
