'use strict';
angular.module('Soar.Patient').controller('ChartingGroupsController', [
  '$scope',
  'ListHelper',
  'toastrFactory',
  'localize',
  'ChartingFavoritesFactory',
  '$uibModalInstance',
  function (
    $scope,
    listHelper,
    toastrFactory,
    localize,
    chartingFavoritesFactory,
    $uibModalInstance
  ) {
    var ctrl = this;
    $scope.groupName = '';

    $scope.close = function () {
      $uibModalInstance.close();
    };

    $scope.save = function () {
      $uibModalInstance.close($scope.groupName);
    };
  },
]);
