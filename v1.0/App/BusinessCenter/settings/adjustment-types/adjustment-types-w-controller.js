'use strict';
var app = angular.module('Soar.BusinessCenter');

var AdjustmentTypesWrapperController = app
  .controller('AdjustmentTypesWrapperController', [
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
          .isMigrationEnabled('NgMigration_AdjustmentTypes')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('adjustmentTypesTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/BusinessCenter/settings/adjustment-types/adjustment-types.html',
      controller: 'AdjustmentTypesController',
    };
  });
