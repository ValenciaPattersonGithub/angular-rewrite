'use strict';

angular.module('common.controllers').controller('SlotPreviewListController', [
  '$scope',
  function ($scope) {
    var ctrl = this;

    $scope.hideFilters = function () {
      if ($scope.onClose) {
        $scope.onClose();
      }
    };

    $scope.previewSlot = function (index, slot) {
      $scope.previewParam.SelectedSlot = slot;
      $scope.previewParam.SelectedSlotIndex = index;
      $scope.previewParam.SelectedSlot.Start = new Date(slot.LocationStartTime);
      $scope.previewParam.SelectedSlot.End = new Date(slot.LocationEndTime);
      if ($scope.onPreview) {
        $scope.onPreview();
      }
    };
  },
]);
