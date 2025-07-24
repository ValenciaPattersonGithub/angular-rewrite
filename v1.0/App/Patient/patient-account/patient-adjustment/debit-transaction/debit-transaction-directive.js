'use strict';

/*
 * Basic Use:
 *
 * <debit-transaction data="dataForDirective">
 * </debit-transaction>
 *
 * How your data for directive should look:
 *
 * (1) data="dataForDirective"
 *          $scope.dataForDirective = {
 *                         PatientInfo: $scope.patientInfo,                     // Patient data object for which the transaction is being made
 *                         AdjustmentTypes: $scope.positiveAdjustmentTypes,     // Positive adjustment type array
 *                         Providers: dataForModal.AllProviders,                // List of all providers
 *                         DebitTransactionDto: $scope.debitTransactionDto,     // Initial debit transaction dto object
 *                         ErrorFlags: {                                        // Object containing the error flag
 *                             hasError: false
 *                         }
 *                     };
 *
 */

angular.module('Soar.Patient').directive('debitTransaction', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-adjustment/debit-transaction/debit-transaction.html',
    controller: 'DebitTransactionController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
