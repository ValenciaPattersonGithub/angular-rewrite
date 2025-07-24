(function () {
  'use strict';
  angular.module('patUi', []);
})();
(function () {
  'use strict';
  var app = angular.module('patUi');
  app.controller('AuthenticationController', [
    '$scope',
    '$rootScope',
    '$uibModal',
    '$timeout',
    'patSecurityService',
    function ($scope, $rootScope, $uibModal, $timeout, patSecurityService) {
      $scope.logOut = function () {
        var modalHtml =
          '<div class="modal-content"><div class="modal-header"><h4 class="modal-title">Confirm Sign Out</h4></div><div class="modal-body"><p>Would you like to sign out?</p><button ng-click="Yes()">Yes</button><button ng-click="No()">No</button></div><div class="modal-footer"></div></div>';

        $rootScope.warning = $uibModal.open({
          template: modalHtml,
          animation: true,
          controller: 'confirmLogoutController',
          windowClass: 'modal-loading',
          backdrop: 'static',
          keyboard: false,
          scope: $rootScope,
        });
      };

      $scope.logIn = function () {
        $timeout(function () {
          if (!patSecurityService.getIsLoggedIn()) {
            patSecurityService.login();
          }
        });
      };

      $scope.$on('patwebcore:loginSuccess', function (ev, user) {
        //console.log($scope.patAuthContext);
        //console.log('logged in');
      });

      $scope.logIn();
    },
  ]);
})();

(function () {
  'use strict';
  angular.module('patUi').controller('confirmLogoutController', [
    '$scope',
    '$uibModalInstance',
    'patSecurityService',
    function ($scope, $uibModalInstance, patSecurityService) {
      $scope.Yes = function () {
        $uibModalInstance.close();
        patSecurityService.logout();
      };

      $scope.No = function () {
        $uibModalInstance.close();
      };
    },
  ]);
})();
