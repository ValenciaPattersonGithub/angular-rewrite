'use strict';

angular.module('common.controllers').controller('CustomLabelPanelCtrl', [
  '$scope',
  'localize',
  '$timeout',
  'toastrFactory',
  'CustomLabelService',
  function ($scope, localize, $timeout, toastrFactory, customLabelService) {
    // Boolean to toggle the buttons when saving
    $scope.panelSaving = false;
    // Force to view mode
    $scope.editIsActive = false;
    // Create temp object for reset
    $scope.tempCustomLabels = {};

    // Build instance of a user
    $scope.buildInstance = function () {
      $scope.tempCustomLabels = JSON.stringify($scope.customLabels);
    };

    // Enable
    $scope.edit = function () {
      $scope.editIsActive = true;
      $scope.panelLive = true;
      $scope.valid = false;
      $scope.buildInstance();
    };

    // Cancel
    $scope.cancelChanges = function () {
      $scope.editIsActive = false;
      $scope.panelLive = false;
      $scope.customLabels = JSON.parse($scope.tempCustomLabels);
      $scope.editIsActive = false;
    };

    // Cancel
    $scope.saveChanges = function () {
      $scope.panelSaving = true;
      $timeout(function () {
        $scope.editIsActive = false;
        $scope.panelLive = false;
        $scope.editIsActive = false;
        $scope.update();
      });
    };

    // Deep watch the labels, if changes are made, mark as valid
    $scope.$watch(
      'customLabels',
      function (nv, ov) {
        if (nv && nv !== ov) {
          $scope.valid = true;
        }
      },
      true
    );

    // Watch the panelList boolean and update the tooltip text to coincide with it
    $scope.$watch('panelLive', function (nv) {
      $scope.panelLiveTooltip =
        nv == true
          ? localize.getLocalizedString(
              'You must close the active portlet before you can open another.'
            )
          : '';
    });
  },
]);
