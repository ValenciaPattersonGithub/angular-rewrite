'use strict';
angular.module('common.controllers').controller('NoResultsController', [
  '$scope',
  'localize',
  function ($scope, localize) {
    $scope.setDefaultMessage = function () {
      if (
        angular.isUndefined($scope.filteringMessage) ||
        $scope.filteringMessage === null ||
        $scope.filteringMessage == ''
      ) {
        $scope.filteringMessage = 'There are no results that match the filter.';
      }
      if (
        angular.isUndefined($scope.loadingMessage) ||
        $scope.loadingMessage === null ||
        $scope.loadingMessage == ''
      ) {
        $scope.loadingMessage = 'There are no results.';
      }
    };
    $scope.setDefaultMessage();

    $scope.$watch(
      'filtering',
      function (nv) {
        if (nv == true) {
          $scope.message = $scope.filteringMessage;
        }
      },
      true
    );

    $scope.$watch(
      'loading',
      function (nv) {
        if (nv == true) {
          $scope.message = $scope.loadingMessage;
        } else if ($scope.filtering == true) {
          $scope.message = $scope.filteringMessage;
        }
      },
      true
    );
  },
]);
