'use strict';
angular
  .module('common.controllers')
  .controller('UserLocationValidationAccessController', [
    '$scope',
    '$rootScope',
    'toastrFactory',
    'ListHelper',
    'localize',
    'ModalFactory',
    'patientData',
    'SaveStates',
    '$filter',
    '$uibModalInstance',
    '$timeout',
    '$q',
    'mode',
    function (
      $scope,
      $rootScope,
      toastrFactory,
      listHelper,
      localize,
      modalFactory,
      patientData,
      saveStates,
      $filter,
      $uibModalInstance,
      $timeout,
      $q,
      mode
    ) {
      $scope.mode = mode;
      $scope.patientData = patientData;

      $scope.close = function () {
        $uibModalInstance.close();
      };
    },
  ]);
