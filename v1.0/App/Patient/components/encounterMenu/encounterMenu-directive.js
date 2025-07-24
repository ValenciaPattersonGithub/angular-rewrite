'use strict';

angular.module('Soar.Patient').directive('encounterMenu', function () {
  return {
    restrict: 'E',
    scope: {
      // Holds an index or encounter row
      encounterIndex: '=',

      // Callback function for "Checkout All" button
      checkoutActionFunction: '&',

      // Property to disable or enable "Checkout All" button
      disableCheckoutAllButton: '=',

      // Property to hide or unhide "Checkout All" button
      hideCheckoutAllButton: '=?',
      isPendingEncounterGrid: '=?',

      // Callback function for refreshing grid data
      refreshPageDataForGrid: '=',

      // Callback function for "View Details" menu option
      viewDetailsActionFunction: '=?',

      // Property to hide or unhide "View Details" menu option
      showViewDetailButton: '=?',

      // Property to hide or unhide "Delete" menu option
      showDeleteButton: '=?',

      // Property to hide or unhide "View Claims" menu option
      showViewClaimButton: '=?',

      // Property to hide or unhide "View/Edit Note" menu option
      showViewEditClaimNoteButton: '=?',

      // Encounter claims object for popover
      encounterClaimsObj: '=?',

      // Property to disable or enable "Delete" menu option
      disableDeleteButton: '=?',

      // Callback function for "Delete" menu option
      deleteActionFunction: '=?',

      // Property to hide or unhide "Edit Transaction" menu option
      showEditButton: '=?',

      // Property to disable or enable "Edit" menu option
      disableEditButton: '=?',

      // Property to hide or unhide "Edit encounter" menu option
      showEditEncounterButton: '=?',

      // Property to disable or enable "Edit Encounter" menu option
      disableEditEncounterButton: '=?',

      // Callback function for "Edit Transaction/Edit Encounter" menu option
      editActionFunction: '=?',

      // Property to hide or unhide "Apply Adjustment" menu option
      showApplyAdjustmentButton: '=?',

      // Callback function for "Apply adjustment" menu option
      applyAdjustmentActionFunction: '=?',

      // Property to hide or unhide "Apply a payment" menu option
      showApplyPaymentButton: '=?',

      // Callback function for "Create claim" menu option
      createClaimActionFunction: '=?',

      // Callback function for "Apply a payment" menu option
      applyPaymentActionFunction: '=?',

      // Property to hide or unhide "Show Complete Encounter" menu option
      showViewCompleteEncounterButton: '=?',

      // Callback function for "View Complete Encounter" menu option
      viewCompleteEncounterActionFunction: '=?',

      // Callback function for "View PreD Response" menu option
      viewCarrierResponseFunction: '=?',

      // Property to hold object bound with row which can be sent back to caller using callback function
      encounter: '=',

      //Callback function for "Change how payment/- adjustment is applied" menu option
      changePaymentOrAdjustmentActionFunction: '=?',

      // Property to hide or unhide "Change how payment/- adjustment is applied" menu option
      // this flag can be removed when we get pbi to show this menu option from summary screen too
      showChangePaymentOrAdjustmentOption: '=?',

      // Property to hide or unhide "Create Claim" menu option
      showCreateClaimButton: '=?',

      //property to disable "Create Claim" menu option
      disableCreateClaimButton: '=?',

      //message shown when create claim button is disabled
      disableMessage: '=?',

      //Callback function for view invoice menu option
      viewInvoiceFunction: '=?',

      printReceiptFunction: '=?',

      // Property to determine whether View EOB link is shown
      showViewEobButton: '=?',

      // Callback function for view EOB
      viewEobActionFunction: '=?',

      // Credit transaction ID to use for retrieving deposit for view deposit
      depositCreditTransactionId: '=?',
    },
    templateUrl: 'App/Patient/components/encounterMenu/encounterMenu.html',
    controller: 'EncounterMenuController',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
