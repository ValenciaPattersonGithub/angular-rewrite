'use strict';
var app = angular.module('Soar.Patient');

var patientLandingWrapperController = app
  .controller('PatientLandingWrapperController', [
    '$scope',
    'FeatureService',
    function ($scope, featureService) {
      var ctrl = this;

      // used to control whether to use converted view or not.
      $scope.useConverted = false;
      $scope.migrationFeatureFlagsLoaded = false;

      //#region conversion feature control

      ctrl.getConversionFlags = function () {
        featureService
          .isMigrationEnabled('NgMigration_PatientLanding')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('patientLandingTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'App/Patient/patient-landing/patient-landing.html',
      controller: 'PatientLandingController',
    };
  });
