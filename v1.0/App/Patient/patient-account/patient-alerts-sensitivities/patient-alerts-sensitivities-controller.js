'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientAlertsSensitivitiesController', [
    '$scope',
    '$routeParams',
    'StaticData',
    'MasterAlertService',
    'PatientServices',
    'toastrFactory',
    'localize',
    'ListHelper',
    'PatientAlertsFactory',
    '$rootScope',
    function (
      $scope,
      $routeParams,
      staticData,
      masterAlertService,
      patientServices,
      toastrFactory,
      localize,
      listHelper,
      patientAlertsFactory,
      $rootScope
    ) {
      var ctrl = this;

      $scope.getAlerts = function () {
        patientServices.Alerts.get(
          { Id: $routeParams.patientId },
          $scope.patientAlertsServiceGetSuccess,
          $scope.patientAlertsServiceGetFailure
        );
      };

      $scope.patientAlertsServiceGetSuccess = function (res) {
        $scope.alerts = angular.copy(res.Value);
      };

      $scope.patientAlertsServiceGetFailure = function () {
        $scope.alerts = [];
        toastrFactory.error(
          'Failed to retrieve the list of alerts. Refresh the page to try again.',
          'Server Error'
        );
      };

      $scope.getAlerts();

      // scope vars
      $scope.masterAlerts = [];
      $scope.selectedId = null;
      $scope.alertSaving = false;
      $scope.tempAlert = {
        PatientAlertId: null,
        MasterAlertId: null,
        Description: '',
        ExpirationDate: null,
        SymbolId: '',
      };

      // Set the min/max dates for the date selector
      $scope.minDate = moment().add(1, 'days').startOf('day').toDate();
      $scope.maxDate = moment().add(100, 'years').startOf('day').toDate();

      // getting the font awesome icon class based on id
      $scope.symbolList = staticData.AlertIcons();
      $scope.getClass = function (id) {
        return $scope.symbolList.getClassById(id);
      };

      // getting the master alerts for the dropdown
      this.getMasterAlerts = function () {
        masterAlertService.get(
          ctrl.masterAlertGetSuccess,
          ctrl.masterAlertGetFailure
        );
      };
      this.masterAlertGetSuccess = function (res) {
        if (res.Value) {
          $scope.masterAlerts = res.Value;
        }
      };
      this.masterAlertGetFailure = function (res) {
        $scope.masterAlerts = [];
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of alerts. Refresh the page to try again.'
          ),
          localize.getLocalizedString('Error')
        );
      };
      ctrl.getMasterAlerts();

      // listening for masterAlerts dropdown changes
      $scope.$watch('selectedId', function (newValue) {
        // clear any left over errors in the custom form when they choose a new master alert from the drop down
        $scope.customFormIsValid = true;
        if (newValue == -1) {
          $scope.hasMasterAlertError = false;
        } else if (newValue) {
          var masterAlertSelected = angular.copy(
            listHelper.findItemByFieldValue(
              $scope.masterAlerts,
              'MasterAlertId',
              newValue
            )
          );
          if (masterAlertSelected) {
            ctrl.processMasterAlertSelection(masterAlertSelected);
          }
        }
      });

      // checking to make sure that the master alert selected is not already attached to the account
      this.processMasterAlertSelection = function (masterAlertSelected) {
        var masterAlertAlreadyAttachedToAccount = false;
        var breakLoop = false;
        angular.forEach($scope.alerts, function (alert) {
          if (
            !breakLoop &&
            angular.equals(
              alert.MasterAlertId,
              masterAlertSelected.MasterAlertId
            )
          ) {
            masterAlertAlreadyAttachedToAccount = true;
            breakLoop = true;
          }
        });
        if (masterAlertAlreadyAttachedToAccount) {
          $scope.hasMasterAlertError = true;
        } else {
          $scope.hasMasterAlertError = false;
          ctrl.addMasterAlertToAccount(masterAlertSelected);
        }
      };

      // adding the master alert selected to the account
      this.addMasterAlertToAccount = function (masterAlertSelected) {
        var params = masterAlertSelected;
        params.Id = $routeParams.patientId;
        params.PatientId = $routeParams.patientId;
        patientServices.Alerts.create(
          params,
          ctrl.masterAlertCreateSuccess,
          ctrl.masterAlertCreateFailure
        );
      };
      this.masterAlertCreateSuccess = function (res) {
        $scope.hasMasterAlertError = false;
        // pushing the new alert on to the account alerts list that is in scope
        $scope.alerts.push(res.Value);
        ctrl.updateAlertsInFactory();
        toastrFactory.success(
          localize.getLocalizedString('Update {0}.', ['successful']),
          localize.getLocalizedString('Success')
        );
      };
      this.masterAlertCreateFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Update was unsuccessful. Please retry your save.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      // adding the custom alert to the account
      $scope.createCustomAlert = function (tempAlert) {
        // clearing a possible left over master alert errors when they choose to create a new custom alert
        $scope.hasMasterAlertError = false;
        $scope.alertSaving = true;
        var params = tempAlert;
        if (!tempAlert || !tempAlert.Description || !$scope.validExpDate) {
          $scope.alertSaving = false;
          $scope.customFormIsValid = false;
        } else {
          $scope.customFormIsValid = true;
          params.Id = $routeParams.patientId;
          params.PatientId = $routeParams.patientId;
          params.SymbolId = '';
          patientServices.Alerts.create(
            params,
            ctrl.customAlertCreateSuccess,
            ctrl.customAlertCreateFailure
          );
        }
      };
      this.customAlertCreateSuccess = function (res) {
        $scope.alertSaving = false;
        // pushing the new alert on to the account alerts list that is in scope
        $scope.alerts.push(res.Value);
        ctrl.updateAlertsInFactory();
        $scope.tempAlert = resetTemporaryAlert(null, null, '', '', '');
        toastrFactory.success(
          localize.getLocalizedString('Update {0}.', ['successful']),
          localize.getLocalizedString('Success')
        );
      };
      this.customAlertCreateFailure = function () {
        $scope.alertSaving = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'Update was unsuccessful. Please retry your save.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      // discard button hamdler
      $scope.cancelCustomAlertCreation = function () {
        $scope.tempAlert = resetTemporaryAlert(null, null, '', null, '');
        $scope.hasMasterAlertError = false;
        $scope.customFormIsValid = true;
      };

      // deleting a master or custom alert from the account
      $scope.deleteAlert = function (index) {
        var alert = $scope.alerts[index];
        patientServices.Alerts.delete(
          { Id: alert.PatientId, PatientAlertId: alert.PatientAlertId },
          function () {
            $scope.hasMasterAlertError = false;
            $scope.customFormIsValid = true;
            // removing the deleting alert from the scope var
            $scope.alerts.splice(index, 1);
            ctrl.updateAlertsInFactory();
            toastrFactory.success(
              localize.getLocalizedString('Remove successful.'),
              localize.getLocalizedString('Success')
            );
          },
          ctrl.deleteAlertFailure
        );
      };
      this.deleteAlertFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('Remove failed.'),
          localize.getLocalizedString('Server Error')
        );
      };

      // helper function for creating/clearing the temp alert
      function resetTemporaryAlert(
        patientAlertId,
        masterAlertId,
        description,
        expirationDate,
        symbolId
      ) {
        return {
          PatientAlertId: patientAlertId,
          MasterAlertId: masterAlertId,
          Description: description,
          ExpirationDate: expirationDate,
          SymbolId: symbolId,
        };
      }

      // upodating the list in the factory, so that 'view' panels can make sure that they are up to date
      this.updateAlertsInFactory = function () {
        patientAlertsFactory.PatientAlerts = {
          PatientId: $routeParams.patientId,
          Alerts: angular.copy($scope.alerts),
        };
        $rootScope.$broadcast('alerts-updated');
      };
    },
  ]);
