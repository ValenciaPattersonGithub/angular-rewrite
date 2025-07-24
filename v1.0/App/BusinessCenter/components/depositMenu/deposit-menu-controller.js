'use strict';

angular.module('common.controllers').controller('DepositMenuController', [
  '$scope',
  'tabLauncher',
  '$window',
  'DepositService',
  'ModalFactory',
  'localize',
  'toastrFactory',
  function (
    $scope,
    tabLauncher,
    $window,
    depositService,
    modalFactory,
    localize,
    toastrFactory
  ) {
    var ctrl = this;
    $scope.deposit.showDetail = false;
    $scope.depositId = $scope.deposit['DepositId'];

    $scope.printDeposit = function () {
      if ($scope.deposit.CreditTransactions == undefined) {
        depositService
          .getDepositDetails({
            locationId: $scope.deposit['LocationId'],
            depositId: $scope.depositId,
          })
          .$promise.then(function (data) {
            $scope.deposit.CreditTransactions =
              data.Value.DepositPaymentHistoryItems;
            localStorage.setItem(
              'deposit_' + $scope.deposit['DepositId'],
              JSON.stringify($scope.deposit)
            );
            tabLauncher.launchNewTab(
              '#/BusinessCenter/Receivables/Deposits/' +
                $scope.deposit['DepositId'] +
                '/PrintDeposit/'
            );
          }, ctrl.getDepositDetailsFailure);
      } else {
        localStorage.setItem(
          'deposit_' + $scope.deposit['DepositId'],
          JSON.stringify($scope.deposit)
        );
        tabLauncher.launchNewTab(
          '#/BusinessCenter/Receivables/Deposits/' +
            $scope.deposit['DepositId'] +
            '/PrintDeposit/'
        );
      }
    };

    ctrl.getDepositDetailsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve deposit details.'),
        localize.getLocalizedString('Error')
      );
    };

    $scope.editDeposit = function () {
      if ($scope.deposit.CreditTransactions == undefined) {
        depositService
          .getDepositDetails({
            locationId: $scope.deposit.LocationId,
            depositId: $scope.deposit.DepositId,
          })
          .$promise.then(function (data) {
            $scope.deposit.CreditTransactions =
              data.Value.DepositPaymentHistoryItems;
            $scope.selectedLocationId = $scope.deposit['LocationId'];
            localStorage.setItem(
              'editDeposit' + $scope.deposit['DepositId'],
              JSON.stringify($scope.deposit)
            );
            $window.location.href =
              '#/BusinessCenter/Receivables/Deposits/' +
              $scope.selectedLocationId +
              '/Edit/' +
              $scope.deposit['DepositId'];
          });
      } else {
        $scope.selectedLocationId = $scope.deposit['LocationId'];
        localStorage.setItem(
          'editDeposit' + $scope.deposit['DepositId'],
          JSON.stringify($scope.deposit)
        );
        if ($scope.deposit.isSingleDepositView) {
          $window.location.href =
            '#/BusinessCenter/Receivables/Deposits/' +
            $scope.selectedLocationId +
            '/Edit/' +
            $scope.deposit['DepositId'] +
            '/singleDeposit';
        } else {
          $window.location.href =
            '#/BusinessCenter/Receivables/Deposits/' +
            $scope.selectedLocationId +
            '/Edit/' +
            $scope.deposit['DepositId'];
        }
      }
    };

    $scope.deleteDeposit = function () {
      var message = localize.getLocalizedString(
        'Are you sure you want to delete this deposit? All payments will no longer be considered deposited.'
      );
      var title = localize.getLocalizedString('Delete deposit?');
      var buttonOkText = localize.getLocalizedString('Yes');
      var buttonCancelText = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(title, message, buttonOkText, buttonCancelText)
        .then(function () {
          depositService
            .delete({ depositId: $scope.deposit.DepositId })
            .$promise.then(
              ctrl.deleteDepositSuccess,
              ctrl.deleteDepositFailure
            );
        });
    };

    ctrl.deleteDepositSuccess = function () {
      toastrFactory.success('Deleted deposit successfully!', 'Success');
      $scope.$emit('refreshDepositGrid');
    };

    ctrl.deleteDepositFailure = function () {
      toastrFactory.error('Delete failed!', 'Error');
    };

    $scope.toggleMenu = function (e) {
      $(e.currentTarget).parent().toggleClass('dropdown open');
    };
  },
]);
