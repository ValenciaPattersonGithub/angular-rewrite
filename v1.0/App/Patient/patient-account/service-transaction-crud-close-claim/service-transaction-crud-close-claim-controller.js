'use strict';
angular
  .module('Soar.Patient')
  .controller('ServiceTransactionCrudCloseClaimController', [
    '$scope',
    '$uibModalInstance',
    '$filter',
    'localize',
    'inputData',
    'ModalFactory',
    function (
      $scope,
      $uibModalInstance,
      $filter,
      localize,
      inputData,
      modalFactory
    ) {
      $scope.data = {
        isEdit: inputData.isEdit,
        priorityText: $filter('priorityLabel')(inputData.planPriority),
        willAffectFeeScheduleWriteOff: inputData.willAffectFeeScheduleWriteOff,
        willAffectOtherPayment: inputData.willAffectOtherPayment,
        title: localize.getLocalizedString(
          (inputData.isEdit ? 'Edit' : 'Delete') + ' {0}',
          [inputData.serviceCode]
        ),
        recreate: false,
        note: null,
        //need DateEntered, Description, and Fee for other services
        otherClaimServices: _.chain(inputData.otherClaimServices)
          .sortBy('DateEntered')
          .map(function (service) {
            return { Description: service.Description, Fee: service.Fee };
          })
          .value(),
      };

      $scope.confirm = function () {
        $uibModalInstance.close({
          recreate: $scope.data.recreate,
          note: $scope.data.note,
        });
      };

      $scope.cancel = function () {
        if ($scope.data.recreate || $scope.data.note) {
          modalFactory.CancelModal().then($uibModalInstance.dismiss);
        } else {
          $uibModalInstance.dismiss();
        }
      };
    },
  ]);
