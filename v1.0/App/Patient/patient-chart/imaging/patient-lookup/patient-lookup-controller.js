'use strict';
angular.module('common.controllers').controller('PatientLookupController', [
  '$scope',
  '$filter',
  'ListHelper',
  'localize',
  '$timeout',
  'ModalFactory',
  'patSecurityService',
  '$uibModalInstance',
  function (
    $scope,
    $filter,
    listHelper,
    localize,
    $timeout,
    modalFactory,
    patSecurityService,
    $uibModalInstance
  ) {
    $scope.modalInstance = $uibModalInstance;
  },
]);
