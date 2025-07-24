'use strict';
var app = angular.module('Soar.Patient');
app.controller('TransactionHistoryMigrationController', [
  '$scope',
  '$rootScope',
  '$filter',
  '$routeParams',
  '$timeout',
  '$q',
  'localize',
  'ModalFactory',
  'referenceDataService',
  'AccountSummaryFactory',
  'AccountServiceTransactionFactory',
  'PatientInvoiceFactory',
  'PatientDocumentsFactory',
  'toastrFactory',
  'PatientServices',
  'ClaimsService',
  'ModalDataFactory',
  'TimeZoneFactory',
  '$window',
  'patSecurityService',
  'NewPaymentTypesService',
  '$location',
  'AccountDebitTransactionFactory',
  'tabLauncher',
  'AccountCreditTransactionFactory',
  'PatientAccountFilterBarFactory',
  'TransactionHistoryExportService',
  'userSettingsDataService',
  'CloseClaimOptionsService',
  'SoarTransactionHistoryHttpService',
  TransactionHistoryMigrationController,
]);
function TransactionHistoryMigrationController(
  $scope,
  $rootScope,
  $filter,
  $routeParams,
  $timeout,
  $q,
  localize,
  modalFactory,
  referenceDataService,
  accountSummaryFactory,
  accountServiceTransactionFactory,
  patientInvoiceFactory,
  patientDocumentsFactory,
  toastrFactory,
  patientServices,
  claimsService,
  modalDataFactory,
  timeZoneFactory,
  $window,
  patSecurityService,
  paymentTypesService,
  $location,
  accountDebitTransactionFactory,
  tabLauncher,
  accountCreditTransactionFactory,
  patientAccountFilterBarFactory,
  transactionHistoryExportService,
  userSettingsDataService,
  closeClaimOptionsService,
  transactionHistoryService
) {
  BaseCtrl.call(this, $scope, 'TransactionHistoryMigrationController');
  var ctrl = this;
  ctrl.patientPath = '#/Patient/';
  $scope.showInvoiceButtons = true;
  $scope.doRefresh = false;
  $scope.currentPatientId = $routeParams.patientId;

  ctrl.locations = undefined;
  /**
   * Get locations resources.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getLocations = () => {
    if (ctrl.locations) {
      return $q.resolve(ctrl.locations);
    }
    return referenceDataService
      .getData(referenceDataService.entityNames.locations)
      .then(function (locations) {
        ctrl.locations = locations;
        return ctrl.locations;
      });
  };

  ctrl.providers = undefined;

  /**
   * Get providers resources.
   *
   * @returns {angular.IPromise<any>}
   */
  ctrl.getProviders = () => {
    if (ctrl.providers) {
      return $q.resolve(ctrl.providers);
    }
    return referenceDataService
      .getData(referenceDataService.entityNames.users)
      .then(function (providers) {
        ctrl.providers = providers;
        return ctrl.providers;
      });
  };

  var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));

  ctrl.location = undefined;

  /**
   * Get user's location.
   *
   * @returns {angular.IPromise<any>}
   */
  ctrl.getUserLocation = () => {
    if (ctrl.location) {
      return $q.resolve(ctrl.location);
    }
    return ctrl.getLocations().then(function (locations) {
      ctrl.location =
        cachedLocation != null
          ? _.find(locations, { LocationId: cachedLocation.id })
          : locations[0];
      return ctrl.location;
    });
  };

  ctrl.allRows = [];
  $scope.patientDet = '';

  $scope.showFilterApplyButton = true;
  $scope.isCreateCustomInvoice = false;
  $scope.showCreateClaimView = false;
  $scope.alreadyApplyingAdjustment = false;
  $scope.sortingApplied = false;
  $scope.keepCreateClaimViewOpen = false;
  $scope.fixedHeader = false;
  $scope.removeShowMoreButton = true;
  ctrl.lazyLoadingActive = false;
  ctrl.currentPage = 1;
  ctrl.paymentTypeCategories = { Account: 1, Insurance: 2 };
  const pageYOffset = 580;
  $scope.sortObject = {
    Date: 2,
  };
  $scope.currentDisplay = '';
  $scope.selectedCount = 0;
  $scope.resetPaging = true;
  $scope.pagingInProgress = false;
  $scope.rows = [];
  ctrl.originalFilters = [];

  //ctrl.filterObject is what we send to the domain.
  ctrl.filterObject = {
    FromDate: null,
    ToDate: null,
    PersonIds: null,
    TransactionTypes: null,
    LocationIds: null,
    ProviderIds: null,
    // Active: 1, Edited: 2, Deleted: 3, Void: 4
    Statuses: null,
    Teeth: null,
  };
  ctrl.unassignedTransactionsList = [];

  //#region Authorization variables
  $scope.soarAuthCdtAdjEditKey = 'soar-acct-cdtadj-edit';
  $scope.soarAuthActPmtEditKey = 'soar-acct-aapmt-edit';
  $scope.soarAuthCdtAdjViewKey = 'soar-acct-cdtadj-view';
  $scope.soarAuthActPmtViewKey = 'soar-acct-aapmt-view';

  //credit tx amfas
  $scope.soarAuthCdtAdjDeleteKey = 'soar-acct-cdtadj-delete';
  $scope.soarAuthActPmtDeleteKey = 'soar-acct-aapmt-delete';
  //#endregion

  ctrl.allPatientPlans = [];
  $scope.plansTrimmed = [];

  ctrl.notifyNotAuthorized = function (authMessageKey) {
    toastrFactory.error(
      patSecurityService.generateMessage(authMessageKey),
      'Not Authorized'
    );
    $location.path(_.escape('/'));
  };

  //balance-detail-row data and methods
  $scope.loadingBalanceDetailRow = true;
  ctrl.getUserLocation().then(function (location) {
    $scope.dataForBalanceDetailRow = {
      allProviders: [],
      currentPatient: {
        AccountId: $scope.patient.Data.PersonAccount.AccountId,
        AccountMemberId:
          $scope.patient.Data.PersonAccount.PersonAccountMember.AccountMemberId,
      },
      Location: location,
      paymentTypes: [],
    };

    $scope.loadingBalanceDetailRow = false;
  });

  $scope.refreshSummaryPageDataForGrid = function (forceApply) {
    $scope.doRefresh = true;
    if (forceApply == true) {
      $scope.$apply();
    }
  };

  /**
   * Called from header data after update.
   *
   * @returns {angular.IPromise}
   */
  $scope.refreshTransactionHistoryPageData = function () {
    if ($scope.resetPaging) {
      ctrl.currentPage = 1;
      $scope.doRefresh = true;
    }
    if ($scope.showCreateClaimView && !$scope.keepCreateClaimViewOpen) {
      $scope.closeCreateClaimView(true);
    }
    return ctrl.getHistory();
  };

  // Get payemnt types
  ctrl.getPaymentTypes = function () {
    paymentTypesService.getAllPaymentTypesMinimal({}).then(
      function (res) {
        ctrl.paymentTypesGetSuccess(res);
      },
      function () {
        ctrl.paymentTypesGetFailure();
      }
    );
  };

  ctrl.paymentTypesGetSuccess = function (successResponse) {
    ctrl.allAccountPaymentTypes = [];
    ctrl.activeAccountPaymentTypes = [];
    ctrl.insurancePaymentTypes = [];
    _.forEach(successResponse.Value, function (payType) {
      if (
        _.isEqual(
          payType.PaymentTypeCategory,
          ctrl.paymentTypeCategories.Account
        )
      ) {
        ctrl.allAccountPaymentTypes.push(payType);
        if (payType.IsActive) {
          ctrl.activeAccountPaymentTypes.push(payType);
        }
      } else if (
        _.isEqual(
          payType.PaymentTypeCategory,
          ctrl.paymentTypeCategories.Insurance
        )
      ) {
        ctrl.insurancePaymentTypes.push(payType);
      }
    });
  };

  ctrl.paymentTypesGetFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['Payment Types']
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  $scope.$on('apply-account-filters', function (param, updatedFilterObject) {
    if (
      !_.isUndefined(updatedFilterObject) &&
      !_.isEqual(updatedFilterObject, $scope.filterObject)
    ) {
      $scope.filterObject = updatedFilterObject;
    }
    $scope.refreshSummaryPageDataForGrid();
  });

  //Update ctrl.filter with $scope.filterObject properties before sending
  ctrl.prepFilter = function () {
    //date selector uses browser time zone, convert back to just date (00:00:00 time) before sending to back end
    //handles case where user is in a timezone which converts to a different utc day than the one they selected
    ctrl.filterObject.FromDate = $scope.filterObject.dateRange.start
      ? $scope.filterObject.dateRange.start.toDateString()
      : null;
    ctrl.filterObject.ToDate = $scope.filterObject.dateRange.end
      ? $scope.filterObject.dateRange.end.toDateString()
      : null;
    ctrl.filterObject.TransactionTypes = $scope.filterObject.transactionTypes;
    ctrl.filterObject.LocationIds = $scope.filterObject.locations;
    ctrl.filterObject.ProviderIds = $scope.filterObject.providers;
    ctrl.filterObject.IncludePaidTransactions =
      $scope.filterObject.IncludePaidTransactions;
    ctrl.filterObject.IncludeUnpaidTransactions =
      $scope.filterObject.IncludeUnpaidTransactions;
    ctrl.filterObject.IncludeUnappliedTransactions =
      $scope.filterObject.IncludeUnappliedTransactions;
    ctrl.filterObject.IncludeAppliedTransactions =
      $scope.filterObject.IncludeAppliedTransactions;
    ctrl.filterObject.IncludeServicesWithOpenClaims =
      $scope.filterObject.IncludeServicesWithOpenClaims;
    ctrl.filterObject.IncludeAccountNotes =
      $scope.filterObject.IncludeAccountNotes;
    ctrl.filterObject.IncludeDocuments = $scope.filterObject.IncludeDocuments;
    ctrl.filterObject.Statuses = $scope.filterObject.Statuses;
    ctrl.filterObject.Teeth =
      $scope.filterObject.Teeth.length > 0 ? $scope.filterObject.Teeth : null;
    if (_.isEqual($scope.filterObject.members, '0')) {
      ctrl.filterObject.PersonIds = null;
      $scope.selectedAccountMembers = _.map(
        $scope.accountMembersOptionsTemp,
        'accountMemberId'
      );
    } else {
      ctrl.filterObject.PersonIds = $scope.filterObject.members;
      var filteredMembers = [];
      _.each($scope.filterObject.members, function (mem) {
        filteredMembers.push(
          _.find($scope.accountMembersOptionsTemp, { personId: mem })
        );
      });
      $scope.selectedAccountMembers = _.map(filteredMembers, 'accountMemberId');
    }
    ctrl.populatePatientPlans();
  };

  /**
   * Get history.
   *
   * @returns {angular.IPromise}
   */
  // TODO: Determine if already have account history for selected patient. Currently getting all acount history on init.
  ctrl.getHistory = function () {
    $scope.patientDet = $scope.patient.Data.PersonAccount;
    ctrl.prepFilter();
    var filterObject = {
      FilterCriteria: ctrl.filterObject,
      SortCriteria: $scope.sortObject,
      PageCount: 50,
      CurrentPage: ctrl.currentPage,
      uiSuppressModal: !$scope.resetPaging,
    };

    return accountSummaryFactory
      .getTransactionHistory(
        $scope.patient.Data.PersonAccount.AccountId,
        filterObject
      )
      .then(function (rows) {
        // Remove the show more button and switch to lazy loading after initial click
        $scope.removeShowMoreButton =
          rows.length < 50 || ctrl.currentPage > 1 ? true : false;

        // Activate lazy loading when the show more button has been clicked
        ctrl.lazyLoadingActive =
          ctrl.currentPage > 1 &&
          _.isEqual(rows.length, 50) &&
          !_.isEmpty(rows);
        ctrl.allRows = _.isEqual(ctrl.currentPage, 1)
          ? rows
          : ctrl.allRows.concat(rows);
        ctrl.getPaymentTypes();

        //recalculate header numbers in case page loads with individual member selected
        $rootScope.$broadcast('recomputeBalance', true);

        // Reset paging for any action other than lazy load or show more
        $scope.resetPaging = true;
        $scope.pagingInProgress = false;

        // Set the rows array for the grid display
        $scope.rows = ctrl.allRows;
      });
  };

  /**
   * Force display of full history for print and export
   * @param {*} printOrExportFunction
   * @returns {angular.IPromise}
   */
  ctrl.getAllHistoryForPrintOrExport = function (printOrExportFunction) {
    ctrl.prepFilter();
    return accountSummaryFactory
      .getTransactionHistory($scope.patient.Data.PersonAccount.AccountId, {
        FilterCriteria: ctrl.filterObject,
        SortCriteria: $scope.sortObject,
        PageCount: 0,
        CurrentPage: 0,
      })
      .then(function (rows) {
        $scope.removeShowMoreButton = true;
        ctrl.lazyLoadingActive = false;
        $scope.rows = rows;
        printOrExportFunction();
      });
  };

  /**
   * Get plans.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getPlans = function () {
    return patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId(
      {
        accountId: $scope.patient.Data.PersonAccount.AccountId,
        includeDeleted: true,
      }
    ).$promise.then(function (res) {
      ctrl.allPatientPlans = res.Value;
      ctrl.populatePatientPlans();
    });
  };

  //Utility functions
  $scope.showEditAndDeleteCondition = function (row) {
    return (
      row.TransactionTypeId === 1 ||
      row.TransactionTypeId === 2 ||
      row.TransactionTypeId === 3 ||
      row.TransactionTypeId === 4 ||
      row.TransactionTypeId === 5 ||
      row.TransactionTypeId === 6 ||
      row.ObjectType === 'Document'
    );
  };

  $scope.disableEditForMenu = function (row) {
    if (row.InProcess) {
      return 1;
    } else if (row.IsAuthorized) {
      if (row.TransactionTypeId === 5) {
        return 3;
      }
      return 2;
    } else if (row.IsDeposited) {
      return 4;
    } else {
      return 0;
    }
  };

  $scope.selectedCountChange = function (event) {
    $scope.selectedCount = 0;
    for (var i = 0; i < $scope.rows.length; i++) {
      if ($scope.rows[i].ServiceManuallySelected || $scope.rows[i].selected) {
        $scope.selectedCount = $scope.selectedCount + 1;
      }
    }
    $scope.$apply();
  };

  //invoice
  $scope.showCreateCustomInvoice = function () {
    $scope.isCreateCustomInvoice = true;
    $scope.currentDisplay = 'Custom Invoice';
    $scope.isSelectionView = true; // grid alignment for checkboxes
    patientAccountFilterBarFactory.setFilterBarStatus(true);
    ctrl.filterGrid();
  };

  $scope.cancelCreateCustomInvoice = function () {
    _.each($scope.rows, function (row) {
      row.selected = false;
    });
    $scope.selectedCount = 0;
    $scope.currentDisplay = '';
    $scope.isCreateCustomInvoice = false;
    $scope.isSelectionView = false; // grid alignment for checkboxes
    $scope.allSelected = false;
    patientAccountFilterBarFactory.setFilterBarStatus(false);
    ctrl.filterGrid();
  };

  /**
   * Create custom invoice.
   *
   * @returns {angular.IPromise}
   */
  $scope.createCustomInvoice = function () {
    var invoiceDetails = [];
    var encounterIds = [];
    var patientNames = [];

    return ctrl.getUserLocation().then(function (location) {
      _.each(_.filter($scope.rows, { selected: true }), function (row) {
        let invoiceDetail = {
          Date: row.Date,
          PatientName: row.PatientName,
          Description: ctrl.getInvoiceDescription(row),
          Fee: row.TransactionTypeId === 1 ? row.Fee : row.Amount,
          DetailType: row.Type,
          Tax: row.Tax == null ? 0 : row.Tax,
          Discount: row.Discount == null ? 0 : row.Discount,
          EstimatedInsurancesTotal:
            row.TotalEstInsurance == null ? 0 : row.TotalEstInsurance,
        };
        if (row.TransactionTypeId === 1)
          invoiceDetail.EncounterId = row.EncounterId;

        invoiceDetails.push(invoiceDetail);

        if (!_.find(patientNames, { Name: row.PatientName })) {
          patientNames.push({ Name: row.PatientName });
        }
        if (row.EncounterId) {
          encounterIds.push(row.EncounterId);
        }
        if (row.TransactionTypeId === 1) {
          //Insurance Payments associated with service?
          if (row.TotalEstInsurance > 0) {
            var associatedInsurancePayments = _.filter(
              ctrl.allRows,
              function (allRow) {
                return (
                  !allRow.IsDeleted &&
                  allRow.TransactionTypeId === 3 &&
                  _.includes(
                    allRow.AssociatedServiceTransactionIds,
                    row.ObjectId
                  )
                );
              }
            );
            _.each(associatedInsurancePayments, function (insPayment) {
              invoiceDetails.push({
                Date: insPayment.Date,
                PatientName: insPayment.PatientName,
                Description: insPayment.Description,
                Fee: insPayment.Amount,
                DetailType: 'ApplyInsurancePayment',
                EncounterId: insPayment.EncounterId,
              });
            });
          }
          //Remaining AdjustedEstimate?
          if (row.TotalAdjEstimate) {
            invoiceDetails.push({
              Date: row.Date,
              PatientName: row.PatientName,
              Description: row.Description,
              Fee: row.TotalAdjEstimate - row.TotalAdjPaidAmount,
              DetailType: 'ApplyInsurancePayment',
              EncounterId: row.EncounterId,
            });
          }
        }
      });

      var dataForModal = {
        PatientDetails: patientNames,
        IsCustomInvoice: true,
        InvoiceOptions: {
          EncounterIds: encounterIds,
          IncludeEstimatedInsurance: true,
          IncludeFutureAppointments: true,
          IncludePreviousBalance: false,
          InvoiceDetails: invoiceDetails,
          IsCustomInvoice: true,
          LocationId: location.LocationId,
          Note: '',
          PatientId:
            $scope.patient.Data.PatientId == null
              ? $routeParams.patientId
              : $scope.patient.Data.PatientId,
        },
      };

      patientInvoiceFactory.ConfirmInvoiceOptions(
        dataForModal,
        $scope.patient.Data.PersonAccount.AccountId,
        true,
        true,
        $scope.cancelCreateCustomInvoice
      );
    });
  };

  ctrl.getInvoiceDescription = function (row) {
    switch (row.TransactionTypeId) {
      case 1:
        return (
          row.Description +
          (_.isNil(row.Tooth) || row.Tooth == '' ? '' : ', Th ' + row.Tooth) +
          (_.isNil(row.Area) || row.Area == '' ? '' : ', ' + row.Area)
        );
      case 2:
        return 'Account Payment - ' + row.Description;
      case 3:
        return 'Insurance Payment - ' + row.Description;
      case 4:
        return 'Negative Adjustment - ' + row.Description;
      case 5:
        return 'Positive Adjustment - ' + row.Description;
      case 6:
        return 'Finance Charge - ' + row.Description;
      default:
        return row.Description;
    }
  };

  $scope.viewInvoice = function (encounter) {
    var patientName =
      $scope.accountMembersOptionsTemp &&
      $scope.accountMembersOptionsTemp.length > 1
        ? encounter.PatientName + ' ' + localize.getLocalizedString('Account')
        : encounter.PatientName;
    patientInvoiceFactory
      .ViewEncounterInvoice(
        encounter.EncounterId,
        patientName,
        $scope.patient.Data.PersonAccount.AccountId
      )
      .then(function (res) {
        if (res.NoInvoceEncounter) {
          var message = localize.getLocalizedString(
            'Original Invoice is unavailable. Please use Current Invoice.'
          );
          var title = localize.getLocalizedString('Attention');
          var button1Text = localize.getLocalizedString('Cancel');
          var clickHereText = localize.getLocalizedString('Click Here');
          modalFactory
            .ConfirmModalWithLink(
              title,
              _.escape('<a>' + message + ' (' + clickHereText + ')</a>'),
              button1Text
            )
            .then(function () {
              var patientId =
                $scope.patient.Data.PatientId == null
                  ? $routeParams.patientId
                  : $scope.patient.Data.PatientId;
              var InvoiceOptions = {
                EncounterIds: [],
                IsCustomInvoice: true,
                IncludeFutureAppointments: true,
                IncludePreviousBalance: false,
                IncludeEstimatedInsurance: true,
                Note: '',
                InvoiceDetails: [],
              };
              patientInvoiceFactory.CreateCurrentInvoice(
                InvoiceOptions,
                encounter,
                patientName,
                patientId
              );
            });
        }
      });
  };

  // #region Create Claim

  // Set Selected Plans
  ctrl.populatePatientPlans = function () {
    var plans = [];
    _.each(ctrl.allPatientPlans, function (plan) {
      if (
        !plan.PatientBenefitPlanDto.IsDeleted &&
        ($scope.filterObject.members == '0' ||
          _.includes(
            $scope.filterObject.members,
            plan.PatientBenefitPlanDto.PatientId
          ))
      ) {
        plans.push({
          PatientBenefitPlanId: plan.PatientBenefitPlanDto.PatientBenefitPlanId,
          Name:
            plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
              .Name +
            ' (' +
            ctrl.getPriorityName(plan.PatientBenefitPlanDto.Priority) +
            ')',
          Priority: plan.PatientBenefitPlanDto.Priority,
        });
      }
    });
    $scope.plansTrimmed = _.orderBy(plans, 'Priority');
    ctrl.setSelectedPlan();
  };

  ctrl.setSelectedPlan = function () {
    //select first in list if it is the only one. Wait for soar-select-list to populate before selecting to avoid kendo problems
    $timeout(function () {
      if ($scope.plansTrimmed && $scope.plansTrimmed.length === 1) {
        $scope.selectedPlanId = $scope.plansTrimmed[0].PatientBenefitPlanId;
      } else {
        $scope.selectedPlanId = '';
      }
    });
  };

  // Claim Buttons
  $scope.openCreateClaimView = function () {
    $scope.showCreateClaimView = true;
    $scope.isSelectionView = true;
    patientAccountFilterBarFactory.setFilterBarStatus(true);
    $scope.currentDisplay = 'Create Claim';
    $scope.showInvoiceButtons = false;
    ctrl.filterGrid();
  };

  $scope.closeCreateClaimView = function (skipFiltering) {
    $scope.showCreateClaimView = false;
    $scope.isSelectionView = false; // grid alignment for checkboxes
    $scope.currentDisplay = '';
    $scope.showInvoiceButtons = true;
    _.each($scope.rows, function (row) {
      row.ServiceManuallySelected = false;
    });
    $scope.selectedCount = 0;
    if (!skipFiltering) {
      ctrl.filterGrid();
    }

    // Reset sorting
    $scope.keepCreateClaimViewOpen = false;
    patientAccountFilterBarFactory.setFilterBarStatus(false);
    $scope.resetSorting();
    ctrl.setSelectedPlan();
  };

  $scope.completeCreateClaim = function () {
    var selectedServices = _.filter($scope.rows, {
      ServiceManuallySelected: true,
    });

    if (selectedServices.length > 0 && $scope.selectedPlanId !== null) {
      var serviceTransactionIds = _.map(selectedServices, 'ObjectId');
      patientServices.ServiceTransactions.getServiceTransactionsByIds(
        serviceTransactionIds,
        ctrl.getServicesSuccess,
        ctrl.getServicesFailure
      );
    }
  };

  ctrl.getServicesSuccess = function (res) {
    var serviceTransactions = res.Value;
    var selectedPlan = ctrl.allPatientPlans.find(
      x =>
        x.PatientBenefitPlanDto.PatientBenefitPlanId === $scope.selectedPlanId
    );
    if (selectedPlan) {
      ctrl
        .calculateEstimatatedInsuranceOption(
          selectedPlan.PatientBenefitPlanDto,
          serviceTransactions
        )
        .then(function (res) {
          var estimateInsuranceOption = res;
          var params = {
            patientBenefitPlanId: $scope.selectedPlanId,
            calculateEstimatatedInsurance: estimateInsuranceOption,
            applyPredAuthNumber: false,
          };
          patientServices.Claim.CreateClaimFromServiceTransactions(
            params,
            serviceTransactions,
            ctrl.completeCreateClaimSuccess,
            ctrl.completeCreateClaimFailure
          );
        });
    }
  };

  ctrl.getServicesFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('failed to get {0}.', ['Services']),
      localize.getLocalizedString('Server Error')
    );
  };

  // Claim Creation

  ctrl.completeCreateClaimSuccess = function (res) {
    toastrFactory.success(
      localize.getLocalizedString('{0} created successfully.', ['Claim']),
      'Success'
    );
    $scope.selectedCount = 0;

    claimsService
      .getClaimById({ claimId: res.Value[0].ClaimId })
      .$promise.then(function (res) {
        ctrl.checkForAdjustment(res.Value);
      });
  };

  ctrl.checkForAdjustment = function (claim) {
    var sum = _.sumBy(
      claim.ServiceTransactionToClaimPaymentDtos,
      'AdjustedEstimate'
    );
    var plan = _.find(ctrl.allPatientPlans, function (plan) {
      return (
        plan.PatientBenefitPlanDto.PatientBenefitPlanId ===
        $scope.selectedPlanId
      );
    });
    var adjust = plan
      ? plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
          .ApplyAdjustments === 1
      : false;
    var adjustAt = plan
      ? plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
          .FeesIns === 2
      : false;
    if (
      plan.PatientBenefitPlanDto.Priority === 1 &&
      sum > 0 &&
      adjust &&
      adjustAt
    ) {
      ctrl.openAdjustmentPrompt(claim, plan);
    } else {
      $scope.refreshSummaryPageDataForGrid();
    }
  };

  ctrl.completeCreateClaimFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to be created.', ['Claim']),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.openAdjustmentPrompt = function (claim, plan) {
    var title = localize.getLocalizedString('Fee Schedule Present');
    var message = localize.getLocalizedString(
      "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?"
    );
    var button1Text = localize.getLocalizedString('Yes');
    var button2Text = localize.getLocalizedString('No');
    modalFactory
      .ConfirmModal(title, message, button1Text, button2Text)
      .then(
        ctrl.openAdjustmentModal(claim, plan),
        $scope.refreshSummaryPageDataForGrid
      );
  };

  ctrl.openAdjustmentModal = function (claim, plan) {
    return function () {
      return ctrl.getProviders().then(function (providers) {
        var ids = _.map(
          claim.ServiceTransactionToClaimPaymentDtos,
          function (item) {
            return item.ServiceTransactionId;
          }
        );
        var sum = _.sumBy(
          claim.ServiceTransactionToClaimPaymentDtos,
          'AdjustedEstimate'
        );
        ctrl.dataForModal = {
          PatientAccountDetails: {
            AccountId: $scope.patient.Data.PersonAccount.AccountId,
          },
          DefaultSelectedIndex: 1,
          AllProviders: providers,
          BenefitPlanId: plan.PatientBenefitPlanDto.BenefitPlanId,
          claimAmount: 0,
          isFeeScheduleAdjustment: true,
          claimId: claim.ClaimId,
          serviceTransactionData: {
            serviceTransactions: ids,
            isForCloseClaim: true,
            unPaidAmout: sum,
          },
          patientData: {
            patientId: claim.PatientId,
            patientName: claim.PatientName,
          },
        };
        modalDataFactory
          .GetTransactionModalData(ctrl.dataForModal, claim.PatientId)
          .then(function (result) {
            modalFactory.TransactionModal(
              result,
              $scope.refreshSummaryPageDataForGrid,
              $scope.refreshSummaryPageDataForGrid
            );
          });
      });
    };
  };

  ctrl.getPriorityName = function (priority) {
    var priorityName = '';

    switch (priority) {
      case 0:
        priorityName = localize.getLocalizedString('Primary');
        break;
      case 1:
        priorityName = localize.getLocalizedString('Secondary');
        break;
      case 2:
        priorityName = localize.getLocalizedString('3rd');
        break;
      case 3:
        priorityName = localize.getLocalizedString('4th');
        break;
      case 4:
        priorityName = localize.getLocalizedString('5th');
        break;
      case 5:
        priorityName = localize.getLocalizedString('6th');
        break;
      default:
        priorityName = localize.getLocalizedString('unknown');
        break;
    }

    return priorityName;
  };

  // #endregion Create claim

  $scope.viewCarrierResponse = function (row) {
    if (
      !_.isUndefined(row) &&
      !_.isNull(row.PersonId) &&
      !_.isEmpty(row.Claims)
    ) {
      var path =
        'BusinessCenter/Insurance/Claims/CarrierResponse/' +
        row.Claims[0].ClaimId +
        '/Patient/' +
        row.PersonId;
      $location.path(_.escape(path));
    }
  };

  // #region filtering

  ctrl.filterGrid = function () {
    if ($scope.showCreateClaimView) {
      ctrl.originalFilters = _.clone($scope.filterObject);
      $scope.filterObject.transactionTypes = [1];
      $scope.filterObject.Statuses = [1];
      $scope.filterObject.IncludeServicesWithOpenClaims = false;
      $scope.filterObject.IncludeAccountNotes = false;
      $scope.filterObject.IncludeDocuments = false;
      $scope.filterObject.IncludeUnpaidTransactions = true;
      $scope.filterObject.IncludePaidTransactions = true;
      $scope.keepCreateClaimViewOpen = true;
    } else if ($scope.isCreateCustomInvoice) {
      ctrl.originalFilters = _.clone($scope.filterObject);
      $scope.filterObject.transactionTypes = [1, 2, 3, 4, 5, 6];
      $scope.filterObject.Statuses = [1];
      $scope.filterObject.IncludeServicesWithOpenClaims = true;
      $scope.filterObject.IncludeAccountNotes = false;
      $scope.filterObject.IncludeDocuments = false;
      $scope.filterObject.IncludeUnpaidTransactions = true;
      $scope.filterObject.IncludeAppliedTransactions = true;
      $scope.filterObject.IncludePaidTransactions = true;
      $scope.filterObject.IncludeUnappliedTransactions = true;
    } else {
      $scope.filterObject = ctrl.originalFilters;
    }

    $scope.refreshSummaryPageDataForGrid();
  };

  // #endregion filtering

  /**
   * Init.
   *
   * @returns {angular.IPromise}
   */
  ctrl.init = function () {
    if ($scope.patient.Data) {
      document.title =
        $scope.patient.Data.PatientCode +
        ' - ' +
        localize.getLocalizedString('Transaction History');
    }
    return ctrl.getPlans().then(function () {
      return ctrl.getHistory();
    });
  };
  ctrl.init();

  $scope.$on('close-doc-uploader', function () {
    $scope.refreshTransactionHistoryPageData();
  });

  $scope.editRowItem = function (itemToBeEdited) {
    if (itemToBeEdited.ObjectType === 'Document') {
      ctrl.openDocumentForEdit(itemToBeEdited);
    } else if (itemToBeEdited.TransactionTypeId === 1) {
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        itemToBeEdited.EncounterId,
        itemToBeEdited.ObjectId,
        itemToBeEdited.LocationId,
        itemToBeEdited.PersonId,
        true,
        $scope.refreshTransactionHistoryPageData,
        itemToBeEdited.Claims
      );
    } else if (itemToBeEdited.TransactionTypeId === 3) {
      patientServices.CreditTransactions.getTransactionHistoryPaymentInformation(
        {
          creditTransactionId: itemToBeEdited.ObjectId,
          getAdditionalBulkPaymentInfo: true,
        }
      ).$promise.then(function (res) {
        if (!_.isNil(res) && !_.isNil(res.Value)) {
          //Set display properties
          itemToBeEdited.BulkCreditTransactionId =
            res.Value.BulkCreditTransactionId;
          itemToBeEdited.$$bulkCreditTransactionAllLocationAccess =
            res.Value.BulkCreditTransactionAllLocationAccess;
          itemToBeEdited.$$bulkCreditTransactionCount =
            res.Value.BulkCreditTransactionCount;

          // Check for multi-claim payments/authorization
          if (
            !_.isNil(itemToBeEdited.$$bulkCreditTransactionCount) &&
            !_.isNil(itemToBeEdited.$$bulkCreditTransactionAllLocationAccess) &&
            itemToBeEdited.$$bulkCreditTransactionAllLocationAccess &&
            itemToBeEdited.$$bulkCreditTransactionCount > 1
          ) {
            ctrl.bulkInsuranceEditModal(itemToBeEdited);
          } else if (
            !_.isNil(itemToBeEdited.$$bulkCreditTransactionAllLocationAccess) &&
            itemToBeEdited.$$bulkCreditTransactionAllLocationAccess === false
          ) {
            modalFactory.ConfirmModal(
              localize.getLocalizedString('Access Denied'),
              localize.getLocalizedString(
                'You do not have access to all locations on this multiple claim insurance payment'
              ),
              localize.getLocalizedString('Ok'),
              null
            );
          } else {
            ctrl.editInsurancePayment(itemToBeEdited);
          }
        }
      });
    } else if (
      _.isEqual(itemToBeEdited.TransactionTypeId, 2) ||
      _.isEqual(itemToBeEdited.TransactionTypeId, 4)
    ) {
      ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(itemToBeEdited, true);
    } else if (itemToBeEdited.TransactionTypeId === 5) {
      accountDebitTransactionFactory.viewOrEditDebit(
        itemToBeEdited.ObjectId,
        itemToBeEdited.PersonId,
        true,
        $scope.refreshTransactionHistoryPageData
      );
    }
  };

  $scope.viewRowItem = function (itemToView) {
    switch (itemToView.TransactionTypeId) {
      case 1:
        accountServiceTransactionFactory.viewOrEditServiceTransaction(
          itemToView.EncounterId,
          itemToView.ObjectId,
          itemToView.LocationId,
          itemToView.PersonId,
          false,
          $scope.refreshTransactionHistoryPageData
        );
        break;
      case 2:
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(itemToView, false);
        break;
      case 3:
        itemToView.$$route = 'TransactionHx';
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(itemToView, false);
        break;
      case 4:
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(itemToView, false);
        break;
      case 5:
      case 6:
        accountDebitTransactionFactory.viewOrEditDebit(
          itemToView.ObjectId,
          itemToView.PersonId,
          false,
          $scope.refreshTransactionHistoryPageData
        );
    }
  };

  $scope.$on('soar:document-properties-edited', function () {
    $scope.docCtrls.close();
    $scope.refreshSummaryPageDataForGrid();
  });

  ctrl.openDocumentForEdit = function (documentToBeEdited) {
    var docAccess = patientDocumentsFactory.GetDocumentAccess();
    if (docAccess.hasDocumentsEditAccess) {
      $scope.docCtrls.content(
        '<document-properties document-id="' +
          _.escape(documentToBeEdited.ObjectIdLong) +
          '" formatted-patient-name="' +
          _.escape(documentToBeEdited.PatientName) +
          '"></document-properties>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '10%',
          left: '35%',
        },
        minWidth: 400,
        scrollable: false,
        iframe: false,
        actions: [],
        title: localize.getLocalizedString('View Document Properties'),
        modal: true,
      });
      $scope.docCtrls.open();
    }
  };

  $scope.displayDocument = function (rowItem) {
    rowItem.Name = rowItem.Description;
    patientDocumentsFactory.DisplayDocument(rowItem);
  };

  $scope.deleteRowItem = function (itemToBeDeleted) {
    if (!ctrl.deletingRowItem) {
      ctrl.deletingRowItem = true;
      if (_.isEqual(itemToBeDeleted.ObjectType, 'Document')) {
        ctrl.deleteDocument(itemToBeDeleted);
      } else if (_.isEqual(itemToBeDeleted.TransactionTypeId, 3)) {
        ctrl.deleteInsurancePayment(itemToBeDeleted);
      } else if (_.isEqual(itemToBeDeleted.ObjectType, 'ServiceTransaction')) {
        accountServiceTransactionFactory.deleteServiceTransaction(
          itemToBeDeleted.ObjectId,
          itemToBeDeleted.LocationId,
          itemToBeDeleted.PersonId,
          $scope.refreshTransactionHistoryPageData
        );
      } else if (_.isEqual(itemToBeDeleted.ObjectType, 'DebitTransaction')) {
        accountDebitTransactionFactory.deleteDebit(
          itemToBeDeleted.ObjectId,
          itemToBeDeleted.TransactionTypeId,
          $scope.refreshTransactionHistoryPageData
        );
      } else if (
        _.isEqual(itemToBeDeleted.TransactionTypeId, 2) ||
        _.isEqual(itemToBeDeleted.TransactionTypeId, 4)
      ) {
        // Delete account payment or negative adjustment
        $scope.deleteAcctPaymentOrNegAdjustmentModal(itemToBeDeleted);
      }
      ctrl.deletingRowItem = false;
    }
  };

  ctrl.deleteDocument = function (documentToDelete) {
    var title = localize.getLocalizedString('Delete Document');
    var message = localize.getLocalizedString('Are you sure you want to {0}', [
      "remove this document permanently from this patient's record?",
    ]);
    var button1Text = localize.getLocalizedString('Yes');
    var button2Text = localize.getLocalizedString('No');
    documentToDelete.DocumentId = documentToDelete.ObjectIdLong;

    modalFactory
      .ConfirmModal(title, message, button1Text, button2Text)
      .then(function () {
        patientDocumentsFactory
          .DeleteDocument(documentToDelete)
          .then(function () {
            return $scope.refreshTransactionHistoryPageData();
          });
      });
  };

  $scope.printFilter = function () {
    ctrl.prepFilter();
    return ctrl.printScreenAfterGettingAllHistory().then(function () {
      const printOptions = {
        FilterObject: ctrl.filterObject,
        SortObject: $scope.sortObject,
        ReportType: 'Print',
        FilterAccountMembers: $scope.FilterAccountMembers
          ? $scope.FilterAccountMembers
          : 'All',
        FilterLocations: $scope.FilterLocations
          ? $scope.FilterLocations
          : 'All',
        FilterDateRange: $scope.FilterDateRange ? $scope.FilterDateRange : null,
        FilterTooth: $scope.FilterTooth ? $scope.FilterTooth : 'All',
        FilterTransactionTypes: $scope.FilterTransactionTypes
          ? $scope.FilterTransactionTypes
          : 'All',
        FilterDistributionTypes: $scope.FilterDistributionTypes
          ? $scope.FilterDistributionTypes
          : 'All',
        FilterProviders: $scope.FilterProviders
          ? $scope.FilterProviders
          : 'All',
        FilterStatus: $scope.FilterStatus ? $scope.FilterStatus : 'All',
        ResponsiblePartyInfo: $scope.responsiblePartyInfo,
        PatientId:
          $scope.patient.Data.PatientId == null
            ? $routeParams.patientId
            : $scope.patient.Data.PatientId,
        UserCode: $scope.currentUserCode,
      };
      printOptions.ReportHeader = 'Transaction History';
      const accountId = $scope.patient.Data.PersonAccount.AccountId;
      localStorage.setItem(
        'printTransactionHistory_' + accountId,
        JSON.stringify(printOptions)
      );
      tabLauncher.launchNewTab(
        `#/Patient/Account/${accountId}/PrintTransactionHistory`
      );
    });
  };

  $window.onafterprint = function () {
    $('body').removeClass('noScroll');
  };

  /**
   * Print screen after getting all history.
   *
   * @returns {angular.IPromise}
   */
  ctrl.printScreenAfterGettingAllHistory = function () {
    return $q
      .all({
        locations: ctrl.getLocations(),
        providers: ctrl.getProviders(),
        location: ctrl.getUserLocation(),
      })
      .then(function (results) {
        $scope.printedDate = moment().format('MM/DD/YYYY - hh:mm a');
        var currentUserId = JSON.parse(sessionStorage.getItem('patAuthContext'))
          .userInfo.userid;
        $scope.currentUserCode = $filter('filter')(
          results.providers,
          { UserId: currentUserId },
          true
        )[0].UserCode;
        var practice = JSON.parse(sessionStorage.getItem('userPractice'));
        $scope.practiceName = _.escape(practice.name);
        var responsiblePerson = $filter('filter')(
          $scope.accountMembersOptionsTemp,
          { isResponsiblePerson: true },
          true
        )[0];
        if (responsiblePerson.id === $scope.patient.id) {
          $scope.responsiblePartyInfo =
            responsiblePerson.name + ' - ' + $scope.patient.Data.PatientCode;
        }

        $scope.FilterLocations = 'All';
        $scope.FilterDateRange = null;
        $scope.FilterTooth = 'All';
        $scope.FilterTransactionTypes = 'All';
        $scope.FilterProviders = 'All';
        $scope.FilterStatus = 'All';
        $scope.FilterAccountMembers = 'All';
        $scope.FilterDistributionTypes = 'All';

        if ($scope.filterObject.locations !== null) {
          var filteredLocationNames = [];
          _.forEach($scope.filterObject.locations, function (locationId) {
            var ofcLocation = _.find(results.locations, {
              LocationId: locationId,
            });
            filteredLocationNames.push(ofcLocation.NameLine1);
          });
          $scope.FilterLocations = filteredLocationNames.join(', ');
        }

        if (
          $scope.filterObject.members !== null &&
          $scope.filterObject.members.length > 0 &&
          $scope.filterObject.members[0] !== '0'
        ) {
          var filteredMemberNames = [];
          _.forEach($scope.filterObject.members, function (personId) {
            var accountMember = _.find($scope.accountMembersOptionsTemp, {
              personId: personId,
            });
            filteredMemberNames.push(accountMember.patientDetailedName);
          });
          $scope.FilterAccountMembers = filteredMemberNames.join(', ');
        }

        if ($scope.filterObject.dateRange.start) {
          $scope.printingDateRangeFrom = $filter('toShortDisplayDate')(
            $scope.filterObject.dateRange.start
          );
        }
        if ($scope.filterObject.dateRange.end) {
          $scope.printingDateRangeTo = $filter('toShortDisplayDate')(
            $scope.filterObject.dateRange.end
          );
        }
        if ($scope.rows.length > 0) {
          if (!$scope.filterObject.dateRange.start) {
            $scope.printingDateRangeFrom = $filter('toShortDisplayDate')(
              timeZoneFactory.ConvertDateTZString(
                $scope.rows[$scope.rows.length - 1].Date,
                _.escape(results.location.Timezone)
              )
            );
          }
          if (!$scope.filterObject.dateRange.end) {
            $scope.printingDateRangeTo = $filter('toShortDisplayDate')(
              timeZoneFactory.ConvertDateTZString(
                $scope.rows[0].Date,
                _.escape(results.location.Timezone)
              )
            );
          }
        }

        if (
          $scope.filterObject.dateRange.start ||
          $scope.filterObject.dateRange.end
        ) {
          $scope.FilterDateRange =
            'From ' +
            $scope.printingDateRangeFrom +
            ' - To ' +
            $scope.printingDateRangeTo;
        }

        if (
          !_.isUndefined($scope.filterObject.Teeth) &&
          $scope.filterObject.Teeth.length > 0
        ) {
          var stringText = [];
          var numbers = [];
          for (var i = 0; i < $scope.filterObject.Teeth.length; i++) {
            var value = parseInt($scope.filterObject.Teeth[i]);
            if (isNaN(value)) {
              stringText.push($scope.filterObject.Teeth[i]);
            } else {
              numbers.push(value);
            }
          }
          $scope.FilterTooth = _.orderBy(stringText)
            .concat(_.orderBy(numbers))
            .join(', ');
        }

        // Add distribution types to filter display
        var filteredDistributionTypes = [];
        if ($scope.filterObject.IncludePaidTransactions === true) {
          filteredDistributionTypes.push('Paid Transactions');
        }
        $scope.FilterDistributionTypes = filteredDistributionTypes.join(', ');

        if ($scope.filterObject.IncludeUnpaidTransactions === true) {
          filteredDistributionTypes.push('Unpaid Transactions');
        }
        $scope.FilterDistributionTypes = filteredDistributionTypes.join(', ');

        if ($scope.filterObject.IncludeUnappliedTransactions === true) {
          filteredDistributionTypes.push('Unapplied Transactions');
        }
        $scope.FilterDistributionTypes = filteredDistributionTypes.join(', ');

        if ($scope.filterObject.IncludeAppliedTransactions === true) {
          filteredDistributionTypes.push('Applied Transactions');
        }
        $scope.FilterDistributionTypes = filteredDistributionTypes.join(', ');
        if (filteredDistributionTypes.length === 4) {
          $scope.FilterDistributionTypes = 'All';
        }

        var filteredStatuses = [];
        if ($scope.filterObject.Statuses) {
          $scope.filterObject.Statuses.forEach(status => {
            if (status === 1) {
              filteredStatuses.push('Active');
            }
            if (status === 2) {
              filteredStatuses.push('Deleted');
            }
            if (status === 3) {
              filteredStatuses.push('Edited');
            }
            if (status === 4) {
              filteredStatuses.push('Offsetting Void');
            }
          });
          $scope.FilterStatus = filteredStatuses.join(', ');
        }

        if ($scope.filterObject.transactionTypes !== null) {
          var transactionTypes = [
            { Text: 'Services', Id: 1 },
            { Text: 'Account Payments', Id: 2 },
            { Text: 'Insurance Payments', Id: 3 },
            { Text: '- Adjustments', Id: 4 },
            { Text: '+ Adjustments', Id: 5 },
            { Text: 'Finance Charges', Id: 6 },
            { Text: 'Account Notes', Id: 7 },
            { Text: 'Documents', Id: 8 },
          ];
          var filteredTransactionTypes = [];
          _.forEach(transactionTypes, function (transactionType) {
            if (
              $scope.filterObject.transactionTypes.includes(transactionType.Id)
            )
              filteredTransactionTypes.push(transactionType.Text);
          });
          $scope.FilterTransactionTypes = filteredTransactionTypes.join(', ');
        }

        if ($scope.filterObject.providers != null) {
          var filteredProviders = [];
          _.forEach($scope.filterObject.providers, function (providerUserId) {
            var provider = _.find(results.providers, {
              UserId: providerUserId,
            });
            var fullName =
              provider.ProfessionalDesignation == null
                ? provider.FirstName + ' ' + provider.LastName
                : provider.FirstName +
                  ' ' +
                  provider.LastName +
                  ', ' +
                  provider.ProfessionalDesignation;
            filteredProviders.push(fullName);
          });
          $scope.FilterProviders = filteredProviders.join(', ');
        }
      });
  };

  $scope.exportFilter = function () {
    ctrl.prepFilter();
    const requestArgs = {
      AccountId: $scope.patient.Data.PersonAccount.AccountId,
      FilterCriteria: ctrl.filterObject,
      SortCriteria: $scope.sortObject,
      PageCount: 0,
      CurrentPage: 0,
    };
    transactionHistoryService
      .requestTransactionHistory(requestArgs)
      .subscribe(res => {
        let transactionHistories = res.Value;
        ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      });
  };

  /**
   * Export screen after getting all history.
   *
   * @param {*} transactionHistories
   * @returns {angular.IPromise}
   */
  ctrl.exportScreenAfterGettingAllHistory = function (transactionHistories) {
    return ctrl.getUserLocation().then(function (location) {
      // TODO: remove mapping of grid to TransactionHistory objects when grid is an array of TransactionHistory objects
      var historyArray = ctrl.convertGridRowsToTransactionHistoryArray(transactionHistories);
      var activeLocationTimezoneIdentifier = timeZoneFactory.GetTimeZoneInfo(_.escape(location.Timezone), undefined).MomentTZ;
      var csvFileName = 'Transaction History ' + moment().tz(activeLocationTimezoneIdentifier).format('YYYY-MM-DD') + '.csv';
      var csv = transactionHistoryExportService.convertTransactionHistoryArrayToCsv(
        historyArray,
        activeLocationTimezoneIdentifier,
        $scope.sortingApplied === true || $scope.filterBarProperties.hideRunningBalance === true);

      if ($window.navigator.msSaveOrOpenBlob) {
        var blob = new Blob([csv], {
          type: 'text/csv;charset=utf-8;',
        });

        $window.navigator.msSaveOrOpenBlob(blob, csvFileName);
      }
      else {
        var element = document.createElement('a');
        element.setAttribute('href',
          'data:text/plain;charset=utf-8,' + $window.encodeURIComponent(csv));
        element.setAttribute('download', csvFileName);
        element.setAttribute('target', '_blank');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    });
  };

  // TODO: Remove this function when the grid is an array of TransactionHistory objects
  ctrl.convertGridRowsToTransactionHistoryArray = function (
    transactionHistories
  ) {
    var historyArray = transactionHistoryExportService.newTransactionHistoryArray();
    transactionHistories.forEach(row => {
      var historyArrayItem = transactionHistoryExportService.newTransactionHistory();
      historyArrayItem.utcDateTimeString = row.Date.toLowerCase().endsWith('z')
        ? row.Date
        : row.Date + 'Z';
      historyArrayItem.patientName = row.PatientName;
      historyArrayItem.providerUserName = row.ProviderUserName;
      historyArrayItem.locationName = row.LocationName;
      historyArrayItem.type = row.Type;
      historyArrayItem.description = row.Description;
      historyArrayItem.tooth = row.Tooth;
      historyArrayItem.area = row.Area;
      historyArrayItem.totalEstimatedInsurance = row.TotalEstInsurance;
      historyArrayItem.amount = row.Amount;
      historyArrayItem.isDeposited = row.IsDeposited;
      historyArrayItem.isSplitPayment = row.IsSplitPayment;
      historyArrayItem.allowedamount = row.AllowedAmount;
      historyArrayItem.totalAdjEstimate = row.TotalAdjEstimate;
      historyArrayItem.runningBalance = row.Balance;
      historyArray.push(historyArrayItem);
    });
    return historyArray;
  };

  // Navigate user to account summary screen, expand and bring into view the row that contains the currently selected debit
  // transaction.
  $scope.viewCompleteEncounter = function (rowItem) {
    if (
      !_.isUndefined(rowItem) &&
      !_.isUndefined(rowItem.PersonId) &&
      !_.isUndefined(rowItem.ObjectId) &&
      !_.isUndefined(rowItem.TransactionTypeId)
    ) {
      if (
        _.isEqual(rowItem.TransactionTypeId, 1) ||
        _.isEqual(rowItem.TransactionTypeId, 4) ||
        _.isEqual(rowItem.TransactionTypeId, 2)
      ) {
        tabLauncher.launchNewTab(
          _.escape(
            ctrl.patientPath +
              rowItem.PersonId +
              '/Summary?tab=Account Summary&open=new&encounterId=' +
              rowItem.EncounterId
          )
        );
      } else if (
        _.isEqual(rowItem.TransactionTypeId, 5) ||
        _.isEqual(rowItem.TransactionTypeId, 6)
      ) {
        tabLauncher.launchNewTab(
          _.escape(
            ctrl.patientPath +
              rowItem.PersonId +
              '/Summary?tab=Account Summary&open=new&encounterId=' +
              rowItem.ObjectId
          )
        );
      }
    }
  };

  // Edit account payment or adjustment
  ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal = function (detail, editMode) {
    if (
      detail.TransactionTypeId === 2 &&
      !patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthActPmtEditKey
      )
    ) {
      //acct payment and not allowed to edit
      ctrl.notifyNotAuthorized($scope.soarAuthActPmtEditKey);
      return;
    }
    if (
      detail.TransactionTypeId === 4 &&
      !patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthCdtAdjEditKey
      )
    ) {
      //neg adjust and not allowed to edit
      ctrl.notifyNotAuthorized($scope.soarAuthCdtAdjDeleteKey);
      return;
    }

    detail.$$editMode = editMode;
    detail.$$patientInfo = $scope.patient.Data;

    // If payment is tied to inactive payment type add to list to be displayed in dropdown
    var paymentTypes = _.clone(ctrl.activeAccountPaymentTypes);
    if (_.isEqual(detail.TransactionTypeId, 2)) {
      var paymentType = _.find(ctrl.allAccountPaymentTypes, {
        PaymentTypeId: detail.PaymentTypeId,
      });
      if (!paymentType.IsActive) {
        paymentTypes.push(paymentType);
        paymentTypes = _.orderBy(paymentTypes, 'Description', 'asc');
      }
    }
    accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
      detail,
      paymentTypes,
      $scope.accountMembersOptionsTemp,
      $scope.refreshSummaryPageDataForGrid
    );
  };

  /**
   * Delete account payment or adjustment.
   *
   * @param {*} creditTransaction
   * @returns {angular.IPromise}
   */
  $scope.deleteAcctPaymentOrNegAdjustmentModal = function (creditTransaction) {
    return ctrl.getUserLocation().then(function (location) {
      if (
        creditTransaction.TransactionTypeId === 2 &&
        !patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthActPmtDeleteKey
        )
      ) {
        //acct payment and not allowed to delete
        ctrl.notifyNotAuthorized($scope.soarAuthActPmtDeleteKey);
        return;
      }
      if (
        creditTransaction.TransactionTypeId === 4 &&
        !patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthCdtAdjDeleteKey
        )
      ) {
        //neg adjust and not allowed to delete
        ctrl.notifyNotAuthorized($scope.soarAuthCdtAdjDeleteKey);
        return;
      }

      creditTransaction.$$accountId =
        $scope.patient.Data.PersonAccount.AccountId;
      creditTransaction.$$ispaymentGatewayEnabled =
        location.IsPaymentGatewayEnabled;

      return accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        creditTransaction,
        ctrl.allAccountPaymentTypes,
        $scope.refreshSummaryPageDataForGrid
      );
    });
  };
  // END region

  ctrl.deleteInsurancePayment = function (row) {
    row.$$paymentType = _.find(ctrl.insurancePaymentTypes, {
      PaymentTypeId: row.PaymentTypeId,
    });
    row.$$patientId = $routeParams.patientId;
    row.$$accountId =
      $scope.patient.Data.PersonAccount.PersonAccountMember.AccountId;
    accountSummaryFactory.deleteInsurancePayment(
      row,
      row.PatientName,
      $scope.refreshSummaryPageDataForGrid
    );
  };

  /**
   * Edit bulk insurance payment modal.
   *
   * @param {*} transaction
   * @returns {angular.IPromise}
   */
  ctrl.bulkInsuranceEditModal = function (transaction) {
    var message = localize.getLocalizedString(
      'This insurance payment is part of a multiple claim insurance payment.  Editing this payment may affect other insurance payments.'
    );
    var title = localize.getLocalizedString('Edit Multi-Claim Payment?');
    var buttonOkText = localize.getLocalizedString('Yes');
    var buttonCancelText = localize.getLocalizedString('No');
    return modalFactory
      .ConfirmModal(title, message, buttonOkText, buttonCancelText)
      .then(function () {
        ctrl.editInsurancePayment(transaction);
      });
  };

  // Edit service transaction - This callback function called from menu directive and will open service transaction modal pop-up to allow user update service transaction data
  ctrl.editInsurancePayment = function (transaction) {
    if (transaction.TransactionTypeId == 3) {
      var tabName = ctrl.getTabNameFromParam();
      var prevLocation = tabName === '' ? 'Account Summary' : tabName;
      if (
        !_.isNil(transaction.$$bulkCreditTransactionCount) &&
        !_.isNil(transaction.$$bulkCreditTransactionAllLocationAccess) &&
        transaction.$$bulkCreditTransactionAllLocationAccess &&
        transaction.$$bulkCreditTransactionCount > 1
      ) {
        tabLauncher.launchNewTab(
          _.escape(
            ctrl.patientPath +
              $routeParams.patientId +
              '/Account/' +
              $scope.patient.Data.PersonAccount.AccountId +
              '/Payment/' +
              prevLocation +
              '/BulkCreditTransaction/' +
              transaction.BulkCreditTransactionId
          )
        );
      } else {
        let patientPath = 'Patient/';
        $location.path(
          _.escape(
            patientPath +
              $routeParams.patientId +
              '/Account/' +
              $scope.patient.Data.PersonAccount.AccountId +
              '/Payment/' +
              prevLocation +
              '/BulkCreditTransaction/' +
              transaction.BulkCreditTransactionId
          )
        );
      }
    }
  };

  $scope.viewEra = function (transaction) {
    if (!_.isNil(transaction) && !_.isEmpty(transaction.Claims)) {
      accountCreditTransactionFactory.viewEob(
        transaction.EraTransactionSetHeaderId,
        transaction.Claims[0].ClaimId,
        transaction.Claims[0].PatientId
      );
    }
  };

  /**
   * Print receipt.
   *
   * @param {*} transactionToPrint
   * @returns {angular.IPromise}
   */
  $scope.printReceipt = function (transactionToPrint) {
    return ctrl.getLocations().then(function (locations) {
      var transaction = _.clone(transactionToPrint);
      transaction.DateEntered = transaction.Date;
      transaction.TransactionType = localize.getLocalizedString(
        'Account Payment'
      );
      transaction.CreditTransactionId = transaction.ObjectId;
      transaction.Location = _.find(locations, function (loc) {
        return loc.LocationId == transaction.LocationId;
      });
      var loggedInLocation = _.find(locations, function (loc) {
        return loc.LocationId == cachedLocation.id;
      });
      transaction.IsLocationPaymentGatewayEnabled = !_.isUndefined(
        loggedInLocation
      )
        ? loggedInLocation.IsPaymentGatewayEnabled
        : false;

      accountCreditTransactionFactory.printReceipt(
        transaction,
        $scope.patient.Data
      );
    });
  };

  // get tab name from url
  ctrl.getTabNameFromParam = function () {
    var urlParams = $location.search();
    var tabName = '';
    if (urlParams && urlParams.tab) {
      var tabNameFromParam = urlParams.tab;
      tabName = tabNameFromParam;
    }
    return tabName;
  };

  // Checks a list of AMFAs and returns true/false based on user access
  ctrl.checkPermissions = function (amfaList) {
    var hasAccess = true;
    _.forEach(amfaList, function (amfa) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
        hasAccess = false;
      }
    });

    return hasAccess;
  };

  //#region change payment/ adjustment
  $scope.changePaymentOrAdjustment = function (transaction) {
    if (
      !ctrl.checkPermissions([$scope.soarAuthActPmtEditKey]) ||
      !ctrl.checkPermissions([$scope.soarAuthCdtAdjEditKey])
    ) {
      toastrFactory.error(localize.getLocalizedString('Not Authorized'));
      return;
    }

    accountCreditTransactionFactory
      .getCreditTransaction(
        $scope.patient.Data.PersonAccount.AccountId,
        transaction.ObjectId
      )
      .then(function (res) {
        if (!_.isUndefined(res) && !_.isUndefined(res.Value)) {
          transaction = res.Value;
          transaction.UnassignedAmount = _.chain(
            transaction.CreditTransactionDetails
          )
            .filter(
              x =>
                !x.IsDeleted &&
                x.AppliedToServiceTransationId === null &&
                x.AppliedToDebitTransactionId === null
            )
            .sumBy(x => x.Amount)
            .value();
          var creditTransactions = [transaction];
          var dataForModal = {
            PatientAccountDetails: {
              AccountId: $scope.patient.Data.PersonAccount
                ? $scope.patient.Data.PersonAccount.PersonAccountMember
                    .AccountId
                : '',
              AccountMemberId: $scope.patient.Data.PersonAccount
                ? $scope.patient.Data.PersonAccount.PersonAccountMember
                    .AccountMemberId
                : '',
            },
            DefaultSelectedIndex: -1,
            AllProviders: $scope.allProviders,
            UnappliedTransactions: creditTransactions,
            IsView: true,
          };
          var hasAdjustment = _.isEqual(transaction.TransactionTypeId, 4)
            ? true
            : false;
          var hasPayments = _.isEqual(transaction.TransactionTypeId, 2)
            ? true
            : false;

          if (
            (hasAdjustment || hasPayments) &&
            !$scope.alreadyApplyingAdjustment
          ) {
            $scope.alreadyApplyingAdjustment = true;
            modalDataFactory
              .GetTransactionModalData(
                dataForModal,
                $routeParams.patientId,
                false,
                true
              )
              .then(ctrl.openModal);
          }
        }
      });
  };

  //Function to open adjustment modal
  ctrl.openModal = function (transactionModalData) {
    ctrl.dataForModal = transactionModalData;
    ctrl.dataForModal.AllProviders = transactionModalData.providersList.Value;
    modalFactory.TransactionModal(
      ctrl.dataForModal,
      function () {
        //Handle Ok callback from adjustment dialog
        $scope.alreadyApplyingAdjustment = false;
        // refresh data
        return $scope.refreshTransactionHistoryPageData();
      },
      function () {
        //Handle Cancel callback from adjustment dialog
        $scope.alreadyApplyingAdjustment = false;
      }
    );
  };

  //#end region

  //#region sorting

  // function to apply orderBy functionality
  $scope.sortColumn = function (field) {
    if (!$scope.showCreateClaimView && !$scope.isCreateCustomInvoice) {
      if ($scope.sortObject[field]) {
        $scope.sortObject[field] = $scope.sortObject[field] === 1 ? 2 : 1;
        $scope.rows = _.orderBy($scope.rows, 'Date', $scope.sortObject[field]);
      } else {
        $scope.sortObject = {};
        $scope.sortObject[field] = 1;
        $scope.rows = _.orderBy($scope.rows, field, $scope.sortObject[field]);
      }
      $scope.sortingApplied =
        _.isEqual(field, 'Date') && _.isEqual($scope.sortObject['Date'], 2)
          ? false
          : true;
      $scope.keepCreateClaimViewOpen = $scope.showCreateClaimView
        ? true
        : false;
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      $scope.refreshSummaryPageDataForGrid(true);
      // $scope.doRefresh = true;
      // ctrl.getHistory();
    }
  };

  // Set the sorting back to Date desc
  $scope.resetSorting = function () {
    $scope.sortObject = {};
    $scope.sortObject['Date'] = 2;
    $scope.sortingApplied = false;
    $scope.refreshSummaryPageDataForGrid();
  };
  //#end region

  //#region paging

  $scope.showMoreResults = function () {
    ctrl.currentPage = 2;
    $scope.resetPaging = false;
    $scope.refreshSummaryPageDataForGrid(true);
  };

  // Add the fixedHeader class to the header when you reach its scroll position. Remove "fixedHeader" when you leave the scroll position
  ctrl.fixHeader = function () {
    if (window.pageYOffset > pageYOffset) {
      $('#gridHeader').addClass('fixedgridHeader');
    } else {
      $('#gridHeader').removeClass('fixedgridHeader');
    }
  };

  // When the user scrolls the page, execute fixHeader Function
  angular.element($window).bind('scroll', function () {
    ctrl.fixHeader();
    ctrl.removeBackToTop();
    if (ctrl.lazyLoadingActive) {
      ctrl.lazyLoad();
    }
  });

  $scope.scrollToTop = function () {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  };

  ctrl.lazyLoad = function () {
    if (ctrl.isPageScrolledToBottom() && !$scope.pagingInProgress) {
      // 65px buffer so that the scroll can hit the bottom on smaller screens
      $scope.pagingInProgress = true;
      ctrl.currentPage += 1;
      $scope.refreshSummaryPageDataForGrid();
      $scope.resetPaging = false;
      $scope.keepCreateClaimViewOpen = $scope.showCreateClaimView
        ? true
        : false;

      // This is needed to remove delay with the infinite scroll
      $scope.$apply();
    }
  };

  ctrl.isPageScrolledToBottom = function () {
    if (
      $(window).scrollTop() + $(window).height() >=
      $(document).height() - 65
    ) {
      return true;
    } else {
      return false;
    }
  };

  ctrl.removeBackToTop = function () {
    window.pageYOffset > pageYOffset
      ? $('.backToTop').addClass('showBackToTop')
      : $('.backToTop').removeClass('showBackToTop');
  };
  //#end region

  // determine if user needs can recreate or create a claim without estimating benefits
  // option only available if at least one of the services is from the prior benefit year (determined by the Plan renewal date)
  // if RenewalDate is null or services are current plan year, user must estimate
  ctrl.calculateEstimatatedInsuranceOption = function (plan, services) {
    let renewalMonth =
      plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth;
    let renewalMonthString = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ][renewalMonth - 1];

    return new Promise(resolve => {
      if (
        closeClaimOptionsService.allowEstimateOption(renewalMonth, services)
      ) {
        var data = {
          estimateInsuranceOption: 'true',
          firstName: plan.PolicyHolderDetails.FirstName,
          lastName: plan.PolicyHolderDetails.LastName,
          renewalMonth: renewalMonthString,
        };
        $scope.confirmationRef = closeClaimOptionsService.open({ data });
        $scope.confirmationModalSubscription = $scope.confirmationRef.events.subscribe(
          events => {
            if (events && events.type) {
              switch (events.type) {
                case 'confirm':
                  $scope.confirmationRef.close();
                  resolve(events.data.estimateInsuranceOption);
                  break;
                case 'close':
                  $scope.confirmationRef.close();
                  break;
              }
            }
          }
        );
      } else {
        resolve(true);
      }
    });
  };
}
TransactionHistoryMigrationController.prototype = Object.create(
  BaseCtrl.prototype
);
