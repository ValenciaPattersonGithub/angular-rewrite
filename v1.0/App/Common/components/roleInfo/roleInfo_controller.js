'use strict';

angular.module('common.controllers').controller('RoleInfoController', [
  '$scope',
  function ($scope) {
    var ctrl = this;
    $scope.roles = [
      { roleId: 1, type: 'Low' },
      { roleId: 2, type: 'Medium' },
      { roleId: 3, type: 'High' },
    ];
  },
]);
