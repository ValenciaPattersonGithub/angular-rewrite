'use strict';

angular
  .module('common.controllers')
  .controller('PaymentVoidConfirmModalController', [
    '$scope',
    '$uibModalInstance',
    'item',
    function (modalScope, mInstance, item) {
      modalScope.item = item;

      modalScope.confirm = function () {
        mInstance.close(modalScope.item.Data);
      };

      modalScope.close = function () {
        mInstance.dismiss();
      };
    },
  ]);
