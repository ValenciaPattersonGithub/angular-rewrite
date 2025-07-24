'use strict';

angular.module('Soar.Patient').controller('PatientAlertFlagController', [
  '$scope',
  'toastrFactory',
  'PatientServices',
  'StaticData',
  'localize',
  'patSecurityService',
  '$location',
  'PatientMedicalHistoryAlertsFactory',
  'PatientAlertsFactory',
  'PersonFactory',
  function (
    $scope,
    toastrFactory,
    patientServices,
    staticData,
    localize,
    patSecurityService,
    $location,
    patientMedicalHistoryAlertsFactory,
    patientAlertsFactory,
    personFactory
  ) {
    //#region scope and controller variables

    var ctrl = this;
    $scope.hasViewAccess = false;
    $scope.masterAlerts = [];
    $scope.customAlerts = [];
    $scope.patientMedicalHistoryAlerts = [];

    // getting the font awesome icon class based on id
    ctrl.symbolList = staticData.AlertIcons();

    // get font awesome class name from id
      $scope.getClass = function (id) {
      if (id == null) {
          id = '0';
      }
      return 'fa ' + ctrl.symbolList.getClassById(id);
    };

    //#endregion

    //#region authorization

    // add access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-per-peralt-view'
      );
    };

    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-peralt-view'),
          'Not Authorized'
        );
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };

    // authorization
    ctrl.authAccess();

    //#endregion

    //#region alerts

    ctrl.getAlerts = function () {
      // get in here if the flags have updated since this controller initially got its data
      var patientId = $scope.patient.Profile
        ? $scope.patient.Profile.PatientId
        : $scope.patient.PatientId;
      if (
        angular.isArray(patientAlertsFactory.PatientAlerts.Alerts) &&
        patientId === patientAlertsFactory.PatientAlerts.PatientId
      ) {
        $scope.patient.Flags.length = 0;
        $scope.patient.Flags = angular.copy(
          patientAlertsFactory.PatientAlerts.Alerts
        );
      }
      $scope.masterAlerts = _.filter($scope.patient.Flags, function (alert) {
        return alert.MasterAlertId;
      });
      $scope.customAlerts = _.filter($scope.patient.Flags, function (alert) {
        return !alert.MasterAlertId;
      });
    };

    ctrl.getAlerts();

    //#endregion

    //#region medical history alerts

    ctrl.getMedicalHistoryAlerts = function () {
      if ($scope.hasViewAccess) {
        var patientId = $scope.patient.Profile
          ? $scope.patient.Profile.PatientId
          : $scope.patient.PatientId;
        if (patientId) {
          patientMedicalHistoryAlertsFactory
            .PatientMedicalHistoryAlerts(patientId)
            .then(function (res) {
              $scope.patientMedicalHistoryAlerts = res.Value;
            });
        }
      }
    };

    ctrl.loadMedicalHistoryAlerts = function () {
      // initial load of medical history alerts is from the patient object passed to the directive if available
      if ($scope.patient && $scope.patient.MedicalHistoryAlerts) {
        $scope.patientMedicalHistoryAlerts =
          $scope.patient.MedicalHistoryAlerts;
      } else {
        ctrl.getMedicalHistoryAlerts();
      }
    };
    ctrl.loadMedicalHistoryAlerts();

    // refresh when medical history changes
    $scope.$on(
      'soar:medical-history-form-created',
      function (medicalHistoryForm) {
        ctrl.getMedicalHistoryAlerts();
      }
    );

    //#endregion
  },
]);
