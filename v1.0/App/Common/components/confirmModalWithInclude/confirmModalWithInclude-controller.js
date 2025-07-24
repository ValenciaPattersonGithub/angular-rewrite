'use strict';

/* Until converted to a factory */
angular
  .module('common.controllers')
  .controller('ConfirmModalWithIncludeController', [
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
