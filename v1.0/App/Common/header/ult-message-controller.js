'use strict';

var app = angular
  .module('Soar.Common')
  .controller('UltMessageController', [
    '$rootScope',
    '$scope',
    'patSecurityService',
    UltMessageController,
  ]);

function UltMessageController($rootScope, $scope, patSecurityService) {
  BaseCtrl.call(this, $scope, 'UltMessageController');
  var ctrl = this;

  $scope.logoutFromUlt = function () {
    patSecurityService.logout();
  };
}

UltMessageController.prototype = Object.create(BaseCtrl.prototype);
