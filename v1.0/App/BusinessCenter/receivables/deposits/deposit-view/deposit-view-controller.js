'use strict';
angular.module('Soar.BusinessCenter').controller('DepositViewController', [
  '$scope',
  '$window',
  '$routeParams',
  'DepositService',
  '$filter',
  'TimeZoneFactory',
  'toastrFactory',
  'localize',
  'tabLauncher',
  function (
    $scope,
    $window,
    $routeParams,
    depositService,
    $filter,
    timeZoneFactory,
    toastrFactory,
    localize,
    tabLauncher
  ) {
    var ctrl = this;

    $scope.isLoading = true;
    $scope.rows = [];

    $scope.depositViewOptions = [
      {
        Name: 'Total Receivables',
        Plural: 'Total Receivables',
        RouteValue: 'Total',
        Url: '#/BusinessCenter/Receivables/TotalReceivables',
        Template:
          'App/BusinessCenter/receivables/total-receivables/total-receivables.html',
        title: 'Total Receivables',
        Controls: false,
      },
      {
        Name: 'Statement',
        Plural: 'Statements',
        RouteValue: 'statements',
        Url: '#/BusinessCenter/Receivables/Statements',
        Template: 'App/BusinessCenter/receivables/statements/statements.html',
        title: 'Statements',
        Controls: true,
      },
      {
        Name: 'Deposit',
        Plural: 'Deposits',
        RouteValue: 'deposits',
        Url: '#/BusinessCenter/Receivables/Deposits',
        Template: 'App/BusinessCenter/receivables/deposits/deposits.html',
        title: 'Deposits',
        Controls: true,
      },
    ];

    $scope.selectView = function (view) {
      $scope.selectedView = view;
      $scope.filter = '';
      $window.location.href = view.Url;
      document.title = view.title;
    };

    $scope.locationId = $routeParams.locationId;
    $scope.depositId = $routeParams.depositId;

    $scope.getSelectedDeposit = function () {
      depositService
        .getSelectedDeposit({
          locationId: $scope.locationId,
          depositId: $scope.depositId,
        })
        .$promise.then(ctrl.getDepositSuccess, ctrl.getDepositFailure);
    };

    $scope.setStyle = function (index) {
      var result = { overflow: 'visible' };
      if (index === 3) {
        result = { 'max-width': '500px' };
      }
      return result;
    };

    $scope.toggleIcon = function (e, row, isDepositItem) {
      var idToToggle = isDepositItem ? '#subRow' + row.DepositId : '#' + row;
      $(e.currentTarget)
        .find('i.indicator')
        .toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
      if (
        $(e.currentTarget)
          .find('i.indicator')
          .hasClass('glyphicon-chevron-right')
      ) {
        $(idToToggle).collapse('hide');
      } else {
        $(idToToggle).collapse('show');
      }
    };

    ctrl.getDepositFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to retrieve selected deposit.'),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.getDepositSuccess = function (res) {
      $scope.depositDetails = res.Value.DepositDetails;
      $scope.depositDetailsOriginal = angular.copy($scope.depositDetails);
      $scope.depositItem = res.Value.DepositItem;
      $scope.depositHistoryItems = res.Value.DepositHistoryItems;
      $scope.hasDepositHistory = $scope.depositHistoryItems.length > 0;

      $scope.depositItem.isSingleDepositView = true;
      $scope.depositItem.CreditTransactions = $scope.depositDetails;
      $scope.depositItem.dateToDisplay = $filter('toShortDisplayDate')(
        $scope.depositItem.LocationTimezone
          ? timeZoneFactory.ConvertDateTZString(
              $scope.depositItem.DepositDate,
              $scope.depositItem.LocationTimezone
            )
          : res
      );
      $scope.depositItem.AccountNumberTitle =
        $scope.depositItem.BankAccountNumber === '***************'
          ? 'This information is restricted'
          : '';
      $scope.depositItem.RoutingNumberTitle =
        $scope.depositItem.RoutingNumber === '*********'
          ? 'This information is restricted'
          : '';
      $scope.depositItem.totalToDisplay = $filter('currency')(
        $scope.depositItem.Total,
        '$',
        2
      );

      $scope.hasDepositDetails = res.Value.DepositDetails.length > 0;
      $scope.expandableColumnDefinition = [
        {
          title: 'Payee',
          field: 'PatientName',
          size: '2',
          sortable: true,
        },
        {
          title: 'Payment Date',
          field: 'PaymentDate',
          size: '2',
          sortable: true,
        },
        {
          title: 'Type',
          field: 'TransactionType',
          size: '2',
          sortable: true,
        },
        {
          title: 'Payment Type',
          field: 'PaymentType',
          size: '1',
          sortable: true,
        },
        {
          title: 'Additional Info',
          field: 'Note',
          size: '2',
          sortable: true,
        },
        {
          title: 'Amount',
          titleClass: 'pull-right',
          field: 'Amount',
          size: '2',
          sortable: true,
        },
        {
          title: '',
          field: 'Status',
          size: '1',
          sortable: true,
        },
      ];

      $scope.depHistoryColumnDefinition = [
        {
          title: 'Date',
          size: '2',
          sortable: true,
        },
        {
          title: 'Bank Name',
          size: '2',
          sortable: true,
        },
        {
          title: 'Account Number',
          size: '2',
          sortable: true,
        },
        {
          title: 'Routing Number',
          size: '2',
          sortable: true,
        },
        {
          title: '',
          size: '2',
          sortable: true,
        },
        {
          title: '',
          size: '2',
          sortable: true,
        },
      ];

      $scope.isLoading = false;

      ctrl.depositsForPrinting = JSON.parse(
        localStorage.getItem('depositsForPrinting')
      );
      if (ctrl.depositsForPrinting && ctrl.depositsForPrinting.length > 0) {
        ctrl.oldSelectedLocationId = ctrl.depositsForPrinting[0].LocationId;
        localStorage.removeItem('depositsForPrinting');
      }

      if (ctrl.depositsForPrinting && ctrl.depositsForPrinting.length > 0) {
        angular.forEach(ctrl.depositsForPrinting, function (deposit) {
          var printDeposit = $scope.depositItem;
          printDeposit.CreditTransactions = $scope.depositDetails;
          localStorage.setItem(
            'deposit_' + $scope.depositItem.DepositId,
            JSON.stringify(printDeposit)
          );

          var urlToOpen =
            '#/BusinessCenter/Receivables/Deposits/' +
            $scope.depositItem.DepositId +
            '/PrintDeposit/';
          tabLauncher.launchNewTab(urlToOpen);
        });
        ctrl.depositsForPrinting.length = 0;
      }
    };

    $scope.getSelectedDeposit();

    $scope.renderToolTipDepositModified = function (item, isDepositItem) {
      if (isDepositItem) {
        return (
          'Modified on ' +
          $filter('toShortDisplayDate')(item.DateModified) +
          ' by ' +
          item.UserModified
        );
      } else {
        var strStatus = '';
        switch (item.Status) {
          case 0:
            strStatus = 'Added on ';
            break;
          case 1:
            strStatus = 'Deleted on ';
            break;
          case 2:
            strStatus = 'Modified on ';
            break;
        }
        return (
          strStatus +
          $filter('toShortDisplayDate')(item.ModifiedDate) +
          ' by ' +
          item.ModifiedUser
        );
      }
    };

    var resetSubRowSort = function () {
      _.forEach($scope.expandableColumnDefinition, function (obj) {
        obj.sort = 0;
        obj.sortIcon = '';
      });
    };
    $scope.subRowSort = function (row) {
      var rowField = $filter('filter')($scope.expandableColumnDefinition, {
        title: row,
      })[0].field;
      var sortOrder = this.column.sort || 0;
      resetSubRowSort();
      switch (sortOrder) {
        case 0:
          this.column.sort = 1;
          this.column.sortIcon = 'fa fa-caret-up';
          $scope.depositDetails = _.orderBy(
            $scope.depositDetails,
            [rowField],
            ['asc']
          );
          break;
        case 1:
          this.column.sort = 2;
          this.column.sortIcon = 'fa fa-caret-down';
          $scope.depositDetails = _.orderBy(
            $scope.depositDetails,
            [rowField],
            ['desc']
          );
          break;
        case 2:
          this.column.sort = 0;
          this.column.sortIcon = '';
          $scope.depositDetails = $scope.depositDetailsOriginal;
          break;
      }
    };

    $scope.subGridRowStyle = function (item) {
      if (item.Status != undefined && item.Status == 1) {
        return 'deletedRow rowWordWrap';
      }
      return 'rowWordWrap';
    };
    $scope.renderToolTip = function (row, item) {
      if (item.Status != undefined && item.Status == 1) {
        var deletedDate = $filter('toShortDisplayDate')(
          row.LocationTimezone
            ? timeZoneFactory.ConvertDateTZString(
                item.DeletedDate,
                row.LocationTimezone
              )
            : item.DeletedDate
        );
        return 'Removed on ' + deletedDate + ' by ' + item.ModifiedUser;
      } else {
        return '';
      }
    };

    $scope.renderToolTipPaymentHistory = function (row, item) {
      var addedDate = $filter('toShortDisplayDate')(
        row.LocationTimezone
          ? timeZoneFactory.ConvertDateTZString(
              item.DateAdded,
              row.LocationTimezone
            )
          : item.DateAdded
      );
      return 'Added on ' + addedDate + ' by ' + item.ModifiedUser;
    };
  },
]);
