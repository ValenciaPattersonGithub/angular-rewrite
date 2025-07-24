'use strict';

angular.module('common.controllers').controller('EllipsisMenuController', [
  '$scope',
  '$timeout',
  'patSecurityService',
  'soarAnimation',
  function ($scope, $timeout, patSecurityService, soarAnimation) {
    $scope.orientV = false;

    $scope.callMenuActionsFunction = function (FunctionName) {
      $scope.callFunction({ functionName: FunctionName, param: $scope.param });
      $scope.eMenuActive = false;
    };

    //#region Menu Toggle
    $scope.eMenuToggle = function ($event) {
      if (!angular.isUndefined($event)) {
        $scope.orientV = soarAnimation.soarVPos($event.currentTarget);
      }
    };
  },
]);
