'use strict';
angular
  .module('common.controllers')
  .controller('ServiceFeeRollbackController', [
    '$scope',
    '$filter',
    'ListHelper',
    'localize',
    '$timeout',
    'ModalFactory',
    'patSecurityService',
    'servicesToRollback',
    'serviceCodes',
    '$uibModalInstance',
    'PatientServicesFactory',
    'CdtCodeService',
    function (
      $scope,
      $filter,
      listHelper,
      localize,
      $timeout,
      modalFactory,
      patSecurityService,
      servicesToRollback,
      serviceCodes,
      $uibModalInstance,
      patientServicesFactory,
      cdtCodeService
    ) {
      var ctrl = this;

      $scope.servicesToRollback = servicesToRollback;
      $scope.serviceCodes = serviceCodes;
      $scope.dataHasChanged = false;
      $scope.saving = false;

      //TODO add access

      //#region validation / set datachanged

      // validate that there are at least one service to rollback
      ctrl.validateRollback = function () {
        var servicesForRollback = [];
        servicesForRollback = $filter('filter')(
          $scope.servicesToRollback,
          function (item) {
            return item.$$RollbackFee === true;
          }
        );
        $scope.dataHasChanged = servicesForRollback.length > 0;
        return servicesForRollback;
      };

      // change event for checkbox
      $scope.rollBackFee = function (service) {
        ctrl.validateRollback();
      };

      //#endregion

      //#region crud

      $scope.rollBackFees = function () {
        var servicesForRollback = ctrl.validateRollback();
        if ($scope.dataHasChanged) {
          $scope.saving = true;
          patientServicesFactory
            .feeRollback(servicesForRollback)
            .then(function (res) {
              // return updated services back to list and close?
              var updatedTransactions = res.Value;
              $scope.saving = false;
              $uibModalInstance.close(updatedTransactions);
            });
        }
      };

      //#endregion

      //#region cancel

      //callback function to handle cancel function
      $scope.cancelListChanges = function () {
        if ($scope.dataHasChanged == true) {
          modalFactory.CancelModal().then($scope.cancelChanges);
        } else $scope.cancelChanges();
      };

      //TODO if they close after selecting some rows, warn before closing
      $scope.cancelChanges = function () {
        $uibModalInstance.dismiss();
      };

      //#endregion

      //#region loading cdtCodes to service

      ctrl.loadCdtCodesToService = function () {
        if ($scope.cdtCodes && $scope.servicesToRollback) {
          angular.forEach($scope.servicesToRollback, function (service) {
            var index = listHelper.findIndexByFieldValue(
              $scope.cdtCodes,
              'CdtCodeId',
              service.$$ServiceCode.CdtCodeId
            );
            if (index > -1) {
              service.$$CdtCode = $scope.cdtCodes[index].Code;
            }
          });
        }
      };

      $scope.cdtCodes = [];
      ctrl.getCdtCodes = function (successResponse) {
        $scope.loadingCodes = true;
        cdtCodeService.getList().then(function (res) {
          $scope.cdtCodes = res.Value;
          $scope.loadingCodes = false;
          ctrl.loadCdtCodesToService();
        });
      };

      //#endregion

      //#region serviceCodes

      // load service codes to service
      ctrl.loadServiceCodesToServices = function () {
        if ($scope.serviceCodes && $scope.servicesToRollback) {
          angular.forEach($scope.servicesToRollback, function (service) {
            var index = listHelper.findIndexByFieldValue(
              $scope.serviceCodes,
              'ServiceCodeId',
              service.ServiceCodeId
            );
            if (index > -1) {
              service.$$ServiceCode = $scope.serviceCodes[index];
            }
          });
        }
      };

      //#endregion

      ctrl.init = function () {
        ctrl.loadServiceCodesToServices();
        ctrl.getCdtCodes();
      };
      ctrl.init();
    },
  ]);
