'use strict';
var app = angular.module('Soar.BusinessCenter');

var userLandingWrapperController = app
  .controller('UserLandingWrapperController', [
    '$scope',
    'FeatureService',
    '$location',
    'localize',
    function ($scope, featureService, $location, localize) {
      var ctrl = this;
      // used to control whether to use converted view or not.
      $scope.useConverted = false;
      $scope.migrationFeatureFlagsLoaded = false;
      //#region conversion feature control
      ctrl.getConversionFlags = function () {
        featureService
          .isMigrationEnabled('NgMigration_TeamMemberLanding')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('userLandingControllerOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'App/BusinessCenter/users/user-landing/user-landing.html',
      controller: 'UserLandingController',
    };
  });
