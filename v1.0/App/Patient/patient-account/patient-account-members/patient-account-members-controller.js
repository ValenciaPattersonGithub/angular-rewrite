'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientAccountMembersController', [
    '$scope',
    'localize',
    'PatientServices',
    'toastrFactory',
    '$timeout',
    'ShareData',
    'PersonFactory',
    '$uibModal',
    '$filter',
    '$location',
    '$routeParams',
    '$route',
    'PatientValidationFactory',
    'userSettingsDataService',
    PatientAccountMembersController,
  ]);

function PatientAccountMembersController(
  $scope,
  localize,
  patientServices,
  toastrFactory,
  $timeout,
  shareData,
  personFactory,
  $uibModal,
  $filter,
  $location,
  $routeParams,
  $route,
  patientValidationFactory,
  userSettingsDataService
) {
  BaseCtrl.call(this, $scope, 'PatientAccountMembersController');
  var ctrl = this;

  $scope.showNewPatientHeader =
    userSettingsDataService.isNewNavigationEnabled();

  //List of account members
  $scope.accountMembers = [];

  //Flag used to display loading icon
  $scope.loadingAccountMembers = false;

  //Success handler to get all account members
  ctrl.getAllAccountMembersSuccess = function (successResponse) {
    $scope.accountMembers = successResponse.Value;

    //To hide loading icon set loadingAccountMembers flag to false
    $scope.loadingAccountMembers = false;
  };

  //Error handler to get all account members
  ctrl.getAllAccountMembersFailure = function () {
    $scope.accountMembers = [];

    //To hide loading icon set loadingAccountMembers flag to false
    $scope.loadingAccountMembers = false;

    //Display error message
    toastrFactory.error(
      localize.getLocalizedString('An error has occurred while {0}', [
        'getting all account members.',
      ]),
      localize.getLocalizedString('Error')
    );
  };

  //Call service to get details of all account members for specified account id
  ctrl.getAllAccountMembers = function () {
    //To display loading icon set loadingAccountMembers flag to true
    $scope.loadingAccountMembers = true;

    //Get all account members using patient service
    if (shareData.AllAccountMembers) {
      ctrl.getAllAccountMembersSuccess({ Value: shareData.AllAccountMembers });
    } else {
      //Get all account members using patient service
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: $scope.accountId,
        },
        ctrl.getAllAccountMembersSuccess,
        ctrl.getAllAccountMembersFailure
      );
    }
  };

  // Get list of all account members for an account
  // ctrl.getAllAccountMembers();

  // Reload account members when selected account member's profile is updated
  $scope.$watch(
    '$parent.$parent.$parent.additionalData',
    function (nv, ov) {
      if (nv != ov) {
        $timeout(function () {
          ctrl.getAllAccountMembers();
        }, 0);
      }
    },
    true
  );

  //#region refactor account members to use observe

  // load account details when changed
  $scope.loadAccountOverview = function (accountOverview) {
    if (accountOverview) {
      $scope.accountOverview = accountOverview;
      $scope.accountMembers = accountOverview.AccountMembersProfileInfo;
    }
  };
  // subscribe to account overview list changes
  $scope.$observerRegistrations.push(
    personFactory.observeActiveAccountOverview($scope.loadAccountOverview)
  );

  // get the account overview on initial load
  var accountOverview = personFactory.ActiveAccountOverview;
  $scope.loadAccountOverview(accountOverview);

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
  $scope.transfer = function (patientId) {
    var tabName = ctrl.getTabNameFromParam();
    var prevLocation = tabName === '' ? 'Overview' : tabName;
    let patientPath = 'Patient/';
    $location.path(
      patientPath +
        patientId +
        '/Account/' +
        $scope.accountId +
        '/TransferAccount/' +
        prevLocation
    );
    //$scope.currentPatient = $filter('filter')($scope.accountMembers, { PatientId: patientId }, true)[0];
    //$scope.refreshSummaryPage =   $scope.loadAccountAfterTransfer;
    //$scope.previewModal = $uibModal.open({
    //animation: true,
    //ariaLabelledBy: 'modal-title',
    //ariaDescribedBy: 'modal-body',
    //templateUrl: 'App/Patient/components/transferAccount-modal/transferAccount-modal.html',
    //controller: 'TransferAccountModalController',
    //bindtoController: true,
    //size: 'md',
    //backdrop: 'static',
    //keyboard: false,
    //scope: $scope,
    //windowClass: 'createNote-modal',
    // });
  };

  //#endregion

  // #region user/patient validation
  $scope.validateAccountMember = function (member) {
    if (member && member.PatientId) {
      patientValidationFactory
        .PatientSearchValidation(member)
        .then(function (res) {
          var patientInfo = res;
          let patientPath = 'Patient/';
          if (
            !patientInfo.authorization
              .UserIsAuthorizedToAtLeastOnePatientLocation
          ) {
            patientValidationFactory.LaunchPatientLocationErrorModal(
              patientInfo
            );
            return;
          } else {
            $location.path(patientPath + member.PatientId + '/Overview');
          }
        });
    }
  };
  // #endregion
}

PatientAccountMembersController.prototype = Object.create(BaseCtrl.prototype);
