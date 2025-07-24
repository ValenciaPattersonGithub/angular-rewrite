'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientAccountSummaryController', [
    '$scope',
    'localize',
    '$timeout',
    '$routeParams',
    'patSecurityService',
    'toastrFactory',
    'PatientServices',
    'ListHelper',
    '$filter',
    'UserServices',
    'ModalFactory',
    'ModalDataFactory',
    '$rootScope',
    'ShareData',
    'FinancialService',
    '$location',
    'UsersFactory',
    'PersonFactory',
    'userSettingsDataService',
    PatientAccountSummaryController,
  ]);
function PatientAccountSummaryController(
  $scope,
  localize,
  $timeout,
  $routeParams,
  patSecurityService,
  toastrFactory,
  patientServices,
  listHelper,
  $filter,
  userServices,
  modalFactory,
  modalDataFactory,
  $rootScope,
  shareData,
  financialService,
  $location,
  usersFactory,
  personFactory,
  userSettingsDataService
) {
  BaseCtrl.call(this, $scope, 'PatientAccountSummaryController');
  //#region properties

  var ctrl = this;
  $scope.loading = false;

  $scope.balanceIsCalculated = false;

  $scope.accountBalances = [];
  $scope.accountMembersOptions = [];
  $scope.providers = [];

  $scope.accountBalance = 0;
  $scope.accountTotal = 0;
  $scope.estimatedInsurance = 0;
  $scope.patientPortion = 0;

  $scope.accountTotalOverview = 0;
  $scope.accountBalanceOverview = 0;
  $scope.estimatedInsuranceOverview = 0;
  $scope.patientPortionOverview = 0;

  $scope.applyingPayment = false;
  $scope.disablePayments = true;
  $scope.disableInsurancePayments = false;

  // graph data container
  $scope.graphData = {
    moreThanThirtyBalance: 0,
    moreThanSixtyBalance: 0,
    moreThanNintyBalance: 0,
    currentBalance: 0,
    totalBalance: 0,
    chartHeight: 120,
  };

  //#endregion

  //#region Authorization
  // view access
  ctrl.authViewAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      'soar-acct-actsrv-view'
    );
  };

  ctrl.authAccess = function () {
    if (!ctrl.authViewAccess()) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-acct-actsrv-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    } else {
      $scope.hasViewAccess = true;
    }
  };

  // authorization
  ctrl.authAccess();

  //#endregion

  ctrl.initializeController = function () {
    if (
      $scope.person.Profile.PersonAccount &&
      $scope.person.Profile.PersonAccount.AccountId
    ) {
      $scope.loading = true;
    }
    if (shareData.allProviders) {
      ctrl.userServicesGetSuccess({ Value: shareData.allProviders });
    } else {
      ctrl.getProviders();
    }
  };

  //#region get account members balance details

  // called after payment or checkout to get fresh account member details
  ctrl.getAccountBalance = function () {
    personFactory
      .AccountMemberDetails($scope.person.Profile.PersonAccount.AccountId)
      .then(function (res) {
        var accountMemberDetails = res.Value;
        $scope.accountBalances = accountMemberDetails;
        ctrl.calculateAccountBalance();
      });
  };

  //#endregion

  //#region calculate balance for account

  ctrl.calculateAccountBalance = function () {
    $scope.accountBalance = 0;
    if ($scope.accountBalances && $scope.person && $scope.person.PatientId) {
      var balances = financialService.calculateAccountAndInsuranceBalances(
        $scope.accountBalances,
        $scope.person.PatientId
      );

      $scope.accountTotal = balances.TotalBalance;
      $scope.estimatedInsurance = balances.TotalInsurance;
      $scope.patientPortion = balances.TotalPatientPortion;
      $scope.adjustedEstIns = balances.TotalAdjustedEstimate;

      /*
       * These scoped variables are to get only the selected patients balance information.
       * If you need these you need to pass them through the patient-account-summary.html and
       * the directive of each panel you need to pass it to.
       */
      $scope.accountTotalOverview = balances.SelectedMemberBalance;
      $scope.estimatedInsuranceOverview = balances.SelectedMemberInsurance;
      $scope.patientPortionOverview = balances.SelectedMemberPatientPortion;
      $scope.adjustedEstInsOverview = balances.SelectedMemberAdjustedEstimate;

      /*
       * $scope.graphData only uses totals, never specific member balances
       */
      $scope.graphData = {
        moreThanThirtyBalance:
          balances.MoreThan30Balance + balances.EstInsMoreThan30Balance,
        moreThanSixtyBalance:
          balances.MoreThan60Balance + balances.EstInsMoreThan60Balance,
        moreThanNintyBalance:
          balances.MoreThan90Balance + balances.EstInsMoreThan90Balance,
        currentBalance: balances.CurrentBalance + balances.EstInsCurrentBalance,
        totalBalance: balances.TotalBalance,
        totalInsurance: balances.TotalInsurance,
        totalPatientPortion: balances.TotalPatientPortion,
      };
    }

    $scope.balanceIsCalculated = true;
  };

  //#endregion

  //#region calculate balance / patient portion for account

  ctrl.calculateAccountTotals = function () {
    if ($scope.balanceIsCalculated === true) {
      $scope.accountTotal = $scope.graphData.totalBalance;
      $scope.patientPortion =
        $scope.graphData.totalBalance -
        $scope.graphData.totalInsurance -
        $scope.adjustedEstIns; //This did not include $scope.adjustedEstIns
      $scope.estimatedInsurance = $scope.graphData.totalInsurance;
    }
  };

  $scope.$watch('balanceIsCalculated', function (nv, ov) {
    if (nv) {
      ctrl.calculateAccountTotals();
      $scope.loading = $scope.balanceIsCalculated === false;
    }
  });

  //#endregion

  //#region providers

  ctrl.enablePayments = function () {
    $scope.disablePayments =
      $scope.providers === [] || $scope.providers.length === 0;
  };

  ctrl.userServicesGetSuccess = function (successResponse) {
    var providers = successResponse.Value;
    $scope.providers = providers;
    ctrl.enablePayments();
  };

  ctrl.userServicesGetFailure = function () {
    $scope.providers = [];
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['Providers']
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  ctrl.getProviders = function () {
    usersFactory
      .Users()
      .then(ctrl.userServicesGetSuccess, ctrl.userServicesGetFailure);
  };

  //#endregion

  ctrl.initializeController();
  //#region make a payment
  $scope.makePayment = function () {
    if (!$scope.disablePayments) {
      $scope.patientPaymentModal();
    }
  };

  // Function to open patient payment modal
  $scope.patientPaymentModal = function () {
    if (!$scope.applyingPayment) {
      $scope.applyingPayment = true;

      ctrl.dataForModal = {
        PatientAccountDetails: {
          AccountId: $scope.person.Profile.PersonAccount
            ? $scope.person.Profile.PersonAccount.PersonAccountMember.AccountId
            : '',
          AccountMemberId: $scope.person.Profile.PersonAccount
            ? $scope.person.Profile.PersonAccount.PersonAccountMember
                .AccountMemberId
            : '',
        },
        DefaultSelectedIndex: 2,
        DefaultSelectedAccountMember: '0',
        AllProviders: $scope.providers,
        // AllAccountMembers: $scope.accountMembersOptions
      };

      modalDataFactory
        .GetTransactionModalData(ctrl.dataForModal, $routeParams.patientId)
        .then(ctrl.openModal);
    }
  };

  //Function to open adjustment modal for applying payment
  ctrl.openModal = function (adjustmentModalData) {
    ctrl.dataForModal = adjustmentModalData;
    modalFactory.TransactionModal(
      ctrl.dataForModal,
      ctrl.patientPaymentModalResultOk,
      ctrl.patientPaymentModalResultCancel
    );
  };

  //Handle success callback from payment modal
  ctrl.patientPaymentModalResultOk = function () {
    $scope.applyingPayment = false;
    $scope.balanceIsCalculated = false;
    $scope.creditIsCalculated = false;
    ctrl.getAccountBalance();
    $scope.applyingPayment = false;
  };

  //Handle Cancel callback from payment modal
  ctrl.patientPaymentModalResultCancel = function () {
    $scope.applyingPayment = false;
  };

  //#endregion

  //#region make a insurance payment

  $scope.makeInsurancePayment = function () {
    var prevLocation = 'PatientOverview';
    let patientPath = 'Patient/';
    $location.path(
      patientPath +
        $routeParams.patientId +
        '/Account/' +
        $scope.person.Profile.PersonAccount.PersonAccountMember.AccountId +
        '/SelectClaims/' +
        prevLocation
    );
  };

  //#endregion

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('checkoutCompleted', function () {
      $scope.balanceIsCalculated = false;
      ctrl.getAccountBalance();
      ctrl.calculateAccountTotals();
    })
  );

  // load account details when changed
  $scope.loadAccountOverview = function (accountOverview) {
    if (accountOverview) {
      $scope.accountOverview = accountOverview;
      $scope.accountBalances = $scope.accountOverview.AccountMembersAccountInfo;
      ctrl.calculateAccountBalance();
    }
  };
  // subscribe to account overview list changes
  $scope.$observerRegistrations.push(
    personFactory.observeActiveAccountOverview($scope.loadAccountOverview)
  );

  // get the account overview on initial load
  var accountOverview = personFactory.ActiveAccountOverview;
  $scope.loadAccountOverview(accountOverview);
}

PatientAccountSummaryController.prototype = Object.create(BaseCtrl.prototype);
