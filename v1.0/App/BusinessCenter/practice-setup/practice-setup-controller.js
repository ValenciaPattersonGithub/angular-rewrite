'use strict';

angular.module('Soar.BusinessCenter').controller('PracticeSetupController', [
  '$scope',
  'ListHelper',
  'FuseFlag',
  'FeatureFlagService',
  function ($scope, listHelper, fuseFlag, featureFlagService) {
    $scope.practiceInfoList = [];
    $scope.teamMembersSettingsList = [];
    $scope.clinicalSetupList = [];
    $scope.patientAccountingSetupList = [];
    $scope.scheduleSetupList = [];
    $scope.patientProfileSetupList = [];
    $scope.chartSettingsList = [];
    $scope.servicesSettingsList = [];
    $scope.prmSettingsList = [];

    $scope.showPrmLink = false;
    featureFlagService.getOnce$(fuseFlag.ShowPrmLinkInSettings).subscribe((value) => {
      $scope.showPrmLink = value;
    });

    $scope.$watch(
      'practiceInfoList',
      function (nv, ov) {
        if (nv && nv !== ov) {
          var users = listHelper.findItemByFieldValue(
            $scope.practiceInfoList,
            'Section',
            'Users'
          );
          if (users) {
            $scope.hasAtLeastOneProvider =
              users.OtherInformation === 'True' ? true : false;
          }
        }
      },
      true
    );
  },
]);
