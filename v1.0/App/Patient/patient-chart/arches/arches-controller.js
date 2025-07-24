'use strict';
angular.module('Soar.Patient').controller('ArchesController', [
  '$scope',
  function ($scope) {
    $scope.selectArch = function (arch) {
      angular.forEach($scope.data, function (arch) {
        arch.selected = false;
      });
      arch.selected = true;
      $scope.$parent.$parent.activeArch = arch;
      $scope.$parent.$parent.validateForm();
    };
  },
]);
