'use strict';

angular
  .module('common.controllers')
  .controller('ServiceCodesPickerModalController', [
    '$scope',
    '$uibModalInstance',
    function ($scope, $uibModalInstance) {
      var ctrl = this;

      // close modal
      $scope.close = function () {
        $uibModalInstance.dismiss();
      };

      $scope.onSelect = function (selectedServiceCodes) {
        $uibModalInstance.close(selectedServiceCodes);
      };
    },
  ]);
