'use strict';
var app = angular.module('Soar.BusinessCenter');

var userRolesByLocationWrapperController = app
  .controller('UserRolesByLocationWrapperController', [
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
          .isMigrationEnabled('NgMigration_AssignRoles')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('userRolesByLocationTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/BusinessCenter/user-roles-by-location/user-roles-by-location.html',
      controller: 'UserRolesByLocationController',
    };
  });
