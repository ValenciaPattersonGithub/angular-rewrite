'use strict';
/*
 * Basic Use:
 *
 * <unapplied-menu id="unappliedMenu{{$index}}" unapplied-data-model="transactionHistoryService.unappliedDataModel" refresh-data="refreshTransactionHistoryPageData"></unapplied-menu>
 *
 * How your data for directive should look:
 *
 * (1) unapplied-data-model="dataForDirective"
 *          $scope.transactionHistoryService.unappliedDataModel = {
 *                          unappliedCreditTransactions: [angular.copy(serviceTransClientDto)],         // Credit-transaction list where that credit-transaction has unapplied credit-transaction-detail in it
 *                          showUnappliedDetail: false,                                                 // flag to show/hide menu on click
 *                          patientAccountDetails: {                                                    // account-id and account-member-id of the patient searched
 *                              AccountId: $scope.patient.Data.PersonAccount ? $scope.patient.Data.PersonAccount.PersonAccountMember.AccountId : '',
 *                              AccountMemberId: $scope.patient.Data.PersonAccount ? $scope.patient.Data.PersonAccount.PersonAccountMember.AccountMemberId : ''
 *                          },
 *                          currentPatientId: $routeParams.patientId,                                   // patient-id of currently searched patient
 *                          allProviders: $scope.allProviders                                           // list of all providers
 *                          totalUnappliedAmount: 10                                                    // total unapplied amount
 *                          showTotalUnappliedAmount: false                                             // true or false depending upon from where it is getting initialized
 *                     };
 *
 * (2) refreshData = "someCallback"
 *          $scope.someCallback = function()
 *          {
 *              // Logic to reload data
 *          }
 *
 */

angular.module('Soar.Patient').directive('unappliedMenu', function () {
  return {
    restrict: 'E',
    scope: {
      unappliedTransactions: '=',
      currentPatientId: '=',
      refreshData: '=',
      showUnappliedTotal: '&?',
    },
    templateUrl: 'App/Patient/components/unappliedMenu/unappliedMenu.html',
    controller: 'UnappliedMenuController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
