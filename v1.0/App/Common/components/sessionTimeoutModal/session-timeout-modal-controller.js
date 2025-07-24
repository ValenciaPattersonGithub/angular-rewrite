'use strict';

angular
  .module('common.controllers')
  .controller('SessionTimeoutModalController', [
    '$scope',
    'patSecurityService',
    '$uibModalInstance',
    '$location',
    function ($scope, patSecurityService, $uibModalInstance, $location) {
      $scope.logIn = function () {
        patSecurityService.logout();
      };
    },
  ]);
