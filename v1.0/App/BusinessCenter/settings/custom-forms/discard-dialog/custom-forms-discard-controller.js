'use strict';

var app = angular.module('Soar.BusinessCenter');

var CustomFormDiscardControl = app.controller('CustomFormDiscardController', [
  '$scope',
  '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.discardForm = function () {
      $uibModalInstance.close();
    };

    $scope.cancelDiscard = function () {
      $uibModalInstance.dismiss('cancel');
    };
  },
]);
