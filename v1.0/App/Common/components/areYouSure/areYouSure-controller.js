'use strict';

angular.module('common.controllers').controller('AreYouSureController', [
  '$scope',
  'localize',
  '$timeout',
  function ($scope, localize, $timeout) {
    $scope.cancelAction = function () {
      $scope.ifNo();
    };
    $scope.confirmAction = function () {
      $scope.ifYes();
    };

    $scope.$watch(
      'isFocusSet',
      function (nv, ov) {
        if (nv && nv != ov) {
          if ($scope.isFocusSet != null && $scope.isFocusSet === true) {
            var append = $scope.appendId ? $scope.appendId : '';
            $timeout(function () {
              angular.element('#btnConfirmDiscard' + append).focus();
            }, 0);
          }
        }
      },
      true
    );
  },
]);
