'use strict';

var app = angular.module('Soar.Patient').controller('PatientFlagsController', [
  '$scope',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  'MasterAlertService',
  'StaticData',
  'ListHelper',
  'SaveStates',
  function (
    $scope,
    $location,
    localize,
    $timeout,
    toastrFactory,
    masterAlertService,
    staticData,
    listHelper,
    saveStates
  ) {
    //#region properties
    var ctrl = this;
    $scope.alertsLoading = false;
    // Set the min/max dates for the date selector
    $scope.minDate = moment().add(1, 'days').startOf('day').toDate();
    $scope.maxDate = moment().add('years', 100).startOf('day').toDate();
    $scope.masterAlerts = [];
    $scope.selectedId = null;

    $scope.patientAlert = {
      PatientAlertId: null,
      MasterAlertId: null,
      PatientId: null,
      Description: '',
      SymbolId: '',
      ExpirationDate: null,
      ObjectState: saveStates.Add,
    };

    //#endregion

    //#region symbols

    // getting the font awesome icon class based on id
    $scope.symbolList = staticData.AlertIcons();
    $scope.getClass = function (id) {
      return $scope.symbolList.getClassById(id);
    };

    //#endregion

    ctrl.initializeController = function () {
      ctrl.initializeCustomAlert();
      ctrl.getMasterAlerts();
    };

    ctrl.resetErrorHandlers = function () {
      $scope.hasMasterAlertError = false;
      $scope.customFormIsValid = true;
    };

    //#region get master alerts

    ctrl.getMasterAlerts = function () {
      $scope.alertsLoading = true;
      masterAlertService.get(
        ctrl.masterAlertGetSuccess,
        ctrl.masterAlertGetFailure
      );
    };
    ctrl.masterAlertGetSuccess = function (res) {
      $scope.alertsLoading = false;
      if (res.Value) {
        $scope.masterAlerts = res.Value;
      }
    };
    ctrl.masterAlertGetFailure = function (res) {
      $scope.alertsLoading = false;
      $scope.masterAlerts = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of alerts. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };

    //#endregion

    //#region add master alert to flags

    // watch for masterAlerts selection
    $scope.$watch('selectedId', function (nv, ov) {
      // clear any left over errors in the custom form when they choose a new master alert from the drop down
      ctrl.resetErrorHandlers();
      if (nv != '' && nv != null) {
        var masterAlertSelected = angular.copy(
          listHelper.findItemByFieldValue(
            $scope.masterAlerts,
            'MasterAlertId',
            nv
          )
        );
        ctrl.addMasterAlert(masterAlertSelected);
      }
    });

    // check to make sure that the master alert selected is not already attached to the account
    // if not, add to flags
    ctrl.addMasterAlert = function (masterAlert) {
      angular.forEach($scope.person.Flags, function (flags) {
        if (angular.equals(flags.MasterAlertId, masterAlert.MasterAlertId)) {
          $scope.hasMasterAlertError = true;
          return;
        }
      });
      if (!$scope.hasMasterAlertError) {
        ctrl.addMasterAlertToArray(masterAlert);
      }
    };

    // adding the master alert selected to the account
    ctrl.addMasterAlertToArray = function (masterAlert) {
      var alert = angular.copy($scope.patientAlert);
      alert.MasterAlertId = masterAlert.MasterAlertId;
      alert.Description = masterAlert.Description;
      alert.SymbolId = masterAlert.SymbolId;

      $scope.person.Flags.push(alert);
    };

    //#endregion

    //#region remove alert

    // deleting a master or custom alert from the account
    $scope.removeAlert = function (index) {
      $scope.person.Flags.splice(index, 1);
    };

    //#endregion

    //#region custom alert handling

    ctrl.initializeCustomAlert = function () {
      $scope.customAlert = {
        Description: '',
        ExpirationDate: null,
        ObjectState: saveStates.Add,
      };
    };

    // validating custom alert
    $scope.addCustomAlert = function (customAlert) {
      // clearing a possible left over master alert errors when they choose to create a new custom alert
      ctrl.resetErrorHandlers();
      if (!customAlert || !customAlert.Description || !$scope.validExpDate) {
        $scope.customFormIsValid = false;
      } else {
        ctrl.addCustomAlertToArray(customAlert);
      }
    };

    // adding the custom alert to flags
    ctrl.addCustomAlertToArray = function (customAlert) {
      var alert = angular.copy($scope.patientAlert);
      alert.Description = customAlert.Description;
      alert.ExpirationDate = customAlert.ExpirationDate;
      $scope.person.Flags.push(alert);
      ctrl.initializeCustomAlert();
    };

    // discard custom alert entry
    $scope.cancelCustomAlert = function () {
      ctrl.initializeCustomAlert();
      ctrl.resetErrorHandlers();
    };

    //#endregion

    ctrl.initializeController();
  },
]);
