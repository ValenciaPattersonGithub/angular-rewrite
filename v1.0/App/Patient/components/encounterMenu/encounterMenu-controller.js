'use strict';

angular.module('Soar.Patient').controller('EncounterMenuController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  '$window',
  'DepositService',
  'AccountNoteFactory',
  'tabLauncher',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    $window,
    depositService,
    accountNoteFactory,
    tabLauncher
  ) {
    // featureService
    // Event for expanding encounter row in summary screen
    $scope.expandEncounter = function () {
      // Call a callback function for "View Details" action from summary screen
      $scope.viewDetailsActionFunction($scope.encounter);
    };

    // Event for View statement link from transaction history screen on encounterMenu
    $scope.viewStatement = function () {
      accountNoteFactory.viewStatement(
        $scope.encounter.AccountStatementId
          ? $scope.encounter.AccountStatementId
          : $scope.encounter.ObjectId
      );
    };

    // Event for deleting encounter row from summary screen or transaction history screen
    $scope.deleteEncounter = function () {
      // Call a callback function for "Delete" action from summary or transaction history screen.
      $scope.deleteActionFunction(angular.copy($scope.encounter));
    };

    // Event for expanding or collapsing encounter menu
    $scope.toggleMenu = function () {
      if ($scope.encounter.showDetail === true) {
        $scope.viewDetailsActionFunction($scope.encounter);
      }
    };

    // Apply adjustment on encounter
    $scope.applyAdjustment = function () {
      // Note- second parameter "true" denotes adjustment operation
      // Call a callback function for "Apply adjustment" action from summary screen
      $scope.applyAdjustmentActionFunction(
        angular.copy($scope.encounter),
        true
      );
    };

    // Apply a payment on encounter
    $scope.applyPayment = function () {
      // Note- second parameter "false" denotes payment operation
      // Call a callback function for "Apply a payment" action from summary screen
      $scope.applyPaymentActionFunction(angular.copy($scope.encounter), false);
    };

    // Open transaction for view/edit action
    $scope.editTransaction = function () {
      $scope.editActionFunction($scope.encounter);
    };

    // Callback function for opening encounter in summary screen that contains current selected service transaction/ payment transaction/ adjustment transaction
    $scope.viewEncounter = function () {
      $scope.viewCompleteEncounterActionFunction($scope.encounter);
    };

    $scope.viewCarrierResponse = function () {
      $scope.viewCarrierResponseFunction($scope.encounter);
    };

    $scope.changePaymentOrAdjustment = function () {
      // Call a callback function for "Change how payment or adjustment is applied" action from transaction-history screen
      $scope.changePaymentOrAdjustmentActionFunction(
        angular.copy($scope.encounter)
      );
    };

    // Call a callback function for "Create claim"
    $scope.createClaimAction = function () {
      $scope.createClaimActionFunction(angular.copy($scope.encounter));
    };

    // Watch the isOpen, when set to false hide the DD menu by removing class
    // (#Bug) When encounter is expanded from DD menu and closed by double click, encounter gets collapsed but still DD menu is shown as DD hide event is not getting fired.
    // Removing open class closed the DD menu
    $scope.$watch('encounter.showDetail', function (nv, ov) {
      if (nv !== ov && nv === false) {
        $timeout(function () {
          angular
            .element('#btnGroup' + $scope.encounterIndex)
            .removeClass('open');
        }, 0);
      }
    });

    $scope.printReceipt = function () {
      $scope.printReceiptFunction(angular.copy($scope.encounter));
    };

    //disable logic area
    $scope.disableTransactionMessage = '';
    switch ($scope.disableEditButton) {
      case 0:
        break;
      case 1:
        $scope.disableTransactionMessage =
          'This service is attached to a claim that is InProcess and it cannot be edited or deleted';
        break;
      case 2:
        $scope.disableTransactionMessage =
          'Credit/Debit Card Payments cannot be edited';
        break;
      case 3:
        $scope.disableTransactionMessage =
          'Credit/Debit card returns cannot be edited or deleted';
        break;
      case 4:
        $scope.disableTransactionMessage =
          'This payment is already deposited and it cannot be edited or deleted.';
        break;
    }

    $scope.viewInvoice = function () {
      var encounter = angular.copy($scope.encounter);
      $scope.viewInvoiceFunction(encounter);
    };

    $scope.getEditButtonAmfa = function () {
      var amfa = 'soar-acct-enctr-edit';

      if ($scope.encounter) {
        switch ($scope.encounter.TransactionTypeId) {
          case 2:
            amfa = 'soar-acct-aapmt-edit';
            break;
          case 3:
            amfa = 'soar-acct-aipmt-edit';
            break;
          case 4:
            amfa = 'soar-acct-cdtadj-edit';
            break;
          case 5:
            amfa = 'soar-acct-dbttrx-edit';
            break;
        }
      }

      return amfa;
    };

    $scope.getDeleteButtonAmfa = function () {
      var amfa = 'soar-acct-enctr-delete';

      if ($scope.encounter) {
        switch ($scope.encounter.TransactionTypeId) {
          case 1:
            amfa = 'soar-acct-actsrv-delete';
            break;
          case 2:
            amfa = 'soar-acct-aapmt-delete';
            break;
          case 3:
            amfa = 'soar-acct-aipmt-delete';
            break;
          case 4:
            amfa = 'soar-acct-cdtadj-delete';
            break;
          case 5:
            amfa = 'soar-acct-dbttrx-delete';
            break;
        }
      }

      return amfa;
    };

    $scope.viewEob = function () {
      $scope.viewEobActionFunction(angular.copy($scope.encounter));
    };

    $scope.getDepositDetailsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve deposit details.'),
        localize.getLocalizedString('Error')
      );
    };

    $scope.viewDeposit = function (objEncounter) {
      $scope.isViewDeposit = true;
      var urlToOpen =
        '#/BusinessCenter/Receivables/Deposits/' +
        $scope.encounter.LocationId +
        '/ViewDeposit/';
      if (!_.isNil(objEncounter.DepositId)) {
        urlToOpen += objEncounter.DepositId;
        $window.$windowScope = $scope;
        tabLauncher.launchNewTab(urlToOpen);
      } else if (!_.isNil($scope.depositCreditTransactionId)) {
        depositService
          .getDepositIdByCreditTransactionId({
            creditTransactionId: $scope.depositCreditTransactionId,
          })
          .$promise.then(function (res) {
            urlToOpen += res.Value;
            $window.$windowScope = $scope;
            tabLauncher.launchNewTab(urlToOpen);
          });
      }
    };

    $scope.openClaimNotes = function () {
      if (
        !_.isNull($scope.encounter) &&
        _.isEqual($scope.encounter.Claims.length, 1)
      ) {
        var claim = $scope.encounter.Claims[0];
        accountNoteFactory.openClaimNoteModal(
          claim,
          $scope.encounter.PersonId,
          $scope.encounter.LocationId,
          $scope.refreshPageDataForGrid
        );
      }
    };
  },
]);
