'use strict';
var app = angular.module('Soar.BusinessCenter');

var LocationCrudWrapperController = app
  .controller('LocationCrudWrapperController', [
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
          .isMigrationEnabled('NgMigration_LocationCrud')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('locationCrudTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/BusinessCenter/locations/location-crud/location-crud.html',
      controller: 'LocationCrudController',
    };
  });
