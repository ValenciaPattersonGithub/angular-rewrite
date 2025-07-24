'use strict';

angular.module('common.controllers').controller('InitialBadgeController', [
  '$scope',
  function ($scope) {
    $scope.getInitials = function () {
      if (
        $scope.person == null ||
        $scope.person.FirstName == null ||
        $scope.person.LastName == null
      ) {
        return '';
      }

      return (
        $scope.person.FirstName[0].toUpperCase() +
        '' +
        $scope.person.LastName[0].toUpperCase()
      );
    };
  },
]);
