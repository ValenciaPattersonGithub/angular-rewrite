'use strict';
angular.module('common.controllers').controller('ObjectStateController', [
  '$scope',
  'savedStates',
  function ($scope, savedStates) {
    console.log($scope.item);
  },
]);
