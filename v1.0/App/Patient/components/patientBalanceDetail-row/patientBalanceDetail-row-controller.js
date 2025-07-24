'use strict';
angular.module('Soar.Patient').controller('PatientBalanceDetailRowController', [
  '$scope',
  '$rootScope',
  'localize',
  'ListHelper',
  'ModalFactory',
  'ModalDataFactory',
  'PatientServices',
  '$filter',
  'toastrFactory',
  '$routeParams',
  'patSecurityService',
  '$location',
  'ShareData',
  'UserServices',
  'FinancialService',
  'UsersFactory',
  'PatientDocumentsFactory',
  '$uibModal',
  'referenceDataService',
  'PatCacheFactory',
  'userSettingsDataService',
  function (
    $scope,
    $rootScope,
    localize,
    listHelper,
    modalFactory,
    modalDataFactory,
    patientServices,
    $filter,
    toastrFactory,
    $routeParams,
    patSecurityService,
    $location,
    shareData,
    userServices,
    financialService,
    usersFactory,
    patientDocumentsFactory,
    $uibModal,
    referenceDataService,
    patCacheFactory,
    userSettingsDataService
  ) {
    var ctrl = this;
    $scope.singleAccountMember = true;
    $scope.showTotalBalance = true;
    $scope.locations = [];
    $scope.accountMembersOptions = [];

    // #region AMFA Authorization

    $scope.hasAmfaAuthAccess = false;
    $scope.soarAuthAddAccountPaymentKey = 'soar-acct-aapmt-add';
    $scope.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
    $scope.soarAuthAddDebitTransactionKey = 'soar-acct-dbttrx-add';
    ctrl.soarAuthInsPaymentViewKey = 'soar-acct-aipmt-view';
    $scope.soarAuthInsPaymentAddKey = 'soar-acct-aipmt-add';
    $scope.soarAuthAcctStmtAddKey = 'soar-acct-astmt-add';
    $scope.hasPatientInsurancePaymentViewAccess = false;

    // graph data container
    $scope.graphData = {
      moreThanThirtyBalance: 0,
      moreThanSixtyBalance: 0,
      moreThanNintyBalance: 0,
      currentBalance: 0,
      chartHeight: 110,
    };

    // Check view access for Insurance Payment view
    ctrl.authPatientInsurancePaymentViewAccess = function () {
      $scope.hasPatientInsurancePaymentViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthInsPaymentViewKey
      );
      $scope.disableLink = !$scope.hasPatientInsurancePaymentViewAccess;
    };

    // validate apply insurance payment link
    ctrl.authPatientInsurancePaymentViewAccess();

    // Check if logged in user has view access to this page
    ctrl.authAddAccountPaymentAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthAddAccountPaymentKey
      );
    };

    ctrl.authAddCreditTransactionAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthAddCreditAdjustmentKey
      );
    };

    ctrl.authAccess = function () {
      if (ctrl.authAddCreditTransactionAccess()) {
        $scope.hasAmfaAuthAccess = true;
      }
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function (authMessageKey) {
      toastrFactory.error(
        patSecurityService.generateMessage(authMessageKey),
        'Not Authorized'
      );
      //Below line is commented as it is not required for now.
      //$location.path('/');
    };

    // authorization
    //Below line is commented as it is not required for now.
    //ctrl.authAccess();
    // #endregion

    ctrl.getCurrentPatientById = function (patientServices, patientId) {
      return patientServices.Patients.get({ Id: patientId }).$promise;
    };

    ctrl.checkCollection = function () {
      ctrl
        .getCurrentPatientById(patientServices, $routeParams.patientId)
        .then(function (res) {
          var patient = res.Value;
          $scope.receivable = patient.PersonAccount.InCollection;
        });
    };

    var initialized = false;
    $scope.$watch('data', function (newVal, oldVal) {
      const newAccountId =
        newVal && newVal.currentPatient && newVal.currentPatient.AccountId
          ? newVal.currentPatient.AccountId
          : null;
      const oldAccountId =
        oldVal && oldVal.currentPatient && oldVal.currentPatient.AccountId
          ? oldVal.currentPatient.AccountId
          : null;
      if (
        newAccountId &&
        (!oldAccountId || newAccountId !== oldAccountId || !initialized)
      ) {
        ctrl.updateBalanceDetailRow();
        initialized = true;
      }
    });

    //Reload account members detail
    ctrl.updateBalanceDetailRow = function (updateData) {
      if (!$scope.data) {
        return;
      }
      $scope.calculatingBalance = true;
      patientServices.Account.getAccountMembersDetailByAccountId(
        {
          accountId: $scope.data.currentPatient.AccountId,
        },
        ctrl.getAllAccountMembersSuccess,
        ctrl.getAllAccountMembersFailure
      );
      if (updateData) {
        //Refresh the parent page contents
        if (typeof $scope.refreshTransactionHistory == 'function') {
          $scope.refreshTransactionHistory();
        }
        if (typeof $scope.refreshSummaryPage == 'function') {
          $scope.refreshSummaryPage();
        }
      }
    };

    ctrl.checkResposiblePartySuccess = function (res) {
      $scope.filterPatient = $filter('filter')(
        res.Value,
        { PatientId: $routeParams.patientId },
        true
      )[0];
      $scope.responsiblePerson = $filter('filter')(
        res.Value,
        { IsResponsiblePerson: true },
        true
      )[0];

      if (
        $scope.filterPatient.IsActive &&
        !$scope.filterPatient.IsResponsiblePerson
      )
        return ($scope.nonRP = true);
      else {
        return ($scope.nonRP = false);
      }
    };
    ctrl.checkResposiblePartFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve. Refresh the page to try again'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.checkIsResponsibleparty = function () {
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: $scope.data.currentPatient.AccountId,
        },
        ctrl.checkResposiblePartySuccess,
        ctrl.checkResposiblePartFailure
      );
    };

    // gets all the providers
    $scope.getPracticeProviders = function () {
      if (shareData.allProviders && shareData.allProviders.length > 0) {
        $scope.userServicesGetSuccess({ Value: shareData.allProviders });
      } else {
        $scope.loadingProviders = true;
        usersFactory
          .Users()
          .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
      }
    };

    $scope.userServicesGetSuccess = function (res) {
      $scope.loadingProviders = false;
      $scope.providers = [];
      $scope.allProvidersList = res.Value;
      var filterdValue = res.Value.filter(function (f) {
        // Provider Types - Dentist, Hygienist, Assistant & Other
        if (f.ProviderTypeId) {
          return (
            f.ProviderTypeId == 1 ||
            f.ProviderTypeId == 2 ||
            f.ProviderTypeId == 3 ||
            f.ProviderTypeId == 5
          );
        }
        return false;
      });
      angular.forEach(filterdValue, function (f) {
        $scope.providers.push({
          Name: f.FirstName + ' ' + f.LastName,
          FirstName: f.FirstName,
          LastName: f.LastName,
          ProfessionalDesignation: f.ProfessionalDesignation,
          IsActive: f.IsActive,
          ProviderId: f.UserId,
          UserCode: f.UserCode,
          ProviderTypeId: f.ProviderTypeId,
        });
      });
      $scope.providers = $filter('orderBy')($scope.providers, 'Name');
    };

    $scope.userServicesGetFailure = function () {
      $scope.loadingProviders = false;
      $scope.providers = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again',
          ['providers']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.getPracticeProviders();
    //$scope.checkIsResponsibleparty();

    ctrl.getAllAccountMembersSuccess = function (successResponse) {
      if (successResponse.Value) {
        ctrl.allAccountMembersBalance = successResponse.Value;
        ctrl.calculateBalance();
        $scope.loadBalanceSummary();
      } else {
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            'getting all account members',
          ]),
          localize.getLocalizedString('Server Error')
        );
      }
    };

    ctrl.getAllAccountMembersFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };

    // Function to open patient payment modal
    $scope.openPatientPaymentModal = function () {
      if (ctrl.authAddAccountPaymentAccess()) {
        // Disable encounter expanding functionality
        $rootScope.transactionToSearchEncounter = null;

        if (!$scope.alreadyApplyingPayment) {
          $scope.alreadyApplyingPayment = true;
          ctrl.dataForModal = {
            PatientAccountDetails: $scope.data.currentPatient,
            DefaultSelectedIndex: 2,
            DefaultSelectedAccountMember: '0',
            AllProviders: $scope.allProvidersList,
            ResponsiblePerson: $scope.responsiblePerson,
          };

          modalDataFactory
            .GetTransactionModalData(ctrl.dataForModal, $routeParams.patientId)
            .then(ctrl.openModal);
        }
      } else {
        ctrl.notifyNotAuthorized($scope.soarAuthAddAccountPaymentKey);
      }
    };

    $scope.showInsuranceEstimate = true;
    $scope.showAdjustedEstimate = true;

    // Calculate the total balance for an account member
    ctrl.calculateBalance = function (selecteMemberIds, dontCalc) {
      $scope.calculatingBalance = true;

      $scope.showInsuranceEstimate = true;
      $scope.showAdjustedEstimate = true;
      $scope.totalBalance = 0;
      $scope.totalPatientPortion = 0;
      $scope.totalInsurance = 0;
      $scope.selectedMemberBalance = 0;
      $scope.selectedMemberInsurance = 0;
      $scope.selectedMemberPatientPortion = 0;

      $scope.totalAdjustedEstimate = 0;
      $scope.selectedMemeberAdjustedEstimate = 0;

      if (
        ctrl.allAccountMembersBalance &&
        !dontCalc &&
        (angular.isDefined($scope.selectedPatientId) ||
          angular.isDefined(selecteMemberIds))
      ) {
        $scope.singleAccountMember =
          ctrl.allAccountMembersBalance.length > 1 ? false : true;
        var accountmemberIds = selecteMemberIds || $scope.selectedPatientId;
        var balances = financialService.calculateAccountAndInsuranceBalances(
          ctrl.allAccountMembersBalance,
          accountmemberIds
        );
        $scope.selectedMemberBalance = balances.SelectedMemberBalance;
        $scope.selectedMemberInsurance = balances.SelectedMemberInsurance;
        $scope.selectedMemberPatientPortion =
          balances.SelectedMemberPatientPortion;
        $scope.totalBalance = balances.TotalBalance;
        $scope.totalInsurance = balances.TotalInsurance;
        $scope.totalPatientPortion = balances.TotalPatientPortion;

        $scope.selectedMemberAdjustedEstimate =
          balances.SelectedMemberAdjustedEstimate;
        $scope.totalAdjustedEstimate = balances.TotalAdjustedEstimate;

        var selectedMemberZeroBalance =
          angular.isUndefined($scope.selectedMemberInsurance) ||
          $scope.selectedMemberInsurance == 0 ||
          $scope.selectedMemberInsurance == '';

        var totalInsuranceZeroBalance =
          angular.isUndefined($scope.totalInsurance) ||
          $scope.totalInsurance == 0 ||
          $scope.totalInsurance == '';

        var totalAdjustedEstimateZeroBalance =
          angular.isUndefined($scope.totalAdjustedEstimate) ||
          $scope.totalAdjustedEstimate == 0 ||
          $scope.totalAdjustedEstimate == '';

        if (selectedMemberZeroBalance || totalInsuranceZeroBalance) {
          // Don't do this check unless a zero balance estimated insurance value exists
          if (
            angular.isDefined($scope.selectedPatientId) &&
            $scope.selectedPatientId != '0'
          ) {
            // We have multiple account members and one of them is selected or it's a single account member
            var selectedPatientIds =
              Array === $scope.selectedPatientId.constructor
                ? $scope.selectedPatientId[0]
                : $scope.selectedPatientId;
            if ($scope.singleAccountMember) {
              // Only one person on the account
              financialService
                .CheckForPatientBenefitPlan(selectedPatientIds)
                .then(function (response) {
                  // This should be receiving a true/false value from financial service instead. Will refactor later.
                  if (
                    !(response && response.Value && response.Value.length > 0)
                  ) {
                    // No benefit plan
                    if (!totalInsuranceZeroBalance) {
                      // If they have an estimated insurance value, we still need to show the value
                      $scope.showInsuranceEstimate = true;
                    } else {
                      // No plan and no estimated insurance outstanding
                      $scope.showInsuranceEstimate = false;
                    }
                    if (!totalAdjustedEstimateZeroBalance) {
                      $scope.showAdjustedEstimate = true;
                    } else {
                      $scope.showAdjustedEstimate = false;
                    }
                  }
                });
            } else {
              if (selectedMemberZeroBalance) {
                // No estimated insurance value for selected member
                financialService
                  .CheckForPatientBenefitPlan(selectedPatientIds)
                  .then(function (response) {
                    // This should be receiving a true/false value from financial service instead. Will refactor later.
                    $scope.showInsuranceEstimate =
                      response && response.Value && response.Value.length > 0;
                    $scope.showAdjustedEstimate =
                      response && response.Value && response.Value.length > 0;
                  });
              } else {
                // There is an estimated insurance balance, so show the value
                $scope.showInsuranceEstimate = true;
                $scope.showAdjustedEstimate = true;
              }
            }
          } else {
            // We have multiple account members, but no one is selected in the dropdown
            if (
              ctrl.allAccountMembersBalance[0] &&
              ctrl.allAccountMembersBalance[0].AccountId
            ) {
              patientServices.PatientBenefitPlan.hasPatientBenefitPlansByAccountId(
                {
                  accountId: ctrl.allAccountMembersBalance[0].AccountId,
                },
                function (res) {
                  if (res.Value) {
                    // If anyone on the account has a benefit plan, show the value
                    $scope.showInsuranceEstimate = true;
                    $scope.showAdjustedEstimate = true;
                  } else {
                    // No account member has a benefit plan
                    if (!totalInsuranceZeroBalance) {
                      // There is an insurance estimate total for the account, so show the value
                      $scope.showInsuranceEstimate = true;
                    } else {
                      // No estimated insurance at all for the account, so hide the value
                      $scope.showInsuranceEstimate = false;
                    }
                    if (!totalAdjustedEstimateZeroBalance) {
                      $scope.showAdjustedEstimate = true;
                    } else {
                      $scope.showAdjustedEstimate = false;
                    }
                  }
                },
                function (err) {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Failed to retrieve {0}. Please try again.',
                      ['patient benefit plans']
                    ),
                    'Error'
                  );
                }
              );
            }
          }
        }
      }

      $scope.calculatingBalance = false;
    };

    // Watch the getLatestDetails and if true then get updated values from server.
    $scope.$watch('getLatestDetails', function (nv, ov) {
      if (nv != ov && nv == true) {
        ctrl.updateBalanceDetailRow(true);
        $scope.loadBalanceSummary();
        $scope.getLatestDetails = false;
      }
    });

    //Call function to reset DD when clicked on All Account Members link
    $scope.resetDataToAll = function () {
      $scope.resetData();
    };

    // Function to open patient adjustment modal
    $scope.openAdjustmentModal = function () {
      if (ctrl.authAddCreditTransactionAccess()) {
        // Disable encounter expanding functionality
        $rootScope.transactionToSearchEncounter = null;

        if (
          !$scope.alreadyApplyingAdjustment &&
          $scope.data &&
          $scope.data.currentPatient
        ) {
          $scope.alreadyApplyingAdjustment = true;
          ctrl.dataForModal = {
            PatientAccountDetails: $scope.data.currentPatient,
            DefaultSelectedIndex: 1,
            DefaultSelectedAccountMember: '0',
            AllProviders: $scope.allProvidersList,
          };

          modalDataFactory
            .GetTransactionModalData(ctrl.dataForModal, $routeParams.patientId)
            .then(ctrl.openModal);
        }
      } else {
        ctrl.notifyNotAuthorized($scope.soarAuthAddCreditAdjustmentKey);
      }
    };

    //Handle Ok callback from adjustment dialog
    ctrl.openAdjustmentModalResultOk = function (res) {
      ctrl.updateBalanceDetailRow(true);
      if ($scope.alreadyApplyingAdjustment)
        $scope.alreadyApplyingAdjustment = false;
      else $scope.alreadyApplyingPayment = false;

      if (res.showUnappliedModal) {
        $scope.$emit('showUnappliedModal');
      }
    };

    //Handle Cancel callback from adjustment dialog
    ctrl.openAdjustmentModalResultCancel = function () {
      if ($scope.alreadyApplyingAdjustment)
        $scope.alreadyApplyingAdjustment = false;
      else $scope.alreadyApplyingPayment = false;
    };

    //Function to open adjustment modal
    ctrl.openModal = function (transactionModalData) {
      ctrl.dataForModal = transactionModalData;
      modalFactory.TransactionModal(
        ctrl.dataForModal,
        ctrl.openAdjustmentModalResultOk,
        ctrl.openAdjustmentModalResultCancel
      );
    };

    // set balances and load graph data on UI
    $scope.loadBalanceSummary = function (
      modifier,
      selectedMembersBalance,
      selectedMemberId
    ) {
      $scope.selectedGraphModifier = modifier;
      var allAccountMembersBalance =
        selectedMembersBalance || ctrl.allAccountMembersBalance;
      var selectedPatientId = selectedMemberId || $scope.selectedPatientId;
      $scope.graphData = financialService.CalculateAccountAgingGraphData(
        allAccountMembersBalance,
        selectedPatientId,
        modifier
      );
    };

    // reload graph on filtering account members
    $scope.$watchGroup(
      ['data', 'filteredAccountMembers'],
      function (nv, ov) {
        const newAccountId =
          nv[0] && nv[0].currentPatient && nv[0].currentPatient.AccountId
            ? nv[0].currentPatient.AccountId
            : null;
        if (
          !angular.equals(nv[1], ov[1]) &&
          nv != null &&
          newAccountId !== null
        ) {
          ctrl.selectedFilteredmembers = nv[1];
          patientServices.Account.getAccountMembersDetailByAccountId(
            {
              accountId: newAccountId,
            },
            ctrl.getFilteredAccountMembersSuccess,
            ctrl.getAllAccountMembersFailure
          );
        }
      },
      true
    );

    //recompute balance if Filters are retained
    //ctrl.isBalanceRecompute = false;
    $scope.$on('recomputeBalance', function (events, args) {
      if (args) {
        ctrl.isBalanceRecompute = true;
        ctrl.selectedFilteredmembers = $scope.filteredAccountMembers;
        patientServices.Account.getAccountMembersDetailByAccountId(
          {
            accountId: $scope.data.currentPatient.AccountId,
          },
          ctrl.getFilteredAccountMembersSuccess,
          ctrl.getAllAccountMembersFailure
        );
      }
    });

    ctrl.getFilteredAccountMembersSuccess = function (successResponse) {
      if (successResponse.Value) {
        var allAccountMembersBalance = successResponse.Value.filter(function (
          accountMemberBalance
        ) {
          return (
            ctrl.selectedFilteredmembers.indexOf(
              accountMemberBalance.AccountMemberId
            ) !== -1
          );
        });

        var selectedMemberIds = allAccountMembersBalance.map(function (
          selectedMember
        ) {
          return selectedMember.AccountMemberId;
        });
        //if (ctrl.isBalanceRecompute) {
        //    selectedMemberIds = $scope.filteredAccountMembers;
        //    ctrl.isBalanceRecompute = false;
        //}
        $scope.showTotalBalance = true;
        var modifier; // pass it as undefiend as its not required
        var dontCalc = undefined;
        $scope.loadBalanceSummary(modifier, allAccountMembersBalance, '0');
        if (ctrl.selectedFilteredmembers[0] == '0') {
          $scope.showTotalBalance = true;
          selectedMemberIds = '0';
        } else if (ctrl.selectedFilteredmembers.length === 1) {
          selectedMemberIds = selectedMemberIds[0];
          $scope.showTotalBalance = false;
        } else if (ctrl.selectedFilteredmembers.length === 0) {
          selectedMemberIds = undefined;
          dontCalc = true;
          $scope.showTotalBalance = true;
        } else if (ctrl.selectedFilteredmembers.length > 1) {
          $scope.showTotalBalance = false;
        }
        ctrl.calculateBalance(selectedMemberIds, dontCalc);
      } else {
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            'getting all account members',
          ]),
          localize.getLocalizedString('Server Error')
        );
      }
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

    // Apply patient insurance payment
    $scope.applyPatientInsurancePayment = function () {
      var tabName = ctrl.getTabNameFromParam();
      let patientPath = 'Patient/';
      var prevLocation = tabName === '' ? 'Account Summary' : tabName;
      $location.path(
        _.escape(
          patientPath +
            $routeParams.patientId +
            '/Account/' +
            $scope.data.currentPatient.AccountId +
            '/SelectClaims/' +
            prevLocation
        )
      );
    };

    $scope.openTab = function () {
      var path =
        '/BusinessCenter/Receivables/Statements/' +
        '?accountId=' +
        $scope.data.currentPatient.AccountId;
      $location.url(_.escape(path));
    };

    //#region uploading docs

    //
    $scope.uploadFile = function () {
      patientDocumentsFactory.selectedFilter = 'Account';
      $scope.openDocUploader();
    };

    $scope.onUpLoadSuccess = function (doc) {
      $scope.docCtrls.close();
    };

    $scope.onUpLoadCancel = function () {
      $scope.docCtrls.close();
    };

    $scope.patientId = $routeParams.patientId;
    $scope.openDocUploader = function () {
      $scope.docCtrls.content(
        '<doc-uploader [patient-id]="patientId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '20%',
          left: '35%',
        },
        minWidth: 300,
        scrollable: false,
        iframe: false,
        actions: ['Close'],
        title: localize.getLocalizedString('Upload a document'),
        modal: true,
      });
      $scope.docCtrls.open();
    };
    $scope.createNoteModal = function () {
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: $scope.data.currentPatient.AccountId,
        },
        ctrl.personAcountMemberAccountnoteSuccess
      );
    };

    /**
     * Success callback
     *
     * @param {*} res
     * @returns {angular.IPromise}
     */
    ctrl.personAcountMemberAccountnoteSuccess = function (res) {
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          $scope.locations = locations;
          $scope.accountMembers = res.Value;
          $scope.currentPatientId = $routeParams.patientId;
          $scope.mode = 'add';
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
            windowClass: 'createNote-modal',
          });
        });
    };

    $scope.transferAccount = function () {
      var tabName = ctrl.getTabNameFromParam();
      var prevLocation = tabName === '' ? 'Account Summary' : tabName;
      let patientPath = 'Patient/';

      $location.path(
        _.escape(
          patientPath +
            $routeParams.patientId +
            '/Account/' +
            $scope.data.currentPatient.AccountId +
            '/TransferAccount/' +
            prevLocation
        )
      );

      //$scope.currentPatientId = $routeParams.patientId;
      //$scope.currentPatient = $scope.filterPatient;
      //$scope.refreshSummaryPage = $scope.refreshSummaryPage;
      //$scope.previewModal = $uibModal.open({
      //    animation: true,
      //    ariaLabelledBy: 'modal-title',
      //    ariaDescribedBy: 'modal-body',
      //    templateUrl: 'App/Patient/components/transferAccount-modal/transferAccount-modal.html',
      //    controller: 'TransferAccountModalController',
      //    bindtoController: true,
      //    size: 'md',
      //    backdrop: 'static',
      //    keyboard: false,
      //    scope: $scope,
      //    windowClass: 'createNote-modal',
      //});
    };

    $scope.updateAccountInCollections = function (receivable) {
      if (receivable === true) {
        modalFactory
          .ConfirmModal(
            'Remove from Collections',
            'Are you sure you want to remove this account from collections?',
            'Yes',
            'No'
          )
          .then(function () {
            patientServices.Account.updateAccountInCollections({
              personAccountId: $scope.data.currentPatient.AccountId,
              inCollection: false,
            }).$promise.then(function () {
              ctrl.updateAccountInCollectionsSuccess(true);
            }, ctrl.updateAccountInCollectionsFailure);
          });
      } else {
        modalFactory
          .ConfirmModal(
            'Place into Collections',
            'By placing the account into collections, the account will be set to not receive statements and any unprocessed statements will be removed.\n\nAre you sure you want to place this account into collections?',
            'OK',
            'Cancel'
          )
          .then(function () {
            patientServices.Account.updateAccountInCollections({
              personAccountId: $scope.data.currentPatient.AccountId,
              inCollection: true,
            }).$promise.then(function () {
              ctrl.updateAccountInCollectionsSuccess(false);
            }, ctrl.updateAccountInCollectionsFailure);
          });
      }
    };

    ctrl.updateAccountInCollectionsSuccess = function (inCollections) {
      patCacheFactory.ClearCache(patCacheFactory.GetCache('PatientServices'));
      patCacheFactory.ClearCache(patCacheFactory.GetCache('PatientAccount'));
      patCacheFactory.ClearCache(patCacheFactory.GetCache('AccountMembers'));
      patCacheFactory.ClearCache(
        patCacheFactory.GetCache('patientOverviewCache')
      );

      if (inCollections) {
        toastrFactory.success('Account removed from collections.', 'Success');
      } else {
        toastrFactory.success('Account placed in collections.', 'Success');
      }
      if (angular.isDefined($scope.$parent.refreshSummaryPageDataForGrid))
        $scope.$parent.refreshSummaryPageDataForGrid();

      if (angular.isDefined($scope.$parent.refreshTransactionHistoryPageData))
        $scope.$parent.refreshTransactionHistoryPageData();

      $scope.receivable = !inCollections;
      $rootScope.$broadcast('updatePatientStatus', !inCollections);
    };

    ctrl.updateAccountInCollectionsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to update account',
          localize.getLocalizedString('Server Error')
        )
      );
    };

    $scope.$on('updatePatientCollectionStatus', function (events, args) {
      $scope.receivable = args;
      if (angular.isDefined($scope.$parent.refreshSummaryPageDataForGrid))
        $scope.$parent.refreshSummaryPageDataForGrid();
    });

    ctrl.checkCollection();
    //#endregion
  },
]);
