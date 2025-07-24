'use strict';

angular.module('common.controllers').controller('ListPanelCtrl', [
  '$scope',
  'localize',
  function ($scope, localize) {
    // Get URL for ngInclude view
    $scope.returnUrl = function () {
      // Check if template url was provided
      if ($scope.listPanelUrl) {
        return $scope.listPanelUrl;
      }
      return '';
    };
  },
]);
