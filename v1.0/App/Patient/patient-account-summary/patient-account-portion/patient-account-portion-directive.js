'use strict';

angular.module('Soar.Patient').directive('patientAccountPortion', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
      patientPortion: '=',
      patientPortionLoading: '=',
      disablePayments: '=',
      paymentFunction: '&',
    },
    templateUrl:
      'App/Patient/patient-account-summary/patient-account-portion/patient-account-portion.html',
    controller: 'PatientAccountPortionController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
