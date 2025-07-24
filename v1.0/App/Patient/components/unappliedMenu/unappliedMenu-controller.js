'use strict';

angular.module('Soar.Patient').controller('UnappliedMenuController', [
  '$scope',
  '$rootScope',
  'patSecurityService',
  'toastrFactory',
  'ModalDataFactory',
  'ModalFactory',
  'ListHelper',
  'referenceDataService',
  'AccountCreditTransactionFactory',
  '$filter',
  function (
    $scope,
    $rootScope,
    patSecurityService,
    toastrFactory,
    modalDataFactory,
    modalFactory,
    listHelper,
    referenceDataService,
    accountCreditTransactionFactory,
    $filter
  ) {
    var ctrl = this;
    $scope.soarAuthAddAccountPaymentKey = 'soar-acct-aapmt-add';
    $scope.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';

    $scope.showUnappliedDetail = false;
    ctrl.patientAccountDetails = {
      AccountId: $scope.$parent.patient.Data.PersonAccount
        ? $scope.$parent.patient.Data.PersonAccount.PersonAccountMember
            .AccountId
        : '',
      AccountMemberId: $scope.$parent.patient.Data.PersonAccount
        ? $scope.$parent.patient.Data.PersonAccount.PersonAccountMember
            .AccountMemberId
        : '',
    };

    // Check if logged in user has view access to this page
    $scope.authAddAccountPaymentAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthAddAccountPaymentKey
      );
    };

    $scope.authAddCreditTransactionAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthAddCreditAdjustmentKey
      );
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function (authMessageKey) {
      toastrFactory.error(
        patSecurityService.generateMessage(authMessageKey),
        'Not Authorized'
      );
    };

    /**
     * Function to open patient adjustment modal.
     *
     * @returns {angular.IPromise}
     */
    $scope.openAdjustmentModal = function () {
      // Get the full credit transaction dto before applying if for only one row item. Do not load all necessary data on new transaction history page.
      if (
        $scope.unappliedTransactions &&
        $scope.unappliedTransactions.length === 1 &&
        !_.isUndefined($scope.unappliedTransactions[0].ObjectId)
      ) {
        return accountCreditTransactionFactory
          .getCreditTransaction(
            ctrl.patientAccountDetails.AccountId,
            $scope.unappliedTransactions[0].ObjectId
          )
          .then(function (res) {
            var creditTransaction = res.Value;
            creditTransaction.UnassignedAmount = $filter(
              'getUnassignedCreditTransactionDetailAmountFilter'
            )(creditTransaction.CreditTransactionDetails);
            return ctrl.setupModalData([creditTransaction]);
          });
      } else {
        // If passing multiple transactions or has old data structure then continue (Apply All on account summary or old tx history page)
        return ctrl.setupModalData($scope.unappliedTransactions);
      }
    };

    /**
     * Setup modal data.
     *
     * @param {*} creditTransactions
     * @returns {angular.IPromise}
     */
    ctrl.setupModalData = function (creditTransactions) {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (providers) {
          var dataForModal = {
            PatientAccountDetails: ctrl.patientAccountDetails,
            DefaultSelectedIndex: -1,
            AllProviders: providers,
            UnappliedTransactions: creditTransactions,
            unappliedCreditTransactionDetailId:
              $scope.unappliedCreditTransactionDetailId,
          };
          var hasAdjustment = listHelper.findItemByFieldValue(
            $scope.unappliedTransactions,
            'TransactionTypeId',
            4
          );
          var hasPayments = listHelper.findItemByFieldValue(
            $scope.unappliedTransactions,
            'TransactionTypeId',
            2
          );
          var hasInsurancePayment = listHelper.findItemByFieldValue(
            $scope.unappliedTransactions,
            'TransactionTypeId',
            3
          );
          if (hasAdjustment && !$scope.authAddCreditTransactionAccess()) {
            ctrl.notifyNotAuthorized($scope.soarAuthAddCreditAdjustmentKey);
          } else if (hasPayments && !$scope.authAddAccountPaymentAccess()) {
            ctrl.notifyNotAuthorized($scope.soarAuthAddAccountPaymentKey);
          } else if (
            hasInsurancePayment &&
            !$scope.authAddAccountPaymentAccess()
          ) {
            ctrl.notifyNotAuthorized($scope.soarAuthAddAccountPaymentKey);
          } else if (
            (hasAdjustment || hasPayments || hasInsurancePayment) &&
            !$scope.alreadyApplyingAdjustment
          ) {
            $scope.alreadyApplyingAdjustment = true;
            modalDataFactory
              .GetTransactionModalData(
                dataForModal,
                $scope.currentPatientId,
                true
              )
              .then(ctrl.openModal);
          }
        });
    };

    //Function to open adjustment modal
    ctrl.openModal = function (transactionModalData) {
      ctrl.dataForModal = transactionModalData;
      ctrl.dataForModal.AllProviders = transactionModalData.providersList.Value;
      modalFactory.TransactionModal(
        ctrl.dataForModal,
        ctrl.openAdjustmentModalResultOk,
        ctrl.openAdjustmentModalResultCancel
      );
    };

    //Handle Ok callback from adjustment dialog
    ctrl.openAdjustmentModalResultOk = function () {
      $rootScope.paymentApplied = false;
      $scope.refreshData();
      $scope.alreadyApplyingAdjustment = false;
    };

    //Handle Cancel callback from adjustment dialog
    ctrl.openAdjustmentModalResultCancel = function () {
      $scope.alreadyApplyingAdjustment = false;
      if ($rootScope.paymentApplied) {
        $rootScope.paymentApplied = false;
        $scope.refreshData();
      }
    };

    ctrl.showUnappliedModalPaymentListener = $scope.$on(
      'showUnappliedModalPayment',
      function (event) {
        var creditTransactionPayments = $scope.unappliedTransactions.filter(
          transaction => {
            return (
              transaction.TransactionTypeId === 4 ||
              transaction.TransactionTypeId === 2
            );
          }
        );
        if (creditTransactionPayments.length > 0 && !event.defaultPrevented) {
          event.preventDefault();
          $scope.openAdjustmentModal(creditTransactionPayments[0]);
        }
      }
    );

    $scope.getTotalUnappliedAmount = function () {
      return _.sumBy($scope.unappliedTransactions, t => t.UnassignedAmount);
    };

    $scope.$on('$destroy', function () {
      ctrl.showUnappliedModalPaymentListener();
    });
  },
]);
