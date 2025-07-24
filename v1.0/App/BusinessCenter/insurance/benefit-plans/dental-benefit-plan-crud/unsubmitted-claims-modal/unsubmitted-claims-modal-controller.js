'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('UnsubmittedClaimsModalController', [
  '$scope',
  '$uibModalInstance',
  'params',
  function ($scope, $uibModalInstance, params) {
    var ctrl = this;

    $scope.params = params;

    $scope.updateUnsubmittedClaims = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  },
]);
