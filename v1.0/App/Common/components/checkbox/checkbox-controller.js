'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('CheckboxController', [
  '$scope',
  '$timeout',
  '$element',
  'patSecurityService',
  'AuthZService',
  function ($scope, $timeout, $element, patSecurityService, authZ) {
    var ctrl = this;

    ctrl.checkIfAuthorized = function (amfa) {
      var authorized =
        !(amfa > '') || patSecurityService.IsAuthorizedByAbbreviation(amfa);
      if (!authorized) {
        var element = angular.element($element);
        $scope.message = authZ.generateTitleMessage();
        element.attr('title', $scope.message);
      }
      return authorized;
    };

    $scope.changeValue = function () {
      $scope.checkboxValue = !$scope.checkboxValue;

      if ($scope.changeFunction) {
        // timeout needed to allow the checkboxValue change to propagate to bound variables in parent controllers
        $timeout(function () {
          $scope.changeFunction();
        }, 0);
      }
    };

    $scope.authorized = ctrl.checkIfAuthorized($scope.authZ);
  },
]);
