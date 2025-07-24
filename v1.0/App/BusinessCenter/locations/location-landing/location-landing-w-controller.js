'use strict';
var app = angular.module('Soar.BusinessCenter');

var LocationLandingWrapperController = app
  .controller('LocationLandingWrapperController', [
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
          .isMigrationEnabled('NgMigration_LocationLanding')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };
      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('locationLandingTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/BusinessCenter/locations/location-landing/location-landing.html',
      controller: 'LocationLandingController',
    };
  });
