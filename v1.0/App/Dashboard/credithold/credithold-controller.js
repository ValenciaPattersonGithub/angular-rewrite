(function () {
    'use strict';
    angular
        .module('Soar.Common')
        .controller('creditHoldController', creditHoldController);
    creditHoldController.$inject = ['$scope', 'patSecurityService'];
    function creditHoldController($scope, patSecurityService) {
        BaseCtrl.call(this, $scope, 'creditHoldController');
        $('section#header').hide();

        $scope.returnToLogin = function () {
            patSecurityService.logout();
        };
    }

    creditHoldController.prototype = Object.create(BaseCtrl);
})();
