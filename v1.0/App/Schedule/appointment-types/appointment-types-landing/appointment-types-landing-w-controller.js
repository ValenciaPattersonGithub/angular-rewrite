'use strict';
var app = angular.module('Soar.Schedule');

var appointmentTypesLandingWrapperController = app
  .controller('AppointmentTypesLandingWrapperController', [
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
          .isMigrationEnabled('NgMigration_AppointmentTypesLanding')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('appointmentTypesLandingTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/Schedule/appointment-types/appointment-types-landing/appointment-types-landing.html',
      controller: 'AppointmentTypesLandingController',
    };
  });
