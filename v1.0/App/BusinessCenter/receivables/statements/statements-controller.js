'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('StatementsController', [
    '$rootScope',
    '$scope',
    '$filter',
    '$routeParams',
    'ModalFactory',
    'BatchStatementService',
    'LocationServices',
    'toastrFactory',
    'localize',
    'patSecurityService',
    '$anchorScroll',
    '$window',
    '$timeout',
    '$sce',
    '$location',
    'PatientServices',
    'tabLauncher',
    'practiceService',
    'FeatureFlagService',
    'FuseFlag',
    function (
      $rootScope,
      $scope,
      $filter,
      $routeParams,
      modalFactory,
      batchStatementService,
      locationServices,
      toastrFactory,
      localize,
      patSecurityService,
      $anchorScroll,
      $window,
      $timeout,
      $sce,
      $location,
      patientServices,
      tabLauncher,
      practiceService,
      featureFlagService,
      fuseFlag
    ) {
      var ctrl = this;

      //BEGIN: New Statements Experience Section
      $scope.showNewStatementsExperience = false;
      ctrl.checkFeatureFlags = async function() {
        // Check the feature flag to see if we should be showing the button or not
        featureFlagService.getOnce$(fuseFlag.EnableNewStatementsExperience).subscribe((value) => {
          $scope.showNewStatementsExperience = value;
        });
      }
      // Initialization logic
      $scope.initialize = function() {
        ctrl.checkFeatureFlags();
      }
      // Do something when the user clicks the NSE button
      $scope.enableNewStatementsExperience = function() {
        console.log('NSE Coming Soon');
        // TODO: Add logic to open the NSE
      }
      // END: New Statements Experience Section

      $scope.currentPage = 0;
      $scope.pageCount = 20;
      $scope.limitofCHCBatch = 2500;
      $scope.allDataDisplayed = false;
      $scope.isUpdating = true;
      $scope.loadingSavedBatch = false;
      $scope.batchData = {};
      $scope.savedBatches = {};
      $scope.batchDataGrid = {};
      $scope.showSavedBatchesGrid = false;
      $scope.isViewingASavedBatch = false;
      $scope.showReportHeader = false;
      $scope.isFinanceChargeOn = true; // This setting is not persisted and should always default to true
      $scope.locations = {
        masterLocations: [],
        selectedLocations: [],
      };
      $scope.accountsFilterTypes = [
        { id: 1, labelText: 'Do Not Exclude' },
        { id: 2, labelText: 'Exclude All With Open Claims' },
        { id: 3, labelText: 'Exclude if Estimated Insurance > $0.00' },
        { id: 4, labelText: 'Exclude if Estimated Insurance = 100%' },
      ];
      $scope.accountStatementMessages = [
        { Name: 'None', AccountStatementMessageId: null },
      ];
      $scope.isEstatementsEnabled = false;
      $scope.submissionMethod = '';
      if (sessionStorage.getItem('statements')) {
        if (sessionStorage.getItem('statements') === 'NotProcessed') {
          $scope.savedBatchesFromDate = moment.utc().subtract(1, 'years');
        } else {
          $scope.savedBatchesFromDate = moment.utc().subtract(30, 'days');
        }
      } else {
        $scope.savedBatchesFromDate = moment.utc().subtract(1, 'years');
      }
      $scope.savedBatchesToDate = moment.utc();
      $scope.savedBatchesMaxToDate = moment.utc();

      $scope.isSingleAccount = !angular.isUndefined($routeParams.accountId);
      $scope.accountId = $scope.isSingleAccount ? $routeParams.accountId : '';
      $scope.practiceId = practiceService.getCurrentPractice().id;

      // Filter Criteria
      $scope.filterCriteriaForm = {};
      $scope.customLetterRangeEnabled = false;
      $scope.numberOfDaysNoStatementsEnabled = false;
      $scope.balanceGreaterThanPrevValue = '';
      $scope.faultedAccountMessage = '';
      $scope.showOnlyFaultedAccount = false;
      $scope.missingAddressAccountsCount = 0;
      $scope.originalmissingAddressAccountsCount = 0;

      // Statement Settings
      //      Detail Date
      $scope.validDetailCustomDate = true;
      $scope.detailDateType = 'CUSTOM';
      $scope.defaultDetailCustomDate = moment().subtract(1, 'month').utc();
      $scope.detailCustomDateValue = $scope.defaultDetailCustomDate;
      //      Due Date
      $scope.validDueDateCustomDate = true;
      $scope.dueDateDateType = 'CUSTOM';
      $scope.defaultDueDateCustomDate = moment()
        .utcOffset(0, true)
        .add(1, 'month')
        .utc();
      $scope.dueDateCustomDateValue = $scope.defaultDueDateCustomDate;
      $scope.dueDateMinDate = moment('January 1, 1900');
      //      Organize By
      $scope.organizeByType = 'PATIENT';
      $scope.checkAllFaultyAccounts = true;
      $scope.checkAllAccounts = true;

      $scope.updateInProgress = false;

      $scope.authAccess = function () {
        if (
          !patSecurityService.IsAuthorizedByAbbreviation('soar-acct-astmt-view')
        ) {
          toastrFactory.error(
            localize.getLocalizedString(
              'User is not authorized to access this area.'
            ),
            localize.getLocalizedString('Not Authorized')
          );
          $location.path('/');
        }
      };

      $scope.authAccess();

      ctrl.getAccountStatementMessages = function () {
        patientServices.AccountStatements.GetAccountStatementMessages(
          {},
          function (res) {
            if (res) {
              angular.forEach(res.Value, function (message) {
                $scope.accountStatementMessages.push(message);
              });
            }
          }
        );
      };
      ctrl.getFilterPreferences = function () {
        batchStatementService.Service.fetchFilterPreferences(
          {},
          ctrl.getFilterPreferencesSuccess,
          ctrl.setFilterPreferencesToDefaults
        );
      };

      ctrl.getFilterPreferencesSuccess = function (res) {
        if (res.Value === null) {
          ctrl.setFilterPreferencesToDefaults();
        } else {
          var prefs = res.Value;
          $scope.selectedDisplayAccountsFromLetter = prefs.AlphabetRangeFirst;
          $scope.selectedDisplayAccountsToLetter = prefs.AlphabetRangeLast;
          $scope.balanceGreaterThan = prefs.BalanceGreaterThan;
          $scope.balanceGreaterThanPrevValue = $scope.balanceGreaterThan;
          $scope.numberOfDaysNoStatements = prefs.LastStatementAge;
          $scope.includeCreditBalance = prefs.IncludeNegativeBalance;
          if (
            !$scope.accountsFilterTypes.find(
              x => x.id === prefs.AccountsFilterType
            )
          ) {
            $scope.selectedAccountsFilterType =
              $scope.accountsFilterTypes[0].id;
          } else {
            $scope.selectedAccountsFilterType = prefs.AccountsFilterType;
          }
          switch (prefs.MainFilterType) {
            case 1:
              $scope.selectedMainFilterType = 'ALL';
              break;
            case 2:
              $scope.selectedMainFilterType = 'AL';
              break;
            case 3:
              $scope.selectedMainFilterType = 'MZ';
              break;
            case 4:
              $scope.selectedMainFilterType = 'CUSTOM';
              $scope.customLetterRangeEnabled = true;
              break;
            case 5:
              $scope.selectedMainFilterType = 'NOSTATEMENTSIN';
              $scope.numberOfDaysNoStatementsEnabled = true;
              break;
          }
          $scope.dueDateDateType = !prefs.IsDueByDate
            ? 'DUEUPONRECEIPT'
            : 'CUSTOM';
          $scope.organizeByType = prefs.IsOrganizedByDate ? 'DATE' : 'PATIENT';
          $scope.selectedStatementMessageId30 = prefs.StatementMessageId30;
          $scope.selectedStatementMessageId60 = prefs.StatementMessageId60;
          $scope.selectedStatementMessageId90 = prefs.StatementMessageId90;
          $scope.selectedStatementMessageId90Plus =
            prefs.StatementMessageId90Plus;

          // IsFinanceChargeOn is not a persisted user preference, however, when viewing a saved
          // batch, we do want IsFinanceChargeOn to be set to the value the batch was created with
          if ($scope.isViewingASavedBatch) {
            $scope.isFinanceChargeOn = prefs.IsFinanceChargeOn;
          }

          $scope.filterCriteriaForm.$dirty = true;
        }
      };

      ctrl.setFilterPreferencesToDefaults = function () {
        // Filter criteria
        $scope.selectedMainFilterType = 'ALL';
        $scope.selectedDisplayAccountsFromLetter = 'A';
        $scope.selectedDisplayAccountsToLetter = 'F';
        $scope.customLetterRangeEnabled = false;
        $scope.numberOfDaysNoStatementsEnabled = false;
        $scope.numberOfDaysNoStatements = 28;
        $scope.balanceGreaterThan = 5.0;
        $scope.balanceGreaterThanPrevValue = $scope.balanceGreaterThan;
        $scope.selectedAccountsFilterType = 1;
        $scope.includeCreditBalance = false;
        // Statement settings
        $scope.defaultDetailCustomDate = moment().subtract(1, 'month').utc();
        $scope.detailCustomDateValue = $scope.defaultDetailCustomDate;
        $scope.detailDateType = 'CUSTOM';
        $scope.defaultDueDateCustomDate = moment()
          .utcOffset(0, true)
          .add(1, 'month')
          .utc();
        $scope.dueDateCustomDateValue = $scope.defaultDueDateCustomDate;
        $scope.dueDateDateType = 'CUSTOM';
        // Message defaults
        $scope.selectedStatementMessageId30 = null;
        $scope.selectedStatementMessageId60 = null;
        $scope.selectedStatementMessageId90 = null;
        $scope.selectedStatementMessageId90Plus = null;

        $scope.filterCriteriaForm.$dirty = true;
      };

      ctrl.getFilterPreferences();
      ctrl.getAccountStatementMessages();
      // Watches

      $scope.$watch('locations.masterLocations', function (nv) {
        if (nv.length && $scope.batchData.Rows) {
          ctrl.appendLocationLabel();
        }
      });

      $scope.$watch('selectedAccountsFilterType', function (nv) {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('selectedMainFilterType', function (nv) {
        $scope.filterCriteriaForm.$dirty = true;
        if (nv === 'CUSTOM') {
          $scope.customLetterRangeEnabled = true;
        } else {
          $scope.customLetterRangeEnabled = false;
        }
        if (nv === 'NOSTATEMENTSIN') {
          $scope.numberOfDaysNoStatementsEnabled = true;
        } else {
          $scope.numberOfDaysNoStatementsEnabled = false;
        }
      });

      $scope.$watch('includeCreditBalance', function (nv) {
        if (nv === true) {
          $scope.balanceGreaterThanPrevValue = $scope.balanceGreaterThan;
          $scope.balanceGreaterThan = 0.0;
        } else {
          $scope.balanceGreaterThan = $scope.balanceGreaterThanPrevValue;
        }
        $scope.filterCriteriaForm.$dirty = true;
      });

      $scope.$watch('locations.selectedLocations', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });

      $scope.$watch('detailCustomDateValue', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('detailCustomDateValue', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('organizeByType', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('balanceGreaterThan', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('selectedStatementMessageId30', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('selectedStatementMessageId60', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('selectedStatementMessageId90', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });
      $scope.$watch('selectedStatementMessageId90Plus', function () {
        $scope.filterCriteriaForm.$dirty = true;
      });

      ctrl.getEstatementEnrollmentStatus = function () {
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        locationServices.getLocationEstatementEnrollmentStatus(
          { locationId: cachedLocation.id },
          ctrl.getEstatementEnrollmentStatusSuccess,
          ctrl.getEstatementEnrollmentStatusFailure
        );
      };

      ctrl.getEstatementEnrollmentStatusSuccess = function (res) {
        $scope.isEstatementsEnabled = res.Result;
      };

      ctrl.getEstatementEnrollmentStatusFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve eStatement Enrollment Status'
          ),
          localize.getLocalizedString('Error')
        );
      };

      ctrl.getLocations = function () {
        $scope.locationsLoading = true;
        locationServices.get(
          {},
          ctrl.getLocationSuccess,
          ctrl.getLocationFailure
        );
      };

      $scope.removeLocation = function (location) {
        location.Selected = false;
        $scope.updateContents();
      };

      ctrl.resetInfiniteScroll = function () {
        $scope.isUpdating = true;
        $scope.allDataDisplayed = false;
        $scope.currentPage = 0;
        $scope.isUpdating = false;
      };

      $scope.createBatch = function () {
        $scope.savedBatchIsProcessed = false;
        $scope.checkAllAccounts = true;
        $scope.currentPage = 0;
        $scope.showOnlyFaultedAccount = false;
        if (
          $scope.isViewingASavedBatch === true &&
          $scope.batchDataGrid.$dirty === true
        ) {
          // User has made changes, ask to confirm losing these changes and create new batch
          var title = localize.getLocalizedString('Discard Changes?');
          var message = localize.getLocalizedString(
            'Creating a batch will discard any changes you have made to the current batch and create a new batch based on the current filters. Continue?'
          );
          var button1Text = localize.getLocalizedString('Yes');
          var button2Text = localize.getLocalizedString('No');
          modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(ctrl.getBatchData);
        } else {
          ctrl.getBatchData();
        }
      };

      $scope.retryBatchModal = function (row) {
        var retryMessage = '';
        $scope.showOnlyFaultedAccount = false;
        var failedLocationsCount = 0;
        var title = localize.getLocalizedString('Statement Processing');
        retryMessage = localize.getLocalizedString(
          'Your attempt to process the statement batch failed.  Please review the batch details for accuracy and try again.'
        );
        var button1Text = localize.getLocalizedString('OK');
        var button2Text = localize.getLocalizedString('Cancel');
        if (!$scope.showNotProcessedSavedBatches) {
          if (row.Status === 4) {
            retryMessage = localize.getLocalizedString(
              'Your attempt to process the statement batch failed.  Would you like to make another attempt to send the failed batch?'
            );
          }
          if (row.Status === 5) {
            var data = '';
            angular.forEach(row.AccountStatementForLocations, function (item) {
              if (item.LocationStatus !== 2) {
                failedLocationsCount += 1;
                row.Location = _.find(
                  $scope.locations.masterLocations,
                  function (location) {
                    if (item.LocationId == location.LocationId) {
                      data += `${location.NameLine1} (${item.NumberOfStatementsPerLocation}), `;
                    }
                  }
                );
              }
            });
            if (data) {
              data = data.slice(0, -2);
            }

            if (failedLocationsCount > 1) {
              retryMessage = localize.getLocalizedString(
                'Your attempt to process the statement batch partially failed. The portions for ' +
                  data +
                  ' were not sent successfully.  Would you like to make another attempt to send the failed portions?'
              );
            } else {
              retryMessage = localize.getLocalizedString(
                'Your attempt to process the statement batch partially failed. The portion for ' +
                  data +
                  ' was not sent successfully.  Would you like to make another attempt to send the failed portion?'
              );
            }
          }
          button1Text = localize.getLocalizedString('Yes');
          button2Text = localize.getLocalizedString('No');
        }

        modalFactory
          .ConfirmModal(title, retryMessage, button1Text, button2Text)
          .then(function () {
            return $scope.getSingleSavedBatch(
              row.BatchStatementId,
              row.UserHasAccess,
              3,
              true
            );
          });
      };

      $scope.processLargeBatch = function (row) {
        var title = localize.getLocalizedString('Statement Processing');
        var message = localize.getLocalizedString(
          'Your statements are being processed.  Please check the saved batches list later for progress updates.'
        );
        var button1Text = localize.getLocalizedString('OK');
        modalFactory
          .ConfirmModal(title, message, button1Text)
          .then(function () {
            $scope.getSavedBatchesForStatements(false);
          });
        $scope.batchData = {};
        $scope.isViewingASavedBatch = false;
      };

      ctrl.getBatchData = function () {
        $scope.batchStatementId = '';
        $scope.isViewingASavedBatch = false;
        $scope.batchData = {};
        $scope.allDataDisplayed = false;
        $scope.isUpdating = true;
        if ($scope.isSingleAccount === true) {
          batchStatementService.Service.fetchSingleAccountStatementData(
            { accountId: $scope.accountId, savePreferences: true },
            ctrl.createFilterObject(),
            ctrl.saveBatchSuccess,
            ctrl.saveBatchFailure
          );
        } else {
          ctrl.validate();
          if ($scope.formIsValid) {
            batchStatementService.Service.saveNewBatch(
              ctrl.createFilterObject(),
              ctrl.saveBatchSuccess,
              ctrl.saveBatchFailure
            );
          }
        }

        $scope.batchDataGrid.$dirty = false;
        $scope.filterCriteriaForm.$dirty = false;
      };
      ctrl.saveBatchSuccess = function (res) {
        $scope.batchStatementId = res.Value.BatchStatement.BatchStatementId;
        $scope.batchData = res.Value;
        $scope.originalTotalCount = $scope.batchData.TotalCountEntireBatch;
        $scope.originalTotalBalance = $scope.batchData.TotalBalanceEntireBatch;
        $scope.missingAddressAccountsCount =
          res.Value.BatchStatement.MissingAddressAccountsCount;
        $scope.originalmissingAddressAccountsCount =
          res.Value.BatchStatement.MissingAddressAccountsCount;
        $scope.hasAnyMissingAddressAccount =
          res.Value.BatchStatement.hasAnyMissingAddressAccount;
        $scope.faultedAccountMessage = localize.getLocalizedString(
          'Show Accounts with Alerts ({0})',
          [$scope.originalmissingAddressAccountsCount]
        );
        if ($scope.isSingleAccount === false) {
          $scope.loadBatchData();
        } else {
          if ($scope.isViewingASavedBatch) {
            angular.forEach(res.Value.Rows, ctrl.setRetrievedStatementSettings);
          } else {
            angular.forEach(res.Value.Rows, ctrl.setStatementSettings);
          }

          ctrl.appendLocationLabel();
        }
        ctrl.resetTop();
      };

      ctrl.appendLocationLabel = function () {
        angular.forEach($scope.batchData.Rows, function (row) {
          row.Location = _.find(
            $scope.locations.masterLocations,
            function (location) {
              return row.LocationId == location.LocationId;
            }
          );
        });
      };

      ctrl.saveBatchFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again.',
            ['Batch Statements']
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.setStatementSettings = function (row) {
        row.SinceLastStatementSelected = $scope.batchData.FilterPreferences
          .IsDetailByDate
          ? false
          : true;
        row.DueDate = row.DueUponReceipt ? null : new Date(row.DueDate);
        row.displayDueDate = row.DueDate ? new Date(row.DueDate) : null;
        if (row.FinanceChargeAmount === 0) {
          row.ApplyFinanceCharge = false;
          row.FinanceChargeDisabled = true;
        } else if (row.AccountReceivesFinanceCharges === false) {
          row.ApplyFinanceCharge = false;
        }
        row.OriginalApplyFinanceCharge = row.ApplyFinanceCharge;

        let existingIndex = _.findIndex($scope.batchData.Rows, {
          AccountId: row.AccountId,
        });
        if (existingIndex === -1) {
          $scope.batchData.Rows.push(row);
        }
      };
      $scope.getFaultedAccounts = function () {
        // When only loading faulted account, call to get all faulted ones; 
        // otherwise, data will be loaded through infinite scroll
        if($scope.showOnlyFaultedAccount){
          $scope.loadBatchData();
        }
        else {
          // When unchecked, infinite scroll will be enabled
          $scope.allDataDisplayed = false;
        }
      };
      $scope.getRowVisibility = function (row) {
        if ($scope.showOnlyFaultedAccount) {
          return row.ValidationMessages.length > 0;
        } else {
          return true;
        }
      };
      $scope.loadBatchData = function () {
        $scope.isUpdating = true;

        let batchData = {
          ...$scope.batchData,
          Rows: [],
          CurrentPage: $scope.currentPage,
          PageCount: $scope.pageCount,
          ShowOnlyFaultedAccounts: $scope.showOnlyFaultedAccount,
        };

        // These properties are not used when loading the grid
        if (batchData.BatchStatement) {
          delete batchData.BatchStatement.AccountStatements;
        }
        
        // No longer using these, but API is still expecting them
        batchData.ApplySelectDeselectAll = false;
        batchData.SelectAll = false;

        batchStatementService.Service.getBatchGrid(
          batchData,
          function (res) {
            $scope.allDataDisplayed = $scope.showOnlyFaultedAccount || res.Value.Rows.length !== $scope.pageCount;

            if ($scope.isViewingASavedBatch) {
              angular.forEach(
                res.Value.Rows,
                ctrl.setRetrievedStatementSettings
              );
            } else {
              angular.forEach(res.Value.Rows, 
                ctrl.setStatementSettings);
            }
            $scope.missingAddressAccountsCount =
              res.Value.BatchStatement.MissingAddressAccountsCount;
            $scope.originalmissingAddressAccountsCount =
              res.Value.BatchStatement.MissingAddressAccountsCount;
            $scope.faultedAccountMessage = localize.getLocalizedString(
              'Show Accounts with Alerts ({0})',
              [$scope.originalmissingAddressAccountsCount]
            );
            if (!$scope.showOnlyFaultedAccount) {
              // Only increment page count when not showing faulted accounts
              $scope.currentPage++;
            }
            $scope.isUpdating = false;
            ctrl.appendLocationLabel();
          }
        );
      };

      ctrl.checkIfSingleAccount = function () {
        if ($scope.isSingleAccount === true) {
          ctrl.setFilterPreferencesToDefaults();
          ctrl.getBatchData();
        }
      };
      $scope.getSavedBatchesForStatements = function (isProcessed) {
        $scope.isUpdating = true;
        $scope.loadingSavedBatch = true;
        $scope.savedBatches = {};
        $scope.showNotProcessedSavedBatches = isProcessed ? false : true;
        ctrl.validateSavedBatchesSearch(isProcessed);
        if ($scope.searchDatesValid) {
          var postObject = {
            FilterCriteria: { IsProcessed: isProcessed ? true : false },
          };
          if (isProcessed) {
            postObject.FilterCriteria.FromDate = $scope.savedBatchesFromDate;
            postObject.FilterCriteria.ToDate = $scope.savedBatchesToDate;
          }
          batchStatementService.Service.getSavedBatches(
            postObject,
            ctrl.getSavedBatchesSuccess,
            ctrl.getSavedBatchesFailure
          );
        }
      };
      $scope.getSavedBatches = function ($event, isProcessed) {
        $scope.getSavedBatchesForStatements(isProcessed);
        if ($scope.searchDatesValid && $event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        $scope.loadingSavedBatch = false;
      };

      ctrl.getSavedBatchesSuccess = function (res) {
        $scope.showReportHeader = false;
        if (res.Value && res.Value.Rows) {
          $scope.savedBatches = res.Value;
          angular.forEach($scope.savedBatches.Rows, function (row) {
            row.DateCreated = moment
              .utc(row.DateCreated)
              .local()
              .format('MM/DD/YYYY');
            if (row.HasReport) {
              $scope.showReportHeader = row.HasReport;
            }
            switch (row.SubmissionMethod) {
              case 0:
                row.SubmissionMethod = 'Not Processed';
                break;
              case 1:
                row.SubmissionMethod = 'Electronic';
                break;
              case 2:
                row.SubmissionMethod = 'Print';
                break;
            }
          });
        }
        $scope.loadingSavedBatch = false;
        $scope.showSavedBatchesGrid = true;
        ctrl.resetTop();
      };

      ctrl.getSavedBatchesFailure = function () {
        $scope.loadingSavedBatch = false;
        $scope.showSavedBatchesGrid = true;
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again.',
            ['Saved Batches']
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.getSingleSavedBatchCallSetup = function (retry) {
        $scope.batchData = {};
        $scope.batchDataGrid.$dirty = false;
        var services = [];

        // If batch is processed, no need to call update API - just call to get grid data
        if (!$scope.showNotProcessedSavedBatches) {
          services = [
            {
              Call: batchStatementService.Service.getBatchGrid,
              Params: {
                CurrentPage: $scope.currentPage,
                PageCount: $scope.pageCount,
                BatchStatement: {
                  BatchStatementId: $scope.batchStatementId,
                },
              },
              OnSuccess: ctrl.getSingleSavedBatchSuccess,
              OnError: ctrl.getSingleSavedBatchFailure,
            },
          ];
          $scope.currentPage++;
        } else {
          // else for unprocessed batches, call update API first then let infinite scroll get the grid data
          services = [
            {
              Call: batchStatementService.Service.getSavedBatch,
              Params: {
                batchStatementId: $scope.batchStatementId,
              },
              OnSuccess: ctrl.getSingleSavedBatchSuccess,
              OnError: ctrl.getSingleSavedBatchFailure,
            },
          ];
        }

        return services;
      };

      $scope.getSingleSavedBatch = function (
        batchStatementId,
        enabled,
        status,
        retry
      ) {
        if (enabled && status !== 2 && status !== 4 && status !== 5) {
          $scope.batchStatementId = batchStatementId;
          ctrl.resetInfiniteScroll();
          $scope.isUpdating = true;
          $scope.isLoading = true;
          modalFactory.LoadingModal(function () {
            return ctrl.getSingleSavedBatchCallSetup(retry);
          });
        }
      };

      ctrl.getSingleSavedBatchSuccess = function (res) {
        $scope.isViewingASavedBatch = true;
        $scope.savedBatchIsProcessed =
          res.Value.BatchStatement.IsProcessed &&
          res.Value.BatchStatement.Status === 3;
        // Takes care of the disabling of the Display Accounts, Options and Location
        $scope.isSingleAccount = res.Value.BatchStatement.IsForSingleAccount;

        // Set Filter, Options & Settings to what they were when the batch was created
        var filters = { Value: res.Value.BatchStatement };
        ctrl.getFilterPreferencesSuccess(filters);

        if (res.Value) {
          $scope.batchData = res.Value;
          $scope.missingAddressAccountsCount =
            res.Value.BatchStatement.MissingAddressAccountsCount;
          $scope.originalmissingAddressAccountsCount =
            res.Value.BatchStatement.MissingAddressAccountsCount;
          $scope.faultedAccountMessage = localize.getLocalizedString(
            'Show Accounts with Alerts ({0})',
            [$scope.originalmissingAddressAccountsCount]
          );
          $scope.originalTotalCount = $scope.batchData.TotalCountEntireBatch;
          $scope.originalTotalBalance =
            $scope.batchData.TotalBalanceEntireBatch;
          // If is a processed batch, set first set of grid rows
          if ($scope.savedBatchIsProcessed) {
            angular.forEach(
              $scope.batchData.Rows,
              ctrl.setRetrievedStatementSettings
            );
            $scope.allDataDisplayed =
              $scope.batchData.Rows.length !== $scope.pageCount;
          } else {
            angular.forEach(
              $scope.batchData.Rows,
              ctrl.handlePartialFailureAndFailedBatches
            );
          }

          var savedBatch =
            $scope.savedBatches && $scope.savedBatches.Rows
              ? _.find($scope.savedBatches.Rows, {
                  BatchStatementId:
                    $scope.batchData.BatchStatement.BatchStatementId,
                })
              : null;
          if (savedBatch) {
            savedBatch.NumberOfStatements = $scope.batchData.TotalCount;
          }
        }

        $scope.isLoading = false;
        $scope.isUpdating = false;
        ctrl.resetTop();
      };
      ctrl.handlePartialFailureAndFailedBatches = function (row) {
        if (
          $scope.batchData.BatchStatement.Status === 4 ||
          $scope.batchData.BatchStatement.Status === 5
        ) {
          if (row.ValidationMessages.length) {
            row.IsSelectedOnBatch = false;
          }
        }
      };
      ctrl.getSingleSavedBatchFailure = function (res) {
        //need a nullable param for name
        $scope.isLoading = false;
        //if api not updated res.status = 500
        if (
          res != null &&
          res.status != 500 &&
          res.data.InvalidProperties[0].PropertyName === 'AccountStatements'
        ) {
          var title = localize.getLocalizedString('Statement Warning');
          var message = localize.getLocalizedString(
            res.data.InvalidProperties[0].ValidationMessage +
            ' and this batch will be deleted. If you want to send this account a statement, please update the patient profile and create statement again. Do you wish to keep this statement despite the patient setting or delete it?'
          );
          var button1Text = localize.getLocalizedString('Delete');
          var button2Text = localize.getLocalizedString('Keep');
          modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(function () {
              batchStatementService.Service.deletebatchStatement(
                { batchStatementId: $scope.batchStatementId },
                ctrl.deleteBatchOnSuccess,
                ctrl.deleteBatchOnFailure
              );
            });
        } else {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve {0}. Please try again.',
              ['saved batch']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      };
      ctrl.deleteBatchOnSuccess = function (deferredObject) {
        toastrFactory.success(
          localize.getLocalizedString('Your {0} has been deleted.', 1),
          localize.getLocalizedString('Success')
        );
        $scope.getSavedBatchesForStatements(false);
      };
      ctrl.deleteBatchOnFailure = function (deferredObject) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Delete was unsuccessful. Please refresh the page and retry your delete.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };
      
      ctrl.isSelectedOnBatchSuccess = function () {
        toastrFactory.success(
          localize.getLocalizedString('The batch has been updated'),
          localize.getLocalizedString('Success')
        );
        $scope.updateInProgress = false;
      };
      ctrl.isSelectedOnBatchFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Batch update was unsuccessful. Please refresh the page and try again.'
          ),
          localize.getLocalizedString('Server Error')
        );
        $scope.updateInProgress = false;
      };

      ctrl.setRetrievedStatementSettings = function (row) {
        row.SinceLastStatementSelected = $scope.batchData.FilterPreferences
          .IsDetailByDate
          ? false
          : true;
        row.DueDate = row.DueUponReceipt ? null : new Date(row.DueDate);
        row.displayDueDate = row.DueDate ? new Date(row.DueDate) : null;
        if (row.StatementHistory === 1) {
          row.accountInfoMessage = 'Account no longer meets criteria';
          row.IsSelectedOnBatch = false;
        }
        if (row.StatementHistory === 2) {
          row.accountInfoMessage =
            'This account now meets the statement criteria';
          row.IsSelectedOnBatch = true;
        }
        row.OriginalApplyFinanceCharge = row.ApplyFinanceCharge;

        if (
          $scope.batchData.BatchStatement.Status === 4 ||
          $scope.batchData.BatchStatement.Status === 5
        ) {
          if (row.ValidationMessages.length) {
            row.IsSelectedOnBatch = false;
          }
        }
        let existingIndex = _.findIndex($scope.batchData.Rows, {
          AccountId: row.AccountId,
        });
        if (existingIndex === -1) {
          $scope.batchData.Rows.push(row);
        }
      };

      ctrl.createFilterObject = function () {
        if (
          $scope.locations.selectedLocations.length == 1 &&
          $scope.locations.selectedLocations[0].LocationId == null
        ) {
          var masterLocations = $scope.locations.masterLocations.filter(
            x => x.LocationId != null
          );
          var locationids = _.map(masterLocations, function (location) {
            if (
              location.LocationStatus == 'Active' &&
              location.LocationId != null
            )
              return location.LocationId;
          });
        } else {
          var locationids = _.map(
            $scope.locations.selectedLocations,
            function (location) {
              return location.LocationId;
            }
          );
        }
        var namesBetweenStartLetter = '';
        var namesBetweenEndLetter = '';
        var daysSinceLastStatement = 0;
        var batchStatementMainFilterType = '';
        var isDetailByCustomDate = $scope.detailDateType === 'CUSTOM';
        var isDueByCustomDate = $scope.dueDateDateType === 'CUSTOM';
        var isOrganizeByDate = $scope.organizeByType === 'DATE';

        switch ($scope.selectedMainFilterType) {
          case 'ALL':
            namesBetweenStartLetter = '';
            namesBetweenEndLetter = '';
            batchStatementMainFilterType = 1;
            break;
          case 'AL':
            namesBetweenStartLetter = 'A';
            namesBetweenEndLetter = 'L';
            batchStatementMainFilterType = 2;
            break;
          case 'MZ':
            namesBetweenStartLetter = 'M';
            namesBetweenEndLetter = 'Z';
            batchStatementMainFilterType = 3;
            break;
          case 'CUSTOM':
            namesBetweenStartLetter = $scope.selectedDisplayAccountsFromLetter;
            namesBetweenEndLetter = $scope.selectedDisplayAccountsToLetter;
            batchStatementMainFilterType = 4;
            break;
          case 'NOSTATEMENTSIN':
            daysSinceLastStatement = $scope.numberOfDaysNoStatements;
            batchStatementMainFilterType = 5;
            break;
        }

        return {
          FilterCriteria: {
            LocationIds: locationids,
            NamesBetweenStartLetter: namesBetweenStartLetter,
            NamesBetweenEndLetter: namesBetweenEndLetter,
            DaysSinceLastStatement: daysSinceLastStatement,
            MainFilterType: batchStatementMainFilterType,
            BalanceGreaterThan: $scope.balanceGreaterThan,
            AccountsFilterType: $scope.selectedAccountsFilterType,
            IncludeAccountsWithCreditBalance: $scope.includeCreditBalance,
          },
          SortCriteria: {},
          FilterPreferences: {
            AlphabetRangeFirst: namesBetweenStartLetter,
            AlphabetRangeLast: namesBetweenEndLetter,
            BalanceGreaterThan: $scope.balanceGreaterThan,
            LastStatementAge: daysSinceLastStatement,
            MainFilterType: batchStatementMainFilterType,
            AccountsFilterType: $scope.selectedAccountsFilterType,
            IncludeNegativeBalance: $scope.includeCreditBalance,
            IsDetailByDate: isDetailByCustomDate,
            DetailFromDate: isDetailByCustomDate
              ? $scope.detailCustomDateValue
              : '',
            IsDueByDate: isDueByCustomDate,
            DueByDate: isDueByCustomDate ? $scope.dueDateCustomDateValue : '',
            IsFinanceChargeOn: $scope.isFinanceChargeOn,
            IsOrganizedByDate: isOrganizeByDate,
            Message: $scope.messageTextValue,
            StatementMessageId30: $scope.selectedStatementMessageId30,
            StatementMessageId60: $scope.selectedStatementMessageId60,
            StatementMessageId90: $scope.selectedStatementMessageId90,
            StatementMessageId90Plus: $scope.selectedStatementMessageId90Plus,
          },
          savePreferences: true,
        };
      };
      $scope.toggleSelected = function (row, save = false) {
        $scope.updateInProgress = true;
        if (save) {
          $scope.updateAccountStatementIsSelectedOnBatch(row);
        }
        $scope.savedBatchIsProcessed = false;
        if (row.IsSelectedOnBatch) {
          $scope.batchData.TotalCount++;
          $scope.batchData.TotalBalance =
            $scope.batchData.TotalBalance + row.Balance;
          if (row.ValidationMessages.length) {
            $scope.missingAddressAccountsCount++;
          }
          if ($scope.batchData.TotalCount === $scope.originalTotalCount) {
            $scope.batchData.SelectAll = true;
          }
        } else {
          $scope.batchData.TotalCount--;
          $scope.batchData.TotalBalance =
            $scope.batchData.TotalBalance - row.Balance;
          if (row.ValidationMessages.length) {
            $scope.missingAddressAccountsCount--;
          }
          $scope.batchData.SelectAll = false;
        }
      };

      $scope.toggleAll = function () {
        $scope.updateInProgress = true;
        $scope.updateIsSelectedOnBatchForEntireBatch();
        if (!$scope.showOnlyFaultedAccount) {
          $scope.batchData.TotalCount = $scope.batchData.SelectAll
            ? $scope.originalTotalCount
            : 0;
          $scope.batchData.TotalBalance = $scope.batchData.SelectAll
            ? $scope.originalTotalBalance
            : 0;
          $scope.missingAddressAccountsCount = $scope.batchData.SelectAll
            ? $scope.originalmissingAddressAccountsCount
            : 0;

          angular.forEach($scope.batchData.Rows, function (row) {
            row.IsSelectedOnBatch = $scope.batchData.SelectAll;
          });
        }
        else {
          angular.forEach($scope.batchData.Rows, function (row) {
            if (row.ValidationMessages.length && 
              row.IsSelectedOnBatch !== $scope.batchData.SelectAll) {
                row.IsSelectedOnBatch = $scope.batchData.SelectAll;
                $scope.toggleSelected(row, false);
            }
          });
        }
      };

      $scope.updateAccountStatementIsSelectedOnBatch = function(row) {
        batchStatementService.Service.updateAccountStatementIsSelectedOnBatch(
          {
            batchStatementId: row.BatchId,
            accountStatementId: row.AccountStatementId,
            isSelected: row.IsSelectedOnBatch
          },
          ctrl.isSelectedOnBatchSuccess,
          ctrl.isSelectedOnBatchFailure
        );
      }

      $scope.updateIsSelectedOnBatchForEntireBatch = function() {
        batchStatementService.Service.updateIsSelectedOnBatchForEntireBatch(
          {
            batchStatementId: $scope.batchData.BatchStatement.BatchStatementId,
            isSelected: $scope.batchData.SelectAll,
            onlyUpdateStatementsWithAlerts: $scope.showOnlyFaultedAccount,
          },
          ctrl.isSelectedOnBatchSuccess,
          ctrl.isSelectedOnBatchFailure
        );
      }

      $scope.alertBatchFailure = function () {
        var title = localize.getLocalizedString('Statement Submission Failure');
        var message = localize.getLocalizedString(
          'This statement batch cannot be processed because one or more of the statements has missing information.  Please check the alerts, make corrections or remove statements with alerts and try again.'
        );
        var button1Text = localize.getLocalizedString('OK');
        modalFactory.ConfirmModal(title, message, button1Text);
        $scope.isViewingASavedBatch = false;
        $scope.savedBatchIsProcessed = false;
      };

      $scope.getValidationsToolTip = function (validationMessages) {
        var messages = [];
        angular.forEach(validationMessages, function (vm) {
          messages.push(localize.getLocalizedString(vm));
        });
        if (messages.length) {
          return messages.join('<br/>');
        }
      };

      /**
       * Returns a promise that resolves to true if all selected locations have eStatements enrolled
       *
       * @param { {IsSelectedOnBatch: boolean; LocationId: number }[] } statements
       * @returns {Promise<boolean>} A promise that resolves to true if all selected locations have eStatements enrolled
       */
      ctrl.allSelectedLocationsHaveEstatementsEnrolled =
        function AllSelectedLocationsHaveEstatementsEnrolled(statements) {
          return Promise.all(
            statements
              // Only statements that are selected on the batch
              .filter(statement => statement.IsSelectedOnBatch)
              .map(statement => statement.LocationId)
              // Only unique location Ids
              .filter(
                (locationId, index, self) => self.indexOf(locationId) === index
              )
              .map(locationId => ctrl.isLocationEstatementsEnrolled(locationId))
          ).then(results => {
            return results.every(Boolean);
          });
        };

      /**
       * Returns a promise that resolves to true if the location is enrolled in eStatements
       *
       * @param {number} locationId The Id of the location
       * @returns {Promise<boolean>} A promise that resolves to true if the location is enrolled in eStatements
       */
      ctrl.isLocationEstatementsEnrolled =
        function IsLocationEstatementsEnrolled(locationId) {
          return locationServices
            .getLocationEstatementEnrollmentStatus({
              locationId: locationId,
            })
            .$promise.then(response => response.Result);
        };

      /**
       * Shows a confirmation modal
       *
       * @param {string} title Title of the modal
       * @param {string} message Message of the modal
       * @param {string} buttonText Text of the button
       * @returns {Promise<void>} A promise that resolves when the modal is closed
       */
      ctrl.showConfirmationModal = function ShowConfirmationModal(
        title,
        message,
        buttonText
      ) {
        title = localize.getLocalizedString(title);
        message = localize.getLocalizedString(message);
        buttonText = localize.getLocalizedString(buttonText);

        return modalFactory.ConfirmModal(title, message, buttonText);
      };

      $scope.confirmSubmissionMethod = function () {
        $scope.savedBatchIsProcessed = true;
        $scope.isAvailableforProcessing = $filter('isAvailableforProcessing')(
          $scope.batchData
        );

        batchStatementService.Service.getSelectedStatementsWithAlertsCount(
          { batchStatementId: $scope.batchStatementId },
          ctrl.getSelectedStatementsWithAlertsCountSuccess,
          ctrl.getSelectedStatementsWithAlertsCountFailure
        );
      };

      // Check to see if the batch has any accounts selected that contain alerts
      ctrl.getSelectedStatementsWithAlertsCountSuccess = function (res) {
        if (res.Value > 0 || !$scope.isAvailableforProcessing) {
          // At least one account with alerts is selected on the batch
          $scope.alertBatchFailure();
          return;
        }
        
        if ($scope.isEstatementsEnabled === true) {
          // Give the user the option to select electronic or print
          $scope.sendNow();
        } else {
          // Print is the only option
          $scope.create(true, 'print');
        }
      }

      ctrl.getSelectedStatementsWithAlertsCountFailure = function (res) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Batch account alert validation failed. Please refresh the page and try again.'
          ),
          localize.getLocalizedString('Server Error')
        );
      }

      $scope.sendNow = function () {
        $scope.submissionMethod = 'electronic';
        modalFactory
          .Modal({
            templateUrl:
              'App/BusinessCenter/receivables/statements/statement-submission-method-modal/statement-submission-method-modal.html',
            backdrop: 'static',
            keyboard: false,
            size: 'md',
            windowClass: 'center-modal',
            controller: 'StatementSubmissionMethodModalController',
            scope: $scope,
            amfa: 'soar-acct-astmt-add',
            resolve: {
              submissionMethod: function () {
                return $scope.submissionMethod;
              },
            },
          })
          .result.then(function (submissionMethod) {
            if (submissionMethod == 'cancel') {
              $scope.savedBatchIsProcessed = false;
            } else {
              $scope.submissionMethod = submissionMethod;
              if ($scope.submissionMethod == 'electronic') {
                return ctrl
                  .allSelectedLocationsHaveEstatementsEnrolled(
                    $scope.batchData.Rows
                  )
                  .then(allLocationsHaveEstatementsEnrolled => {
                    if (allLocationsHaveEstatementsEnrolled) {
                      $scope.create(true, $scope.submissionMethod);
                    } else {
                      return ctrl
                        .showConfirmationModal(
                          'Electronic Statement Submission',
                          'eStatement submission is currently unavailable for locations selected within this batch. Our partners at Optum are experiencing a global network outage that is causing connectivity issues with eStatement submission. Paper statements can still be generated. We sincerely apologize for the inconvenience this is causing to your day to day practice workflow. Thank you for your continued partnership',
                          'Ok'
                        )
                        .then(function () {
                          $scope.savedBatchIsProcessed = false;
                        });
                    }
                  });
              } else if ($scope.submissionMethod == 'print') {
                $scope.create(true, $scope.submissionMethod);
              } else {
                $scope.savedBatchIsProcessed = false;
              }
            }
          });
      }

      $scope.create = function (isSendNow, submissionMethod) {
        $scope.submissionMethod = submissionMethod;
        angular.forEach($scope.batchData.Rows, function (row) {
          if (row.ApplyFinanceCharge === false) row.FinanceCharge = null;
        });

        switch (submissionMethod) {
          case 'electronic':
            $scope.batchData.BatchStatement.SubmissionMethod = 1;
            break;
          case 'print':
            $scope.batchData.BatchStatement.SubmissionMethod = 2;
            break;
          default:
            $scope.batchData.BatchStatement.SubmissionMethod = 0;
            break;
        }

        var savedBatch =
          $scope.savedBatches && $scope.savedBatches.Rows
            ? _.find($scope.savedBatches.Rows, {
                BatchStatementId:
                  $scope.batchData.BatchStatement.BatchStatementId,
              })
            : null;
        if (savedBatch) {
          savedBatch.NumberOfStatements = $scope.batchData.TotalCount;
          savedBatch.TotalDue = $scope.batchData.TotalBalance;
        }

        var postObject = {};
        $scope.batchData.BatchStatement.NumberOfStatements =
          $scope.batchData.TotalCount;
        postObject = {
          AccountStatementSettings: $scope.batchData.Rows.map(function (row) {
            return {
              BatchId: row.BatchId,
              DueUponReceipt: row.DueUponReceipt,
              DueDate: row.DueDate,
              ApplyFinanceCharge: row.ApplyFinanceCharge,
              IsSelectedOnBatch: row.IsSelectedOnBatch,
              AccountStatementId: row.AccountStatementId,
              LocationId: row.LocationId,
              FinanceCharge: row.FinanceCharge,
              IsOrganizedByDate: row.IsOrganizedByDate,
              DetailDate: row.DetailDate,
              AccountId: row.AccountId,
              SinceLastStatementSelected: row.SinceLastStatementSelected,
              Message: row.Message,
            };
          }),
          FinalizeStatements: isSendNow ? true : false,
          BatchStatement: $scope.batchData.BatchStatement,
          ApplySelectDeselectAll: false, // always send false because API is ignoring it anyway
          SelectAll: false, // always send false because API is ignoring it anyway
        };

        // When pagination was implemented, batch is saved initially so always call update api.
        if ($scope.isViewingASavedBatch) {
          postObject.BatchStatement.BatchStatementId = $scope.batchStatementId;
        }
        if (isSendNow) {
          if (
            $scope.batchData.TotalCountEntireBatch == 1 &&
            postObject.BatchStatement.SubmissionMethod == 2
          ) {
            batchStatementService.Service.update(
              postObject,
              ctrl.batchCreateSuccess(isSendNow),
              ctrl.batchCreateFailure
            );
          } else {
            batchStatementService.Service.queueSubmission(
              { submissionMethod: postObject.BatchStatement.SubmissionMethod },
              postObject,
              $scope.processLargeBatch,
              ctrl.batchCreateFailure
            );
          }
        } else {
          batchStatementService.Service.updatebatchstatementstatus(
            { batchStatementId: postObject.BatchStatement.BatchStatementId },
            postObject,
            ctrl.batchCreateSuccess(isSendNow),
            ctrl.batchCreateFailure
          );
        }
        $scope.filterCriteriaForm.$dirty = true;
        $scope.showOnlyFaultedAccount = false;
      };

      ctrl.batchCreateSuccess = function (finalized) {
        return function (res) {
          if (finalized && $scope.submissionMethod === 'electronic') {
            var title = localize.getLocalizedString('Success');
            var message = localize.getLocalizedString(
              '{0} statements were successfully processed',
              [res.Value.NumberOfProcessedStatements]
            );
            var button1Text = localize.getLocalizedString('Ok');
            modalFactory
              .ConfirmModal(title, message, button1Text)
              .then(function () {
                $scope.getSavedBatchesForStatements(false);
              });
          } else {
            toastrFactory.success(
              localize.getLocalizedString('Batch Creation Successful'),
              localize.getLocalizedString('Success')
            );
            if (finalized) {
              $scope.getBatchPdf(res.Value.BatchStatementId);
              $scope.getSavedBatchesForStatements(false);
            }
          }
          $scope.batchData = {};
          $scope.isViewingASavedBatch = false;
        };
      };

      ctrl.batchCreateFailure = function () {
        if ($scope.submissionMethod === 'electronic') {
          var title = localize.getLocalizedString(
            'Service Temporarily Unavailable; Try Again Later'
          );
          var message = localize.getLocalizedString(
            'The statement batch failed to send - the statements were not processed.  To try again later, retrieve the batch from the Statements page.'
          );
          var button1Text = localize.getLocalizedString('Ok');
          modalFactory.ConfirmModal(title, message, button1Text);
        } else {
          toastrFactory.error(
            localize.getLocalizedString('Failed to create {0}', [
              'Batch Statement',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      };
      $scope.getBatchPdf = function (id) {
        batchStatementService
          .GetPdf(id)
          .then(ctrl.getBatchPdfSuccess, ctrl.getBatchPdfFailure);
      };

      ctrl.getBatchPdfSuccess = function (res) {
        var file = new Blob([res.data], {
          type: 'application/pdf',
        });

        ctrl.window = $window.open('');
        if (window.navigator.msSaveOrOpenBlob) {
          ctrl.window.navigator.msSaveOrOpenBlob(
            file,
            'View Selected Claims' + '.pdf'
          );
        } else {
          var fileURL = URL.createObjectURL(file);
          var pdfData = $sce.trustAsResourceUrl(fileURL);

          var html =
            "<html><head><title>View Batch</title></head><body><iframe id='pdfContent' name='pdfContent' src=" +
            pdfData +
            " style='width:100%;height:100%;'/></body></div></html>";
          ctrl.window.document.write(html);
          var print = ctrl.window.frames['pdfContent'].print();

          ctrl.window.frames['pdfContent'].print = function () {
            ctrl.window.frames['pdfContent'].focus();
            ctrl.window.document.close();
            print();
          };
        }
      };

      ctrl.getBatchPdfFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('Failed to get {0}', [
            'Batch Statement PDF',
          ]),
          localize.getLocalizedString('Server Error')
        );
      };

      $scope.updatePdf = function (row) {
        if (row.DueUponReceipt) {
          row.DueDate = null;
        } else {
          if (row.displayDueDate == null) {
            row.DueDate = new Date().toLocaleDateString();
            row.displayDueDate = moment().toDate();
          } else {
            var date = new Date(row.displayDueDate);
            row.DueDate = date.toLocaleDateString();
          }
        }
        if (
          row.AccountReceivesFinanceCharges === false &&
          row.ApplyFinanceCharge &&
          row.OriginalApplyFinanceCharge === false
        ) {
          // if account is set to not receive finance charges and the user is opting to apply one, show a modal before checking the checkbox
          var title = localize.getLocalizedString('Add Finance Charge?');
          var message = localize.getLocalizedString(
            'This account is not set to receive finance charges.  Do you want to continue?'
          );
          var button1Text = localize.getLocalizedString('Yes');
          var button2Text = localize.getLocalizedString('No');
          modalFactory
            .ConfirmModal(title, message, button1Text, button2Text)
            .then(
              function () {
                if (row.showPdf) {
                  ctrl.GetSinglePdf(row);
                }
              },
              function () {
                row.ApplyFinanceCharge = false;
                if (row.showPdf) {
                  ctrl.GetSinglePdf(row);
                }
              }
            );
        } else if (row.showPdf) {
          ctrl.GetSinglePdf(row);
        }
      };

      $scope.togglePdf = function (row) {
        row.showPdf = !row.showPdf;
        if (row.showPdf) {
          ctrl.GetSinglePdf(row);
        }
      };

      ctrl.GetSinglePdf = function (row) {
        row.pdf = null;
        $scope.showPreviewError = false;
        if (row.DueDate) {
          var date = new Date(row.DueDate);
          row.DueDate = date.toLocaleDateString();
        }
        if ($scope.batchData.BatchStatement.IsProcessed) {
          patientServices.AccountStatementSettings.GetAccountStatementPdf(
            '_soarapi_/accounts/accountstatement/' +
              row.AccountStatementId +
              '/GetAccountStatementPdf'
          ).then(ctrl.getSinglePdfSuccess(row), ctrl.getSinglePdfFailure);
        } else {
          batchStatementService
            .GetSingleStatementPdfFromSettings(row)
            .then(ctrl.getSinglePdfSuccess(row), ctrl.getSinglePdfFailure);
        }
      };

      ctrl.getSinglePdfSuccess = function (row) {
        return function (res) {
          var file = new Blob([res.data], { type: 'application/pdf' });

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(
              file,
              'Account Statement Preview.pdf'
            );
          } else {
            var fileUrl = URL.createObjectURL(file);
            row.pdf = $sce.trustAsResourceUrl(fileUrl);
          }
        };
      };

      ctrl.getSinglePdfFailure = function (error) {
        var dataView = new DataView(error.data);
        var decoder = new TextDecoder('utf8');
        var response = JSON.parse(decoder.decode(dataView));
        var invalidProperties = response.InvalidProperties;
        if (!_.isEmpty(invalidProperties)) {
          if (
            _.some(invalidProperties, function (property) {
              return (
                property.PropertyName === 'AccountId' &&
                property.ValidationMessage ===
                  'The Responsible Person was not found for this account. The Responsible Person may have been changed since the batch was generated.'
              );
            })
          ) {
            $scope.showPreviewError = true;
          }
        } else {
          toastrFactory.error(
            localize.getLocalizedString('Failed to get {0}', [
              'Account Statement PDF',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      };

      $scope.viewReport = function (row) {
        if (row.UserHasAccess) {
          tabLauncher.launchNewTab(
            '#/BusinessCenter/Receivables/Statements/Report/' +
              _.escape(row.BatchStatementId)
          );
        }
      };

      ctrl.getLocations();
      ctrl.getEstatementEnrollmentStatus();

      $scope.navigateToAccount = function (personId) {
        if (personId != 'null') {
          let patientPath = '#/Patient/';
          let fullUrl =
            patientPath +
            _.escape(personId) +
            '/Summary?tab=Transaction%20History&currentPatientId=0';
          tabLauncher.launchNewTab(fullUrl);
        }
        return '';
      };

      ctrl.validate = function () {
        $scope.formIsValid = true;

        if (
          $scope.selectedMainFilterType === 'CUSTOM' &&
          $scope.selectedDisplayAccountsToLetter <
            $scope.selectedDisplayAccountsFromLetter
        ) {
          toastrFactory.error(
            localize.getLocalizedString('Invalid Custom Letter Range'),
            localize.getLocalizedString('Error')
          );
          $scope.formIsValid = false;
        }
        if ($scope.balanceGreaterThan < 0) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Balance Greater Than cannot be negative'
            ),
            localize.getLocalizedString('Error')
          );
          $scope.formIsValid = false;
        }
        if (
          $scope.selectedMainFilterType === 'NOSTATEMENTSIN' &&
          ($scope.numberOfDaysNoStatements < 1 ||
            angular.isUndefined($scope.numberOfDaysNoStatements))
        ) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Number of days must be between 1 and 365'
            ),
            localize.getLocalizedString('Error')
          );
          $scope.formIsValid = false;
        }
      };

      ctrl.validateSavedBatchesSearch = function (isProcessed) {
        $scope.searchDatesValid = true;
        if (isProcessed) {
          if (
            $scope.savedBatchesFromDate === null ||
            $scope.savedBatchesToDate === null
          ) {
            toastrFactory.error(
              localize.getLocalizedString('From Date and To Date are required'),
              localize.getLocalizedString('Error')
            );
            $scope.searchDatesValid = false;
          } else if ($scope.savedBatchesFromDate > $scope.savedBatchesToDate) {
            toastrFactory.error(
              localize.getLocalizedString(
                'From Date cannot be greater than To Date'
              ),
              localize.getLocalizedString('Error')
            );
            $scope.searchDatesValid = false;
          }
        }
      };

      angular.element($window).bind('scroll', function () {
        if (this.pageYOffset > 200) {
          $scope.$apply(function () {
            $scope.hasScrolled = true;
          });
        } else {
          $scope.$apply(function () {
            $scope.hasScrolled = false;
          });
        }
      });

      $scope.backToTop = function () {
        $anchorScroll();
        $scope.hasScrolled = false;
      };

      $scope.alphaSelectionOptions = [
        { Letter: 'A', Value: 'A' },
        { Letter: 'B', Value: 'B' },
        { Letter: 'C', Value: 'C' },
        { Letter: 'D', Value: 'D' },
        { Letter: 'E', Value: 'E' },
        { Letter: 'F', Value: 'F' },
        { Letter: 'G', Value: 'G' },
        { Letter: 'H', Value: 'H' },
        { Letter: 'I', Value: 'I' },
        { Letter: 'J', Value: 'J' },
        { Letter: 'K', Value: 'K' },
        { Letter: 'L', Value: 'L' },
        { Letter: 'M', Value: 'M' },
        { Letter: 'N', Value: 'N' },
        { Letter: 'O', Value: 'O' },
        { Letter: 'P', Value: 'P' },
        { Letter: 'Q', Value: 'Q' },
        { Letter: 'R', Value: 'R' },
        { Letter: 'S', Value: 'S' },
        { Letter: 'T', Value: 'T' },
        { Letter: 'U', Value: 'U' },
        { Letter: 'V', Value: 'V' },
        { Letter: 'W', Value: 'W' },
        { Letter: 'X', Value: 'X' },
        { Letter: 'Y', Value: 'Y' },
        { Letter: 'Z', Value: 'Z' },
      ];

      $scope.numberRange = function (min, max) {
        var result = [];
        for (var i = min; i <= max; i++) {
          result.push(i);
        }
        return result;
      };

      $scope.dateOptions = {
        format: $scope.format || 'MM/dd/yyyy',
        minDate: $scope.minDate || new Date('January 1, 1900'),
        maxDate: $scope.maxDate,
        showWeeks: false,
      };

      $scope.open = function ($event, row) {
        $event.preventDefault();
        $event.stopPropagation();
        $('.uib-datepicker-popup').hide();
        row.opened = !row.opened;
      };

      $scope.closeSavedBatchesGrid = function () {
        $scope.showSavedBatchesGrid = false;
        ctrl.resetTop();
      };

      if (sessionStorage.getItem('statements')) {
        if (sessionStorage.getItem('statements') === 'NotProcessed') {
          $scope.getSavedBatches(false, false);
        } else {
          $scope.getSavedBatches(false, true);
        }
        sessionStorage.removeItem('statements');
      }

      ctrl.resetTop = function () {
        // recalculate the point at which the keeptop directive will fix the header
        // let the digest cycle finish and make it "unfixed" to make sure the header is in the right spot
        // I don't know why you have to wait so long for the digest cycle to finish,
        // but it seems like the header doesn't "show" until after the top calculation is done
        // unless you wait a while to recalculate

        $timeout(function () {
          $('#statements-keep-top-div').removeClass('keepTop');
          $('#statements-keep-top-div').css('top', '');
          $rootScope.$broadcast('reset-top');
        }, 500);
      };

      ctrl.checkIfSingleAccount();

      $scope.editMessage = function (accountStatement) {
        batchStatementService.Service.getAccountStatementMessageById(
          { accountStatementId: accountStatement.AccountStatementId },
          function (result) {
            modalFactory
              .Modal({
                controller: 'StatementEditMessageModalController',
                templateUrl:
                  'App/BusinessCenter/receivables/statements/statement-edit-message-modal/statement-edit-message-modal.html',
                amfa: 'soar-acct-astmt-edit',
                resolve: {
                  accountStatementMessage: function () {
                    return result.Value;
                  },
                },
              })
              .result.then(function (accountStatementMessage) {
                batchStatementService.Service.updateAccountStatementMessageById(
                  {
                    accountStatementId: accountStatement.AccountStatementId,
                    message: accountStatementMessage,
                  },
                  function () {
                    accountStatement.Message = accountStatementMessage;

                    if (accountStatement.showPdf) {
                      ctrl.GetSinglePdf(accountStatement);
                    }
                  },
                  function () {
                    toastrFactory.error(
                      localize.getLocalizedString(
                        'Failed to update account statement message'
                      ),
                      localize.getLocalizedString('Error')
                    );
                  }
                );
              });
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve account statement message'
              ),
              localize.getLocalizedString('Error')
            );
          }
        );
      };
    },
  ])

  .filter('statementProgressStatus', [
    'localize',
    function (localize) {
      return function (status) {
        switch (status) {
          case 1:
            return localize.getLocalizedString('Not Processed');
          case 2:
            return localize.getLocalizedString('In Progress');
          case 3:
            return localize.getLocalizedString('Complete');
          case 4:
            return localize.getLocalizedString('Failed');
          case 5:
            return localize.getLocalizedString('Partial Failure');
        }
      };
    },
  ])
  .filter('isAvailableforProcessing', function () {
    return function (batch) {
      if (!batch || !batch.Rows) {
        return true;
      }
      return !_.find(batch.Rows, function (row) {
        return row.IsSelectedOnBatch && row.ValidationMessages.length;
      });
    };
  })

  .filter('hasNoSelectedStatements', function () {
    return function (batch) {
      if (!batch || !batch.Rows) {
        return true;
      }
      return !_.find(batch.Rows, function (row) {
        return row.IsSelectedOnBatch;
      });
    };
  });
