'use strict';

angular
  .module('common.controllers')
  .controller('CdtCodePickerModalController', [
    '$scope',
    '$uibModalInstance',
    function ($scope, $uibModalInstance) {
      var ctrl = this;

      // close modal
      $scope.close = function () {
        $uibModalInstance.dismiss();
      };

      $scope.onSelect = function (cdtCode) {
        $uibModalInstance.close(cdtCode);
      };
    },
  ]);
