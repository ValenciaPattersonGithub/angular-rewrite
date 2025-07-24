'use strict';
angular.module('Soar.Patient').controller('TransferAccountModalController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  '$filter',
  'ListHelper',
  '$location',
  'PatientServices',
  '$routeParams',
  '$rootScope',
  '$q',
  '$route',
  'userSettingsDataService',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    $filter,
    ListHelper,
    $location,
    patientServices,
    $routeParams,
    $rootScope,
    $q,
    $route,
    userSettingsDataService
  ) {
    var ctrl = this;
    $scope.currentPatient = $scope.currentPatient;
    $scope.actionItems = [];
    $scope.selectedActionItem = 0;
    $scope.refreshSummaryPage = $scope.refreshSummaryPage;
    ctrl.onInit = function () {
      if ($scope.currentPatient.MiddleName === '') {
        $scope.patientName =
          $scope.currentPatient.FirstName +
          ' ' +
          $scope.currentPatient.LastName +
          ' ' +
          $scope.currentPatient.SuffixName;
      } else {
        $scope.patientName =
          $scope.currentPatient.FirstName +
          ' ' +
          $scope.currentPatient.MiddleName +
          '.' +
          ' ' +
          $scope.currentPatient.LastName +
          ' ' +
          $scope.currentPatient.SuffixName;
      }

      $scope.actionItems = [{ id: 0, name: 'Transfer Patient to New Account' }];
    };

    $scope.cancel = function () {
      if (
        typeof $scope.previewModal != 'undefined' &&
        $scope.previewModal != null
      ) {
        $scope.previewModal.close();
      }
    };

    ctrl.transferAccountSuccess = function () {
      patientServices.Account.getByPersonId(
        {
          personId: $scope.currentPatient.PatientId,
        },
        ctrl.getAccountByIdSuccess
      );
    };
    ctrl.transferAccountFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieved. Refresh the page to try again'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.transfer = function () {
      patientServices.PatientAccountTransfer.save(
        {
          patientId: $scope.currentPatient.PatientId,
        },
        ctrl.transferAccountSuccess,
        ctrl.transferAccountFailure
      );
    };

    ctrl.getAccountByIdSuccess = function (data) {
      $scope.accountId = data.Value.AccountId;

      $scope.cancel();

      toastrFactory.success(
        localize.getLocalizedString(
          'Patient successfully transferred to a new account'
        ),
        localize.getLocalizedString('Success')
      );

      ctrl.RedirectAfterSave();

      //if ($scope.$parent.$parent.refreshSummaryGridAfterTransfer !== undefined)
      //    $scope.$parent.$parent.refreshSummaryGridAfterTransfer($scope.accountId);
      //else if ($scope.$parent.$parent.refreshHistoryGridAfterTransfer !== undefined
      //) //if transaction history window
      //    $scope.$parent.$parent.refreshHistoryGridAfterTransfer($scope.accountId);
      //else
      //    $scope.refreshSummaryPage();
    };
    ctrl.RedirectAfterSave = function () {
      var locationPath = '/';
      var routeParams = $routeParams;
      try {
        let patientPath = '/Patient/';
        if (routeParams.Category === 'Overview') {
          locationPath =
            patientPath + $scope.currentPatient.PatientId + '/Overview';
          $location.path(locationPath);
        } else if (routeParams.Category === 'Summary') {
          if (
            routeParams.tab &&
            (routeParams.tab === 'Account Summary' ||
              routeParams.tab === 'Transaction History')
          ) {
            $route.reload();
          } else {
            locationPath =
              patientPath +
              $scope.currentPatient.PatientId +
              '/Summary/?tab=Profile';
            $location.path(locationPath);
          }
          //else if (routeParams.tab && routeParams.tab === "Transaction History") {
          //    locationPath = patientPath + $scope.currentPatient.PatientId + "/Summary/?tab=Profile";
          //    $location.path(locationPath);
          //}
        }
      } catch (e) {
        console.log(e);
      }
    };
    ctrl.onInit();
  },
]);
