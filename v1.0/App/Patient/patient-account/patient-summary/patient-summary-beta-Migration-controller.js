'use strict';

var app = angular.module('Soar.Patient');

app.controller('patientSummaryBetaMigrationController', [
  '$scope',
  '$rootScope',
  '$routeParams',
  '$timeout',
  '$filter',
  '$location',
  '$q',
  'localize',
  'PatientServices',
  'toastrFactory',
  'ModalFactory',
  'NewPaymentTypesService',
  'ModalDataFactory',
  'patSecurityService',
  'ClaimsService',
  '$window',
  'AccountSummaryFactory',
  'AccountServiceTransactionFactory',
  'PatientInvoiceFactory',
  'CommonServices',
  '$sce',
  'referenceDataService',
  'AccountSummaryDeleteFactory',
  'TimeZoneFactory',
  '$uibModal',
  'PatientSummaryFactory',
  'AccountNoteFactory',
  'AccountDebitTransactionFactory',
  'AccountCreditTransactionFactory',
  'CloseClaimOptionsService',
  PatientSummaryBetaMigrationController,
]);
function PatientSummaryBetaMigrationController(
  $scope,
  $rootScope,
  $routeParams,
  $timeout,
  $filter,
  $location,
  $q,
  localize,
  patientServices,
  toastrFactory,
  modalFactory,
  paymentTypesService,
  modalDataFactory,
  patSecurityService,
  claimsService,
  $window,
  accountSummaryFactory,
  accountServiceTransactionFactory,
  patientInvoiceFactory,
  commonServices,
  $sce,
  referenceDataService,
  accountSummaryDeleteFactory,
  timeZoneFactory,
  $uibModal,
  patientSummaryFactory,
  accountNoteFactory,
  accountDebitTransactionFactory,
  accountCreditTransactionFactory,
  closeClaimOptionsService
) {
  // #region Controller level variables
  var ctrl = this;
  $scope.isPopoverOpen = false;
  $scope.locations = [];
  if ($scope.patient.Data) {
    document.title =
      $scope.patient.Data.PatientCode +
      ' - ' +
      localize.getLocalizedString('Account Summary');
  }

  $scope.Rows = [];
  $scope.PendingEncounters = [];
  ctrl.allAccountPaymentTypes = [];
  ctrl.activeAccountPaymentTypes = [];
  ctrl.insurancePaymentTypes = [];
  ctrl.plans = [];
  $scope.doRefresh = false;
  $scope.multiLocationEncounterTooltip = localize.getLocalizedString(
    'Your {0} has {1}s spanning multiple {1} {2}s. Please delete your {0} and create a new one so that all {1}s are assigned to the same {2}.',
    ['encounter', 'service', 'location']
  );
  $scope.disableAllPendingEncountersTooltip = localize.getLocalizedString(
    'You have {0}s spanning multiple {1} {2}s. You must check out the {0}s individually.',
    ['encounter', 'service', 'location']
  );
  $scope.noDeleteAccessTooltipMessage = localize.getLocalizedString(
    'You do not have permission to Delete {0}s at the service location.',
    ['encounter']
  );
  $scope.checkoutAllIsAllowed = true;
  $scope.currentPatientId = $routeParams.patientId;
  ctrl.paymentTypeCategories = { Account: 1, Insurance: 2 };

  ctrl.locations = undefined;

  /**
   * Get locations resources.
   *
   * @returns {angular.IPromise<any>}
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

  ctrl.location = undefined;

  /**
   * Gets user location.
   *
   * @returns {angular.IPromise<any>}
   */
  ctrl.getUserLocation = () => {
    if (ctrl.location) {
      $q.resolve(ctrl.location);
    }
    return ctrl.getLocations().then(function (locations) {
      var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      ctrl.location =
        cachedLocation != null
          ? _.find(locations, { LocationId: cachedLocation.id })
          : locations[0];
      return ctrl.location;
    });
  };

  //encounter amfas
  $scope.soarAuthEnctrAddKey = 'soar-acct-enctr-add';
  $scope.soarAuthEnctrChkOutKey = 'soar-acct-enctr-chkout';
  $scope.soarAuthEnctrEditKey = 'soar-acct-enctr-edit';
  $scope.soarAuthEnctrDeleteKey = 'soar-acct-enctr-delete';

  //service amfas
  $scope.soarAuthSvcTrViewKey = 'soar-acct-actsrv-view';
  $scope.soarAuthSrvTrEditKey = 'soar-acct-actsrv-edit';
  $scope.soarAuthSrvTrDeleteKey = 'soar-acct-actsrv-delete';

  //credit tx amfas
  $scope.soarAuthCdtAdjAddKey = 'soar-acct-cdtadj-add';
  $scope.soarAuthCdtAdjEditKey = 'soar-acct-cdtadj-edit';
  $scope.soarAuthCdtAdjDeleteKey = 'soar-acct-cdtadj-delete';

  $scope.soarAuthActPmtAddKey = 'soar-acct-aapmt-add';
  $scope.soarAuthActPmtEditKey = 'soar-acct-aapmt-edit';
  $scope.soarAuthActPmtDeleteKey = 'soar-acct-aapmt-delete';

  $scope.soarAuthInsPmtEditKey = 'soar-acct-aipmt-edit';
  $scope.soarAuthInsPmtDeleteKey = 'soar-acct-aipmt-delete';

  //debit tx amfas
  $scope.soarAuthDbtTrxEditKey = 'soar-acct-dbttrx-edit';
  $scope.soarAuthDbtTrxDeleteKey = 'soar-acct-dbttrx-delete';

  //endregion

  //filter object
  ctrl.filterObject = {
    FromDate: null,
    ToDate: null,
    PersonIds: null,
  };

  //endregion

  // ARWEN: #509747 This looks like it was duplicated.
  //get rows for account Summary grid
  // ctrl.getAccountSummaryMain = function () {
  //     return accountSummaryFactory.getAccountSummaryMain($scope.patient.Data.PersonAccount.AccountId, ctrl.filterObject).then(function (res) {
  //         ctrl.prep(res.Value);
  //         $scope.Rows = res.Value.Rows;
  //         $rootScope.$broadcast('recomputeBalance', true);
  //         if (!_.isUndefined($location.search().encounterId)) {
  //             $scope.getRowDetails(_.find(res.Value.Rows, { ObjectId: _.escape($location.search().encounterId) }), true);
  //         }
  //     });
  // };

  /**
   * get rows for account Summary grid
   *
   * @returns {angular.IPromise}
   */
  ctrl.getAccountSummaryMain = function () {
    return accountSummaryFactory
      .getAccountSummaryMain(
        $scope.patient.Data.PersonAccount.AccountId,
        ctrl.filterObject
      )
      .then(function (res) {
        return ctrl.prep(res.Value).then(function () {
          $scope.Rows = res.Value.Rows;
          $rootScope.$broadcast('recomputeBalance', true);
          if (!_.isUndefined($location.search().encounterId)) {
            return $scope.getRowDetails(
              _.find(res.Value.Rows, {
                ObjectId: _.escape($location.search().encounterId),
              }),
              true
            );
          }
          return $q.resolve();
        });
      });
  };

  /**
   * Preparation.
   *
   * @param {*} result
   * @returns {angular.IPromise}
   */
  ctrl.prep = function (result) {
    return ctrl.getLocations().then(function (locations) {
      if (!$scope.patient) {
        return $q.reject();
      }
      //process unapplied credit transactions
      $scope.unappliedTransactions = _.cloneDeep(
        result.UnappliedCreditTransactions
      );
      _.forEach($scope.unappliedTransactions, creditTransaction => {
        creditTransaction.UnassignedAmount = _.chain(
          creditTransaction.CreditTransactionDetails
        )
          .filter(
            d =>
              !d.IsDeleted &&
              !d.AppliedToServiceTransationId &&
              !d.AppliedToDebitTransactionId
          )
          .sumBy(d => d.Amount)
          .value();
        creditTransaction.TransactionType =
          creditTransaction.TransactionTypeId === 2
            ? 'Account Payment'
            : '+ Adjustment';
      });

      //process rows
      _.each(result.Rows, row => {
        if (row.ObjectType === 'PersonAccountNote') {
          row.AccountId = $scope.patient.Data.PersonAccount.AccountId;
          row.PersonAccountNoteId = row.ObjectIdLong;
        }
        var ofcLocation = _.find(locations, { LocationId: row.LocationId });
        row.displayDate = $filter('toShortDisplayTodayLocal')(
          row.Date,
          ofcLocation ? _.escape(ofcLocation.Timezone) : null
        );
      });
    });
  };
  //endregion

  //get pending encounters
  // ARWEN: #509747 This looks like it was duplicated below.
  // ctrl.getPendingEncounters = function () {
  //     // create temp filter object that gets all encounters for this account
  //     var filterObject = {
  //         FromDate: null,
  //         ToDate: null,
  //         PersonIds: null,
  //     };
  //     accountSummaryFactory.getPendingEncounters($scope.patient.Data.PersonAccount.AccountId, filterObject).then(function (rows) {
  //         $scope.checkoutAllIsAllowed = patientSummaryFactory.canCheckoutAllEncounters(rows);
  //         // filter encounters if for one account member, use all rows otherwise
  //         if (ctrl.filterObject.PersonIds) {
  //             $scope.PendingEncounters = rows.filter(function (row) {
  //                 return ctrl.filterObject.PersonIds.indexOf(row.PersonId) > -1;
  //             });
  //         } else {
  //             $scope.PendingEncounters = rows;
  //         }
  //         if (!_.isEmpty($scope.PendingEncounters) && $scope.PendingEncounters.length === 1) {
  //             $scope.getRowDetails(_.head($scope.PendingEncounters));
  //         }
  //     });
  // };

  /**
   * Get pending encounters.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getPendingEncounters = function () {
    // create temp filter object that gets all encounters for this account
    var filterObject = {
      FromDate: null,
      ToDate: null,
      PersonIds: null,
    };

    if (!$scope.patient) {
      return $q.reject();
    }

    return accountSummaryFactory
      .getPendingEncounters(
        $scope.patient.Data.PersonAccount.AccountId,
        filterObject
      )
      .then(function (rows) {
        $scope.checkoutAllIsAllowed = patientSummaryFactory.canCheckoutAllEncounters(
          rows
        );
        // filter encounters if for one account member, use all rows otherwise
        if (ctrl.filterObject.PersonIds) {
          $scope.PendingEncounters = rows.filter(function (row) {
            return ctrl.filterObject.PersonIds.indexOf(row.PersonId) > -1;
          });
        } else {
          $scope.PendingEncounters = rows;
        }
        if (
          !_.isEmpty($scope.PendingEncounters) &&
          $scope.PendingEncounters.length === 1
        ) {
          return $scope.getRowDetails(_.head($scope.PendingEncounters));
        }
        return $q.resolve();
      });
  };
  //endregion

  /**
   * this calls the factory to get the details of the row, which the factory then applies to the
   * row and also sorts the data into lists of different types which are passed by reference to be
   * accessible later.
   *
   * @param {*} row
   * @param {*} focus
   * @returns {angular.IPromise}
   */
  $scope.getRowDetails = function (row, focus) {
    var deferred = $q.defer();

    if (!$scope.patient) {
      return $q.reject();
    }

    if (row === null || row === undefined) {
      return $q.resolve();
    }

    $timeout(function () {
      $scope.isPopoverOpen = false;
    });
    if (!row.retrieved && row.ObjectType !== 'PersonAccountNote') {
      accountSummaryFactory
        .getEncounterDetails(
          row,
          $scope.patient.Data.PersonAccount.AccountId,
          ctrl.plans
        )
        .then(function () {
          deferred.resolve();
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    } else {
      deferred.resolve();
    }

    return deferred.promise.then(function () {
      row.showDetail = !row.showDetail;
      if (focus) {
        $timeout(function () {
          angular.element('#row' + row.ObjectId)[0].scrollIntoView(true);
          $window.scrollBy(0, -100); // Offset to get row header out from under app header
        });
      }
    });
  };

  /**
   * used to recursively refresh details of a specific encounter after an edit through modal window.
   *
   * @returns {angular.IPromise<any>}
   */
  ctrl.refreshEncounterDetails = function () {
    return accountSummaryFactory.getEncounterDetails(
      ctrl.encounterToRefresh,
      $scope.patient.Data.PersonAccount.AccountId,
      ctrl.plans
    );
  };

  //getting and setting of PaymentTypes

  ctrl.getPaymentTypes = function () {
    return paymentTypesService.getAllPaymentTypesMinimal({}).then(
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

  //endregion

  /**
   * get benefit plans.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getPlans = function () {
    if (!$scope.patient) {
      return $q.reject();
    }

    return patientServices.PatientBenefitPlan.getPatientBenefitPlansByAccountId(
      { accountId: $scope.patient.Data.PersonAccount.AccountId }
    ).$promise.then(function (res) {
      ctrl.plans = res.Value;
      return res;
    });
  };

  //endregion

  $scope.loadingBalanceDetailRow = true;

  /**
   * assembling data for balanceDetailRow Directive.
   *
   * @returns {angular.IPromise}
   */
  ctrl.assembleDataForBalanceDetailRow = function () {
    if (!$scope.patient) {
      return $q.reject();
    }

    $scope.loadingBalanceDetailRow = true;
    return ctrl.getUserLocation().then(function (location) {
      if (!$scope.patient) {
        return $q.reject();
      }

      $scope.dataForBalanceDetailRow = {
        allProviders: $scope.allProvidersList ? $scope.allProvidersList : [],
        currentPatient: {
          AccountId: $scope.patient.Data.PersonAccount.AccountId,
          AccountMemberId:
            $scope.patient.Data.PersonAccount.PersonAccountMember
              .AccountMemberId,
        },
        Location: location,
        paymentTypes: ctrl.activeAccountPaymentTypes,
      };
      $scope.loadingBalanceDetailRow = false;
    });
  };

  $scope.refreshSummaryPageDataForGrid = function (forceApply) {
    $scope.doRefresh = true;
    if (forceApply == true) {
      $scope.$apply();
    }
  };

  //endregion

  //assembling data for Unapplied-menu directive
  //Todo: set this up so that showunnaplied detail flag is flipped when appropriate and unappliedCreditTransactions are tracked properly

  //endregion

  //setting filtered patients
  ctrl.selectAccountMembers = function () {
    if (_.isEqual($scope.filterObject.members, '0')) {
      $scope.selectAll = true;
      $scope.selectedAccountMembers = _.map(
        $scope.accountMembersOptionsTemp,
        'accountMemberId'
      );
      //populate the filter object with correct personIds so the grid can filter by patient
      ctrl.filterObject.PersonIds = null;
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
  };
  //endregion

  /**
   * initialize page.
   *
   * @returns {angular.IPromise}
   */
  ctrl.loadPage = function () {
    ctrl.selectAccountMembers();
    return $q
      .resolve()
      .then(function () {
        return ctrl.getPaymentTypes();
      })
      .then(function () {
        return ctrl.getPlans();
      })
      .then(function () {
        return ctrl.assembleDataForBalanceDetailRow();
      })
      .then(function () {
        return ctrl.getAccountSummaryMain();
      })
      .then(function () {
        return ctrl.getPendingEncounters();
      });
  };

  ctrl.loadPage();

  /**
   * Reload page.
   *
   * @returns {angular.IPromise}
   */
  $scope.reloadPage = function () {
    ctrl.selectAccountMembers();
    return $q
      .resolve()
      .then(function () {
        return ctrl.assembleDataForBalanceDetailRow();
      })
      .then(function () {
        return ctrl.getAccountSummaryMain();
      })
      .then(function () {
        return ctrl.getPendingEncounters();
      });
  };

  //endregion

  $scope.$on('apply-account-filters', $scope.reloadPage);

  //end region

  //utility methods

  ctrl.notifyNotAuthorized = function (authMessageKey) {
    toastrFactory.error(
      patSecurityService.generateMessage(authMessageKey),
      'Not Authorized'
    );
    $location.path('/');
  };

  $scope.togglePopover = function () {
    $scope.isPopoverOpen = true;
  };

  $scope.previewPdf = function (claim) {
    var internetexplorer, myWindow;
    var viewVsPreview = claim.Status === 1 ? 'Preview' : 'View';

    if (window.navigator.msSaveOrOpenBlob) {
      internetexplorer = true;
    } else {
      internetexplorer = false;
      myWindow = $window.open('');
      var claimorPred =
        claim.Type === 1 ? 'Claim for ' : 'Predetermination for ';
      var titleHtml =
        '<html><head><title>' +
        viewVsPreview +
        ' ' +
        claimorPred +
        claim.PatientName +
        '</title></head></html>';
      myWindow.document.write(titleHtml);
    }
    var fileURL;

    commonServices.Insurance.ClaimPdf(
      '_soarapi_/insurance/claims/pdf?claimCommondId=' + claim.ClaimId
    ).then(function (res) {
      var file = new Blob([res.data], {
        type: 'application/pdf',
      });

      if (internetexplorer) {
        window.navigator.msSaveOrOpenBlob(file, claim.PatientName + '.pdf');
      } else {
        fileURL = URL.createObjectURL(file);
        var pdfData = $sce.trustAsResourceUrl(fileURL);
        var html =
          '<html><head><title>View Claim for ' +
          claim.PatientName +
          "</title></head><body><iframe style='width:100%;height:100%;' src=" +
          fileURL +
          '></iframe></body></div></html>';
        myWindow.document.write(html);
        myWindow.document.close();
      }
      $scope.isPopoverOpen = false;
    });
  };

  $scope.openClaimNotes = function (claim, row) {
    $scope.isPopoverOpen = false;
    if (!_.isNull($scope.claim)) {
      ctrl.encounterToRefresh = row;
      accountNoteFactory.openClaimNoteModal(
        claim,
        $scope.patient.Data.PatientId,
        claim.LocationId,
        ctrl.refreshEncounterDetails
      );
    }
  };

  $scope.deleteInsurancePayment = function (row) {
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

  // adjustment & payment management
  $scope.applyAdjustment = function (encounter) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthCdtAdjAddKey)
    ) {
      ctrl.openPaymentAdjustmentModal(encounter, 1);
    } else {
      ctrl.notifyNotAuthorized(ctrl.soarAuthCdtAdjAddKey);
    }
  };

  $scope.applyPayment = function (encounter) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthActPmtAddKey)
    ) {
      ctrl.openPaymentAdjustmentModal(encounter, 2);
    } else {
      ctrl.notifyNotAuthorized(ctrl.soarAuthActPmtAddKey);
    }
  };

  ctrl.openPaymentAdjustmentModal = function (encounter, typeIndex) {
    if (!ctrl.applyingAdjustmentOrPayment) {
      if (
        !encounter.retrieved &&
        encounter.ObjectType !== 'PersonAccountNote'
      ) {
        accountSummaryFactory.getEncounterDetails(encounter).then(function () {
          ctrl.buildAndOpenModal(encounter, typeIndex);
        });
      } else {
        ctrl.buildAndOpenModal(encounter, typeIndex);
      }
    }
  };

  /**
   * Build and open modal.
   *
   * @param {*} encounter
   * @param {*} typeIndex
   * @returns {angular.IPromise<any>}
   */
  ctrl.buildAndOpenModal = function (encounter, typeIndex) {
    return ctrl
      .buildModalTransactions(encounter.serviceTransactions)
      .then(function (transactions) {
        ctrl.applyingAdjustmentOrPayment = true;
        ctrl.dataForModal = {
          PatientAccountDetails: {
            AccountId: $scope.patient.Data.PersonAccount
              ? $scope.patient.Data.PersonAccount.PersonAccountMember.AccountId
              : '',
            AccountMemberId: $scope.patient.Data.PersonAccount
              ? $scope.patient.Data.PersonAccount.PersonAccountMember
                  .AccountMemberId
              : '',
          },
          DefaultSelectedIndex: typeIndex,
          DefaultSelectedAccountMember: encounter.AccountMemberId,
          TransactionList: transactions,
          AllProviders: $scope.allProvidersList || [],
        };
        return modalDataFactory
          .GetTransactionModalData(ctrl.dataForModal, $routeParams.patientId)
          .then(ctrl.openAdjustmentModal);
      });
  };

  /**
   * Build modal transactions.
   *
   * @param {*} transactions
   * @returns {angular.IPromise<any>} Transactions
   */
  ctrl.buildModalTransactions = function (transactions) {
    return ctrl.getLocations().then(function (locations) {
      _.each(transactions, t => {
        var locationTmp = _.find(locations, { LocationId: t.LocationId });
        var locationTimezone = locationTmp
          ? _.escape(locationTmp.Timezone)
          : '';
        t.DateEntered = timeZoneFactory.ConvertDateToMomentTZ(
          t.Date,
          locationTimezone
        );
        t.ServiceTransactionId = t.ObjectId;
      });
      return transactions;
    });
  };

  ctrl.openAdjustmentModal = function (modalData) {
    modalFactory.TransactionModal(
      modalData,
      ctrl.modalResultOk,
      ctrl.modalResultCancel
    );
  };

  ctrl.modalResultOk = function () {
    $scope.refreshSummaryPageDataForGrid();
    ctrl.applyingAdjustmentOrPayment = false;
  };

  ctrl.modalResultCancel = function () {
    ctrl.applyingAdjustmentOrPayment = false;
  };
  // endregion
  var InvoiceOptions = {
    EncounterIds: [],
    IsCustomInvoice: true,
    IncludeFutureAppointments: true,
    IncludePreviousBalance: false,
    IncludeEstimatedInsurance: true,
    Note: '',
    InvoiceDetails: [],
  };
  $scope.viewInvoice = function (encounter) {
    var patientName =
      $scope.accountMembersOptionsTemp &&
      $scope.accountMembersOptionsTemp.length > 1
        ? encounter.PatientName + ' ' + localize.getLocalizedString('Account')
        : encounter.PatientName;
    patientInvoiceFactory
      .ViewEncounterInvoice(
        encounter.ObjectId,
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
              '<a>' + message + ' (' + clickHereText + ')</a>',
              button1Text
            )
            .then(function () {
              var patientId =
                $scope.patient.Data.PatientId == null
                  ? $routeParams.patientId
                  : $scope.patient.Data.PatientId;

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

  $scope.createCurrentInvoice = function (encounter) {
    var patientName =
      $scope.accountMembersOptionsTemp &&
      $scope.accountMembersOptionsTemp.length > 1
        ? encounter.PatientName + ' ' + localize.getLocalizedString('Account')
        : encounter.PatientName;

    var patientId =
      $scope.patient.Data.PatientId == null
        ? $routeParams.patientId
        : $scope.patient.Data.PatientId;
    patientInvoiceFactory.CreateCurrentInvoice(
      InvoiceOptions,
      encounter,
      patientName,
      patientId
    );
  };

  // DELETE
  $scope.deleteAccountSummaryRowDetail = function (
    accountSummaryRow,
    accountSummaryRowDetail
  ) {
    if (
      !_.isNil(accountSummaryRowDetail) &&
      _.isEqual(accountSummaryRowDetail.ObjectType, 'ServiceTransaction')
    ) {
      accountServiceTransactionFactory.deleteServiceTransaction(
        accountSummaryRowDetail.ObjectId,
        accountSummaryRowDetail.LocationId,
        accountSummaryRow.PersonId,
        $scope.refreshSummaryPageDataForGrid
      );
    } else if (
      _.isEqual(accountSummaryRow.ObjectType, 'DebitTransaction') &&
      _.isEqual(accountSummaryRowDetail.ObjectType, 'DebitTransaction') &&
      _.isEqual(accountSummaryRowDetail.TransactionTypeId, 5)
    ) {
      accountDebitTransactionFactory.deleteDebit(
        accountSummaryRowDetail.ObjectId,
        accountSummaryRowDetail.TransactionTypeId,
        $scope.refreshSummaryPageDataForGrid
      );
    } else {
      ctrl.getUserLocation().then(function () {
        var loggedInLocationId = parseInt(
          _.escape(ctrl.location.LocationId),
          10
        );
        accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
          accountSummaryRow,
          accountSummaryRowDetail,
          $scope.refreshSummaryPageDataForGrid,
          loggedInLocationId
        );
      });
    }
  };
  // END DELETE

  // region checkout - add, edit, checkout, checkout all, delete
  // determine navigation by development mode
  $scope.addNewEncounter = function (patientId, accountId) {
    let patientPath = '/Patient/';
    if (
      patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthEnctrAddKey)
    ) {
      if ($scope.patient.Data.IsPatient) {
        var path =
          patientPath +
          patientId +
          '/Account/' +
          accountId +
          '/EncountersCart/AccountSummary';
        $location.url(path);
      } else {
        var title = localize.getLocalizedString('Not a Patient');
        var message = localize.getLocalizedString(
          "This person is not a patient. Proceeding will change this person's status to a patient. Do you wish to continue?"
        );
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(function () {
            var path =
              patientPath +
              patientId +
              '/Account/' +
              accountId +
              '/EncountersCart/AccountSummary';
            $location.url(path);
          });
      }
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrAddKey);
    }
  };

  $scope.editEncounter = function (encounter) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthEnctrEditKey)
    ) {
      ctrl.setRouteParams(encounter, 'EncountersCart/AccountSummary');
      patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrEditKey);
    }
  };

  $scope.checkoutPendingEncounter = function (row, index) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthEnctrChkOutKey
      )
    ) {
      ctrl.setRouteParams(row, 'Checkout/AccountSummary');
      patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrChkOutKey);
    }
  };

  $scope.checkoutAllPendingEncounters = function () {
    if (
      patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthEnctrChkOutKey
      )
    ) {
      var params = {};
      params.$$locationId = $scope.PendingEncounters[0].$$locationId;
      params.ObjectId = null;
      if ($scope.checkoutAllIsAllowed) {
        ctrl.setRouteParams(params, 'Checkout/AccountSummary');
        patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
      }
    } else {
      ctrl.notifyNotAuthorized(angular.element($scope.soarAuthEnctrChkOutKey));
    }
  };

  ctrl.setRouteParams = function (row, route) {
    $routeParams.patientId = $scope.patientId;
    $routeParams.accountId = $scope.patient.Data.PersonAccount.AccountId;
    $routeParams.encounterId = row.ObjectId;
    $routeParams.route = route;
    $routeParams.location = row.$$locationId;

    var currentUserLocation = JSON.parse(
      sessionStorage.getItem('userLocation')
    );
    if (_.isEqual(row.$$locationId, currentUserLocation.id)) {
      $routeParams.overrideLocation = false;
    } else {
      $routeParams.overrideLocation = true;
    }
  };

  // end region checkout

  /**
   * Delete account payment or adjustment.
   *
   * @param {*} creditTransaction
   * @returns {angular.IPromise}
   */
  $scope.deleteAcctPaymentOrNegAdjustmentModal = function (creditTransaction) {
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

    creditTransaction.$$accountId = $scope.patient.Data.PersonAccount.AccountId;

    return ctrl.getUserLocation().then(async function (location) {
      creditTransaction.$$ispaymentGatewayEnabled =
        location.IsPaymentGatewayEnabled;
          accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
            creditTransaction,
            ctrl.allAccountPaymentTypes,
            $scope.refreshSummaryPageDataForGrid
          );
       
    });

  };

  // END region


  $scope.editAcctPaymentOrNegAdjustmentModal = function (detail) {
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
    detail.$$editMode = true;
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

  //region create claim
  $scope.createClaim = function (row) {
    var member = _.find($scope.accountMembersOptionsTemp, {
      accountMemberId: row.AccountMemberId,
    });
    row.EncounterId = row.ObjectId;
    var plans = ctrl.plans[member.personId];
    // method expects only ServiceTransactions
    var serviceTransactions = row.Items.filter(
      x => x.ObjectType === 'ServiceTransaction'
    );
    serviceTransactions.forEach(service => {
      service.DateEntered = service.Date;
    });
    // determine Option whether the user can choose not to not estimate when recreating a claim via Account Summary/Encounter/Create Claim
    var estimateInsuranceOption = true;
    if (plans && plans.length === 1) {
      ctrl.selectedPlan = plans[0];
      ctrl
        .calculateEstimatatedInsuranceOption(
          ctrl.selectedPlan,
          serviceTransactions
        )
        .then(function (res) {
          estimateInsuranceOption = res;
          patientServices.Claim.Create(
            {
              encounterId: row.ObjectId,
              calculateEstimatatedInsurance: estimateInsuranceOption,
              patientBenefitPlanId: plans[0].PatientBenefitPlanId,
            },
            {},
            ctrl.createClaimSuccess,
            ctrl.createClaimFailure
          );
        });
    } else {
      // use createClaimsModal to select plan
      modalFactory
        .CreateClaimsModal({
          Encounter: row,
          AccountMember: member,
          selectPlanOnly: true,
        })
        .then(function (res) {
          // filter for the correct plan
          ctrl.selectedPlan = plans.find(x => x.PatientBenefitPlanId === res);
          // patient may no longer have this plan in which case we stop execution
          if (ctrl.selectedPlan) {
            ctrl
              .calculateEstimatatedInsuranceOption(
                ctrl.selectedPlan,
                serviceTransactions
              )
              .then(function (res) {
                estimateInsuranceOption = res;
                patientServices.Claim.Create(
                  {
                    encounterId: row.ObjectId,
                    calculateEstimatatedInsurance: estimateInsuranceOption,
                    patientBenefitPlanId:
                      ctrl.selectedPlan.PatientBenefitPlanId,
                  },
                  {},
                  ctrl.checkAdjustment
                );
              });
          }
        });
    }
  };

  ctrl.createClaimSuccess = function () {
    toastrFactory.success(
      { Text: '{0} created successfully.', Params: ['Claim'] },
      'Success'
    );
    $scope.refreshSummaryPageDataForGrid();
  };

  ctrl.createClaimFailure = function () {
    toastrFactory.error(
      { Text: 'Failed to create {0}.', Params: ['Claim'] },
      'Error'
    );
    $scope.refreshSummaryPageDataForGrid();
  };

  ctrl.checkAdjustment = function (claim) {
    let createClaimRes = claim.Value;
    var plan = ctrl.selectedPlan;
    var benefitPlan = plan.PolicyHolderBenefitPlanDto.BenefitPlanDto;
    // if secondary insurance && plan adjusts off at time of charge we'll check if we need to ask about a write off
    if (
      plan.Priority === 1 &&
      benefitPlan.FeesIns === 2 &&
      benefitPlan.ApplyAdjustments === 1
    ) {
      claimsService.getClaimById(
        { claimId: createClaimRes[0].ClaimId },
        function (claimPaymentRes) {
          var needsAdjustment = _.find(
            claimPaymentRes.Value.ServiceTransactionToClaimPaymentDtos,
            function (service) {
              return service.AdjustedEstimate > 0;
            }
          )
            ? true
            : false;
          if (needsAdjustment) {
            var title = localize.getLocalizedString('Fee Schedule Present');
            var message = localize.getLocalizedString(
              "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?"
            );
            var button1Text = localize.getLocalizedString('Yes');
            var button2Text = localize.getLocalizedString('No');
            modalFactory
              .ConfirmModal(title, message, button1Text, button2Text)
              .then(
                ctrl.writeOffModal(claimPaymentRes.Value),
                $scope.refreshSummaryPageDataForGrid
              );
          } else {
            $scope.refreshSummaryPageDataForGrid();
          }
        }
      );
    } else {
      $scope.refreshSummaryPageDataForGrid();
    }
  };

  /**
   * Write-off modal.
   *
   * @param {*} claimPayment
   * @returns {angular.IPromise}
   */
  ctrl.writeOffModal = function (claimPayment) {
    return function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (providers) {
          if (!$scope.patient) {
            return;
          }
          var ids = _.map(
            claimPayment.ServiceTransactionToClaimPaymentDtos,
            'ServiceTransactionId'
          );
          var sum = _.sumBy(
            claimPayment.ServiceTransactionToClaimPaymentDtos,
            'AdjustedEstimate'
          );
          ctrl.dataForModal = {
            PatientAccountDetails: {
              AccountId: $scope.patient.Data.PersonAccount.AccountId,
            },
            DefaultSelectedIndex: 1,
            AllProviders: providers,
            BenefitPlanId: claimPayment.BenefitPlanId,
            claimAmount: 0,
            isFeeScheduleAdjustment: true,
            claimId: claimPayment.ClaimId,
            serviceTransactionData: {
              serviceTransactions: ids,
              isForCloseClaim: true,
              unPaidAmout: sum,
            },
            patientData: {
              patientId: claimPayment.PatientId,
              patientName: claimPayment.PatientName,
            },
          };
          modalDataFactory
            .GetTransactionModalData(ctrl.dataForModal, claimPayment.PatientId)
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
  //end region create claim

  //region account notes
  $scope.viewAccountNote = function (note) {
    $scope.mode = 'view';
    ctrl.showModalAccountNote(note);
  };

  $scope.editAccountNote = function (note) {
    $scope.mode = 'edit';
    ctrl.showModalAccountNote(note);
  };

  ctrl.showModalAccountNote = function (note) {
    accountNoteFactory.getAccountNote(note.ObjectIdLong).then(function (res) {
      $scope.personAccountNote = res.Value;
      ctrl.getPersonAccountMembers();
    });
  };

  ctrl.getPersonAccountMembers = function () {
    patientServices.Account.getAllAccountMembersByAccountId(
      {
        accountId: $scope.personAccountNote.AccountId,
      },
      ctrl.personAccountMemberSuccess,
      ctrl.personAccountMemberFailure
    );
  };

  /**
   * Person account member success callback.
   *
   * @param {*} res
   * @returns {angular.IPromise}
   */
  ctrl.personAccountMemberSuccess = function (res) {
    if ($scope.personAccountNote.NoteType === 2 && $scope.mode !== 'view') {
      return $q.resolve();
    }

    return ctrl.getLocations().then(function (locations) {
      $scope.locations = locations;
      $scope.accountMembers = res.Value;
      var locationTmp = _.find(locations, {
        LocationId: $scope.personAccountNote.LocationId,
      });
      var locationTimezone = locationTmp ? _.escape(locationTmp.Timezone) : '';
      $scope.personAccountNote.Date = timeZoneFactory.ConvertDateToMomentTZ(
        $scope.personAccountNote.DateEntered,
        locationTimezone
      );
      $scope.selectedPatientId = $scope.personAccountNote.PatientId;
      $scope.previewModal = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl:
          'App/Patient/components/createNote-modal/createNote-modal.html',
        controller: 'CreateNoteModalController',
        bindtoController: true,
        size: 'md',
        backdrop: 'static',
        keyboard: false,
        scope: $scope,
      });
    });
  };

  ctrl.personAccountMemberFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('Failed'),
      localize.getLocalizedString('Failed')
    );
  };

  $scope.deleteAccountNote = function (note) {
    note.Id = note.Id ? note.Id : note.PersonAccountNoteId;
    accountNoteFactory.deleteAccountNote(
      note.NoteType,
      note.Id,
      $scope.refreshSummaryPageDataForGrid
    );
  };

  $scope.viewEob = function (item, row) {
    if (!_.isNil(item)) {
      if (item.item.TransactionTypeId === 3) {
        if (!_.isEmpty(item.item.Claims)) {
          accountCreditTransactionFactory.viewEob(
            item.item.EraTransactionSetHeaderId,
            item.item.Claims[0].ClaimId,
            item.row.PersonId
          );
        }
      } else {
        accountNoteFactory.viewEob(
          item.item.EraTransactionSetHeaderId,
          item.item.ObjectIdLong,
          item.item.PersonId
        );
      }
    }
  };
  //end region notes

  // listener for showUnappliedModal, when positive adjustment made and user opts to 'Apply unapplied amounts to this adjustment'
  // a broadcast emits for this listener which triggers the adjustment modal to open
  ctrl.showUnappliedModalListener = $scope.$on(
    'showUnappliedModal',
    function () {
      $scope.$broadcast('showUnappliedModalPayment');
    }
  );

  $scope.$on('$destroy', function () {
    ctrl.showUnappliedModalListener();
  });

  $scope.editAccountSummaryRowDetail = function (item) {
    var accountSummaryRow = item.accountSummaryRow;
    var accountSummaryRowDetail = item.accountSummaryRowDetail;
    if (
      _.isEqual(accountSummaryRow.ObjectType, 'EncounterBo') &&
      _.isEqual(accountSummaryRowDetail.ObjectType, 'ServiceTransaction') &&
      _.isEqual(accountSummaryRowDetail.TransactionTypeId, 1)
    ) {
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        accountSummaryRow.ObjectId,
        accountSummaryRowDetail.ObjectId,
        accountSummaryRowDetail.LocationId,
        accountSummaryRow.PersonId,
        true,
        $scope.refreshSummaryPageDataForGrid,
        accountSummaryRowDetail.Claims
      );
    }

    if (
      _.isEqual(accountSummaryRow.ObjectType, 'DebitTransaction') &&
      _.isEqual(accountSummaryRowDetail.ObjectType, 'DebitTransaction') &&
      _.isEqual(accountSummaryRowDetail.TransactionTypeId, 5)
    ) {
      accountDebitTransactionFactory.viewOrEditDebit(
        accountSummaryRowDetail.ObjectId,
        accountSummaryRow.PersonId,
        true,
        $scope.refreshSummaryPageDataForGrid
      );
    }

    // TODO: handle other edit types
  };

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
PatientSummaryBetaMigrationController.prototype = Object.create(
  BaseCtrl.prototype
);
