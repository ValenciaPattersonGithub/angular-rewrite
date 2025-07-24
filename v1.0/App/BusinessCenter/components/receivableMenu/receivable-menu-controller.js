'use strict';

angular.module('common.controllers').controller('ReceivableMenuController', [
  '$scope',
  'PatientServices',
  '$location',
  'tabLauncher',
  'ModalDataFactory',
  'UsersFactory',
  'toastrFactory',
  'localize',
  'ModalFactory',
  '$uibModal',
  'referenceDataService',
  'userSettingsDataService',
  '$rootScope',
  function (
    $scope,
    patientServices,
    $location,
    tabLauncher,
    modalDataFactory,
    usersFactory,
    toastrFactory,
    localize,
    modalFactory,
    $uibModal,
    referenceDataService,
    userSettingsDataService,
    $rootScope
  ) {
    var ctrl = this;

    ctrl.getCurrentPatientById = function (patientServices, patientId) {
      return patientServices.Patients.get({
        Id: patientId,
        uiSuppressModal: true,
      }).$promise;
    };

    ctrl.getProviders = function () {
      usersFactory
        .Users()
        .then(ctrl.userServicesGetSuccess, ctrl.userServicesGetFailure);
    };

    ctrl.userServicesGetSuccess = function (successResponse) {
      var providers = successResponse.Value;
      ctrl.providers = providers;
      ctrl.enablePayments();
    };

    ctrl.userServicesGetFailure = function () {
      ctrl.providers = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Providers']
        ),
        localize.getLocalizedString('Server Error')
      );
      ctrl.enablePayments();
    };

    ctrl.enablePayments = function () {
      $scope.disablePayments =
        ctrl.providers == [] || ctrl.providers.length == 0;
    };

    ctrl.openModal = function (adjustmentModalData) {
      ctrl.dataForModal = adjustmentModalData;
      modalFactory.TransactionModal(
        ctrl.dataForModal,
        ctrl.patientPaymentModalResultOk,
        ctrl.patientPaymentModalResultCancel
      );
    };

    ctrl.patientPaymentModalResultOk = function () {
      ctrl.refreshGrid($scope);
      $scope.applyingPayment = false;
    };

    ctrl.refreshGrid = function (scope) {
      if (typeof scope.$parent != 'undefined' && scope.$parent != null) {
        if (typeof scope.$parent.refreshGrid != 'undefined') {
          scope.$parent.refreshGrid();
        } else {
          ctrl.refreshGrid(scope.$parent);
        }
      }
      ctrl.refreshGrids();
    };

    ctrl.refreshGrids = function () {
      $scope.$emit('refreshGrids');
    };

    ctrl.patientPaymentModalResultCancel = function () {
      $scope.applyingPayment = false;
    };

    $scope.createStatement = function (receivable) {
      ctrl
        .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
        .then(function (res) {
          var patient = res.Value;
          var accountId = patient.PersonAccount.AccountId;
          var path =
            '#/BusinessCenter/Receivables/Statements/' +
            '?accountId=' +
            accountId;
          tabLauncher.launchNewTab(path);
        });
    };

    $scope.applyPayment = function (receivable) {
      if ($scope.disablePayments) {
        return;
      }

      if (!$scope.applyingPayment) {
        $scope.applyingPayment = true;

        ctrl
          .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
          .then(function (res) {
            var patient = res.Value;

            ctrl.dataForModal = {
              PatientAccountDetails: {
                AccountId: patient.PersonAccount
                  ? patient.PersonAccount.PersonAccountMember.AccountId
                  : '',
                AccountMemberId: patient.PersonAccount
                  ? patient.PersonAccount.PersonAccountMember.AccountMemberId
                  : '',
              },
              DefaultSelectedIndex: 2,
              DefaultSelectedAccountMember: 0,
              AllProviders: ctrl.providers,
            };

            modalDataFactory
              .GetTransactionModalData(ctrl.dataForModal, patient.PatientId)
              .then(ctrl.openModal);
          });
      }
    };

    $scope.viewInsurance = function (receivable) {
      ctrl
        .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
        .then(function (res) {
          var patient = res.Value;
          let patientPath = '/Patient/';
          $location.url(
            patientPath +
              patient.PatientId +
              '/Summary/?tab=Insurance%20Information'
          );
        });
    };

    $scope.createCommunication = function (receivable) {
      ctrl
        .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
        .then(function (res) {
          var patient = res.Value;
          $scope.selectedPatientId = patient.PatientId;

          $scope.activeFltrTab = 2;
          let patientPath = '#/Patient/';
          tabLauncher.launchNewTab(
            patientPath +
              patient.PatientId +
              '/Communication/?withDrawerOpened=true&communicationType=999'
          );
          $rootScope.$broadcast('nav:drawerChange', 5);
        });
    };

    $scope.$on('closeCommunicationModal', function (events, args) {
      if (
        typeof $scope.modalInstance != 'undefined' &&
        $scope.modalInstance != null
      ) {
        $scope.modalInstance.close();
      }
    });

    $scope.viewOverview = function (receivable) {
      ctrl
        .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
        .then(function (res) {
          var patient = res.Value;

          let patientPath = '#/Patient/';
          tabLauncher.launchNewTab(
            patientPath + patient.PatientId + '/Overview/'
          );
        });
    };
    $scope.viewProfile = function (receivable) {
      ctrl
        .getCurrentPatientById(patientServices, receivable.ResponsiblePartyId)
        .then(function (res) {
          var patient = res.Value;

          let patientPath = '#/Patient/';
          tabLauncher.launchNewTab(
            patientPath +
              patient.PatientId +
              '/Summary/?tab=Profile&currentPatientId=0'
          );
        });
    };

    $scope.createNote = function (receivable) {
      $scope.patientInfo = receivable;
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: receivable.AccountId,
        },
        ctrl.personAccountMemberSuccess,
        ctrl.personAccountMemberFailure
      );
    };

    ctrl.personAccountMemberSuccess = function (res) {
      $scope.accountMembers = res.Value;
      $scope.locations = referenceDataService.get(
        referenceDataService.entityNames.locations
      );

      $scope.window = 'receivables';
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
      });
    };

    ctrl.personAccountMemberFailure = function () {
      toastrFactory.success(
        localize.getLocalizedString('Failed'),
        localize.getLocalizedString('Failed')
      );
    };
    $scope.receivable.showDetail = false;
    $scope.receivableId =
      'A' + $scope.receivable.ResponsiblePartyId.replace(/-/gi, '');
    $scope.applyingPayment = false;
    ctrl.getProviders();

    $scope.updateAccountInCollections = function (receivable) {
      if (receivable.InCollections === true) {
        modalFactory
          .ConfirmModal(
            'Remove from Collections',
            'Are you sure you want to remove this account from collections?',
            'Yes',
            'No'
          )
          .then(function () {
            patientServices.Account.updateAccountInCollections({
              personAccountId: receivable.AccountId,
              inCollection: false,
            }).$promise.then(
              ctrl.updateAccountInCollectionsSuccess(true),
              ctrl.updateAccountInCollectionsFailure
            );
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
              personAccountId: receivable.AccountId,
              inCollection: true,
            }).$promise.then(
              ctrl.updateAccountInCollectionsSuccess(false),
              ctrl.updateAccountInCollectionsFailure
            );
          });
      }
    };

    ctrl.updateAccountInCollectionsSuccess = function (inCollections) {
      if (inCollections) {
        toastrFactory.success('Account removed from collections.', 'Success');
      } else {
        toastrFactory.success('Account placed in collections.', 'Success');
      }
      ctrl.refreshGrids();
    };

    ctrl.updateAccountInCollectionsFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to update account',
          localize.getLocalizedString('Server Error')
        )
      );
    };

    $scope.toggleMenu = function (e) {
      $(e.currentTarget).parent().toggleClass('dropdown open');
    };
  },
]);
