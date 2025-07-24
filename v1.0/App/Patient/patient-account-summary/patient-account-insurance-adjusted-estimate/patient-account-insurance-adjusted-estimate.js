'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientAccountInsuranceAdjustedEstimateController', [
    '$scope',
    '$rootScope',
    'localize',
    'patSecurityService',
    'PatientServices',
    'toastrFactory',
    'FinancialService',
    'ModalFactory',
    'ModalDataFactory',
    '$routeParams',
    'ShareData',
    'PersonFactory',
    PatientAccountInsuranceAdjustedEstimateController,
  ]);
function PatientAccountInsuranceAdjustedEstimateController(
  $scope,
  $rootScope,
  localize,
  patSecurityService,
  patientServices,
  toastrFactory,
  financialService,
  modalFactory,
  modalDataFactory,
  $routeParams,
  shareData,
  personFactory
) {
  BaseCtrl.call(
    this,
    $scope,
    'PatientAccountInsuranceAdjustedEstimateController'
  );
  var ctrl = this;
  $scope.totalAdjustedEstimate = 0;
  $scope.currentPerson = $scope.person;
  $scope.currentPatient = {
    AccountId:
      $scope.currentPerson.Profile.PersonAccount.PersonAccountMember.AccountId,
    AccountMemberId:
      $scope.currentPerson.Profile.PersonAccount.PersonAccountMember
        .AccountMemberId,
  };
  $scope.selectedMemberAdjustedEstimate = 0;

  // authentication var
  ctrl.soarAuthInsPaymentViewKey = 'soar-acct-aipmt-view';
  $scope.soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
  $scope.soarAuthAddDebitTransactionKey = 'soar-acct-dbttrx-add';
  $scope.hasPatientInsurancePaymentViewAccess = false;

  ctrl.calcShowTotalBalance = function () {
    $scope.showTotalBalance =
      ctrl.allAccountMembersBalance.length > 1 ? true : false;
  };

  // Check view access for Insurance Payment view
  ctrl.authPatientInsurancePaymentViewAccess = function () {
    $scope.hasPatientInsurancePaymentViewAccess =
      patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthInsPaymentViewKey
      );
    $scope.disablePayments = !$scope.hasPatientInsurancePaymentViewAccess;
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

  // validate patient account insurance access
  ctrl.authPatientInsurancePaymentViewAccess();

  ctrl.calculateBalance = function (selectedMemberIds) {
    $scope.calculatingBalance = true;
    $scope.totalAdjustedEstimate = 0;
    $scope.selectedPatientId = $scope.currentPerson.PatientId;
    if (
      ctrl.allAccountMembersBalance &&
      (angular.isDefined($scope.selectedPatientId) ||
        angular.isDefined(selectedMemberIds))
    ) {
      $scope.singleAccountMember =
        ctrl.allAccountMembersBalance.length > 1 ? false : true;
      var accountmemberIds = selectedMemberIds || $scope.selectedPatientId;
      var balances = financialService.calculateAccountAndInsuranceBalances(
        ctrl.allAccountMembersBalance,
        accountmemberIds
      );

      $scope.selectedMemberAdjustedEstimate =
        balances.SelectedMemberAdjustedEstimate;
      $scope.totalAdjustedEstimate = balances.TotalAdjustedEstimate;
    }

    $scope.calculatingBalance = false;
  };

  // load account details when changed
  $scope.loadAccountOverview = function (accountOverview) {
    if (accountOverview) {
      ctrl.allAccountMembersBalance = accountOverview.AccountMembersAccountInfo;
      ctrl.calcShowTotalBalance();
      ctrl.calculateBalance();
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

PatientAccountInsuranceAdjustedEstimateController.prototype = Object.create(
  BaseCtrl.prototype
);
