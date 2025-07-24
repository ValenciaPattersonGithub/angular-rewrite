'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('RadiogroupController', [
  '$scope',
  function ($scope) {
    $scope.changeValue = function (index) {
      $scope.value = $scope.options[index];

      if ($scope.changeFunction) {
        $scope.changeFunction({ value: $scope.value });
      }
    };
  },
]);
