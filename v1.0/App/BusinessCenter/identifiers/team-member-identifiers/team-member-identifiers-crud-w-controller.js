'use strict';

var app = angular.module('Soar.BusinessCenter');

var TeamMemberIdentifiersWrapperControl = app
  .controller('TeamMemberIdentifiersWrapperController', [
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
          .isMigrationEnabled('NgMigration_TeamMemberIdentifiers')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('teamMemberIdentifiersTemplateOriginal', function () {
    return {
      restrict: 'E',
      scope: false,
      templateUrl:
        'App/BusinessCenter/identifiers/team-member-identifiers/team-member-identifiers-crud.html',
      controller: 'TeamMemberIdentifierController',
    };
  });
