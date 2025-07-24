'use strict';
var app = angular.module('Soar.BusinessCenter');

var patientMedicalAlertsWrapperController = app
  .controller('PatientMedicalAlertsWrapperController', [
    '$scope',
    'FeatureService',
    'medicalHistoryAlerts',
    function ($scope, featureService, medicalHistoryAlerts) {
      var ctrl = this;

      // used to control whether to use converted view or not.
      $scope.useConverted = false;
      $scope.migrationFeatureFlagsLoaded = false;
      $scope.alertsShared = medicalHistoryAlerts.Value;

      //#region conversion feature control

      ctrl.getConversionFlags = function () {
        featureService
          .isMigrationEnabled('NgMigration_PatientMedicalAlerts')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('patientMedicalAlertsTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: { alerts: '=' },
      templateUrl:
        'App/BusinessCenter/settings/patient-medical-alerts/patient-medical-alerts.html',
      controller: 'PatientMedicalAlertsController',
    };
  });
//#region Resolve
patientMedicalAlertsWrapperController.resolvePatientMedicalAlerts = {
  medicalHistoryAlerts: [
    '$route',
    'MedicalHistoryAlertsFactory',
    function ($route, medicalHistoryAlertsFactory) {
      return medicalHistoryAlertsFactory.MedicalHistoryAlerts();
    },
  ],
};

//#endregion

//TODO
// localize
// amfa
// less
