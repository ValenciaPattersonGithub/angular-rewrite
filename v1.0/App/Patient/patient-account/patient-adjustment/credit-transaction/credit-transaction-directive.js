'use strict';
/*
 * Basic Use:
 *
 * <credit-transaction data="dataForDirective">
 * </credit-transaction>
 *
 * How your data for directive should look:
 *
 * (1) data="dataForDirective"
 *          $scope.dataForDirective = {
 *                          PatientInfo: ctrl.patientInfo,                                      // Patient data object for which the transaction is being made
 *                          PaymentTypes: $scope.paymentTypes,                                  // List of all payment types
 *                          AdjustmentTypes: $scope.filteredAdjustmentTypes,                    // List of all adjustment types
 *                          Providers: dataForModal.AllProviders,                               // List of all providers
 *                          CreditTransactionDto: angular.copy($scope.creditTransactionDto),    // Credit transaction dto object
 *                          UnassignedAmount: 0,                                                // Unassigned amount
 *                          ServiceAndDebitTransactionDtos: [],                                 // List of service/debit transactions
 *                          SelectedAdjustmentTypeIndex: ctrl.defaultSelectedOptionIndex,       // Flag to denote operation 1: '-' Adjustment 2: Account Payment
 *                          ErrorFlags: {                                                       // Error Flags
 *                              hasError: false,
 *                              providerMissing: false
 *                          },
 *                          IsTransactionOnEncounter: false                                     // true: Adjustment on particular encounter's transactions false: Adjustment on all transactions
 *                     };
 *
 */
angular.module('Soar.Patient').directive('creditTransaction', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-adjustment/credit-transaction/credit-transaction.html',
    controller: 'CreditTransactionController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
