(function () {
  'use strict';
  angular
    .module('Soar.Common')
    .controller('InactiveController', inactiveController);
  inactiveController.$inject = ['$scope', 'patSecurityService'];
  function inactiveController($scope, patSecurityService) {
    BaseCtrl.call(this, $scope, 'inactiveController');
    $('section#header').hide();

    $scope.returnToLogin = function () {
      patSecurityService.logout();
    };
  }

  inactiveController.prototype = Object.create(BaseCtrl);
})();
