'use strict';

angular.module('Soar.Patient').directive('patientAccountBalance', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
      accountTotal: '=',
      accountTotalLoading: '=',
      graphData: '=',
      accountBalances: '=',
    },
    templateUrl:
      'App/Patient/patient-account-summary/patient-account-balance/patient-account-balance.html',
    controller: 'PatientAccountBalanceController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
