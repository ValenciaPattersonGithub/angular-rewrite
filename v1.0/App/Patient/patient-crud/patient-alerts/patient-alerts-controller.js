'use strict';

angular.module('Soar.Patient').controller('PatientAlertsController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  '$window',
  'PatientServices',
  'MasterAlertService',
  'StaticData',
  '$templateCache',
  'ListHelper',
  '$http',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    $timeout,
    toastrFactory,
    $window,
    patientServices,
    masterAlertService,
    staticData,
    $templateCache,
    listHelper,
    $http
  ) {
    //#region Kendo Combobox
    $http
      .get(
        'App/Patient/patient-crud/patient-alerts/patient-alerts-dropdown.html'
      )
      .then(function (res) {
        $scope.dropdownTemplate = res.data;
      });
    //#endregion

    // #region Initialization

    // flag for retrieving alert list
    $scope.retrievingAlertList = true;

    // text in input
    $scope.inputText = '';

    // flag for currently saving
    $scope.alertSaving = false;

    // form valid flag
    $scope.formIsValid = true;

    // master alert error flag
    $scope.hasMasterAlertError = false;

    // max number of alerts error flag
    $scope.maxNumberOfAlertsReached = false;

    // patient alert list
    $scope.patientAlerts = [];

    // master alert dropdown list
    $scope.masterAlerts = [];

    // Stub out temp alert
    $scope.alert = {
      PatientAlertId: null,
      MasterAlertId: null,
      Description: '',
      ExpirationDate: null,
      SymbolId: null,
    };

    // Set the min/max dates for the date selector
    $scope.minDate = moment().add(1, 'days').startOf('day').toDate();
    $scope.maxDate = moment().add(100, 'years').startOf('day').toDate();

    // #endregion Initialization

    // #region Carousel
    // get alert collection for carousel
    $scope.getAlertCollection = function (size) {
      var collection;
      var alertCollection = [];

      for (var i = 0; i < $scope.patientAlerts.length; i += size) {
        collection = {
          alerts: [],
        };

        for (var j = 0; j < size; j++) {
          if ($scope.patientAlerts[i + j]) {
            collection.alerts[j] = $scope.patientAlerts[i + j];
          }
        }

        alertCollection.push(collection);
      }

      $scope.alertCarousel = alertCollection;

      // Add this back in if we end up limiting the alerts to ten permanently
      //if ($scope.patientAlerts.length >= 10) {
      //    $scope.maxNumberOfAlertsReached = true;
      //}
      //else {
      //    $scope.maxNumberOfAlertsReached = false;
      //}
    };

    // Allows carousel to be 'responsive'. Will adjust how many can be shown at a time based on window size
    // Since we manually create the collections
    angular.element($window).bind('resize', function () {
      $scope.refreshCarousel();
      $scope.$digest();
    });

    // refresh carousel
    $scope.refreshCarousel = function () {
      var windowWidth = $window.innerWidth;
      var minMobileWidth = 320;
      // Fudge factor for better responsive layout
      var fudge = windowWidth < 900 ? 275 : 200;
      // Dividing by minimum mobile width + additional styling fudge
      var size = Math.round(windowWidth / (minMobileWidth + fudge));
      if ($scope.collectionSize != size) {
        // desktop
        $scope.collectionSize = size;
        $scope.getAlertCollection($scope.collectionSize);
      }
    };

    // Initialize carousel
    $scope.refreshCarousel();

    // watch patient alerts list and refresh carousel if needed
    $scope.$watch('patientAlerts.length', function (nv, ov) {
      if (nv != ov) {
        $scope.getAlertCollection($scope.collectionSize);
      }
    });

    // #endregion Carousel

    // #region Alerts
    // Drowdown Text
    $scope.dropDownText = localize
      .getLocalizedString('Select {0}', ['Alert'])
      .toString()
      .toUpperCase();

    // List of symbols that can be used for master alerts
    $scope.symbolList = staticData.AlertIcons();
    $scope.getClass = function (id) {
      return $scope.symbolList.getClassById(id);
    };

    // get a list of patient alerts
    $scope.getAlerts = function () {
      patientServices.Alerts.get(
        { Id: $routeParams.patientId },
        $scope.patientAlertsServiceGetSuccess,
        $scope.patientAlertsServiceGetFailure
      );
    };

    $scope.patientAlertsServiceGetSuccess = function (res) {
      $scope.retrievingAlertList = false;
      // Set the patient alert list
      $scope.patientAlerts = $scope.patientAlerts.concat(res.Value);

      $scope.getAlertCollection();
    };

    $scope.patientAlertsServiceGetFailure = function () {
      $scope.retrievingAlertList = false;

      // Toastr alert to show error
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of alerts. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Server Error')
      );

      // Reset patient alert list
      $scope.patientAlerts = [];
    };

    // get a list of master alerts for dropdown
    $scope.getMasterAlerts = function () {
      masterAlertService.get(
        $scope.masterAlertServiceGetSuccess,
        $scope.masterAlertServiceGetFailure
      );
    };

    $scope.masterAlertServiceGetSuccess = function (res) {
      $scope.masterAlerts = res.Value;
      $scope.masterAlerts.unshift({
        MasterAlertId: -1,
        Description: $scope.dropDownText,
        SymbolId: null,
      });
    };

    $scope.masterAlertServiceGetFailure = function () {
      $scope.masterAlerts = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of alerts. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };

    if ($scope.editMode) {
      // Load all patient alerts
      $scope.getAlerts();

      // load master alert for dropdown
      $scope.getMasterAlerts();
    }

    $scope.selectedId = null;
    $scope.$watch('selectedId', function (nv) {
      if (nv) {
        var alert = angular.copy(
          listHelper.findItemByFieldValue(
            $scope.masterAlerts,
            'MasterAlertId',
            nv
          )
        );
        $scope.selectAlert(alert);
      }
    });

    // Selecting alert from Master List
    $scope.selectAlert = function (masterListAlert) {
      if (masterListAlert.MasterAlertId == -1) {
        $scope.alertSaving = false;
        return;
      }

      // flag for currently attached master alert
      var masterAlertIdFound = false;
      $scope.inputText = masterListAlert.Description;

      // store master alert from dropdown and current alert list
      var alert = masterListAlert;
      var alertList = $scope.patientAlerts;

      // loop through alert list looking for currently attached master alert
      var i = 0,
        length = alertList.length;

      for (; i < length; i++) {
        if (angular.equals(alertList[i].MasterAlertId, alert.MasterAlertId)) {
          masterAlertIdFound = true;
          break;
        }
      }

      if (masterAlertIdFound) {
        // currently attached
        $scope.hasMasterAlertError = true;
      } else {
        $scope.hasMasterAlertError = false;

        // not currently attached so attach master alert to patient
        alert.Description = masterListAlert.Description;
        alert.MasterAlertId = masterListAlert.MasterAlertId;
        alert.SymbolId = masterListAlert.SymbolId;

        $scope.save(alert);
      }
    };

    // Clear temporary alert
    $scope.clearAlert = function () {
      $scope.alert = {
        PatientAlertId: null,
        MasterAlertId: null,
        Description: '',
        ExpirationDate: null,
        SymbolId: null,
      };
    };

    // #endregion Alerts

    // #region Alert CRUD

    // Save patient alert
    $scope.save = function (alert) {
      $scope.alertSaving = true;
      var params = alert;

      if (alert.MasterAlertId == null) $scope.validateForm();
      $scope.hasErrors = !$scope.formIsValid;

      if (
        (alert.MasterAlertId && alert.MasterAlertId != '') ||
        !$scope.hasErrors
      ) {
        // set params for service call
        params.Id = $routeParams.patientId;
        params.PatientId = $routeParams.patientId;

        // if this is a master alert assignment, pass those parameters to service
        if (alert.MasterAlertId != '') {
          params.MasterAlertId = alert.MasterAlertId;
          params.SymbolId = alert.SymbolId;
        }

        // call service
        patientServices.Alerts.create(
          params,
          $scope.patientAlertsServiceCreateSuccess,
          $scope.patientAlertsServiceCreateFailure
        );
      } else {
        $scope.alertSaving = false;
      }
    };

    $scope.patientAlertsServiceCreateSuccess = function (res) {
      // push alert from service onto the patient alerts list
      $scope.patientAlerts.push(res.Value);

      // reset the temp alert
      $scope.clearAlert();
      $scope.alertSaving = false;
      // since we successfully saved, clear the master alert error
      $scope.hasMasterAlertError = false;
      toastrFactory.success(
        localize.getLocalizedString('Update {0}.', ['successful']),
        localize.getLocalizedString('Success')
      );
    };
    $scope.patientAlertsServiceCreateFailure = function () {
      $scope.alertSaving = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Update was unsuccessful. Please retry your save.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    // Delete
    $scope.delete = function (alert) {
      var params = alert;
      params.PatientId = $routeParams.patientId;
      params.Id = $routeParams.patientId;

      patientServices.Alerts.delete(
        params,
        function () {
          $scope.patientAlertsServiceDeleteSuccess(alert);
        },
        $scope.patientAlertsServiceDeleteFailure
      );
    };

    $scope.patientAlertsServiceDeleteSuccess = function (alert) {
      $scope.patientAlerts.splice($scope.patientAlerts.indexOf(alert), 1);
      toastrFactory.success(
        localize.getLocalizedString('Remove successful.'),
        localize.getLocalizedString('Success')
      );
    };

    $scope.patientAlertsServiceDeleteFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Remove failed.'),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.cancel = function () {
      $scope.clearAlert();
      $scope.formIsValid = true;
    };

    // #endregion Alert CRUD

    // #region Form Validity
    $scope.$watch('alert.Description', function (nv, ov) {
      if (nv != ov && nv.length > 0) {
        $scope.validateForm();
      }
    });

    $scope.$watch('alert.ExpirationDate', function (nv, ov) {
      if (nv != ov && nv.length > 0) {
        $scope.validateForm();
      }
    });

    // validate required and any attributes
    $scope.validateForm = function () {
      $scope.formIsValid =
        $scope.alert.Description !== null &&
        $scope.alert.Description.length > 0 &&
        $scope.validExpDate;
    };
    // #endregion Form Validity

    // Filter the full list of master alerts
    $scope.filterMasterAlerts = function (masterAlert) {
      if (masterAlert !== null && masterAlert !== undefined) {
        for (var i = 0; i < $scope.patientAlerts.length; i++) {
          if (
            masterAlert.MasterAlertId == $scope.patientAlerts[i].MasterAlertId
          ) {
            return false;
          }
        }
        return true;
      }
      return true;
    };
  },
]);
