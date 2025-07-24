'use strict';
var app = angular.module('Soar.Dashboard');

var UserDashboardWrapperController = app
  .controller('UserDashboardWrapperController', [
    '$scope',
    'FeatureService',
    'locationService',
    '$rootScope',
    function ($scope, featureService, locationService, $rootScope) {
      var ctrl = this;

      // used to control whether to use converted view or not.
      $scope.useConverted = false;
      $scope.migrationFeatureFlagsLoaded = false;

      //#region conversion feature control

      ctrl.getConversionFlags = function () {
        featureService
          .isMigrationEnabled('NgMigration_UserDashboard')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      var selectedLocation = locationService.getCurrentLocation();
      if (selectedLocation) {
        ctrl.getConversionFlags();
      } else {
        $rootScope.$on('patCore:load-location-display', () => {
          ctrl.getConversionFlags();
        });
      }
      //#endregion
    },
  ])
  .directive('userDashboardTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'App/Dashboard/user-dashboard.html',
      controller: 'UserDashboardController',
    };
  });
