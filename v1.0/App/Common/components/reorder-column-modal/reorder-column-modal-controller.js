'use strict';

angular
  .module('common.controllers')
  .controller('ReorderColumnModalController', [
    '$scope',
    '$uibModalInstance',
    'modalResolve',
    function ($scope, mInstance, modalResolve) {
      var ctrl = this;

      $scope.mouseEnter = function (index, e) {
        $scope.hoverIndex = index;
      };

      $scope.mouseDown = function (index, e) {
        $scope.dragIndex = index;
      };

      $scope.mouseUp = function (index, e) {
        if (
          $scope.dragIndex > -1 &&
          $scope.hoverIndex > -1 &&
          $scope.dragIndex != $scope.hoverIndex
        ) {
          var temp, step;

          // if dragging down, interate forwards; otherwise, iterate backwards.
          step = $scope.dragIndex < $scope.hoverIndex ? 1 : -1;

          // store the dragged index in a temporarily
          temp = $scope.list[$scope.dragIndex];

          // shift all the values up or down 1 depending on whather we are dragging up or down
          for (var i = $scope.dragIndex; i != $scope.hoverIndex; i = i + step) {
            $scope.list[i] = $scope.list[i + step];
          }

          // replace the largest index with the temporary variable
          $scope.list[$scope.hoverIndex] = temp;
        }

        $scope.dragIndex = -1;
      };

      $scope.restoreDefaults = function () {
        mInstance.close([]);
      };

      $scope.save = function () {
        mInstance.close($scope.list);
      };

      $scope.cancel = function () {
        mInstance.dismiss();
      };

      $scope.initialize = function () {
        $scope.list = modalResolve.list != null ? modalResolve.list : [];
        $scope.display = modalResolve.display;
        $scope.dragIndex = -1;
        $scope.hoverIndex = -1;
      };
    },
  ]);
