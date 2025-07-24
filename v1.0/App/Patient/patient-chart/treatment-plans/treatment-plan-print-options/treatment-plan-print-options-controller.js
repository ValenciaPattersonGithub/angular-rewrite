'use strict';
angular
  .module('common.controllers')
  .controller('TxPlanPrintOptionsController', [
    '$scope',
    '$filter',
    'ListHelper',
    'localize',
    '$timeout',
    'ModalFactory',
    'patSecurityService',
    'txPlanPrintTemplate',
    'activeTreatmentPlan',
    'personId',
    '$uibModalInstance',
    function (
      $scope,
      $filter,
      listHelper,
      localize,
      $timeout,
      modalFactory,
      patSecurityService,
      txPlanPrintTemplate,
      activeTreatmentPlan,
      personId,
      $uibModalInstance
    ) {
      $scope.txPlanPrintTemplate = txPlanPrintTemplate;
      $scope.activeTreatmentPlan = activeTreatmentPlan;
      $scope.modalInstance = $uibModalInstance;
      $scope.personId = personId;
    },
  ]);
