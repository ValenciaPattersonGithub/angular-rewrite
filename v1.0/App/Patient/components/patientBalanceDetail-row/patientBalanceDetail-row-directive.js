'use strict';

angular.module('Soar.Patient').directive('balanceDetailRow', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      selectedPatientId: '=',
      resetData: '=?',
      getLatestDetails: '=?',
      refreshTransactionHistory: '=?',
      refreshSummaryPage: '=?',
      filteredAccountMembers: '=?',
      linkToAllAccountMembers: '@?',
    },
    templateUrl:
      'App/Patient/components/patientBalanceDetail-row/patientBalanceDetail-row.html',
    controller: 'PatientBalanceDetailRowController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
