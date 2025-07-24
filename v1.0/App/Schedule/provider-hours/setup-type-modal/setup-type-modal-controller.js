'use strict';

angular.module('Soar.Schedule').controller('SetupTypeModalController', [
  '$scope',
  '$uibModalInstance',
  'mode',
  function ($scope, mInstance, mode) {
    $scope.mode = mode;

    $scope.series = function (value) {
      mInstance.close(value);
    };

    $scope.dismiss = function () {
      mInstance.dismiss();
    };
  },
]);
