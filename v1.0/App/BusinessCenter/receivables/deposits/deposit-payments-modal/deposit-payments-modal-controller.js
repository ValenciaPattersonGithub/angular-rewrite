'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('DepositPaymentsModalController', [
    '$scope',
    '$filter',
    '$timeout',
    '$location',
    'toastrFactory',
    'DepositPaymentsGridFactory',
    'DepositService',
    '$routeParams',
    '$window',
    'ModalFactory',
    'tabLauncher',
    'localize',
    'TimeZoneFactory',
    'locationService',
    'ListHelper',
    'SoarConfig',
    'patSecurityService',
    '$rootScope',
    'userSettingsDataService',
    function (
      $scope,
      $filter,
      $timeout,
      $location,
      toastrFactory,
      depositPaymentsGridFactory,
      depositService,
      $routeParams,
      $window,
      modalFactory,
      tabLauncher,
      localize,
      timeZoneFactory,
      locationService,
      listHelper,
      soarConfig,
      patSecurityService,
      userSettingsDataService
    ) {
      var ctrl = this;
      ctrl.url = $location.path();
      $scope.pageMode = ctrl.url.indexOf('Create') > -1 ? 'Create' : 'Edit';

      $scope.isSingleDeposit = false;
      ctrl.depositBreadcrumb = 'Deposits';
      ctrl.depositBreadcrumbPath = '#/BusinessCenter/Receivables/Deposits';

      if ($routeParams.viewMode && $routeParams.viewMode === 'singleDeposit') {
        $scope.isSingleDeposit = true;
        ctrl.depositBreadcrumb = 'Single Deposit View';
        ctrl.depositBreadcrumbPath =
          '#/BusinessCenter/Receivables/Deposits/' +
          $routeParams.locationId +
          '/ViewDeposit/' +
          $routeParams.depositId;
      }

      // #region AMFA
      var amfa =
        $scope.pageMode === 'Create' ? 'soar-biz-dep-add' : 'soar-biz-dep-edit';
      $scope.authAccess = function () {
        if (!patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
          toastrFactory.error(
            localize.getLocalizedString(
              'User is not authorized to access this area.'
            ),
            localize.getLocalizedString('Not Authorized')
          );
          $location.path('/');
        }
      };

      // #region Declaration
      $scope.selectedLocationId = $routeParams.locationId;
      $scope.undepositedTotal = 0.0;
      $scope.depositDtos = [];
      $scope.depositDto = {
        LocationId: $scope.selectedLocationId,
        BankAccountId: null,
        DepositDate: new Date(),
        TotalAmount: 0,
        CreditTransactions: [],
        BulkCreditTransactions: [],
        PrintSlip: false,
      };

      if ($scope.pageMode === 'Create') {
        var locationIdentifier =
          'createDepositLocation_' + $routeParams.locationId;
        $scope.selectedLocation = JSON.parse(
          localStorage.getItem(locationIdentifier)
        );
        if ($scope.selectedLocation == null) {
          $window.location.href = '#/BusinessCenter/Receivables/Deposits';
        }
        localStorage.removeItem(locationIdentifier);
        $scope.currentPage = 'Create Deposits';
        $scope.header =
          'Deposit Payments for ' +
          $scope.selectedLocation.NameLine1 +
          ' (' +
          timeZoneFactory.GetTimeZoneAbbr($scope.selectedLocation.Timezone) +
          ')';
        $scope.paymentGridTotal = 0.0;
      } else {
        ctrl.editDepositId = $routeParams.depositId;
        var editDepositIdentifier = 'editDeposit' + ctrl.editDepositId;
        ctrl.editDeposit = JSON.parse(
          localStorage.getItem(editDepositIdentifier)
        );
        if (ctrl.editDepositId === 'undefined' || ctrl.editDeposit == null) {
          $window.location.href = '#/BusinessCenter/Receivables/Deposits';
        }
        localStorage.removeItem(editDepositIdentifier);

        $scope.currentPage = 'Edit Deposit';
        $scope.header =
          'Edit Deposit ' +
          $filter('toShortDisplayDate')(
            ctrl.editDeposit.LocationTimezone
              ? timeZoneFactory.ConvertDateTZString(
                  ctrl.editDeposit.DepositDate,
                  ctrl.editDeposit.LocationTimezone
                )
              : ctrl.editDeposit.DepositDate
          ) +
          ' to ' +
          ctrl.editDeposit.BankAccount +
          ' for ' +
          $filter('currency')(ctrl.editDeposit.Total, '$', 2);
        $scope.paymentGridTotal =
          $scope.depositDtos.length > 0 ? 0.0 : ctrl.editDeposit.Total;
        $scope.depositDto.DepositDate = ctrl.editDeposit.LocationTimezone
          ? timeZoneFactory.ConvertDateTZString(
              ctrl.editDeposit.DepositDate,
              ctrl.editDeposit.LocationTimezone
            )
          : ctrl.editDeposit.DepositDate;
      }

      $scope.selectedPayments = {
        CreditTransactions: [],
        BulkCreditTransactions: [],
      };

      $scope.depositSummary = {
        TotalAmount: 0,
        Rows: [],
      };
      $scope.disableAdd = true;
      $scope.disableDeposit = true;
      ctrl.practiceLocations = [];
      ctrl.printAllDeposit = false;
      $scope.currentBank = { selected: null };

      // #endregion

      // #region Breadcrumbs
      $scope.breadcrumbs = [
        {
          Name: 'Receivables',
          Path: '#/BusinessCenter/Receivables/TotalReceivables',
        },
        {
          Name: ctrl.depositBreadcrumb,
          Path: ctrl.depositBreadcrumbPath,
        },
        {
          Name: $scope.currentPage,
          Path: '',
        },
      ];

      $scope.changePath = function (breadcrumb) {
        if ($scope.depositDtos.length > 0) {
          modalFactory.CancelModal().then(function () {
            $window.location.href = _.escape(breadcrumb.Path);
            $window.document.title = breadcrumb.Name;
          });
        } else {
          $window.location.href = _.escape(breadcrumb.Path);
          $window.document.title = breadcrumb.Name;
        }
      };
      // #endregion

      //#region Grid Options

      $scope.paymentsGridOptions = depositPaymentsGridFactory.getOptions();

      if ($scope.currentPage === 'Create Deposits') {
        $scope.paymentsGridOptions.columnDefinition[2].filterFrom = moment(
          new Date()
        )
          .subtract(30, 'days')
          .format('MM/DD/YYYY');
        $scope.paymentsGridOptions.columnDefinition[2].filterTo = moment(
          new Date()
        ).format('MM/DD/YYYY');
        $scope.paymentGridTotal = 0.0;
      } else {
        var dates = $filter('orderBy')(
          ctrl.editDeposit.CreditTransactions,
          'PaymentDate'
        );
        $scope.paymentsGridOptions.columnDefinition[2].filterFrom =
          dates[0].PaymentDate;
        $scope.paymentsGridOptions.columnDefinition[2].filterTo =
          dates[dates.length - 1].PaymentDate;
        $scope.paymentsGridOptions.updateFilter('IsEdit', true);
        $scope.paymentsGridOptions.updateFilter(
          'DepositId',
          ctrl.editDepositId
        );
        $scope.paymentGridTotal = ctrl.editDeposit.Total;
      }

      $scope.paymentsGridOptions.id = 'PaymentsGrid';

      $scope.paymentsGridOptions.successAction = function (data) {
        if (data.dto.IsMaxGridResults) {
          ctrl.showWarningModal();
        }
        if (data.dto.CurrentPage > 0) {
          for (var i = 0; i < data.dto.Rows.length; i++) {
            $scope.transactions.push(data.dto.Rows[i]);
          }
        } else {
          $scope.transactions = data.dto.Rows;
        }

        if ($scope.transactions.length === 0 && $scope.depositDtos.length === 0)
          $scope.disableDeposit = true;

        $scope.undepositedTotal = data.dto.TotalAmount;
        $scope.paymentsGridOptions.columnDefinition[2].filterFrom = data.dto
          .FilterCriteria.DateEnteredFrom
          ? moment(data.dto.FilterCriteria.DateEnteredFrom).format('MM/DD/YYYY')
          : '';
        $scope.paymentsGridOptions.columnDefinition[2].filterTo = data.dto
          .FilterCriteria.DateEnteredTo
          ? moment(data.dto.FilterCriteria.DateEnteredTo).format('MM/DD/YYYY')
          : '';

        if ($scope.depositDto.BankAccountId === null) {
          $scope.bankAccounts = data.dto.BankAccounts;
          if (data.dto.BankAccounts.length === 1) {
            $scope.depositDto.BankAccountId = $scope.bankAccounts[0].Key;
            $scope.currentBank.selected = $scope.bankAccounts[0];
          }
        }

        $scope.paymentGridTotal = 0.0;
        $scope.depositDto.TotalAmount = 0.0;
        $scope.depositDto.CreditTransactions.length = 0;
        $scope.depositDto.BulkCreditTransactions.length = 0;
        if ($scope.depositDtos.length === 0) {
          $scope.selectedPayments.CreditTransactions.length = 0;
          $scope.selectedPayments.BulkCreditTransactions.length = 0;
        }

        if (
          $scope.pageMode === 'Edit' &&
          $scope.depositSummary.Rows.length === 0
        ) {
          $scope.currentBank.selected = $filter('filter')(
            $scope.bankAccounts,
            { Value: ctrl.editDeposit.BankAccount },
            true
          )[0];
          if (!angular.isUndefined($scope.currentBank.selected)) {
            $scope.depositDto.BankAccountId = $scope.currentBank.selected.Key;
            ctrl.originalSelectedBankId = $scope.currentBank.selected.Key;
          }
          ctrl.newBankId = ctrl.originalSelectedBankId;

          var selectedCreditTransactions = $filter('filter')(data.dto.Rows, {
            Selected: true,
          });
          angular.forEach(selectedCreditTransactions, function (row) {
            $scope._selectPayment(row);
          });
        }

        ctrl.originalCreditTransactions = angular.copy(
          $scope.depositDto.CreditTransactions
        );
        ctrl.originalBulkCreditTransactions = angular.copy(
          $scope.depositDto.BulkCreditTransactions
        );
        ctrl.originalDepositDate = $filter('toShortDisplayDate')(
          $scope.depositDto.DepositDate
        );
        ctrl.originalTotalAmount = $scope.depositDto.TotalAmount;
        ctrl.newDate = ctrl.originalDepositDate;

        $timeout(function () {
          ctrl.isWatchReady = true;
        }, 300);

        $timeout(function () {
          $('#ckbCheckAll').attr('checked', false);
        });
      };

      $scope.selectPayment = function (selectedRow) {
        $scope.isToggleAll = false;

        if (
          $('.depositCheckBox:checked').length === $('.depositCheckBox').length
        ) {
          $('#ckbCheckAll').prop('checked', true);
        }

        $scope._selectPayment(selectedRow);
      };

      $scope._selectPayment = function (selectedRow) {
        var row = {};
        var item = null;
        var rowCheck = null;
        var index = null;

        $('.depositCheckBox').each(function () {
          if (!this.checked) $('#ckbCheckAll').attr('checked', false);
        });

        if (selectedRow['IsBulkPayment']) {
          item = selectedRow['BulkCreditTransactionId'];
          row =
            $filter('filter')(
              $scope.transactions,
              { BulkCreditTransactionId: item },
              true
            )[0] || null;
          rowCheck =
            $filter('filter')(
              $scope.selectedPayments.BulkCreditTransactions,
              item,
              true
            )[0] || null;
          index = $scope.selectedPayments.BulkCreditTransactions.indexOf(item);
        } else {
          item = selectedRow['CreditTransactionId'];
          row =
            $filter('filter')(
              $scope.transactions,
              { CreditTransactionId: item },
              true
            )[0] || null;
          rowCheck =
            $filter('filter')(
              $scope.selectedPayments.CreditTransactions,
              item,
              true
            )[0] || null;
          index = $scope.selectedPayments.CreditTransactions.indexOf(item);
        }

        if (rowCheck !== null && !$scope.isToggleAll) {
          $scope.depositDto.TotalAmount =
            $scope.depositDto.TotalAmount - row.Amount;
          var dtoIndex = null;
          if (row['IsBulkPayment']) {
            dtoIndex = _.findIndex($scope.depositDto.BulkCreditTransactions, {
              BulkCreditTransactionId: item,
            });
            $scope.depositDto.BulkCreditTransactions.splice(dtoIndex, 1);
            $scope.selectedPayments.BulkCreditTransactions.splice(index, 1);
          } else {
            dtoIndex = $scope.depositDto.CreditTransactions.indexOf(row);
            $scope.depositDto.CreditTransactions.splice(dtoIndex, 1);
            $scope.selectedPayments.CreditTransactions.splice(index, 1);
          }
        } else if (rowCheck === null) {
          if (row['IsBulkPayment']) {
            $scope.depositDto.BulkCreditTransactions.push({
              BulkCreditTransactionId: item,
            });
            $scope.selectedPayments.BulkCreditTransactions.push(item);
          } else {
            $scope.depositDto.CreditTransactions.push(row);
            $scope.selectedPayments.CreditTransactions.push(item);
          }
          selectedRow.Selected = true;
          $scope.depositDto.TotalAmount =
            $scope.depositDto.TotalAmount + row.Amount;
        }
        $scope.paymentGridTotal = $scope.depositDto.TotalAmount;
      };

      $scope.toggleAll = function () {
        $scope.checkAll = $('#ckbCheckAll')[0];
        if ($scope.checkAll.checked) {
          $('.depositCheckBox').each(function () {
            this.checked = true;
          });
          $scope.isToggleAll = true;
        } else {
          $('.depositCheckBox').each(function () {
            this.checked = false;
          });
          $scope.isToggleAll = false;
        }
        angular.forEach($scope.transactions, function (selectedRow) {
          $scope._selectPayment(selectedRow);
        });
      };

      $scope.paymentsGridOptions.actions.selectPayment = $scope.selectPayment;
      $scope.paymentsGridOptions.actions.toggleAll = $scope.toggleAll;

      $scope.navigateToInsurancePayment = function (data) {
        if (data.TransactionTypeId === 3) {
          if (!data.IsOnlyChild) {
            ctrl.multiInsuranceWarningModal(data);
          } else {
            ctrl.continueInsuranceNav(data);
          }
        }
      };

      ctrl.multiInsuranceWarningModal = function (data) {
        var message = localize.getLocalizedString(
          'This insurance payment is part of a multiple claim insurance payment.  Editing this payment may affect other insurance payments.'
        );
        var title = localize.getLocalizedString('Edit Multi-Claim Payment?');
        var buttonOkText = localize.getLocalizedString('Yes');
        var buttonCancelText = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, buttonOkText, buttonCancelText)
          .then(function () {
            ctrl.continueInsuranceNav(data);
          });
      };

      ctrl.continueInsuranceNav = function (transaction) {
        var tabName = ctrl.getTabNameFromParam();
        var prevLocation = tabName === '' ? 'Account Summary' : tabName;

        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            _.escape(transaction.PatientId) +
            '/Account/' +
            _.escape(transaction.AccountId) +
            '/Payment/' +
            prevLocation +
            '/BulkCreditTransaction/' +
            _.escape(transaction.BulkCreditTransactionId)
        );
      };

      ctrl.getTabNameFromParam = function () {
        var urlParams = $location.search();
        var tabName = '';
        if (urlParams && urlParams.tab) {
          var tabNameFromParam = urlParams.tab;
          tabName = tabNameFromParam;
        }
        return tabName;
      };

      $scope.paymentsGridOptions.actions.navigateToInsurancePayment =
        $scope.navigateToInsurancePayment;

      //#endregion

      //#region Location Service

      ctrl.getPracticeLocations = function () {
        locationService
          .getCurrentPracticeLocations()
          .then(function (locations) {
            if (ctrl.practiceLocations) {
              ctrl.practiceLocations.length = 0;
              angular.forEach(locations, function (loc) {
                ctrl.practiceLocations.push(loc);
              });
            } else {
              ctrl.practiceLocations = locations;
            }
            var ofcLocation = listHelper.findItemByFieldValue(
              ctrl.practiceLocations,
              'id',
              $scope.depositDto.LocationId
            );
            if (ofcLocation) {
              if ($scope.pageMode == 'Create') {
                $scope.depositDto.DepositDate =
                  timeZoneFactory.ConvertDateTZString(
                    $scope.depositDto.DepositDate,
                    ofcLocation.timezone
                  );
              }
              ctrl.selectedLocation = angular.copy(location);
            }
            ctrl.refreshModal();
          });
      };
      ctrl.getPracticeLocations();

      //#endregion

      //#region Main Functions

      ctrl.refreshModal = function () {
        if ($scope.selectedLocationId) {
          $scope.depositDto.LocationId = $scope.selectedLocationId;
          $scope.paymentsGridOptions.updateFilter(
            'Location',
            $scope.selectedLocationId
          );
        }

        $scope.paymentsGridOptions.refresh();
      };

      ctrl.hasValidChanges = function () {
        var hasChangesInTrans = false;
        if ($scope.pageMode === 'Edit') {
          if (ctrl.originalSelectedBankId !== ctrl.newBankId) {
            hasChangesInTrans = true;
          }
          if (
            ctrl.originalTotalAmount.toFixed(2) !==
            ctrl.newTotalAmount.toFixed(2)
          ) {
            hasChangesInTrans = true;
          }
        }
        if (ctrl.originalDepositDate !== ctrl.newDate) {
          hasChangesInTrans = true;
        }
        if (
          ctrl.originalCreditTransactions.length !==
          ctrl.selectedCreditTransactions.length
        ) {
          hasChangesInTrans = true;
        } else {
          angular.forEach(ctrl.originalCreditTransactions, function (trans) {
            var selectedTrans = $filter('filter')(
              ctrl.selectedCreditTransactions,
              { CreditTransactionId: trans.CreditTransactionId },
              true
            );
            if (selectedTrans.length == 0) {
              hasChangesInTrans = true;
            }
          });

          angular.forEach(ctrl.selectedCreditTransactions, function (trans) {
            var selectedTrans = $filter('filter')(
              ctrl.originalCreditTransactions,
              { CreditTransactionId: trans.CreditTransactionId },
              true
            );
            if (selectedTrans.length == 0) {
              hasChangesInTrans = true;
            }
          });
        }
        if (
          ctrl.originalBulkCreditTransactions.length !==
          ctrl.selectedBulkCreditTransactions.length
        ) {
          hasChangesInTrans = true;
        } else {
          angular.forEach(
            ctrl.originalBulkCreditTransactions,
            function (trans) {
              var selectedTrans = $filter('filter')(
                ctrl.selectedBulkCreditTransactions,
                { CreditTransactionId: trans.CreditTransactionId },
                true
              );
              if (selectedTrans.length == 0) {
                hasChangesInTrans = true;
              }
            }
          );

          angular.forEach(
            ctrl.selectedBulkCreditTransactions,
            function (trans) {
              var selectedTrans = $filter('filter')(
                ctrl.originalBulkCreditTransactions,
                { CreditTransactionId: trans.CreditTransactionId },
                true
              );
              if (selectedTrans.length == 0) {
                hasChangesInTrans = true;
              }
            }
          );
        }

        if (
          ctrl.selectedCreditTransactions.length === 0 &&
          ctrl.selectedBulkCreditTransactions.length === 0
        ) {
          hasChangesInTrans = false;
        }

        return hasChangesInTrans;
      };

      ctrl.isWatchReady = false;
      ctrl.originalDepositDate = '';
      ctrl.originalSelectedBankId = 0;
      ctrl.originalCreditTransactions = [];
      ctrl.selectedCreditTransactions = [];
      ctrl.originalBulkCreditTransactions = [];
      ctrl.selectedBulkCreditTransactions = [];
      ctrl.originalTotalAmount = 0.0;
      $scope.$watch(
        'depositDto',
        function (nv) {
          if (ctrl.isWatchReady) {
            ctrl.newDate = $filter('toShortDisplayDate')(nv.DepositDate);
            ctrl.newTotalAmount = nv.TotalAmount;
            ctrl.selectedCreditTransactions = $filter('filter')(
              nv.CreditTransactions,
              { Selected: true }
            );
            ctrl.selectedBulkCreditTransactions = nv.BulkCreditTransactions;
            $scope.disableAdd = !ctrl.hasValidChanges();
          }
        },
        true
      );

      $scope.$watch(
        'currentBank',
        function (nv) {
          if (ctrl.isWatchReady) {
            ctrl.newBankId = nv.selected.Key;
            $scope.disableAdd = !ctrl.hasValidChanges();
          }
        },
        true
      );

      $scope.addSelectedPayment = function () {
        if ($scope.currentBank.selected) {
          $scope.depositSummary.TotalAmount =
            $scope.depositSummary.TotalAmount + $scope.depositDto.TotalAmount;
          var row = {
            Bank: $scope.currentBank.selected.Value,
            Total: $scope.depositDto.TotalAmount,
          };
          $scope.depositDto.BankAccountId = $scope.currentBank.selected.Key;
          $scope.depositSummary.Rows.push(row);

          $scope.disableDeposit = false;

          var dto = angular.copy($scope.depositDto);
          $scope.depositDtos.push(dto);

          $scope.paymentsGridOptions.updateFilter(
            'CreditTransactions',
            $scope.selectedPayments.CreditTransactions
          );
          $scope.paymentsGridOptions.updateFilter(
            'BulkCreditTransactions',
            $scope.selectedPayments.BulkCreditTransactions
          );
          $scope.paymentsGridOptions.refresh();

          if ($scope.bankAccounts.length > 1) {
            $scope.depositDto.BankAccountId = null;
            $scope.currentBank.selected = null;
          }

          $scope.depositDto.DepositDate = angular.isUndefined(ctrl.tzObject)
            ? new Date()
            : new Date(
                moment
                  .tz(new Date(), ctrl.tzObject.MomentTZ)
                  .format('MM/DD/YYYY HH:mm:ss')
              );
          $scope.depositDto.TotalAmount = 0;
          $scope.depositDto.CreditTransactions.length = 0;
          $scope.depositDto.BulkCreditTransactions.length = 0;
          $scope.paymentGridTotal = 0.0;
        }
      };

      $scope.deposit = function () {
        angular.forEach($scope.depositDtos, function (depositDto) {
          var ofcLocation = listHelper.findItemByFieldValue(
            ctrl.practiceLocations,
            'id',
            depositDto.LocationId
          );
          if (ofcLocation) {
            depositDto.DepositDate = timeZoneFactory.ConvertDateToSave(
              depositDto.DepositDate,
              ofcLocation.timezone
            );
          }
        });
        if ($scope.pageMode === 'Create') {
          depositService
            .create($scope.depositDtos)
            .$promise.then(ctrl.depositSuccess, ctrl.depositFailure);
        } else {
          depositService
            .edit(
              { editDepositId: ctrl.editDeposit.DepositId },
              $scope.depositDtos
            )
            .$promise.then(ctrl.depositSuccess, ctrl.depositFailure);
        }
      };

      ctrl.depositSuccess = function (result) {
        ctrl.depositsForPrinting = $filter('filter')(result.Value, {
          PrintSlip: true,
        });
        if (ctrl.depositsForPrinting && ctrl.depositsForPrinting.length > 0) {
          localStorage.setItem(
            'depositsForPrinting',
            JSON.stringify(ctrl.depositsForPrinting)
          );
        }

        toastrFactory.success('Deposit saved!', 'Success');
        if ($scope.isSingleDeposit) {
          var urlToOpen =
            '#/BusinessCenter/Receivables/Deposits/' +
            _.escape($routeParams.locationId) +
            '/ViewDeposit/' +
            _.escape(result.Value[0].DepositId);
          $window.location.href = urlToOpen;
        } else {
          $window.location.href = '#/BusinessCenter/Receivables/Deposits';
          $window.document.title = 'Deposits';
        }
      };

      ctrl.depositFailure = function () {
        toastrFactory.error('Deposit failed!', 'Error');
      };

      $scope.printSlip = function (index) {
        $scope.depositDtos[index].PrintSlip =
          !$scope.depositDtos[index].PrintSlip;
        if (ctrl.printAllDeposit) {
          ctrl.printAllDeposit = false;
          $('#printAll')[0].checked = false;
        } else {
          var notForPrinting = $filter('filter')($scope.depositDtos, {
            PrintSlip: false,
          });
          if (notForPrinting && notForPrinting.length === 0) {
            ctrl.printAllDeposit = true;
            $('#printAll')[0].checked = true;
          }
        }
      };

      $scope.printAll = function () {
        $scope.checkAll = $('#printAll')[0];

        if ($scope.checkAll.checked) {
          $('.printSlip').each(function () {
            this.checked = true;
          });
          ctrl.printAllDeposit = true;
        } else {
          $('.printSlip').each(function () {
            this.checked = false;
          });
          ctrl.printAllDeposit = false;
        }
        angular.forEach($scope.depositDtos, function (item) {
          item.PrintSlip = ctrl.printAllDeposit;
        });
      };

      $scope.cancel = function () {
        if ($scope.depositDtos.length > 0) {
          modalFactory.CancelModal().then(function () {
            if ($scope.isSingleDeposit) {
              var urlToOpen =
                '#/BusinessCenter/Receivables/Deposits/' +
                _.escape($routeParams.locationId) +
                '/ViewDeposit/' +
                _.escape($routeParams.depositId);
              $window.location.href = urlToOpen;
            } else {
              $window.location.href = '#/BusinessCenter/Receivables/Deposits';
              $window.document.title = 'Deposits';
            }
          });
        } else {
          if ($scope.isSingleDeposit) {
            var urlToOpen =
              '#/BusinessCenter/Receivables/Deposits/' +
              _.escape($routeParams.locationId) +
              '/ViewDeposit/' +
              _.escape($routeParams.depositId);
            $window.location.href = urlToOpen;
          } else {
            $window.location.href = '#/BusinessCenter/Receivables/Deposits';
            $window.document.title = 'Deposits';
          }
        }
      };

      ctrl.showWarningModal = function () {
        // modalFactory.CancelModal().then(ctrl.confirmCancel);
        var message = localize.getLocalizedString('{0}', [
          'Your search has produced a large number of records. Please use the filters to narrow down the results.',
        ]);
        var title = localize.getLocalizedString('Warning!');
        var button2Text = localize.getLocalizedString('Ok');
        modalFactory
          .ConfirmModal(title, message, button2Text)
          .then(ctrl.cancelSave, ctrl.resumeSave);
      };
      //#endregion
    },
  ]);
