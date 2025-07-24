'use strict';

var app = angular
  .module('Soar.BusinessCenter')
  .controller('UndoSupportController', [
    '$scope',
    'UndoSupportService',
    function ($scope, undoSupportService) {
      $scope.canUndo = false;
      $scope.canRedo = false;

      $scope.undoServiceObject = undoSupportService.record(
        'section',
        $scope,
        true
      );

      $scope.canUndoRedo = function () {
        $scope.canUndo = $scope.undoServiceObject.canUndo();
        $scope.canRedo = $scope.undoServiceObject.canRedo();
      };

      $scope.undoServiceObject.addOnAdjustFunction($scope.canUndoRedo);
      $scope.undoServiceObject.addOnUndoFunction($scope.canUndoRedo);
      $scope.undoServiceObject.addOnRedoFunction($scope.canUndoRedo);

      $scope.undo = function () {
        $scope.undoServiceObject.undo();
      };

      $scope.clearUndo = function () {
        $scope.undoServiceObject.clear();
        //$scope.undoServiceObject.canUndo();
        //$scope.undoServiceObject.canRedo();
      };

      $scope.redo = function () {
        $scope.undoServiceObject.redo();
      };
    },
  ]);
