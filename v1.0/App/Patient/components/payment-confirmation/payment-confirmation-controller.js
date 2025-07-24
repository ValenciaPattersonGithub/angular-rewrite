'use strict';
angular.module('Soar.Patient').controller('PaymentConfirmationController', [
  '$scope',
  'localize',
  '$uibModalInstance',
  'DataForModal',
  'ListHelper',
  'UserSettingsService',
  'toastrFactory',
  function (
    $scope,
    localize,
    $uibModalInstance,
    dataForModal,
    listHelper,
    userSettingsService,
    toastrFactory
  ) {
    var ctrl = this;
    $scope.patientName = dataForModal.PatientDetails.Name;

    $scope.incPrevBal = true;
    $scope.incFutureAppts = true;
    $scope.printNotes = '';
    $scope.patientNames = [];
    $scope.negativeAdjustmentsApplied = [];
    $scope.paymentsApplied = [];
    $scope.userSetting = { PrintInvoice: true };
    ctrl.isUserAvailable = false;

    $scope.printToggle = function () {
      if (!$scope.userSetting.PrintInvoice) {
        $scope.incPrevBal = false;
        $scope.incFutureAppts = false;
        $scope.printNotes = '';
      }
    };

    userSettingsService.get().$promise.then(
      function (res) {
        $scope.userSetting = res.Value;
        ctrl.printChecked = res.Value.PrintInvoice;
        ctrl.isUserAvailable = true;
        $scope.printToggle();
      },
      function (error) {
        $scope.userSetting.PrintInvoice = true;
      }
    );

    $scope.groupPayments = function () {
      var paymentsApplied = angular.copy(dataForModal.PaymentsApplied);
      var payments = [];
      var otherPaymentTypes = [];
      var cashPayments = listHelper.findItemsByFieldValue(
        paymentsApplied,
        'Description',
        'Cash'
      );
      var checkPayments = listHelper.findItemsByFieldValue(
        paymentsApplied,
        'Description',
        'Check'
      );
      var creditPayments = listHelper.findItemsByFieldValue(
        paymentsApplied,
        'Description',
        'Credit'
      );
      var cashPaymentTotal = 0;
      var checkPaymentTotal = 0;
      var creditPaymentTotal = 0;

      if (paymentsApplied == undefined) {
        payments.push({ AppliedAmount: 0, Description: 'Payment Applied' });
      }

      angular.forEach(cashPayments, function (cash) {
        cashPaymentTotal = cashPaymentTotal + cash.AppliedAmount;
      });

      if (cashPaymentTotal != 0) {
        payments.push({ AppliedAmount: cashPaymentTotal, Description: 'Cash' });
      }

      angular.forEach(checkPayments, function (check) {
        checkPaymentTotal = checkPaymentTotal + check.AppliedAmount;
      });

      if (checkPaymentTotal != 0) {
        payments.push({
          AppliedAmount: checkPaymentTotal,
          Description: 'Check',
        });
      }

      angular.forEach(creditPayments, function (credit) {
        creditPaymentTotal = creditPaymentTotal + credit.AppliedAmount;
      });

      if (creditPaymentTotal != 0) {
        payments.push({
          AppliedAmount: creditPaymentTotal,
          Description: 'Credit',
        });
      }

      angular.forEach(paymentsApplied, function (appliedPayment) {
        if (
          appliedPayment.Description != 'Cash' &&
          appliedPayment.Description != 'Check' &&
          appliedPayment.Description != 'Credit' &&
          appliedPayment.Description != 'Acct Credit'
        ) {
          if (appliedPayment.AdjustmentTypeId == null) {
            var typeExists = listHelper.findItemByFieldValue(
              otherPaymentTypes,
              'Description',
              appliedPayment.Description
            );

            if (typeExists == null) {
              otherPaymentTypes.push({
                Description: appliedPayment.Description,
              });
            }
          }
        }
      });

      angular.forEach(otherPaymentTypes, function (otherType) {
        var type = otherType.Description;
        var paymentsForType = listHelper.findItemsByFieldValue(
          paymentsApplied,
          'Description',
          type
        );
        var paymentsForTypeTotal = 0;

        angular.forEach(paymentsForType, function (paymentForType) {
          paymentsForTypeTotal =
            paymentsForTypeTotal + paymentForType.AppliedAmount;
        });
        payments.push({
          AppliedAmount: paymentsForTypeTotal,
          Description: type,
        });
      });

      return payments;
    };

    // set payment related flags and data
    $scope.isPaymentApplied = dataForModal.PaymentsApplied ? true : false;
    //$scope.paymentAmount = $scope.isPaymentApplied ? dataForModal.PaymentDetails.Amount : 0;
    //$scope.paymentDescription = $scope.isPaymentApplied ? dataForModal.PaymentDetails.Description : "";
    $scope.paymentsApplied = $scope.groupPayments();
    $scope.patientNames = dataForModal.PatientNames;

    // set negative adjustment related flags and data
    $scope.isNegatveAdjustmentApplied = dataForModal.NegativeAdjustmentDetails
      ? true
      : false;
    $scope.negativeAdjustmentAmount = $scope.isNegatveAdjustmentApplied
      ? dataForModal.NegativeAdjustmentDetails.Amount
      : 0;
    $scope.negativeAdjustmentDescription = $scope.isNegatveAdjustmentApplied
      ? dataForModal.NegativeAdjustmentDetails.Description
      : '';

    $scope.getPaymentsAppliedTotal = function () {
      var totalAmountApplied = 0;

      angular.forEach($scope.paymentsApplied, function (payment) {
        totalAmountApplied = totalAmountApplied + payment.AppliedAmount;
      });

      return totalAmountApplied;
    };

    $scope.closeModal = function () {
      if (ctrl.isUserAvailable) {
        if (ctrl.printChecked !== $scope.userSetting.PrintInvoice) {
          userSettingsService.update($scope.userSetting).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('{0} change saved successfully.', [
                  'User Settings',
                ]),
                'Success'
              );
            },
            function (error) {
              toastrFactory.error(
                localize.getLocalizedString('Failed to save {0}.', [
                  'User Settings',
                ]),
                'Error'
              );
            }
          );
        }
      } else {
        toastrFactory.error(
          localize.getLocalizedString('Failed to save {0}.', ['User Settings']),
          'Error'
        );
      }
      if ($scope.userSetting.PrintInvoice) {
        var invoiceOptionsDto = {
          IncludePreviousBalance: $scope.incPrevBal,
          IncludeFutureAppointments: $scope.incFutureAppts,
          Note: $scope.printNotes,
        };
        $uibModalInstance.close(invoiceOptionsDto);
      } else {
        $uibModalInstance.close();
      }
    };

    $scope.cancelModal = function () {
      $uibModalInstance.close();
    };
  },
]);
