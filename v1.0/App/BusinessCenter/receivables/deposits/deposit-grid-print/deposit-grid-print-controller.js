'use strict';
angular.module('Soar.BusinessCenter').controller('DepositGridPrintController', [
  '$scope',
  '$routeParams',
  '$timeout',
  '$filter',
  'TimeZoneFactory',
  function ($scope, $routeParams, $timeout, $filter, timeZoneFactory) {
    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.depositIdentifier = 'deposit_' + $routeParams.depositId;
      $scope.deposit = JSON.parse(localStorage.getItem(ctrl.depositIdentifier));
      $scope.deposit['CreditTransactions'] = $filter('filter')(
        $scope.deposit['CreditTransactions'],
        { DeletedDate: null }
      );
      localStorage.removeItem(ctrl.depositIdentifier);

      if ($scope.deposit) {
        ctrl.formatData();
      }
      ctrl.cleanup();
    };

    ctrl.cleanup = function () {
      angular.element('.view-container').attr('style', 'background-color:#fff');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('body').attr('style', 'padding-left:0;');
      angular.element('body').attr('style', 'background-color:#fff');

      $timeout(function () {
        angular.element('#walkme-player').remove();
      }, 2000);
    };

    ctrl.formatData = function () {
      var locationTimezone = $scope.deposit['LocationTimezone'];
      var depositDate = $scope.deposit['DepositDate'];
      $scope.depositDate = $filter('toShortDisplayDate')(
        locationTimezone
          ? timeZoneFactory.ConvertDateTZString(depositDate, locationTimezone)
          : depositDate
      );

      $scope.depositTotal = $filter('currency')(
        $scope.deposit['Total'],
        '$',
        2
      );
      $scope.paymentTypes = [];

      // #region Account Payment Types

      ctrl.accountCreditTransactions = $filter('filter')(
        $scope.deposit['CreditTransactions'],
        { TransactionType: 'Account' }
      );
      ctrl.accountCreditTransactions = $filter('orderBy')(
        ctrl.accountCreditTransactions,
        'PaymentType'
      );

      angular.forEach(ctrl.accountCreditTransactions, function (object) {
        var find = $filter('filter')(
          $scope.paymentTypes,
          {
            PaymentType: object.PaymentType,
            TransactionType: object.TransactionType,
          },
          true
        );
        if (find.length === 0) {
          var items = $filter('filter')(
            ctrl.accountCreditTransactions,
            { PaymentType: object.PaymentType },
            true
          );
          var total = 0;
          angular.forEach(items, function (item) {
            item.PaymentDate = $filter('toShortDisplayDate')(
              locationTimezone
                ? timeZoneFactory.ConvertDateTZString(
                    item.PaymentDate,
                    locationTimezone
                  )
                : item.PaymentDate
            );
            total = total + item.Amount;
          });
          $scope.paymentTypes.push({
            PaymentType: object.PaymentType,
            TransactionType: object.TransactionType,
            Total: total,
          });
        }
      });

      // #endregion

      // #region Insurance Payment Types

      ctrl.insuranceCreditTransactions = $filter('filter')(
        $scope.deposit['CreditTransactions'],
        { TransactionType: 'Insurance' }
      );
      ctrl.insuranceCreditTransactions = $filter('orderBy')(
        ctrl.insuranceCreditTransactions,
        'PaymentType'
      );

      angular.forEach(ctrl.insuranceCreditTransactions, function (object) {
        var find = $filter('filter')(
          $scope.paymentTypes,
          {
            PaymentType: object.PaymentType,
            TransactionType: object.TransactionType,
          },
          true
        );
        if (find.length === 0) {
          var items = $filter('filter')(
            ctrl.insuranceCreditTransactions,
            { PaymentType: object.PaymentType },
            true
          );
          var total = 0;
          angular.forEach(items, function (item) {
            item.PaymentDate = $filter('toShortDisplayDate')(
              locationTimezone
                ? timeZoneFactory.ConvertDateTZString(
                    item.PaymentDate,
                    locationTimezone
                  )
                : item.PaymentDate
            );
            total = total + item.Amount;
          });
          $scope.paymentTypes.push({
            PaymentType: object.PaymentType,
            TransactionType: object.TransactionType,
            Total: total,
          });
        }
      });

      // #endregion

      $scope.printedDate = moment().format('MM/DD/YYYY - hh:mm a');
    };

    $scope.print = function () {
      window.print();
      window.document.close();
    };

    ctrl.$onInit();
  },
]);
