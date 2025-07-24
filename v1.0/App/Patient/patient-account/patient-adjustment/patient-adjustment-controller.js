'use strict';
var app = angular.module('Soar.Patient');
app.controller('PatientAdjustmentController', [
  '$sce',
  '$scope',
  '$rootScope',
  '$uibModalInstance',
  '$timeout',
  '$filter',
  '$q',
  'toastrFactory',
  'ModalFactory',
  'ListHelper',
  'localize',
  'PatientServices',
  'DataForModal',
  '$location',
  'patSecurityService',
  'SaveStates',
  'ShareData',
  'ClaimsService',
  'BusinessCenterServices',
  'PaymentGatewayFactory',
  'PaymentGatewayService',
  'tabLauncher',
  '$window',
  '$uibModal',
  'FinancialService',
  'referenceDataService',
  'UserServices',
  'TimeZoneFactory',
  'WaitOverlayService',
  'userSettingsDataService',
  'StaticData',
  PatientAdjustmentController,
]);
function PatientAdjustmentController(
  $sce,
  $scope,
  $rootScope,
  $uibModalInstance,
  $timeout,
  $filter,
  $q,
  toastrFactory,
  modalFactory,
  listHelper,
  localize,
  patientServices,
  dataForModal,
  $location,
  patSecurityService,
  saveStates,
  shareData,
  claimsService,
  businessCenterServices,
  paymentGatewayFactory,
  paymentGatewayService,
  tabLauncher,
  $window,
  $uibModal,
  financialService,
  referenceDataService,
  userServices,
  timeZoneFactory,
  waitOverlayService,
  userSettingsDataService,
  staticData
) {
  BaseCtrl.call(this, $scope, 'PatientAdjustmentController');
  //#region Member Variables And Default Initialization

  var ctrl = this;
  ctrl.patientAccountInfo = dataForModal.PatientAccountDetails;
  ctrl.acctMembers = dataForModal.AccountMembersDetail;
  ctrl.responsiblePerson = dataForModal.ResponsiblePerson;
  // Set flag if performing adjustment on unapplied amount transaction
  $scope.isAdjustmentOnUnappliedAmount =
    dataForModal.IsAdjustmentOnUnappliedAmount;
  // Set flag if changing adjustment or payment transaction
  $scope.isChangingAdjustmentOrPayment =
    dataForModal.IsChangingAdjustmentOrPayment;
  // Set flag if only preparing data for adjustment and not applying it
  $scope.isPrepareDataAction = dataForModal.OnlyPrepareAdjustmentData
    ? dataForModal.OnlyPrepareAdjustmentData
    : false;
  // Set existingAdjustmentData if already adjusted data is passed in dataForModal
  $scope.existingAdjustmentData = dataForModal.NegativeAdjustmentData
    ? dataForModal.NegativeAdjustmentData
    : null;
  $scope.currentAccountMemberId = 0;
  $scope.showAccountMemeberOption = false;
  $scope.isForCloseClaim = false;
  $scope.printReceiptAfterCheckout = false;
  $scope.applyUnappliedAfterCheckout = false;
  $scope.applyingAdjustment = false;
  $scope.amountFocused = { disableApply: false };
  $scope.isReadonly = false;
  $scope.paypageRedirectEventSubscription = null;
  if (
    dataForModal.IsView &&
    dataForModal.UnappliedTransactions &&
    dataForModal.UnappliedTransactions.length > 0 &&
    dataForModal.UnappliedTransactions[0].IsFeeScheduleWriteOff
  )
    $scope.isReadonly = true;
  ctrl.waitOverlay = null;

  ctrl.locations = undefined;
  $scope.PaymentProviders = staticData.PaymentProviders();
  $scope.payPageUrl = undefined;
  $scope.showPayPageModal  = false;
  $scope.modalLoading = false;

  
  $scope.ChargeType ={
    Sale : 1,
    Purchase : 2,
    Refund : 3,
    Credit : 4
  }
  $scope.GatewayAccountType ={
    None : 0,
    Pin :2,
    CashBenefit : 3,
    FoodStamp : 4
 }
  $scope. GatewayTransactionType ={
  CreditCard : 1,
  DebitCard : 2,
  Interactive : 3
 }
 $scope.PaymentCategory ={
  Encounter:0,
  AccountPayment:1
 }
 $scope.transactionInformation = null;
  staticData.CurrencyTypes().then((res) => ctrl.loadCurrencyTypes(res));

  ctrl.loadCurrencyTypes = function (res) {
    if (res && res.Value) {
      $scope.CurrencyTypes = _.reduce(
        res.Value, function(accu, ct) {
          const key = ct.Name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
          return { ...accu, [key]: ct.Id};
        }, {});
    }
    $scope.CurrencyTypes = $scope.CurrencyTypes || {};
  };

  $window.addEventListener('beforeunload', function(event) {
    $scope.preventRefreshPage(event);
  });
  $scope.preventRefreshPage = function(event) {
    if ($scope.showPayPageModal) {
      event.preventDefault();

      // Adding a listener for the 'unload' event
      $window.addEventListener('unload', function() {
        sessionStorage.removeItem('isPaypageModalOpen');
      });

      // Return to prevent the page unload behavior
      return;
    }
  };



    // Create an Observable-like event callback
  $scope.paypageRedirectEvent = function(callback) {
      const eventListener = (event) => {
          callback(event);
      };
      $window.addEventListener('paypageRedirectCallback', eventListener);

      // Return a subscription object
      return {
          unsubscribe: function() {
              $window.removeEventListener('paypageRedirectCallback', eventListener);
          }
      };
  };

  $scope.clearPaypageModal = function() {
    $scope.showPayPageModal = false;
    sessionStorage.removeItem('isPaypageModalOpen');
  }
      // Example usage
  $scope.init = function() {
    $rootScope.$broadcast('patient-adj-modal-open', true);
        $scope.paypageRedirectEventSubscription = $scope.paypageRedirectEvent((event) => {
          if($scope.showPayPageModal){
          $scope.clearPaypageModal();
          paymentGatewayService.completeCreditTransaction($scope.transactionInformation ,1, ctrl.handlePartialPayment, $scope.cardTransactionOnErrorCallback);
          }
        });
  };


 $scope.$on('$destroy', function() {
  $rootScope.$broadcast('patient-adj-modal-open', false);
    if ($scope.paypageRedirectEventSubscription) {
        $scope.paypageRedirectEventSubscription.unsubscribe();
    }
 });

 $scope.init();

  // Watch for changes in showPayPageModal
   $scope.$watch('showPayPageModal', function(newValue, oldValue) {
    if (newValue) {  // Only do this when the modal is shown
      $timeout(function() {
        const embedElement = document.querySelector('.paypage');
        if (embedElement) {
          embedElement.addEventListener('load', function() {
            $scope.modalLoading = false; // Hide the loader
            $scope.$apply(); // Ensure AngularJS updates the view
          });
        }
      }, 0); // Delay to ensure the DOM has updated
    }
  });
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

  ctrl.userLocation = undefined;

  /**
   * Gets user's location.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getUserLocation = () => {
    if (ctrl.userLocation) {
      return $q.resolve(ctrl.userLocation);
    }
    return ctrl.getLocations().then(function (locations) {
      var userLocationId = JSON.parse(sessionStorage.getItem('userLocation'));
      ctrl.userLocation = _.find(locations, { LocationId: userLocationId.id });
      return ctrl.userLocation;
    });
  };

  if (
    dataForModal &&
    dataForModal.serviceTransactionData &&
    dataForModal.serviceTransactionData.isForCloseClaim
  ) {
    $scope.isForCloseClaim =
      dataForModal.serviceTransactionData.isForCloseClaim;
  }

  $scope.isLess = function (amt1, amt2) {
    return amt1 < amt2;
  };

  // set default negative adjustment type if closing claim
  ctrl.setDefaultNegativeAdjType = function () {
    return businessCenterServices.BenefitPlan.get({
      BenefitId: dataForModal.BenefitPlanId,
    }).$promise.then(
      function (res) {
        ctrl.getBenefitPlanSuccess(res);
      },
      function () {
        ctrl.getBenefitPlanFailure();
      }
    );
  };

  ctrl.getBenefitPlanSuccess = function (response) {
    if (response.Value.AdjustmentTypeId !== null)
      $scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId =
        response.Value.AdjustmentTypeId;
  };

  ctrl.getBenefitPlanFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('Failed to retrieve claims benefit plan'),
      localize.getLocalizedString('Error')
    );
  };

  //0: Positive Adjustment
  //1: Negative Adjustment
  //2: Account Payment
  //3: Fee Schedule Adjustment
  ctrl.defaultSelectedOptionIndex = dataForModal.DefaultSelectedIndex;

  // set default account-member
  ctrl.defaultSelectedAccountMemberId =
    dataForModal.DefaultSelectedAccountMember;

  //#region Authorization
  ctrl.soarAuthAddAccountPaymentKey = 'soar-acct-aapmt-add';
  ctrl.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
  ctrl.soarAuthAddDebitTransactionKey = 'soar-acct-dbttrx-add';
  $scope.soarAuthPaymentOrAdjustmentAccessKey = '';
  $scope.disableApplyButton = true;

  $scope.accountDetails = dataForModal.PatientAccountDetails;
  $scope.defaultAccountMemberOptionIndex = 0;
  $scope.accountMembersOptions = [];
  // Check if logged in user has view access to this page
  ctrl.authAddAccountPaymentAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthAddAccountPaymentKey
    );
  };

  ctrl.authAddCreditTransactionAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthAddCreditAdjustmentKey
    );
  };

  ctrl.authAddDebitTransactionAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      ctrl.soarAuthAddDebitTransactionKey
    );
  };

  //Notify user, he is not authorized to access current area
  ctrl.notifyNotAuthorized = function (authMessageKey) {
    toastrFactory.error(
      patSecurityService.generateMessage(authMessageKey),
      'Not Authorized'
    );
    $location.path('/');
  };

  ctrl.authAccess = function (selectedOption) {
    switch (selectedOption) {
      //0: Positive Adjustment
      case 0:
        if (!ctrl.authAddDebitTransactionAccess()) {
          ctrl.notifyNotAuthorized(ctrl.soarAuthAddDebitTransactionKey);
        }

        $scope.soarAuthPaymentOrAdjustmentAccessKey =
          ctrl.soarAuthAddDebitTransactionKey;

        break;
      //1: Negative Adjustment
      case 1:
        if (!ctrl.authAddCreditTransactionAccess()) {
          ctrl.notifyNotAuthorized(ctrl.soarAuthAddCreditAdjustmentKey);
        }

        $scope.soarAuthPaymentOrAdjustmentAccessKey =
          ctrl.soarAuthAddCreditAdjustmentKey;

        break;
      //2: Account Payment
      case 2:
        if (!ctrl.authAddAccountPaymentAccess()) {
          ctrl.notifyNotAuthorized(ctrl.soarAuthAddAccountPaymentKey);
        }

        $scope.soarAuthPaymentOrAdjustmentAccessKey =
          ctrl.soarAuthAddAccountPaymentKey;

        break;
      //Default negative adjustment
      default:
        if (!ctrl.authAddCreditTransactionAccess()) {
          ctrl.notifyNotAuthorized(ctrl.soarAuthAddCreditAdjustmentKey);
        }

        $scope.soarAuthPaymentOrAdjustmentAccessKey =
          ctrl.soarAuthAddCreditAdjustmentKey;
    }
  };

  // authorization
  ctrl.authAccess(ctrl.defaultSelectedOptionIndex);

  //get the account members
  //this can be remove....
  ctrl.getAllAccountMembersSuccess = function (successResponse) {
    if (successResponse.Value) {
      ctrl.getAllAccountMembers(successResponse);
    } else {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members',
        ]),
        localize.getLocalizedString('Server Error')
      );
    }
  };

  //Error handler for get all account member service
  ctrl.getAllAccountMembersFailure = function () {
    ctrl.AccountMembersDetail = null;
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting all account members',
      ]),
      localize.getLocalizedString('Error')
    );
  };

  // this can be remove..
  ctrl.getAllAccountMembers = function (successResponse) {
    if (successResponse) ctrl.AccountMembersDetail = successResponse.Value;
    if ($scope.accountDetails) {
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: ctrl.patientAccountInfo.AccountId,
        },
        ctrl.getAccountMembersSuccess,
        ctrl.getAccountMembersFailure
      );
    }
  };
  ctrl.getAllAccountMemberDetails = function () {
    patientServices.Account.getAccountMembersDetailByAccountId(
      { accountId: ctrl.patientAccountInfo.AccountId },
      function (successResponse) {
        if (successResponse) ctrl.AccountMembersDetail = successResponse.Value;
        if ($scope.accountDetails) {
          patientServices.Account.getAllAccountMembersByAccountId(
            {
              accountId: ctrl.patientAccountInfo.AccountId,
            },
            ctrl.getAccountMembersSuccess,
            ctrl.getAccountMembersFailure
          );
        }
      },
      function () {
        ctrl.AccountMembersDetail = null;
      }
    );
  };

  // #endregion

  // Search and set Account Member in Account Members drop-down list
  ctrl.setAccountMemberOptionData = function () {
    $scope.accountMembersOptions = $scope.accountMembersOptionsTemp
      ? $scope.accountMembersOptionsTemp
      : $scope.accountMembersOptions;
    var defaultSelectionIndex = -1;

    //selecting accountmember in dropdown having the current claim for which we are applying negative adjustment
    if (
      dataForModal.patientData &&
      dataForModal.patientData.patientId &&
      $scope.isForCloseClaim
    ) {
      var selectedMemberOption = _.find(
        $scope.accountMembersOptions,
        function (option) {
          return option.personId === dataForModal.patientData.patientId;
        }
      );

      if (selectedMemberOption !== undefined || selectedMemberOption != null) {
        ctrl.defaultSelectedAccountMemberId =
          selectedMemberOption.accountMemberId;
      }
    }

    if (ctrl.defaultSelectedAccountMemberId) {
      defaultSelectionIndex = listHelper.findIndexByFieldValue(
        $scope.accountMembersOptions,
        'accountMemberId',
        ctrl.defaultSelectedAccountMemberId
      );
    }
    var itemIndex = defaultSelectionIndex > -1 ? defaultSelectionIndex : 0;

    //for case: all account we need to select 0 index, for case: single member without all account we need 0 index too.
    if ($scope.currentPatientId > '') {
      var personIndex = listHelper.findIndexByFieldValue(
        $scope.accountMembersOptions,
        'personId',
        $scope.currentPatientId
      );

      itemIndex = personIndex > -1 ? personIndex : itemIndex;
    }

    if (
      $scope.accountMembersOptions != null &&
      $scope.accountMembersOptions.length > 0
    ) {
      $scope.defaultAccountMemberOptionIndex = itemIndex;
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
      $scope.currentPatientId =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].personId;
    }
  };

  ctrl.getPatient = function (patientId) {
    patientServices.Patients.get(
      { Id: patientId },
      function (res) {
        var patient = res.Value;
        ctrl.responsiblePerson = patient;
      },
      function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the {0}. Please try again.',
            ['patient']
          ),
          'Error'
        );
      }
    );
  };

  ctrl.initializeAccountMembers = function () {
    var rpId;

    if (
      !$scope.accountMembersOptions &&
      $scope.accountMembersOptions.length > 0
    )
      return true;

    if (
      $scope.accountMembersOptionsTemp != undefined ||
      shareData.accountMembersDetail != undefined
    ) {
      $scope.accountMembersOptionsTemp = shareData.accountMembersDetail;
    } else {
      ctrl.getAccountMembersSuccess(ctrl.acctMembers);
      ctrl.setAccountMemberOptionData();

      return true;
    }

    // Search and set Account Member in Account Members list on startup
    ctrl.setAccountMemberOptionData();

    angular.forEach($scope.accountMembersOptions, function (accountMember) {
      if (
        accountMember.responsiblePersonId == accountMember.personId &&
        accountMember.responsiblePersonId != 0
      ) {
        rpId = accountMember.personId;
      }
    });

    ctrl.getPatient(rpId);
  };

  $scope.paymentTypes = dataForModal.PaymentTypes.Value;
  // If it is not adjustment on unapplied amount then set required data-sets
  if (
    !$scope.isAdjustmentOnUnappliedAmount &&
    !$scope.isChangingAdjustmentOrPayment
  ) {
    $scope.adjustmentTypes = dataForModal.AdjustmentTypes.Value;
    $scope.filteredAdjustmentTypes = $filter('getPositiveAdjustmentTypes')(
      angular.copy($scope.adjustmentTypes),
      false
    );

    $scope.providers = dataForModal.AllProviders;
    ctrl.getAllAccountMemberDetails();

    $scope.showAccountMemeberOption =
      $scope.accountMembersOptions.length === 1 ? false : true;

    if ($scope.accountMembersOptions && $scope.accountMembersOptions.length > 0)
      var itemIndex = 0;
    //for case: all account we need to select 0 index, for case: single member without all account we need 0 index too.
    if ($scope.currentPatientId > '') {
      var personIndex = listHelper.findIndexByFieldValue(
        $scope.accountMembersOptions,
        'personId',
        $scope.currentPatientId
      );

      itemIndex = personIndex > -1 ? personIndex : itemIndex;
    }

    if (
      $scope.accountMembersOptions != null &&
      $scope.accountMembersOptions.length > 0
    ) {
      $scope.defaultAccountMemberOptionIndex = itemIndex;
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
      $scope.currentPatientId =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].personId;
    }
  }

  ctrl.patientInfo = dataForModal.CurrentPatient.Value;
  $scope.isInCollection =
    dataForModal.CurrentPatient.Value.PersonAccount.InCollection;
  ctrl.preferredName = ctrl.patientInfo.PreferredName
    ? '(' + ctrl.patientInfo.PreferredName + ')'
    : '';
  ctrl.middleName = ctrl.patientInfo.MiddleName
    ? ctrl.patientInfo.MiddleName.charAt(0) + '.'
    : '';
  $scope.patientName = [
    ctrl.patientInfo.FirstName,
    ctrl.preferredName,
    ctrl.patientInfo.LastName,
  ]
    .filter(function (text) {
      return text;
    })
    .join(' ');

  ctrl.dataHasChanged = false;
  $scope.negativeAdjustmentType = 2;
  $scope.serviceAndDebitTransactionDtos = [];
  ctrl.serviceAndDebitTransactionDtos = [];
  // flag to disable/enable operation type selector DD
  $scope.disableOperationTypeSelectorDD = false;
  // flag to disable/enable account member selector DD
  $scope.disableAccountMemberSelectorDD = false;

  // Get the service transactions in this list
  $scope.serviceTransactions = [];

  // Get the debit transactions in this list
  $scope.debitTransactions = [];

  ctrl.dateToday = new Date();

  /**
   * Gets current display date.
   *
   * @returns {angular.IPromise<any>}
   */
  ctrl.getDisplayDate = () => {
    if (ctrl.displayDate) {
      return $q.resolve(ctrl.displayDate);
    }
    return ctrl.getUserLocation().then(function (userLocation) {
      const locationTimezone = userLocation ? userLocation.Timezone : '';
      ctrl.displayDate = timeZoneFactory.ConvertDateToMomentTZ(
        ctrl.dateToday,
        locationTimezone
      );
      return ctrl.displayDate;
    });
  };

  var localizedStrings = {
    ApplyAn: localize.getLocalizedString('Apply an'),
    ApplyA: localize.getLocalizedString('Apply a'),
  };

  //#endregion

  //#region DTO Initialization

  /**
   * Set transaction DTO.
   *
   * @returns {angular.IPromise}
   */
  ctrl.setTransactionDto = function () {
    return $q
      .all({
        userLocation: ctrl.getUserLocation(),
        displayDate: ctrl.getDisplayDate(),
      })
      .then(function (results) {
        //Credit transaction object
        $scope.creditTransactionDto = {
          CreditTransactionId: '00000000-0000-0000-0000-000000000000',
          // current location id
          LocationId: sessionStorage['userLocation']
            ? JSON.parse(sessionStorage.getItem('userLocation')).id
            : 0,
          // This should have some valid account id, If not payment will not get added.
          AccountId: ctrl.patientInfo.PersonAccount.AccountId,
          AdjustmentTypeId: null,
          Amount: $scope.isForCloseClaim
            ? dataForModal.serviceTransactionData.unPaidAmout
            : dataForModal.claimAmount != null
            ? dataForModal.claimAmount
            : 0.0,
          ClaimId: null,
          DateEntered: ctrl.dateToday,
          $$DateEntered: results.displayDate,
          ValidDate: true,
          Description: null,
          // PromptTitle property is used at client side only. This property is used to display payment type prompt label on UI.
          PromptTitle: null,
          // user's patient-id
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          // Set note if allowed amount was changed during checkout
          Note: dataForModal.note ? dataForModal.note : '',
          PaymentTypeId: null,
          // Allowed transaction type id's are 2 - Account Payment, 3 - Insurance Payment, 4 - Negative Adjustment.
          TransactionTypeId: 4,
          CreditTransactionDetails: [],
          PaymentTypePromptValue: null,
          // Set default adjustment distribution strategy
          AssignedAdjustmentTypeId:
            $scope.isAdjustmentOnUnappliedAmount ||
            $scope.isChangingAdjustmentOrPayment
              ? 2
              : 1,
        };

        //Debit transaction object
        $scope.debitTransactionDto = {
          DebitTransactionId: '00000000-0000-0000-0000-000000000000',
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          LocationId: sessionStorage['userLocation']
            ? JSON.parse(sessionStorage.getItem('userLocation')).id
            : 0,
          AdjustmentTypeId: null,
          EncounterId: null,
          Amount: 0.0,
          DateEntered: ctrl.dateToday,
          $$DateEntered: results.displayDate,
          ValidDate: true,
          Description: '',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Note: '',
          TransactionTypeId: 5,
          ProviderUserId: null,
          location: results.userLocation,
        };

        // take backup
        ctrl.initialCreditTransactionDto = angular.copy(
          $scope.creditTransactionDto
        );
        ctrl.initialDebitTransactionDto = angular.copy(
          $scope.debitTransactionDto
        );
      });
  };

  //#endregion

  //#region Set data for Credit & Debit transaction directives

  // Initialize data for credit transaction
  ctrl.setCreditTransactionData = function () {
    if ($scope.existingAdjustmentData == null) {
      $scope.dataForCreditTransaction = {
        PatientInfo: ctrl.patientInfo,
        PaymentTypes: $scope.paymentTypes,
        AdjustmentTypes: $scope.filteredAdjustmentTypes,
        Providers: dataForModal.AllProviders,
        CreditTransactionDto: angular.copy($scope.creditTransactionDto),
        UnassignedAmount: 0,
        ServiceAndDebitTransactionDtos: [],
        SelectedAdjustmentTypeIndex: ctrl.defaultSelectedOptionIndex,
        ErrorFlags: {
          hasError: false,
          providerMissing: false,
        },
        IsTransactionOnEncounter: false,
        IsAdjustmentOnUnappliedAmount: $scope.isAdjustmentOnUnappliedAmount,
        IsChangingAdjustmentOrPayment: $scope.isChangingAdjustmentOrPayment,
        EncounterId: null,
        UnappliedTransaction: ctrl.currentUnappliedTransaction
          ? ctrl.currentUnappliedTransaction
          : {},
        HasUnappliedAmountAdjusted: false,
        HasValidationError: false,
        amountFocused: $scope.amountFocused,
        IsFeeScheduleAdjustment: dataForModal.isFeeScheduleAdjustment,
        BenefitPlan: dataForModal.BenefitPlan,
        IsView: $scope.isReadonly,
        selectedCardReader:angular.copy($scope.selectedCardReader),
        showPaymentProvider:angular.copy($scope.showPaymentProvider),
        cardReaders:angular.copy($scope.cardReaders),
      };
    } else {
      $scope.dataForCreditTransaction = angular.copy(
        $scope.existingAdjustmentData
      );
      // Set flag to denote negative-adjustment edit action from checkout screen
      $scope.dataForCreditTransaction.IsEditOperation = true;
      $scope.dataForCreditTransaction.IsView = $scope.isReadonly;
      // take backup
      ctrl.initialCreditTransactionDto = angular.copy(
        $scope.dataForCreditTransaction.CreditTransactionDto
      );
    }

    if ($scope.isForCloseClaim) {
      return ctrl.setDefaultNegativeAdjType();
    }
    return $q.resolve();
  };

  // Initialize data for debit transaction
  ctrl.setDebitTransactionData = function () {
    $scope.dataForDebitTransaction = {
      PatientInfo: ctrl.patientInfo,
      AdjustmentTypes: $scope.filteredAdjustmentTypes,
      Providers: dataForModal.AllProviders,
      DebitTransactionDto: $scope.debitTransactionDto,
      ErrorFlags: {
        hasError: false,
      },
      paymentProviderSupportsIndependentRefunds: false,
    }
  };

  //#endregion

  //#region Initialization of Static Drop-downs And Default Values Selection

  // Options for apply screen
  $scope.adjustmentTypeOptions = [
    {
      name: localize.getLocalizedString('{0} Adjustment', ['Positive (+)']),
    },
    {
      name: localize.getLocalizedString('{0} Adjustment', ['Negative (-)']),
    },
    {
      name: localize.getLocalizedString('Account Payment'),
    },
    //{
    //    name: localize.getLocalizedString('Fee Schedule Adjustment')
    //}
  ];

  $scope.showAdjType = function (index) {
    var show = true;
    switch (index) {
      case 0:
        if ($scope.isForCloseClaim) {
          show = false;
        }
        break;
      case 3:
        if ($scope.isForCloseClaim) {
          show = false;
        }
        break;
    }
    return show;
  };

  $scope.selectedAdjustmentType = $scope.adjustmentTypeOptions[
    ctrl.defaultSelectedOptionIndex
  ]
    ? $scope.adjustmentTypeOptions[ctrl.defaultSelectedOptionIndex].name
    : '';
  $scope.selectedAdjustmentTypeIndex = ctrl.defaultSelectedOptionIndex;
  $scope.defaultAdjustmentTypeOptionIndex = 1;
  if ($scope.selectedAdjustmentTypeIndex === 2) {
    $scope.applyLabelText = localizedStrings.ApplyAn;
  }

  //#endregion

  //#region Merge Service Transactions And Positive Adjustments

  // Callback handler to handle success from service transaction service
  ctrl.getServiceTransactionsByAccountMemberIdSuccess = function (
    successResponse
  ) {
    $scope.serviceTransactions = [];
    var serviceTransactionIds = dataForModal.serviceTransactionData
      ? dataForModal.serviceTransactionData.serviceTransactions
      : null;
    //filter out zero balance service transactions
    angular.forEach(successResponse.Value, function (transaction) {
      if (!transaction.IsDeleted) {
        if ($scope.isForCloseClaim && serviceTransactionIds) {
          if (
            serviceTransactionIds.indexOf(transaction.ServiceTransactionId) > -1
          ) {
            transaction.IsForClosingClaim = true;
            $scope.serviceTransactions.push(transaction);
          }
        } else {
          $scope.serviceTransactions.push(transaction);
        }
      }
    });
  };

  // Callback handler to handle failure from service transaction service
  ctrl.getServiceTransactionsByAccountMemberIdFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting service transactions',
      ]),
      localize.getLocalizedString('Server Error')
    );
    $scope.serviceTransactions = [];
  };

  // Callback handler to handle success from debit transaction service
  ctrl.getDebitTransactionsByAccountMemberIdSuccess = function (
    successResponse
  ) {
    $scope.debitTransactions = [];
    //filter out zero balance positive adjustments
    angular.forEach(successResponse.Value, function (transaction) {
      if (
        transaction.TransactionTypeId === 5 ||
        transaction.TransactionTypeId === 6
      ) {
        $scope.debitTransactions.push(transaction);
      }
    });
  };

  // Callback handler to handle failure from debit transaction service
  ctrl.getDebitTransactionsByAccountMemberIdFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting debit transactions',
      ]),
      localize.getLocalizedString('Server Error')
    );
    $scope.debitTransactions = [];
  };

  //Process service transaction data
  ctrl.processServiceTransactionData = function () {
    var index = 0;
    var patientDetail = null;
    //Set patient name for service transactions, set AdjustmentAmount to 0, set UnixTimeStamp with unix time-stamp (consider date from DateEntered)
    angular.forEach($scope.serviceAndDebitTransactionDtos, function (service) {
      service.AllAccountMembersSelected = true;
      service.PatientName = '';
      if (
        dataForModal.AccountMembersList &&
        dataForModal.AccountMembersList.Value &&
        dataForModal.AccountMembersList.Value.length > 0
      ) {
        var accountMember = listHelper.findItemByFieldValue(
          dataForModal.AccountMembersList.Value,
          'AccountMemberId',
          service.AccountMemberId
        );
        if (accountMember) {
          patientDetail = listHelper.findItemByFieldValue(
            dataForModal.AccountMembersDetail.Value,
            'PatientId',
            accountMember.PersonId
          );
          if (patientDetail) {
            service.PatientName =
              [patientDetail.FirstName, patientDetail.LastName.charAt(0)]
                .filter(function (text) {
                  return text;
                })
                .join(' ') + '.';
          }
        }
      }

      // If the data was not passed into the modal, try to get it from share data.
      if (
        (service.PatientName === null ||
          service.PatientName === undefined ||
          service.PatientName === '') &&
        shareData.accountMembersDetail &&
        shareData.accountMembersDetail.length > 0
      ) {
        patientDetail = listHelper.findItemByFieldValue(
          shareData.accountMembersDetail,
          'accountMemberId',
          service.AccountMemberId
        );
        if (patientDetail) {
          service.PatientName = patientDetail.displayName;
        }
      }

      service.AdjustmentAmount = service.AdjustmentAmount
        ? service.AdjustmentAmount
        : 0;
      service.UnixTimeStamp = moment(
        new Date(moment(service.DateEntered).format('MM/DD/YYYY'))
      ).unix();
      // below property is used in credit-transaction-controller for search and compare purpose.
      service.RecordIndex = index;
      index++;
    });

    // Change ordering of the transactions.
    $scope.serviceAndDebitTransactionDtos = $filter(
      'orderBy'
    )($scope.serviceAndDebitTransactionDtos, ['UnixTimeStamp', 'Balance']);
    if ($scope.serviceAndDebitTransactionDtos) {
      $scope.serviceAndDebitTransactionDtos = $scope.serviceAndDebitTransactionDtos.filter(
        function (serviceTransaction) {
          return !serviceTransaction.IsDeleted;
        }
      );
    } else {
      $scope.serviceAndDebitTransactionDtos = [];
    }
  };

  // logic to push transaction on display as per flags and work flow
  ctrl.buildTransactionForDisplay = function (
    transaction,
    isServiceTransaction
  ) {
    var prop = isServiceTransaction
      ? 'AppliedToServiceTransationId'
      : 'AppliedToDebitTransactionId';
    var id = isServiceTransaction
      ? transaction.ServiceTransactionId
      : transaction.DebitTransactionId;
    var creditTransactionDetails;
    var totalAmountPaid;
    if ($scope.isForCloseClaim) {
      ctrl.serviceAndDebitTransactionDtos.push(transaction);
    } else {
      if (transaction.Balance > 0) {
        if ($scope.isChangingAdjustmentOrPayment) {
          var modifiedTransaction = angular.copy(transaction);
          creditTransactionDetails = listHelper.findItemsByFieldValue(
            ctrl.currentUnappliedTransaction.CreditTransactionDetails,
            prop,
            id
          );
          if (creditTransactionDetails) {
            totalAmountPaid = creditTransactionDetails.reduce(function (
              total,
              currentRecord
            ) {
              return total + -currentRecord['Amount'];
            },
            0);
            modifiedTransaction.AdjustmentAmount = totalAmountPaid
              ? totalAmountPaid
              : 0;
            modifiedTransaction.Balance = parseFloat(
              (
                modifiedTransaction.Balance +
                modifiedTransaction.AdjustmentAmount
              ).toFixed(2)
            );
            modifiedTransaction.TotalUnpaidBalance +=
              modifiedTransaction.AdjustmentAmount;
            ctrl.serviceAndDebitTransactionDtos.push(modifiedTransaction);
          } else {
            ctrl.serviceAndDebitTransactionDtos.push(modifiedTransaction);
          }
        } else {
          ctrl.serviceAndDebitTransactionDtos.push(transaction);
        }
      } else {
        if ($scope.isChangingAdjustmentOrPayment) {
          var updatedTransaction = angular.copy(transaction);
          creditTransactionDetails = listHelper.findItemsByFieldValue(
            ctrl.currentUnappliedTransaction.CreditTransactionDetails,
            prop,
            id
          );
          if (creditTransactionDetails) {
            totalAmountPaid = creditTransactionDetails.reduce(function (
              total,
              currentRecord
            ) {
              return total + -currentRecord['Amount'];
            },
            0);

            updatedTransaction.AdjustmentAmount = totalAmountPaid
              ? totalAmountPaid
              : 0;
            updatedTransaction.Balance =
              updatedTransaction.Balance + updatedTransaction.AdjustmentAmount;
            updatedTransaction.TotalUnpaidBalance +=
              updatedTransaction.AdjustmentAmount;
            ctrl.serviceAndDebitTransactionDtos.push(updatedTransaction);
          }
        }
      }
    }
  };

  /**
   * Merge service transactions and debit transactions for distribution.
   *
   * @returns {angular.IPromise}
   */
  ctrl.mergeServiceTransactionsAndDebitTransaction = function () {
    return ctrl.getLocations().then(function (locations) {
      ctrl.serviceAndDebitTransactionDtos = [];
      var deferred = $q.defer();
      if (!dataForModal.TransactionList) {
        angular.forEach($scope.serviceTransactions, function (transaction) {
          ctrl.buildTransactionForDisplay(transaction, true);
        });

        // set amount to fee for debit transactions
        $scope.debitTransactions = $scope.debitTransactions.map(function (
          transaction
        ) {
          var objectState = { ObjectState: 'None' };
          var fee = { Fee: angular.copy(transaction.Amount) };
          return angular.extend(transaction, fee, objectState);
        });

        angular.forEach($scope.debitTransactions, function (transaction) {
          ctrl.buildTransactionForDisplay(transaction, false);
        });

        // If adjustment on unapplied amount then set the correct credit-transaction dto and sync data with credit-transaction directive
        if (
          $scope.isAdjustmentOnUnappliedAmount ||
          $scope.isChangingAdjustmentOrPayment
        ) {
          $scope.creditTransactionDto = angular.copy(
            ctrl.currentUnappliedTransaction
          );
          ctrl.initialCreditTransactionDto = angular.copy(
            $scope.creditTransactionDto
          );
          deferred.resolve(ctrl.setCreditTransactionData());
        } else {
          deferred.resolve();
        }
      } else {
        angular.forEach(dataForModal.TransactionList, function (transaction) {
          if (transaction.Balance > 0) {
            ctrl.serviceAndDebitTransactionDtos.push(transaction);
          }
        });
        $scope.disableOperationTypeSelectorDD = true;
        $scope.disableAccountMemberSelectorDD = true;
        $scope.dataForCreditTransaction.IsTransactionOnEncounter = true;
        $scope.dataForCreditTransaction.EncounterId =
          dataForModal.TransactionList[0].EncounterId;

        deferred.resolve();
      }

      return deferred.promise.then(function () {
        //set display date after converting to location timezone
        _.each(ctrl.serviceAndDebitTransactionDtos, function (transaction) {
          var locationTmp = _.find(locations, {
            LocationId: transaction.LocationId,
          });
          let locationTimezone = locationTmp ? locationTmp.Timezone : '';
          transaction.displayDate = timeZoneFactory
            .ConvertDateToMomentTZ(transaction.DateEntered, locationTimezone)
            .format('MM/DD/YYYY');
        });
        $scope.serviceAndDebitTransactionDtos =
          ctrl.serviceAndDebitTransactionDtos;
        //process service transaction dtos
        ctrl.processServiceTransactionData();

        //If editing existing distribution (clicking on negative-adjustment row from checkout-flow) then set the old distributed amount.
        if ($scope.existingAdjustmentData) {
          angular.forEach(
            $scope.serviceAndDebitTransactionDtos,
            function (service) {
              var creditTransactionDetails = listHelper.findItemsByFieldValue(
                $scope.existingAdjustmentData.CreditTransactionDto
                  .CreditTransactionDetails,
                'AppliedToServiceTransationId',
                service.ServiceTransactionId
              );
              if (creditTransactionDetails) {
                var totalAmountPaid = creditTransactionDetails.reduce(function (
                  total,
                  currentRecord
                ) {
                  return total + currentRecord['Amount'];
                },
                0);

                service.AdjustmentAmount = totalAmountPaid;
              }
            }
          );
        }

        //take backup of original service and debit transaction list
        ctrl.initialServiceAndDebitTransactionDtos = angular.copy(
          $scope.serviceAndDebitTransactionDtos
        );

        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = angular.copy(
          $scope.serviceAndDebitTransactionDtos
        );
      });
    });
  };

  //#endregion

  //#region Global Location Change

  // global location change
  $scope.$on('patCore:initlocation', function () {
    ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
    if (
      $scope.dataForCreditTransaction &&
      $scope.dataForCreditTransaction.CreditTransactionDto
    ) {
      $scope.dataForCreditTransaction.CreditTransactionDto.LocationId =
        ctrl.location.id;
    }

    if (
      $scope.dataForDebitTransaction &&
      $scope.dataForDebitTransaction.DebitTransactionDto
    ) {
      $scope.dataForDebitTransaction.DebitTransactionDto.LocationId =
        ctrl.location.id;
    }
  });

  //#endregion

  //#region Adjustment Types Dropdown

  /**
   * click event handler for adjustment type selector dropdown
   * @param {*} option
   * @returns {angular.IPromise}
   */
  $scope.adjustmentTypeOptionClicked = function (option) {
    const deferred = $q.defer();

    $scope.negativeAdjustmentType = 2;
    // set to default values if option is invalid
    if (!option) {
      option =
        $scope.adjustmentTypeOptions[$scope.defaultAdjustmentTypeOptionIndex];
      $scope.selectedAdjustmentType =
        $scope.adjustmentTypeOptions[
          $scope.defaultAdjustmentTypeOptionIndex
        ].name;
      $scope.selectedAdjustmentTypeIndex =
        $scope.defaultAdjustmentTypeOptionIndex;
    }
    // set the type of adjustment to be applied
    $scope.selectedAdjustmentType = option.name;

    var selectedTypeIndex = listHelper.findIndexByFieldValue(
      $scope.adjustmentTypeOptions,
      'name',
      option.name
    );
    if (selectedTypeIndex !== $scope.selectedAdjustmentTypeIndex) {
      const innerDeferred = $q.defer();

      // Authorization check
      ctrl.authAccess(selectedTypeIndex);

      if (selectedTypeIndex === 0) {
        $scope.debitTransactionDto = angular.copy(
          ctrl.initialDebitTransactionDto
        );
        $scope.filteredAdjustmentTypes = $filter('getPositiveAdjustmentTypes')(
          angular.copy($scope.adjustmentTypes),
          true
        );
        $scope.applyLabelText = localizedStrings.ApplyA;
        $scope.showAccountMemeberOption = false;
        ctrl
          .setTransactionDto()
          .then(function () {
            ctrl.setDebitTransactionData();
            innerDeferred.resolve();
          })
          .catch(function (error) {
            innerDeferred.reject(error);
          });
      } else {
        if (selectedTypeIndex === 1) {
          $scope.applyLabelText = localizedStrings.ApplyA;
          $scope.filteredAdjustmentTypes = $filter(
            'getPositiveAdjustmentTypes'
          )(angular.copy($scope.adjustmentTypes), false);
          $scope.showAccountMemeberOption = true;
        } else if (selectedTypeIndex === 2) {
          $scope.applyLabelText = localizedStrings.ApplyAn;
          $scope.showAccountMemeberOption = true;
        }
        ctrl
          .setTransactionDto()
          .then(function () {
            return ctrl.setCreditTransactionData();
          })
          .then(function () {
            $scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = selectedTypeIndex;
            $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId = null;
            if ($scope.currentAccountMemberId == 0) {
              $scope.AllAccountMembersSelected = true;
              $scope.serviceAndDebitTransactionDtos = angular.copy(
                ctrl.initialServiceAndDebitTransactionDtos
              );
              ctrl.setSelectedAccountMember(
                $scope.serviceAndDebitTransactionDtos,
                true
              );
              $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = angular.copy(
                $scope.serviceAndDebitTransactionDtos
              );
            } else {
              $scope.serviceAndDebitTransactionDtos = listHelper.findItemsByFieldValue(
                ctrl.initialServiceAndDebitTransactionDtos,
                'AccountMemberId',
                $scope.currentAccountMemberId
              );
              ctrl.setSelectedAccountMember(
                $scope.serviceAndDebitTransactionDtos,
                false
              );
              $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = angular.copy(
                $scope.serviceAndDebitTransactionDtos
              );
            }
            angular
              .element('#inpTotalAmount')
              .val($filter('currency')(0, '$', 2));
            innerDeferred.resolve();
            $timeout(function () {
              angular.element('#inpNegativeAdjustmentAmount').focus();
            }, 500);
          })
          .catch(function (error) {
            innerDeferred.reject(error);
          });
      }

      innerDeferred.promise
        .then(function () {
          deferred.resolve();
          $timeout(function () {
            $scope.selectedAdjustmentTypeIndex = selectedTypeIndex;
            ctrl.dataHasChanged = false;
          }, 300);
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    } else {
      deferred.resolve();
    }

    return deferred.promise.then(() => {
      // Close the adjustment type selector drop down
      angular.element('#divAdjustmentTypeSelector').removeClass('open');
    });
  };

  //#endregion

  //#region Apply Debit And Credit Transactions

  // prepare credit transaction detail dtos
  ctrl.prepareCreditTransactionDetailList = function () {
    var creditTransactionDetails = [];
    angular.forEach(
      $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
      function (serviceTransactionDetail) {
        if (
          serviceTransactionDetail.AdjustmentAmount &&
          serviceTransactionDetail.AdjustmentAmount !== 0
        ) {
          var creditTransactionDetail = ctrl.createNewCreditTransactionDetailRecord(
            serviceTransactionDetail
          );
          creditTransactionDetails.push(creditTransactionDetail);
        }
      }
    );
    if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
      var isCreatingNewCreditTransaction = true;
      var unappliedCreditTransactionDetail = ctrl.createNewUnappliedCreditTransactionDetailRecord(
        isCreatingNewCreditTransaction
      );

      creditTransactionDetails.push(unappliedCreditTransactionDetail);
    }
    return creditTransactionDetails;
  };

  ctrl.prepareUnappliedCreditTransactionDetailListForApplying = function () {
    var existingDetails = _.filter(
      $scope.dataForCreditTransaction.CreditTransactionDto
        .CreditTransactionDetails,
      { IsDeleted: false }
    );
    //handle applieds
    _.each(
      $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
      function (serviceOrDebit) {
        if (serviceOrDebit.AdjustmentAmount > 0) {
          var creditTransactionDetail = ctrl.createNewCreditTransactionDetailRecord(
            serviceOrDebit
          );
          _.each(existingDetails, function (detail) {
            if (
              (serviceOrDebit.ServiceTransactionId &&
                detail.AppliedToServiceTransationId ===
                  serviceOrDebit.ServiceTransactionId) ||
              (serviceOrDebit.DebitTransactionId &&
                detail.AppliedToDebitTransactionId ===
                  serviceOrDebit.DebitTransactionId)
            ) {
              detail.ObjectState = saveStates.Delete;
              creditTransactionDetail.Amount += Math.abs(detail.Amount);
            }
          });
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
            creditTransactionDetail
          );
        }
      }
    );
    //handle unapplieds
    _.each(existingDetails, function (detail) {
      if (
        !detail.AppliedToServiceTransationId &&
        !detail.AppliedToDebitTransactionId
      ) {
        detail.ObjectState = saveStates.Delete;
      }
    });
    if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
      $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
        ctrl.createNewUnappliedCreditTransactionDetailRecord(false)
      );
    }
  };

  // This function will search all the details to find any unapplied amount associated with account member id that is passed to function.
  // This will return index of unapplied credit transaction details if found else -1.
  ctrl.getUnappliedCreditTransactionIndexForAccountMember = function (
    acctMemberId,
    unappliedCreditTransactionDetailsList
  ) {
    var unappliedCreditTransactionDetailsIndex = -1;

    if (
      unappliedCreditTransactionDetailsList &&
      unappliedCreditTransactionDetailsList.length > 0
    ) {
      //unappliedCreditTransactions
      for (
        var unappCrDetial = 0;
        unappCrDetial < unappliedCreditTransactionDetailsList.length;
        unappCrDetial++
      ) {
        var creditTransactionDetail =
          unappliedCreditTransactionDetailsList[unappCrDetial];
        // Check if we get unapplied record for account member
        if (creditTransactionDetail.AccountMemberId == acctMemberId) {
          unappliedCreditTransactionDetailsIndex = listHelper.findIndexByFieldValue(
            $scope.dataForCreditTransaction.CreditTransactionDto
              .CreditTransactionDetails,
            'CreditTransactionDetailId',
            creditTransactionDetail.CreditTransactionDetailId
          );
          return unappliedCreditTransactionDetailsIndex;
        }
      }
      unappliedCreditTransactionDetailsIndex = listHelper.findIndexByFieldValue(
        $scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails,
        'CreditTransactionDetailId',
        unappliedCreditTransactionDetailsList[0].CreditTransactionDetailId
      );
    }
    return unappliedCreditTransactionDetailsIndex;
  };

  // Prepare server-side dto for changing payment or adjustment
  ctrl.prepareChangedCreditTransactionDetailList = function () {
    angular.forEach(
      $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
      function (serviceTransactionDetail) {
        if (
          serviceTransactionDetail.AdjustmentAmount &&
          serviceTransactionDetail.AdjustmentAmount !== 0
        ) {
          var creditTransactionDetail = ctrl.createNewCreditTransactionDetailRecord(
            serviceTransactionDetail
          );

          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
            creditTransactionDetail
          );
        }
      }
    );
    var unappliedCreditTransactions, unappliedCreditTransactionDetailsIndex;
    var creditTransactonsList = [];
    angular.forEach(
      $scope.dataForCreditTransaction.CreditTransactionDto
        .CreditTransactionDetails,
      function (creditTransactionDetails) {
        if (
          creditTransactionDetails.ObjectState == null ||
          creditTransactionDetails.ObjectState === saveStates.None
        ) {
          creditTransactionDetails.ObjectState = saveStates.Delete;
          creditTransactionDetails.Amount =
            creditTransactionDetails.Amount < 0
              ? creditTransactionDetails.Amount * -1
              : creditTransactionDetails.Amount;
        }
      }
    );
    creditTransactonsList.push(
      $scope.dataForCreditTransaction.CreditTransactionDto
    );
    if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
      unappliedCreditTransactions = $filter(
        'getUnassignedCreditTransactionsFilter'
      )(creditTransactonsList);
      if (
        unappliedCreditTransactions &&
        unappliedCreditTransactions.length > 0
      ) {
        // if true that means current credit-transaction already has unapplied credit-transaction-detail record in it. Find it, update it
        unappliedCreditTransactionDetailsIndex = ctrl.getUnappliedCreditTransactionIndexForAccountMember(
          ctrl.patientAccountInfo.AccountMemberId,
          unappliedCreditTransactions[0].CreditTransactionDetails
        );

        if (unappliedCreditTransactionDetailsIndex != -1) {
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails[
            unappliedCreditTransactionDetailsIndex
          ].AccountMemberId = ctrl.patientAccountInfo.AccountMemberId;
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails[
            unappliedCreditTransactionDetailsIndex
          ].Amount =
            $scope.dataForCreditTransaction.UnassignedAmount < 0
              ? $scope.dataForCreditTransaction.UnassignedAmount * -1
              : $scope.dataForCreditTransaction.UnassignedAmount;
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails[
            unappliedCreditTransactionDetailsIndex
          ].ProviderUserId =
            $scope.dataForCreditTransaction.CreditTransactionDto.ProviderUserId;
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails[
            unappliedCreditTransactionDetailsIndex
          ].ObjectState = saveStates.Update;
        }
      } else {
        // if false then we need to create new credit-transaction-detail record for the unapplied amount.
        var isCreatingNewCreditTransaction = false;
        $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
          ctrl.createNewUnappliedCreditTransactionDetailRecord(
            isCreatingNewCreditTransaction
          )
        );
      }
    }

    $scope.dataForCreditTransaction.CreditTransactionDto.AccountId =
      ctrl.patientAccountInfo.AccountId;
    $scope.dataForCreditTransaction.CreditTransactionDto.Amount = $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.reduce(
      function (total, currentRecord) {
        if (currentRecord['ObjectState'] != saveStates.Delete) {
          return total + parseFloat(currentRecord['Amount']);
        } else {
          return total + 0;
        }
      },
      0
    );
    $scope.dataForCreditTransaction.CreditTransactionDto.Amount = $scope.dataForCreditTransaction.CreditTransactionDto.Amount.toFixed(
      2
    );
    $scope.dataForCreditTransaction.CreditTransactionDto.Amount =
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount < 0
        ? $scope.dataForCreditTransaction.CreditTransactionDto.Amount * -1
        : $scope.dataForCreditTransaction.CreditTransactionDto.Amount;
  };

  ctrl.prepareChangedCreditTransactionDetailListForChanging = function () {
    //handle applied details (new and existing) - ignore any that aren't in the list of services/debits and any that are already deleted
    _.each(
      $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
      function (serviceOrDebit) {
        //find the existing details applied to the service/debit
        var associatedDetails = _.filter(
          $scope.dataForCreditTransaction.CreditTransactionDto
            .CreditTransactionDetails,
          function (detail) {
            return !detail.IsDeleted && serviceOrDebit.ServiceTransactionId
              ? detail.AppliedToServiceTransationId ===
                  serviceOrDebit.ServiceTransactionId
              : detail.AppliedToDebitTransactionId ===
                  serviceOrDebit.DebitTransactionId;
          }
        );
        //if there is not exactly 1 existing then delete old (if exist) and add a single new (if there's an amount)
        if (associatedDetails.length !== 1) {
          _.each(associatedDetails, function (detail) {
            detail.ObjectState = saveStates.Delete;
          });
          if (serviceOrDebit.AdjustmentAmount > 0) {
            $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
              ctrl.createNewCreditTransactionDetailRecord(serviceOrDebit)
            );
          }
        } else {
          //assume exactly 1, delete and re-add if amount changed, delete if no new amount, do nothing otherwise
          if (serviceOrDebit.AdjustmentAmount > 0) {
            if (
              Math.abs(serviceOrDebit.AdjustmentAmount) !==
              Math.abs(associatedDetails[0].Amount)
            ) {
              associatedDetails[0].ObjectState = saveStates.Delete;
              $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
                ctrl.createNewCreditTransactionDetailRecord(serviceOrDebit)
              );
            } //new amount matches old, do nothing
          } else {
            //new amount is zero
            associatedDetails[0].ObjectState = saveStates.Delete;
          }
        }
      }
    );
    //handle unapplied details
    var unappliedDetails = _.filter(
      $scope.dataForCreditTransaction.CreditTransactionDto
        .CreditTransactionDetails,
      function (detail) {
        return (
          !detail.IsDeleted &&
          !detail.AppliedToDebitTransactionId &&
          !detail.AppliedToServiceTransationId
        );
      }
    );
    if (unappliedDetails.length !== 1) {
      //if none or more than one delete all and re-add if necessary
      _.each(unappliedDetails, function (detail) {
        detail.ObjectState = saveStates.Delete;
      });
      if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
        $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
          ctrl.createNewUnappliedCreditTransactionDetailRecord(false)
        );
      }
    } else {
      //assume exactly one, delete and re-add if amount or provider changed, delete if no new amount, do nothing otherwise
      if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
        if (
          Math.abs($scope.dataForCreditTransaction.UnassignedAmount) !==
            Math.abs(unappliedDetails[0].Amount) ||
          $scope.dataForCreditTransaction.CreditTransactionDto
            .ProviderUserId !== unappliedDetails[0].ProviderUserId
        ) {
          unappliedDetails[0].ObjectState = saveStates.Delete;
          $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails.push(
            ctrl.createNewUnappliedCreditTransactionDetailRecord(false)
          );
        } //new detail matches old, do nothing
      } else {
        unappliedDetails[0].ObjectState = saveStates.Delete;
      }
    }
  };

  // create credit-transaction-detail dto applied to service-transaction/debit-transaction with 'Add' object-state
  ctrl.createNewCreditTransactionDetailRecord = function (
    serviceTransactionDetail
  ) {
    var creditTransactionDetail = {
      // user's account member id
      AccountMemberId: serviceTransactionDetail.AccountMemberId,
      Amount:
        serviceTransactionDetail.AdjustmentAmount < 0
          ? serviceTransactionDetail.AdjustmentAmount * -1
          : serviceTransactionDetail.AdjustmentAmount,
      CreditTransactionId:
        $scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionId,
      AppliedToServiceTransationId: null,
      AppliedToDebitTransactionId: null,
      DateEntered:
        $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered,
      ProviderUserId: serviceTransactionDetail.ProviderUserId,
      EncounterId: serviceTransactionDetail.EncounterId,
      ObjectState: saveStates.Add,
      AppliedLocationId: serviceTransactionDetail.LocationId,
    };
    if (
      serviceTransactionDetail.TransactionTypeId === 5 ||
      serviceTransactionDetail.TransactionTypeId === 6
    ) {
      creditTransactionDetail.AppliedToDebitTransactionId =
        serviceTransactionDetail.DebitTransactionId;
      creditTransactionDetail.EncounterId = null;
      creditTransactionDetail.DebitTransactionDataTag =
        serviceTransactionDetail.DataTag;
      creditTransactionDetail.AppliedLocationId =
        serviceTransactionDetail.LocationId;
    } else {
      creditTransactionDetail.AppliedToServiceTransationId =
        serviceTransactionDetail.ServiceTransactionId;
      creditTransactionDetail.ServiceTransactionDataTag =
        serviceTransactionDetail.DataTag;
      creditTransactionDetail.AppliedLocationId =
        serviceTransactionDetail.LocationId;
    }
    return creditTransactionDetail;
  };

  // create unapplied credit-transaction-detail dto with 'Add' object-state
  ctrl.createNewUnappliedCreditTransactionDetailRecord = function (
    isCreatingNewCreditTransaction
  ) {
    var accountInfo = _.find($scope.accountMembersOptions, {
      accountMemberId: ctrl.patientAccountInfo.AccountMemberId,
    });
    var responsiblePerson = _.find($scope.accountMembersOptions, {
      personId: accountInfo.responsiblePersonId,
    });
    var creditTransactionDetail = {
      // user's account member id
      AccountMemberId: responsiblePerson.accountMemberId,
      Amount: $scope.dataForCreditTransaction.UnassignedAmount,
      AppliedToServiceTransationId: null,
      DateEntered: $filter('setDateTime')(
        $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered
      ),
      EncounterId: '',
      ProviderUserId:
        $scope.dataForCreditTransaction.CreditTransactionDto.ProviderUserId,
      ObjectState: saveStates.Add,
      AppliedLocationId:
        $scope.dataForCreditTransaction.CreditTransactionDto.LocationId,
    };
    if (!isCreatingNewCreditTransaction)
      creditTransactionDetail.CreditTransactionId =
        $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionId;

    return creditTransactionDetail;
  };

  ctrl.createCredit = function () {
    paymentGatewayService.createCredit(
      $scope.dataForCreditTransaction.CreditTransactionDto.AccountId,
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount,
      1,
      false,
      ctrl.handlePartialPayment,
      $scope.cardTransactionOnErrorCallback
    );
  };

  ctrl.createCreditOrDebitForPaymentProvider = function (IsCreditOrDebit) {

    var  accountTypeValue = IsCreditOrDebit? $scope.GatewayAccountType.None: $scope.GatewayAccountType.Pin;
    var transactionTypeValue  =IsCreditOrDebit? $scope.GatewayTransactionType.CreditCard:$scope.GatewayTransactionType.DebitCard;
    var chargeTypeValue  =IsCreditOrDebit? $scope.ChargeType.Sale:  $scope.ChargeType.Purchase;

    paymentGatewayService.createPaymentProviderCreditOrDebitPayment (
      $scope.dataForCreditTransaction.CreditTransactionDto.AccountId,
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount,
       1,
      false,
      accountTypeValue ,
      transactionTypeValue ,
      chargeTypeValue,
      $scope.PaymentCategory.AccountPayment
    ).$promise.then((result) => {
      $scope.transactionInformation = result.Value;
   
      var paymentIntentDto = {
        LocationId: ctrl.userLocation ? ctrl.userLocation.LocationId : undefined ,
        PaymentGatewayTransactionId: $scope.transactionInformation.PaymentGatewayTransactionId,
        Amount: $scope.dataForCreditTransaction.CreditTransactionDto.Amount,
        PartnerDeviceId:$scope.dataForCreditTransaction.selectedCardReader ? $scope.dataForCreditTransaction.selectedCardReader : null,
        RedirectUrl:location.origin + '/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback'
      }
      patientServices.CreditTransactions.payPageRequest(paymentIntentDto).$promise.then(
        (result) => {         
            $scope.payPageUrl = $sce.trustAsResourceUrl(result.Value.PaypageUrl)
            $scope.showPayPageModal = true;
            sessionStorage.setItem('isPaypageModalOpen', $scope.showPayPageModal.toString());
            $scope.modalLoading = true; // added loader while the paypage is loading.
        },
        (error) => {
          const validationError = error.data;
          if (validationError.InvalidProperties.length > 0) {
            validationError.InvalidProperties.forEach(element => {
              toastrFactory.error(`${element.PropertyName}: ${element.ValidationMessage}`, localize.getLocalizedString('Error'));
            });
          } else {
            toastrFactory.error(localize.getLocalizedString('Get pay page failed.'), localize.getLocalizedString('Error'));
          }
        }
      );
     },
     (error) => {
        toastrFactory.error(localize.getLocalizedString('Get pay page failed.'), localize.getLocalizedString('Error'));
      });
  };

  ctrl.createDebit = function () {
    paymentGatewayService.createDebit(
      $scope.dataForCreditTransaction.CreditTransactionDto.AccountId,
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount,
      1,
      false,
      ctrl.handlePartialPayment,
      $scope.cardTransactionOnErrorCallback
    );
  };

  ctrl.createCreditReturn = function () {
    paymentGatewayService.positiveAdjustmentCreditCardReturn(
      ctrl.patientAccountInfo.AccountId,
      $scope.dataForDebitTransaction.DebitTransactionDto.AccountMemberId,
      $scope.dataForDebitTransaction.DebitTransactionDto.Amount,
      1,
      false,
      ctrl.handlePartialPayment,
      $scope.cardTransactionOnErrorCallback
    );
  };
 
  ctrl.createDebitReturn = function () {
    paymentGatewayService.positiveAdjustmentDebitCardReturn(
      ctrl.patientAccountInfo.AccountId,
      $scope.dataForDebitTransaction.DebitTransactionDto.AccountMemberId,
      $scope.dataForDebitTransaction.DebitTransactionDto.Amount,
      1,
      false,
      ctrl.handlePartialPayment,
      $scope.cardTransactionOnErrorCallback
    );
  };

  $scope.cardTransactionOnErrorCallback = function () {
    ctrl.removeWaitOverlay();
  };

  /**
   * Apply adjustment.
   *
   * @returns {angular.IPromise}
   */
  $scope.applyAdjustment = function () {
    return ctrl.getUserLocation().then(function (userLocation) {
      $scope.applyAdjustmentClicked = true; // disables apply button right away

      $timeout(function () {
        $scope.applyAdjustmentClicked = false; // no longer blocks apply button after 1 second (other logic may continue to block it though)
      }, 1000);

      var paymentTypeId =
        $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId;
      var paymentType = _.find($scope.dataForCreditTransaction.PaymentTypes, {
        PaymentTypeId: paymentTypeId,
      });

      var req1 = paymentType && _.includes([3, 4], paymentType.CurrencyTypeId); // making credit/debit card transaction
      var req2 = userLocation && !userLocation.IsPaymentGatewayEnabled; // the credit card integration is disabled
      var req3 =
        userLocation &&
        _.isString(userLocation.MerchantId) &&
        !_.isEqual(userLocation.MerchantId, ''); // the account token is setup

      if (req1 && req2 && req3) {
        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        var userId = userContext.Result.User.UserId;

        userServices.Users.get(
          { Id: userId },
          function (result) {
            var user = result.Value;

            if (user.ShowCardServiceDisabledMessage) {
              modalFactory
                .CardServiceDisabledModal(userLocation.NameLine1, user)
                .then(function () {
                  ctrl.applyAdjustment(userLocation);
                });
            } else {
              ctrl.applyAdjustment(userLocation);
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Get user failed.'),
              localize.getLocalizedString('Error')
            );
          }
        );
      } else {
        ctrl.applyAdjustment(userLocation);
      }
    });
  };

  ctrl.applyAdjustment = function (userLocation) {
    //test for unnasigned amount
    ctrl.authAccess($scope.selectedAdjustmentTypeIndex);

    if (ctrl.validateAdjustment() && !$scope.applyingAdjustment) {
      // Apply negative adjustment
      if (
        $scope.selectedAdjustmentTypeIndex === 1 ||
        $scope.selectedAdjustmentTypeIndex === 2
      ) {
        //Set TransactionTypeId=4 for credit transactions or TransactionTypeId=2 for payments
        if ($scope.selectedAdjustmentTypeIndex === 1)
          $scope.dataForCreditTransaction.CreditTransactionDto.TransactionTypeId = 4;
        else
          $scope.dataForCreditTransaction.CreditTransactionDto.TransactionTypeId = 2;

        if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
          ctrl.notifyUserAboutAccountCredit(
            $scope.startPaymentProviderTransaction.bind(ctrl, userLocation)
          );
        } else {
          $scope.startPaymentProviderTransaction(userLocation);
        }
      } else {
        $scope.startPaymentProviderTransaction(userLocation);
      }
    } else {
      $scope.startPaymentProviderTransaction(userLocation);
    }
  };


  ctrl.removeWaitOverlay = function () {
    // remove overlay
    if (ctrl.waitOverlay) {
      ctrl.waitOverlay.close();
      ctrl.waitOverlay = null;
    }
    if(document.querySelector('.cdk-overlay-container'))
    document.querySelector('.cdk-overlay-container').style.zIndex = 1000;
  };

  ctrl.getCardTransactionOverlay = function () {
    let data = {
      header: 'Please wait, do not refresh...',
      message: 'Your payment is currently being processed. ',
      message2:
        'Refreshing the page or closing the browser during this transaction may prevent the payment from being posted to the patient account.',
    };
    let ref = waitOverlayService.open({ data });
    // since we're on a modal with a z-index of 1050...maybe a better way to do this?
    document.querySelector('.cdk-overlay-container').style.zIndex = 1051;
    return ref;
  };

  $scope.startPaymentProviderTransaction = function (userLocation) {
    if ($scope.selectedAdjustmentTypeIndex == 0) {
      if (ctrl.validateAdjustment()) {
        if (
          $scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds &&
          userLocation &&
          userLocation.IsPaymentGatewayEnabled &&
          $scope.dataForDebitTransaction.DebitTransactionDto.IsPaymentGateway &&
          $scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType
        ) {
          ctrl.waitOverlay = ctrl.getCardTransactionOverlay();
          if (
            $scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType ===
            '1'
          ) {
            ctrl.createCreditReturn();
          } else if ($scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds &&
            $scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType ===
            '2'
          ) {
            ctrl.createDebitReturn();
          } else {
            ctrl.continueAdjustment()();
          }
        } else {
          ctrl.continueAdjustment()();
        }
      } else {
        $scope.dataForDebitTransaction.ErrorFlags.hasError = true;
      }
    }
    //credit transaction
    else if (
      $scope.selectedAdjustmentTypeIndex === 1 ||
      $scope.selectedAdjustmentTypeIndex === 2
    ) {
      // Dont call create debit or credit methods if we don't have a valid credit transaction
      if (ctrl.validateAdjustment()) {
        var paymentType = _.find(
          $scope.dataForCreditTransaction.PaymentTypes,
          function (paymentType) {
            return (
              paymentType.PaymentTypeId ==
              $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId
            );
          }
        );

        if (userLocation && userLocation.IsPaymentGatewayEnabled) {
          if (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.CreditCard) {
            if(userLocation.PaymentProvider !== $scope.PaymentProviders.OpenEdge && $scope.dataForCreditTransaction.showPaymentProvider){
              ctrl.createCreditOrDebitForPaymentProvider(true)
            }else{
              ctrl.waitOverlay = ctrl.getCardTransactionOverlay();
              ctrl.createCredit();
            }
          
          } else if (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.DebitCard ) {
            if(userLocation.PaymentProvider !== $scope.PaymentProviders.OpenEdge && $scope.dataForCreditTransaction.showPaymentProvider){
              ctrl.createCreditOrDebitForPaymentProvider(false)
            }else{
              ctrl.waitOverlay = ctrl.getCardTransactionOverlay();
              ctrl.createDebit();
            }
           
          } else {
            ctrl.continueAdjustment()();
          }
        } else {
          ctrl.continueAdjustment()();
        }
      } else {
        if (
          $scope.selectedAdjustmentTypeIndex === 1 ||
          $scope.selectedAdjustmentTypeIndex === 2
        ) {
          $scope.dataForCreditTransaction.ErrorFlags.hasError = true;
        } else {
          $scope.dataForDebitTransaction.ErrorFlags.hasError = true;
        }
      }
      //other
    } else {
      ctrl.continueAdjustment()();
    }
  };

  ctrl.handlePartialPayment = function (paymentGatewayId, approvedAmount) {
   ctrl.removeWaitOverlay();
    if (approvedAmount) {
      //I am applying the continue adjustment method to a scoped object to be called upon completion of the redistribution of the payment amount
      //this needs to be happen when a credit card gives a partial approval.
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount = approvedAmount;
      $scope.dataForCreditTransaction.partialPayment = true;
      $scope.dataForCreditTransaction.continueAdjustment = ctrl.continueAdjustment(
        paymentGatewayId,
        approvedAmount
      );
      $scope.dataForCreditTransaction.processAmountChange();
    } else {
      ctrl.continueAdjustment(paymentGatewayId)();
    }
  };

  // Function to apply adjustment
  ctrl.continueAdjustment = function (paymentGatewayId, approvedAmount) {
    return function () {
      // Authorization check
      ctrl.authAccess($scope.selectedAdjustmentTypeIndex);

      if (ctrl.validateAdjustment() && !$scope.applyingAdjustment) {
        // Apply negative adjustment
        if (
          $scope.selectedAdjustmentTypeIndex === 1 ||
          $scope.selectedAdjustmentTypeIndex === 2
        ) {
          //Set TransactionTypeId=4 for credit transactions or TransactionTypeId=2 for payments
          if ($scope.selectedAdjustmentTypeIndex === 1)
            $scope.dataForCreditTransaction.CreditTransactionDto.TransactionTypeId = 4;
          else
            $scope.dataForCreditTransaction.CreditTransactionDto.TransactionTypeId = 2;

          if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
            ctrl.postNegativeAdjustment(paymentGatewayId)();
          } else {
            if (dataForModal.isFeeScheduleAdjustment) {
              $scope.dataForCreditTransaction.CreditTransactionDto.IsFeeScheduleWriteOff = true;
            }
            ctrl.postNegativeAdjustment(paymentGatewayId)();
          }
        } else if ($scope.selectedAdjustmentTypeIndex == 0) {
          $scope.applyingAdjustment = true;
          // if $$DateEntered has changed we need to update it here
          ctrl.setDateEntered($scope.debitTransactionDto, ctrl.displayDate);
          $scope.debitTransactionDto.DateEntered = $filter('setDateTime')(
            $scope.debitTransactionDto.DateEntered
          );
          $scope.debitTransactionDto.PaymentGatewayTransactionId = paymentGatewayId;
          // Send data to server for creating debit transaction/positive adjustment
          patientServices.DebitTransaction.createDebitTransaction(
            $scope.debitTransactionDto,
            ctrl.applyTransactionSuccess,
            ctrl.applyTransactionFailure
          );
        } else if ($scope.isAdjustmentOnUnappliedAmount) {
          if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
            ctrl.notifyUserAboutAccountCredit(
              ctrl.applyUnappliedCreditTransaction
            );
          } else {
            ctrl.applyUnappliedCreditTransaction();
          }
        } else {
          //if $scope.isChangingAdjustmentOrPayment
          if ($scope.dataForCreditTransaction.UnassignedAmount > 0) {
            ctrl.notifyUserAboutAccountCredit(ctrl.changePaymentOrAdjustment);
          } else {
            ctrl.changePaymentOrAdjustment();
          }
        }
      } else {
        if (
          $scope.selectedAdjustmentTypeIndex === 1 ||
          $scope.selectedAdjustmentTypeIndex === 2
        ) {
          $scope.dataForCreditTransaction.ErrorFlags.hasError = true;
        } else {
          $scope.dataForDebitTransaction.ErrorFlags.hasError = true;
        }
      }
    };
  };


  $scope.isDisableApplyButton = function(){
    var creditTransactionDto = $scope.dataForCreditTransaction.CreditTransactionDto;
    if($scope.selectedAdjustmentTypeIndex === 1  ) {
      if(!creditTransactionDto.$$DateEntered|| !creditTransactionDto.AdjustmentTypeId || !creditTransactionDto.Amount){
         return true;
      }
    }else if($scope.selectedAdjustmentTypeIndex === 2 ){
      if(!creditTransactionDto.$$DateEntered ||!creditTransactionDto.PaymentTypeId ||!creditTransactionDto.Amount){
        return true;
      }
      var isValidCardReader = $scope.dataForCreditTransaction.cardReaders && $scope.dataForCreditTransaction.cardReaders.length 
      ? !!$scope.dataForCreditTransaction.selectedCardReader 
      : true;
      var paymentType = _.find(
        $scope.dataForCreditTransaction.PaymentTypes,
        function (paymentType) {
          return (
            paymentType.PaymentTypeId ==
            creditTransactionDto.PaymentTypeId
          );
        }
      );
      var checkCreditOrDebitPaymentType = (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.CreditCard) ||   (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.DebitCard); 
  
      if(checkCreditOrDebitPaymentType && !isValidCardReader){
         return true;
       }

    } else if ($scope.selectedAdjustmentTypeIndex === 0) {
      var debitTransactionDto = $scope.dataForDebitTransaction.DebitTransactionDto;
      if(!debitTransactionDto.$$DateEntered || !debitTransactionDto.AdjustmentTypeId || !debitTransactionDto.Amount) {
        return true;
      }
      
    }
    
    return false;
  }


  //throw message about account credit
  ctrl.notifyUserAboutAccountCredit = function (callback) {
    var providerName = 'unassigned';
    if ($scope.dataForCreditTransaction.CreditTransactionDto.ProviderUserId) {
      var provider = listHelper.findItemByFieldValue(
        $scope.dataForCreditTransaction.Providers,
        'UserId',
        $scope.dataForCreditTransaction.CreditTransactionDto.ProviderUserId
      );
      providerName =
        'assigned to provider ' + provider.FirstName + ' ' + provider.LastName;
    }
    //TransactionTypeId -2: Account Payment
    //TransactionTypeId -4: Negative Adjustment
    var message =
      $scope.dataForCreditTransaction.CreditTransactionDto.TransactionTypeId ==
      4
        ? localize.getLocalizedString(
            'This adjustment will result in an unapplied amount of {0} {1}',
            [
              $filter('currency')(
                $scope.dataForCreditTransaction.UnassignedAmount
              ),
              providerName,
            ]
          )
        : localize.getLocalizedString(
            'This payment will result in an unapplied amount of {0} {1}',
            [
              $filter('currency')(
                $scope.dataForCreditTransaction.UnassignedAmount
              ),
              providerName,
            ]
          );
    var title = localize.getLocalizedString('Confirm');
    var buttonContinue = localize.getLocalizedString('Continue');
    var buttonCancel = localize.getLocalizedString('Cancel');
    modalFactory
      .ConfirmModal(title, message, buttonContinue, buttonCancel)
      .then(callback);
  };

  //build credit transaction object and call post service
  ctrl.postNegativeAdjustment = function (paymentGatewayId) {
    return function () {
      $scope.applyingAdjustment = true;

      //adding additional properties required for negative adjustment for close claim operation
      if ($scope.isForCloseClaim) {
        $scope.dataForCreditTransaction.CreditTransactionDto.AccountMemberId =
          ctrl.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId;
        $scope.dataForCreditTransaction.CreditTransactionDto.IsApplyNegativeAdjustmentForCloseClaim = true;
      }

      // if $$DateEntered has changed we need to update it here
      ctrl.setDateEntered(
        $scope.dataForCreditTransaction.CreditTransactionDto,
        ctrl.displayDate
      );
      $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered = $filter(
        'setDateTime'
      )($scope.dataForCreditTransaction.CreditTransactionDto.DateEntered);
      $scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = ctrl.prepareCreditTransactionDetailList();
      if (dataForModal.isFeeScheduleAdjustment && dataForModal.claimId) {
        $scope.dataForCreditTransaction.CreditTransactionDto.ClaimId =
          dataForModal.claimId;
      }
      $scope.dataForCreditTransaction.CreditTransactionDto.IsAllAccountMembersSelected = _.some(
        $scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails,
        det =>
          det.AccountMemberId !==
          $scope.dataForCreditTransaction.CreditTransactionDto
            .CreditTransactionDetails[0].AccountMemberId
      );
      // if $scope.isPrepareDataAction is true then don't apply the adjustment, close the modal by passing the prepared data back to the caller
      if ($scope.isPrepareDataAction) {
        var negativeAdjustmentData = angular.copy(
          $scope.dataForCreditTransaction.CreditTransactionDto
        );
        var adjustmentTypeDetail = listHelper.findItemByFieldValue(
          $scope.filteredAdjustmentTypes,
          'AdjustmentTypeId',
          negativeAdjustmentData.AdjustmentTypeId
        );
        if (adjustmentTypeDetail != null) {
          // Set properties which are required on checkout screen for displaying negative adjustment data row.
          negativeAdjustmentData.Description = [
            localize.getLocalizedString('- Negative Adjustment'),
            adjustmentTypeDetail.Description,
          ]
            .filter(function (text) {
              return text;
            })
            .join(' - ');
          negativeAdjustmentData.AdjustmentTypeDescription =
            adjustmentTypeDetail.Description;
        }

        var dataForAdjustmentOnCheckout = {
          NegativeAdjustmentData: negativeAdjustmentData,
          CompleteAdjustmentData: angular.copy($scope.dataForCreditTransaction),
        };
        $uibModalInstance.close(dataForAdjustmentOnCheckout);
      } else {
        if (paymentGatewayId) {
          $scope.dataForCreditTransaction.CreditTransactionDto.PaymentGatewayTransactionId = paymentGatewayId;
        }
        if (
          $scope.dataForCreditTransaction.CreditTransactionDto
            .IsFeeScheduleWriteOff &&
          $scope.dataForCreditTransaction.CreditTransactionDto
            .CreditTransactionDetails.length > 1
        ) {
          var transactions = [];
          _.each(
            $scope.dataForCreditTransaction.CreditTransactionDto
              .CreditTransactionDetails,
            function (detail) {
              if (parseFloat(detail.Amount).toFixed(2) > 0) {
                var dto = angular.copy(
                  $scope.dataForCreditTransaction.CreditTransactionDto
                );
                dto.CreditTransactionDetails = [angular.copy(detail)];
                dto.Amount = dto.CreditTransactionDetails[0].Amount;
                transactions.push(dto);
              }
            }
          );
          patientServices.CreditTransactions.createMultiple(
            { accountId: transactions[0].AccountId },
            transactions,
            ctrl.applyTransactionSuccess,
            ctrl.applyTransactionFailure
          );
        } else {
          patientServices.CreditTransactions.create(
            $scope.dataForCreditTransaction.CreditTransactionDto,
            ctrl.applyTransactionSuccess,
            ctrl.applyTransactionFailure
          );
        }
      }
    };
  };

  //build credit transaction object and call post service for adjustment on unapplied amount
  ctrl.applyUnappliedCreditTransaction = function () {
    $scope.applyingAdjustment = true;
    ctrl.prepareUnappliedCreditTransactionDetailListForApplying();
    patientServices.CreditTransactions.applyUnappliedCreditTransaction(
      $scope.dataForCreditTransaction.CreditTransactionDto,
      ctrl.applyTransactionSuccess,
      ctrl.applyTransactionFailure
    );
  };

  //build credit transaction object and call post service for changing payment or adjustment
  ctrl.changePaymentOrAdjustment = function () {
    $scope.applyingAdjustment = true;
    if ($scope.isChangingAdjustmentOrPayment) {
      ctrl.prepareChangedCreditTransactionDetailListForChanging();
      patientServices.CreditTransactions.applyPaymentAdjustment(
        $scope.dataForCreditTransaction.CreditTransactionDto,
        ctrl.applyTransactionSuccess,
        ctrl.applyTransactionFailure
      );
    } else {
      ctrl.prepareChangedCreditTransactionDetailList();
      patientServices.CreditTransactions.update(
        $scope.dataForCreditTransaction.CreditTransactionDto,
        ctrl.applyTransactionSuccess,
        ctrl.applyTransactionFailure
      );
    }
  };

  /**
   * Success callback to handle success response from server.
   *
   * @param {*} res
   * @returns {angular.IPromise}
   */
  ctrl.applyTransactionSuccess = function (res) {
    return $q
      .all({
        locations: ctrl.getLocations(),
        userLocation: ctrl.getUserLocation(),
      })
      .then(function (results) {
        var deferred = $q.defer();

        var transaction = res.Value;
        transaction.Location = _.find(results.locations, {
          LocationId: transaction.LocationId,
        });
        transaction.PatientInfo = $scope.dataForCreditTransaction.PatientInfo;
        transaction.Services =
          $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos;
        transaction.ResponsiblePerson = ctrl.responsiblePerson;
        transaction.CurrentBalance = ctrl.getCurrentBalance();
        transaction.AdjustmentType = $scope.selectedAdjustmentType;
        transaction.IsCreditCardPayment = transaction.IsAuthorized;
        transaction.IsLocationPaymentGatewayEnabled = results.userLocation
          ? results.userLocation.IsPaymentGatewayEnabled
          : false;
        transaction.PatientName = '';

        var patientCount = 0;
        var tempName = '';

        _.forEach(
          transaction.CreditTransactionDetails,
          function (creditTransactionDetail) {
            var service = _.find(transaction.Services, function (item) {
              return (
                creditTransactionDetail.AppliedToServiceTransationId ==
                  item.ServiceTransactionId ||
                creditTransactionDetail.AppliedToDebitTransactionId ==
                  item.ServiceTransactionId
              );
            });

            if (service != null) {
              var person = _.find($scope.accountMembersOptions, {
                accountMemberId: service.AccountMemberId,
              });

              if (
                person != null &&
                transaction.PatientName.indexOf(person.name) == -1
              ) {
                if (transaction.PatientName === '') {
                  transaction.PatientName = person.name;
                  tempName = person.patientDetailedName;
                } else {
                  transaction.PatientName =
                    transaction.PatientName + ', ' + person.name;
                }
                patientCount++;
              }

              creditTransactionDetail.PatientName = service.PatientName;
            } else {
              let rp = _.find($scope.accountMembersOptions, {
                personId: transaction.ResponsiblePerson.ResponsiblePersonId,
              });
              if (rp !== null) {
                transaction.PatientName = rp.patientDetailedName;
              }
            }
          }
        );

        if (patientCount == 1) {
          transaction.PatientName = tempName;
        }

        $scope.applyingAdjustment = false;
        $scope.selectedAdjustmentTypeIndex === 2
          ? toastrFactory.success(
              localize.getLocalizedString('Payment applied successfully'),
              localize.getLocalizedString('Success')
            )
          : toastrFactory.success(
              localize.getLocalizedString('Adjustment applied successfully'),
              localize.getLocalizedString('Success')
            );

        if (!$scope.isAdjustmentOnUnappliedAmount) {
          $uibModalInstance.close({
            showUnappliedModal: $scope.applyUnappliedAfterCheckout,
          });

          if ($scope.printReceiptAfterCheckout) {
            if (!transaction.hasOwnProperty('AccountId')) {
              transaction.AccountId = ctrl.patientAccountInfo.AccountId;
            }
            localStorage.setItem(
              'acctPaymentReceipt_' + transaction.CreditTransactionId,
              JSON.stringify(transaction)
            );
            let patientPath = '#/Patient/';
            tabLauncher.launchNewTab(
              patientPath +
                transaction.CreditTransactionId +
                '/Account/PrintReceipt/'
            );
          }
          deferred.resolve();
        } else {
          var innerDeferred = $q.defer();
          if ($scope.UnappliedTransactionsList.length > 0) {
            $scope.currentUnappliedTransactionIndex++;
            ctrl.proceedToNextAdjustment().then(function () {
              innerDeferred.resolve();
            });
          } else {
            $uibModalInstance.close();
            innerDeferred.resolve();
          }

          innerDeferred.promise.then(function () {
            $rootScope.paymentApplied = true;
            if ($scope.printReceiptAfterCheckout) {
              if (!transaction.hasOwnProperty('AccountId')) {
                transaction.AccountId = ctrl.patientAccountInfo.AccountId;
              }
              localStorage.setItem(
                'acctPaymentReceipt_' + transaction.CreditTransactionId,
                JSON.stringify(transaction)
              );
              let patientPath = '#/Patient/';
              tabLauncher.launchNewTab(
                patientPath +
                  transaction.CreditTransactionId +
                  '/Account/PrintReceipt/'
              );
            }
            deferred.resolve();
          });
        }

        return deferred.promise.then(function () {
          //Collections modal
          if ($scope.isInCollection) {
            ctrl.updateAccountInCollections();
          }
        });
      });
  };

  ctrl.updateAccountInCollections = function () {
    modalFactory
      .ConfirmModal(
        'Remove from Collections',
        'Do you wish to remove this account from collections?',
        'Yes',
        'No'
      )
      .then(function () {
        patientServices.Account.updateAccountInCollections({
          personAccountId: ctrl.patientAccountInfo.AccountId,
          inCollection: false,
        }).$promise.then(
          ctrl.updateAccountInCollectionsSuccess(),
          ctrl.updateAccountInCollectionsFailure
        );
      });
  };

  ctrl.updateAccountInCollectionsSuccess = function () {
    toastrFactory.success('Account removed from collections.', 'Success');

    $rootScope.$broadcast('updatePatientStatus', false);
    $rootScope.$broadcast('updatePatientCollectionStatus', false);
    $rootScope.$broadcast('refreshTranHistoryPage');
  };

  ctrl.updateAccountInCollectionsFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to update account',
        localize.getLocalizedString('Server Error')
      )
    );
  };

  //Error callback to handle error from server
  ctrl.applyTransactionFailure = function (error) {
    if (!(error && error.status === 409)) {
      ctrl.failureMessageString = '';
      //$scope.selectedAdjustmentTypeIndex === 2 ? toastrFactory.error(localize.getLocalizedString('An error has occurred while {0}', ['applying payment']), localize.getLocalizedString('Error')) : toastrFactory.error(localize.getLocalizedString('An error has occurred while {0}', ['applying adjustment']), localize.getLocalizedString('Error'));
      $scope.selectedAdjustmentTypeIndex === 2
        ? (ctrl.failureMessageString = 'applying payment')
        : (ctrl.failureMessageString = 'applying adjustment');
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          ctrl.failureMessageString,
        ]),
        localize.getLocalizedString('Error')
      );
    }
    $scope.applyingAdjustment = false;
    _.remove(
      $scope.dataForCreditTransaction.CreditTransactionDto
        .CreditTransactionDetails,
      { ObjectState: 'Add' }
    );
  };

  // Function to handle cancel button click event
  $scope.cancelAdjustmentModal = function () {
    // Check if data has changed for the first time
    if (
      $scope.selectedAdjustmentTypeIndex === 1 ||
      $scope.selectedAdjustmentTypeIndex === 2
    ) {
      if ($scope.dataForCreditTransaction.IsEditOperation) {
        // if performing edit on negative-adjustment from checkout screen then find if changes were made or not
        ctrl.dataHasChanged = !angular.equals(
          $scope.dataForCreditTransaction.CreditTransactionDto,
          ctrl.initialCreditTransactionDto
        );
      } else {
        ctrl.dataHasChanged = !angular.equals(
          $scope.dataForCreditTransaction.CreditTransactionDto,
          ctrl.initialCreditTransactionDto
        );
        if (!ctrl.dataHasChanged) {
          ctrl.dataHasChanged = !(
            $scope.dataForCreditTransaction.CreditTransactionDto
              .AssignedAdjustmentTypeId === 1
          );
        }
      }
    } else if ($scope.selectedAdjustmentTypeIndex === 0) {
      ctrl.dataHasChanged = !angular.equals(
        $scope.dataForDebitTransaction.DebitTransactionDto,
        ctrl.initialDebitTransactionDto
      );
    } else {
      ctrl.dataHasChanged =
        $scope.dataForCreditTransaction.HasUnappliedAmountAdjusted;
    }
    //Display cancel modal depending upon whether data has changed or not
    if (ctrl.dataHasChanged)
      modalFactory.CancelModal().then($uibModalInstance.dismiss);
    else $uibModalInstance.dismiss();
  };

  // Function to handle disable apply button when data is not changed
  $scope.disableApply = function () {
    // Check if data has changed for the first time
    if (
      $scope.selectedAdjustmentTypeIndex === 1 ||
      $scope.selectedAdjustmentTypeIndex === 2
    ) {
      ctrl.dataHasChanged = !angular.equals(
        $scope.dataForCreditTransaction.CreditTransactionDto,
        ctrl.initialCreditTransactionDto
      );
      if (!ctrl.dataHasChanged) {
        ctrl.dataHasChanged = $scope.dataForCreditTransaction.CreditTransactionDto.AssignedAdjustmentTypeId !== 1;
      }
    } else if ($scope.selectedAdjustmentTypeIndex === 0) {
      ctrl.dataHasChanged = true;
    } else {
      ctrl.dataHasChanged =
        $scope.dataForCreditTransaction.HasUnappliedAmountAdjusted;
    }
    if (ctrl.dataHasChanged) $scope.disableApplyButton = false;
    else $scope.disableApplyButton = true;
  };

  ctrl.sumOfAdjustmentAmounts = function () {
    return parseFloat(
      _.reduce(
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
        function (sum, item) {
          return sum + item.AdjustmentAmount;
        },
        0
      ).toFixed(2)
    );
  };
  ctrl.sumOfAdjustedEstimates = function () {
    return parseFloat(
      _.reduce(
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
        function (sum, item) {
          return sum + item.TotalAdjEstimate;
        },
        0
      ).toFixed(2)
    );
  };

  ctrl.hasAdjustmentAmountGreaterThanAdjustedEstimate = function () {
    var a = _.find(
      $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
      function (item) {
        return (
          parseFloat(item.AdjustmentAmount.toFixed(2)) >
          parseFloat(item.TotalAdjEstimate.toFixed(2))
        );
      },
      0
    );
    return a;
  };

  // Validate adjustment to be applied
  ctrl.validateAdjustment = function () {
    var isValidDate;
    var isValidAdjustmentType;
    var isValidAmount;
    var isValidPaymentType;
    var isValidForFeeScheduleAdjustment;
    var isValidCardReader;
    var paymentType = _.find(
      $scope.dataForCreditTransaction.PaymentTypes,
      function (paymentType) {
        return (
          paymentType.PaymentTypeId ==
          $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId
        );
      }
    );
    // Validate negative adjustment
    if (
      $scope.selectedAdjustmentTypeIndex === 1 ||
      $scope.selectedAdjustmentTypeIndex === 2
    ) {
      isValidDate =
        $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered !==
          '' &&
        $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered !=
          null &&
        $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered !=
          undefined &&
        angular.isDefined(
          $scope.dataForCreditTransaction.CreditTransactionDto.DateEntered
        ) &&
        $scope.dataForCreditTransaction.CreditTransactionDto.ValidDate;
      isValidAmount = !(
        typeof $scope.dataForCreditTransaction.CreditTransactionDto.Amount ===
          'undefined' ||
        $scope.dataForCreditTransaction.CreditTransactionDto.Amount === null ||
        $scope.dataForCreditTransaction.CreditTransactionDto.Amount <= 0 ||
        $scope.dataForCreditTransaction.CreditTransactionDto.Amount > 999999.99
      );
      isValidAdjustmentType =
        $scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId >
        '';
      isValidPaymentType =
        $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId > '';
      isValidForFeeScheduleAdjustment =
        !dataForModal.isFeeScheduleAdjustment ||
        (parseFloat(
          $scope.dataForCreditTransaction.CreditTransactionDto.Amount.toFixed(2)
        ) === ctrl.sumOfAdjustmentAmounts() &&
          parseFloat(
            $scope.dataForCreditTransaction.CreditTransactionDto.Amount.toFixed(
              2
            )
          ) <= ctrl.sumOfAdjustedEstimates() &&
          !ctrl.hasAdjustmentAmountGreaterThanAdjustedEstimate());
      // Validate amount applied on services
      var serviceTransactionIndex = -1;
      var keepGoing = true;
      ctrl.serviceTransactionDtosDummy = $filter('orderBy')(
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos,
        ['UnixTimeStamp', 'Balance']
      );
      angular.forEach(
        ctrl.serviceTransactionDtosDummy,
        function (serviceTransaction) {
          if (keepGoing) {
            serviceTransactionIndex++;

            if ($scope.isForCloseClaim) {
              var paid = _.reduce(
                serviceTransaction.InsuranceEstimates,
                function (sum, item) {
                  return sum + item.PaidAmount;
                },
                0
              );
              if (
                serviceTransaction.AdjustmentAmount >
                parseFloat((serviceTransaction.Amount - paid).toFixed(2))
              ) {
                keepGoing = false;
              }
            } else if (
              serviceTransaction.AdjustmentAmount > serviceTransaction.Amount
            ) {
              keepGoing = false;
            }
            //bandaid for restricting patients from paying more then the total charge on the service
            else if (
              serviceTransaction.AdjustmentAmount >
              serviceTransaction.Balance +
                serviceTransaction.TotalAdjEstimate +
                serviceTransaction.TotalEstInsurance
            ) {
              keepGoing = false;
              $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[
                serviceTransactionIndex
              ].HasValidationError = true;
              $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[
                serviceTransactionIndex
              ].ValidationErrorMessage =
                'Cannot apply more than the remaining balance.';
            }
          }
        }
      );

      if (!isValidDate) {
        $timeout(function () {
          angular.element('#inpNegativeAdjustmentDate').find('input').focus();
        }, 0);
        return false;
      }

      if (!isValidAmount) {
        $timeout(function () {
          angular.element('#inpNegativeAdjustmentAmount').focus();
        }, 0);
        return false;
      }

      if (
        !isValidAdjustmentType &&
        $scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex === 1
      ) {
        $timeout(function () {
          angular
            .element('#lstNegativeAdjustmentTypeSelector')
            .find('span')
            .focus();
        }, 0);
        return false;
      }

      if (
        !isValidPaymentType &&
        $scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex === 2
      ) {
        $timeout(function () {
          angular.element('#lstPaymentType').find('span').focus();
        }, 0);
        return false;
      }

      // Check if serviceTransaction with invalid adjustment amount is there, if yes set focus
      if (serviceTransactionIndex > -1 && !keepGoing) {
        $timeout(function () {
          angular.element('#inpFee' + serviceTransactionIndex).focus();
        }, 0);
        return false;
      }

      if ($scope.dataForCreditTransaction.UnassignedAmount < 0) {
        return false;
      }

      if (!isValidForFeeScheduleAdjustment) {
        return false;
      } 
      isValidCardReader = $scope.dataForCreditTransaction.cardReaders && $scope.dataForCreditTransaction.cardReaders.length 
          ? !!$scope.dataForCreditTransaction.selectedCardReader 
          : true;
     var checkCreditOrDebitPaymentType= (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.CreditCard) ||   (paymentType && paymentType.CurrencyTypeId === $scope.CurrencyTypes.DebitCard); 
      
      if($scope.selectedAdjustmentTypeIndex == 2 && checkCreditOrDebitPaymentType && !isValidCardReader){
        $timeout(function () {
          angular
            .element('#lstCardReaderSelector')
            .find('span')
            .focus();
        }, 0);
        return false;

      }
    } else if ($scope.selectedAdjustmentTypeIndex == 0) {
      // Validate positive adjustment
      isValidDate =
        angular.isDefined($scope.debitTransactionDto.DateEntered) &&
        $scope.debitTransactionDto.ValidDate;
      isValidAdjustmentType = $scope.debitTransactionDto.AdjustmentTypeId > '';
      isValidAmount =
        typeof $scope.debitTransactionDto.Amount === 'undefined' ||
        $scope.debitTransactionDto.Amount === null ||
        ($scope.debitTransactionDto.Amount > 0 &&
          $scope.debitTransactionDto.Amount <= 999999.99);


      if (!isValidDate) {
        $timeout(function () {
          angular.element('#inpPositiveAdjustmentDate').find('input').focus();
        }, 0);
        return false;
      }

      if (!isValidAdjustmentType) {
        $timeout(function () {
          angular
            .element('#lstPositiveAdjustmentTypeSelector')
            .find('span')
            .focus();
        }, 0);
        return false;
      }

      if (!isValidAmount) {
        $timeout(function () {
          angular.element('#inpAmount').focus();
        }, 0);
        return false;
      }
    } else {
      // isChangingAdjustmentOrPayment indicates Change Distribution on Payment or Adjustment
      if ($scope.isChangingAdjustmentOrPayment === true) {
        // service.AdjustmentAmount should never be more than the service.TotalUnpaidBalance
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.forEach(
          serviceTransactionOrDebit => {
            if (
              serviceTransactionOrDebit.AdjustmentAmount >
              serviceTransactionOrDebit.TotalUnpaidBalance
            ) {
              $scope.dataForCreditTransaction.HasValidationError = true;
            }
          }
        );
        if ($scope.dataForCreditTransaction.HasValidationError === true) {
          return false;
        }
      }
    }

    return true;
  };

  //#endregion

  //#region Dependencies Initialization

  // Populate and return the dependency services for adjustment
  ctrl.adjustmentCallSetup = function () {
    // #region Create a list of dependent services
    var services = [];

    if (!dataForModal.TransactionList) {
      //  If adjustment is on unapplied amount transaction then fetch data as per account
      services.push({
        Call:
          patientServices.ServiceTransactions.getServiceTransactionsByAccountId,
        Params: {
          accountId: ctrl.patientAccountInfo.AccountId,
          serviceTransactionStatusId: 4,
        },
        OnSuccess: ctrl.getServiceTransactionsByAccountMemberIdSuccess,
        OnError: ctrl.getServiceTransactionsByAccountMemberIdFailure,
      });

      if (!$scope.isForCloseClaim) {
        services.push({
          Call:
            patientServices.DebitTransaction.getDebitTransactionsByAccountId,
          Params: {
            accountId: ctrl.patientAccountInfo.AccountId,
          },
          OnSuccess: ctrl.getDebitTransactionsByAccountMemberIdSuccess,
          OnError: ctrl.getDebitTransactionsByAccountMemberIdFailure,
        });
      }
    }
    // #endregion

    services.push();
    return services;
  };

  /**
   * Close the 'Loading' pop-up and show the screen with populated data from server
   *
   * @returns {angular.IPromise}
   */
  ctrl.processAdjustmentData = function () {
    if (ctrl.adjustmentCallSetup) {
      return ctrl
        .mergeServiceTransactionsAndDebitTransaction()
        .then(function () {
          $scope.isLoading = false;
          $timeout(function () {
            angular.element('#inpNegativeAdjustmentAmount').focus();
          }, 100);
        });
    }
    return $q.resolve();
  };

  /**
   * Get all required dependent data and start processing data to be displayed on screen.
   *
   * @returns {angular.IPromise}
   */
  ctrl.fetchAdjustmentDependencies = function () {
    // return if dependent data loading is still in progress
    if ($scope.isLoading) return $q.resolve();

    if (ctrl.patientInfo && ctrl.patientAccountInfo) {
      // Indicate that fetching of data from server has been started
      $scope.isLoading = true;

      // Show modal loading screen until data has been fetched from the server
      return modalFactory
        .LoadingModalWithoutTemplate(ctrl.adjustmentCallSetup)
        .then(ctrl.processAdjustmentData);
    }
    return $q.resolve();
  };

  /**
   * Function to allow user to process next unapplied transaction.
   *
   * @param {*} skipDataFetch
   * @returns {angular.IPromise}
   */
  ctrl.proceedToNextAdjustment = function (skipDataFetch) {
    return ctrl.getLocations().then(function (locations) {
      $scope.dataForCreditTransaction.HasUnappliedAmountAdjusted = false;
      ctrl.currentUnappliedTransaction = $scope.UnappliedTransactionsList.pop();
      ctrl.currentUnappliedTransaction.Amount = parseFloat(
        -ctrl.currentUnappliedTransaction.Amount.toFixed(2)
      );
      ctrl.currentUnappliedTransaction.UnassignedAmount = -ctrl
        .currentUnappliedTransaction.UnassignedAmount;
      var locationTmp = _.find(locations, {
        LocationId: ctrl.currentUnappliedTransaction.LocationId,
      });
      let locationTimezone = locationTmp ? locationTmp.Timezone : '';
      ctrl.currentUnappliedTransaction.displayDate = timeZoneFactory
        .ConvertDateToMomentTZ(
          ctrl.currentUnappliedTransaction.DateEntered,
          locationTimezone
        )
        .format('MM/DD/YYYY');
      ctrl.setProviderUserId();

      if (dataForModal.UnappliedTransactions.length > 1) {
        $scope.applyLabelText = localize.getLocalizedString(
          'Apply Transaction {0} of {1}',
          [
            $scope.currentUnappliedTransactionIndex,
            $scope.unappliedTransactionsCount,
          ]
        );
      } else {
        $scope.applyLabelText = localize.getLocalizedString(
          'Apply {0} in Unapplied Transactions',
          [
            $filter('currency')(
              ctrl.currentUnappliedTransaction.UnassignedAmount
            ),
          ]
        );
      }
      if (skipDataFetch) {
        return ctrl.mergeServiceTransactionsAndDebitTransaction();
      } else {
        return ctrl.fetchAdjustmentDependencies();
      }
    });
  };

  ctrl.setProviderUserId = function () {
    var unappliedCreditTransactionDetails = $filter(
      'getUnassignedCreditTransactionDetailFromCreditTransactionFilter'
    )(ctrl.currentUnappliedTransaction);
    var unappliedCrTrnDetailProviderId = '';

    if (dataForModal.unappliedCreditTransactionDetailId) {
      dataForModal.unappliedCreditTransactionDetailId =
        Array === dataForModal.unappliedCreditTransactionDetailId.constructor
          ? dataForModal.unappliedCreditTransactionDetailId
          : [dataForModal.unappliedCreditTransactionDetailId];
    }

    //Check if the unapplied is on account or account member level
    if (dataForModal.unappliedCreditTransactionDetailId) {
      for (var i = 0; i < unappliedCreditTransactionDetails.length; i++) {
        var index = dataForModal.unappliedCreditTransactionDetailId.indexOf(
          unappliedCreditTransactionDetails[i].CreditTransactionDetailId
        );
        if (index !== -1) {
          unappliedCrTrnDetailProviderId =
            unappliedCreditTransactionDetails[i].ProviderUserId;
          break;
        }
      }
    } else if (
      unappliedCreditTransactionDetails &&
      unappliedCreditTransactionDetails.length
    ) {
      //use the first non-deleted detail's provider id for the dropdown, unless there are other (non-deleted) details whose provider doesn't match, then fill with empty
      var detail = _.find(unappliedCreditTransactionDetails, {
        IsDeleted: false,
      });
      if (
        detail &&
        !_.find(unappliedCreditTransactionDetails, function (dt) {
          return dt.ProviderUserId != detail.ProviderUserId && !dt.IsDeleted;
        })
      ) {
        unappliedCrTrnDetailProviderId = detail.ProviderUserId;
      }
    }
    ctrl.currentUnappliedTransaction.ProviderUserId = unappliedCrTrnDetailProviderId;
  };

  /**
   * Function to skip current unapplied transaction adjustment and proceed to next.
   *
   * @returns {angular.IPromise}
   */
  $scope.skipAdjustment = function () {
    $scope.currentUnappliedTransactionIndex++;
    return ctrl.proceedToNextAdjustment(true);
  };

  ctrl
    .setTransactionDto()
    .then(function () {
      return ctrl.setCreditTransactionData();
    })
    .then(function () {
      ctrl.setDebitTransactionData();

      if (
        !$scope.isAdjustmentOnUnappliedAmount &&
        !$scope.isChangingAdjustmentOrPayment
      ) {
        // If adjustment is not on unapplied amount transaction then directly fetch data as per account member
        ctrl.fetchAdjustmentDependencies().then(function () {
          $scope.applyLabelText =
            $scope.selectedAdjustmentTypeIndex === 2
              ? localizedStrings.ApplyAn
              : localizedStrings.ApplyA;
        });
      } else if ($scope.isAdjustmentOnUnappliedAmount) {
        // If adjustment is on unapplied amount transaction then select one unapplied transaction at a time and fetch data as per account
        $scope.currentUnappliedTransactionIndex = 1;
        $scope.unappliedTransactionsCount =
          dataForModal.UnappliedTransactions.length;
        $scope.UnappliedTransactionsList = angular.copy(
          dataForModal.UnappliedTransactions
        );
        ctrl.proceedToNextAdjustment();
      } else {
        // If changing payment or adjustment
        $scope.unappliedTransactionsCount =
          dataForModal.UnappliedTransactions.length;
        $scope.UnappliedTransactionsList = angular.copy(
          dataForModal.UnappliedTransactions
        );

        $scope.dataForCreditTransaction.HasUnappliedAmountAdjusted = false;
        ctrl.currentUnappliedTransaction = $scope.UnappliedTransactionsList.pop();
        ctrl.currentUnappliedTransaction.Amount = parseFloat(
          -ctrl.currentUnappliedTransaction.Amount.toFixed(2)
        );
        ctrl.currentUnappliedTransaction.UnassignedAmount = -ctrl
          .currentUnappliedTransaction.UnassignedAmount;

        ctrl.getLocations().then(function (locations) {
          var locationTmp = _.find(locations, {
            LocationId: ctrl.currentUnappliedTransaction.LocationId,
          });
          let locationTimezone = locationTmp ? locationTmp.Timezone : '';
          ctrl.currentUnappliedTransaction.displayDate = ctrl
            .currentUnappliedTransaction.DateEntered
            ? timeZoneFactory
                .ConvertDateToMomentTZ(
                  ctrl.currentUnappliedTransaction.DateEntered,
                  locationTimezone
                )
                .format('MM/DD/YYYY')
            : timeZoneFactory
                .ConvertDateToMomentTZ(
                  ctrl.currentUnappliedTransaction.Date,
                  locationTimezone
                )
                .format('MM/DD/YYYY');
          ctrl.setProviderUserId();

          $scope.applyLabelText = localize.getLocalizedString(
            ($scope.isReadonly ? 'View' : 'Change') + ' Distribution'
          );

          return ctrl.fetchAdjustmentDependencies();
        });
      }
    });

  //Watch data.UnappliedTransaction.UnassignedAmount for any changes
  $scope.$watch(
    'dataForCreditTransaction',
    function (nv, ov) {
      if (nv && ov != null && nv != ov) {
        $scope.disableApply();
      }
    },
    true
  );
  //Watch data.UnappliedTransaction.UnassignedAmount for any changes
  $scope.$watch(
    'dataForDebitTransaction',
    function (nv, ov) {
      if (nv && ov != null && nv != ov) {
        $scope.disableApply();
      }
    },
    true
  );

  // click event handler for account member drop-down
  $scope.accountMemberOptionClicked = function (option) {
    // set to default values if option is invalid
    if (!option) {
      option =
        $scope.accountMembersOptions[$scope.defaultAccountMemberOptionIndex];
      $scope.selectedAccountMemberOption =
        $scope.accountMembersOptions[
          $scope.defaultAccountMemberOptionIndex
        ].patientDetailedName;
    }
    // set the name of currently selected view
    $scope.selectedAccountMemberOption = option.patientDetailedName;

    $timeout(function () {
      $scope.currentPatientId = option.personId;
      $scope.currentAccountMemberId = option.accountMemberId;
      ctrl.defaultSelectedAccountMemberId = option.accountMemberId;
      $scope.dataForCreditTransaction.UnassignedAmount = 0.0;
      $scope.dataForCreditTransaction.CreditTransactionDto.Amount = 0.0;
      $scope.dataForCreditTransaction.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId = null;
      $scope.dataForCreditTransaction.hasAccountMemberChanged = true;
      $scope.dataForCreditTransaction.CreditTransactionDto.ClaimId = null;
      $scope.dataForCreditTransaction.CreditTransactionDto.PromptTitle = null;
      $scope.dataForCreditTransaction.CreditTransactionDto.Note = '';
      $scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypePromptValue = null;
      if ($scope.currentAccountMemberId == 0) {
        $scope.AllAccountMembersSelected = true;
        $scope.serviceAndDebitTransactionDtos = angular.copy(
          ctrl.initialServiceAndDebitTransactionDtos
        );

        ctrl.processServiceTransactionData();
        ctrl.setSelectedAccountMember(
          $scope.serviceAndDebitTransactionDtos,
          true
        );
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = angular.copy(
          $scope.serviceAndDebitTransactionDtos
        );
      } else {
        $scope.serviceAndDebitTransactionDtos = listHelper.findItemsByFieldValue(
          ctrl.initialServiceAndDebitTransactionDtos,
          'AccountMemberId',
          $scope.currentAccountMemberId
        );
        ctrl.processServiceTransactionData();
        ctrl.setSelectedAccountMember(
          $scope.serviceAndDebitTransactionDtos,
          false
        );
        $scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = angular.copy(
          $scope.serviceAndDebitTransactionDtos
        );
      }
    }, 100);
    //set the focus to the negative adjustment amount
    $timeout(function () {
      angular.element('#inpNegativeAdjustmentAmount').focus();
    }, 100);
    // Close the adjustment type selector drop down
    angular.element('#divAccountMemberSelector').removeClass('open');
  };

  ctrl.setSelectedAccountMember = function (serviceTransactionDtos, flag) {
    angular.forEach(serviceTransactionDtos, function (serviceTransaction) {
      if (flag) serviceTransaction.AllAccountMembersSelected = true;
      else serviceTransaction.AllAccountMembersSelected = false;
    });
  };

  //Error handler for get all account member service
  ctrl.getAccountMembersFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting all account members',
      ]),
      localize.getLocalizedString('Error')
    );
  };

  //Success handler for get all account member service
  ctrl.getAccountMembersSuccess = function (successResponse) {
    var rpId;
    if (successResponse.Value) {
      $scope.accountMembersOptions = successResponse.Value;
      ctrl.allAccountMembers = successResponse.Value;
      ctrl.allAccountMembers = $filter('orderBy')(ctrl.allAccountMembers, [
        'LastName',
        'FirstName',
      ]);

      $scope.showAccountMembersDropdown = ctrl.allAccountMembers.length > 1;

      $scope.accountMembersOptionsTemp = [];

      if (ctrl.allAccountMembers.length > 1) {
        //push first option in the account-member list to represent all account-members.
        $scope.accountMembersOptionsTemp.push({
          firstName: '',
          name:
            localize.getLocalizedString('All Account Members') +
            '(' +
            ctrl.allAccountMembers.length +
            ')',
          patientDetailedName:
            localize.getLocalizedString('All Account Members') +
            '(' +
            ctrl.allAccountMembers.length +
            ')',
          displayName: '',
          value: 0,
          personId: '0',
          accountMemberId: 0,
          accountId: 0,
          responsiblePersonId: 0,
          balanceCurrent: 0,
          isActive: false,
        });
      }
      angular.forEach(ctrl.allAccountMembers, function (accountMemberDto) {
        var accountMember = angular.copy(accountMemberDto);

        ctrl.AccountMembersDetail =
          ctrl.AccountMembersDetail != undefined
            ? ctrl.AccountMembersDetail
            : dataForModal.AccountMembersList.Value;

        var accountMemberServerDto = listHelper.findItemByFieldValue(
          ctrl.AccountMembersDetail,
          'PersonId',
          accountMember.PatientId
        );

        $scope.accountMembersOptionsTemp.push({
          firstName: accountMember.FirstName,
          name: [accountMember.FirstName, accountMember.LastName]
            .filter(function (text) {
              return text;
            })
            .join(' '),
          displayName:
            [accountMember.FirstName, accountMember.LastName.charAt(0)]
              .filter(function (text) {
                return text;
              })
              .join(' ') + '.',
          personId: accountMember.PatientId,
          patientDetailedName:
            accountMember.FirstName +
            (accountMember.PreferredName != null &&
            accountMember.PreferredName != ''
              ? ' (' + accountMember.PreferredName + ')'
              : '') +
            (accountMember.MiddleName != null && accountMember.MiddleName != ''
              ? ' ' + accountMember.MiddleName + '.'
              : '') +
            ' ' +
            accountMember.LastName +
            (accountMember.SuffixName != null && accountMember.SuffixName != ''
              ? ', ' + accountMember.SuffixName
              : ''),
          value: $scope.accountMembersOptionsTemp.length + 1,
          accountMemberId: accountMemberServerDto.AccountMemberId,
          accountId: accountMemberServerDto.AccountId,
          responsiblePersonId: accountMemberServerDto.ResponsiblePersonId,
          balanceCurrent: accountMemberServerDto.BalanceCurrent,
          isActive: accountMemberServerDto.IsActive,
        });
        $scope.accountMembersCount = $scope.accountMembersOptions.length;
      });

      // Search and set Account Member in Account Members list on startup
      ctrl.setAccountMemberOptionData();

      angular.forEach($scope.accountMembersOptions, function (accountMember) {
        if (
          accountMember.responsiblePersonId == accountMember.personId &&
          accountMember.responsiblePersonId != 0
        ) {
          rpId = accountMember.personId;
        }
      });

      ctrl.getPatient(rpId);
      //ctrl.getCurrentBalance();
    } else {
      toastrFactory.error(
        localize.getLocalizedString('An error has occurred while {0}', [
          'getting all account members',
        ]),
        localize.getLocalizedString('Error')
      );
    }
  };

  ctrl.getCurrentBalance = function () {
    var option = _.find($scope.accountMembersOptions, {
      patientDetailedName: $scope.selectedAccountMemberOption,
    });
    return financialService.calculateAccountAndInsuranceBalances(
      ctrl.AccountMembersDetail,
      option.accountMemberId
    ).TotalBalance;
  };

  ctrl.validatePaymentType = function (paymentTypeId) {
    var paymentType = listHelper.findItemByFieldValue(
      $scope.paymentTypes,
      'PaymentTypeId',
      paymentTypeId
    );

    if (paymentType.CurrencyTypeId == 3) {
      return true;
    } else {
      return false;
    }
  };

  // Days difference from original DateEntered to current DateEntered in days if any
  ctrl.daysDifference = function (originalDate, currentDate) {
    var start = moment(originalDate);
    var end = moment(currentDate);
    var days = end.diff(start, 'days');
    return days;
  };

  ctrl.setDateEntered = function (transactionDto, displayDate) {
    // if $$DateEntered has changed we need to update it here, currently DateEntered can only be today or in the past
    var days = ctrl.daysDifference(displayDate, transactionDto.$$DateEntered);
    if (days < 0) {
      var currentDate = new Date(Date.parse(transactionDto.DateEntered));
      currentDate = moment(currentDate).add(days, 'days');
      transactionDto.DateEntered = currentDate;
    }
    //transactionDto.DateEntered =   transactionDto.$$DateEntered ;
  };

  ctrl.initializeAccountMembers();

  $scope.closePaypage= function () {
    if ($window.confirm('Are you sure you want to close the paypage? All incomplete transactions will be lost.')) {
      $scope.clearPaypageModal()
    }
}


  //#endregion
}
PatientAdjustmentController.prototype = Object.create(BaseCtrl.prototype);
