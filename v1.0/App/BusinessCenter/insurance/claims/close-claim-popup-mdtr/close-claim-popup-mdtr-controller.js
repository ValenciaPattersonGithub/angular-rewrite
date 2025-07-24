'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('CloseClaimModalControllerBeta', [
    '$scope',
    '$uibModalInstance',
    'toastrFactory',
    'closeClaimObject',
    'localize',
    'ModalFactory',
    'ModalDataFactory',
    'CloseClaimService',
    'patSecurityService',
    'UserServices',
    'PatientServices',
    '$filter',
    'UsersFactory',
    'ClaimsService',
    function (
      $scope,
      $uibModalInstance,
      toastrFactory,
      closeClaimObject,
      localize,
      modalFactory,
      modalDataFactory,
      closeClaimService,
      patSecurityService,
      userServices,
      patientServices,
      $filter,
      usersFactory,
      claimsService
    ) {
      $scope.currentObject = closeClaimObject;
      $scope.uibModalInstance = $uibModalInstance;
      $scope.mainScope = $scope;
    },
  ]);
