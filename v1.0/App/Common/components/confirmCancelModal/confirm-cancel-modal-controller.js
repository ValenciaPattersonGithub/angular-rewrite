'use strict';

angular
  .module('common.controllers')
  .controller('ConfirmCancelModalController', [
    '$scope',
    '$uibModalInstance',
    'item',
    function (modalScope, mInstance, item) {
      modalScope.item = item;

      modalScope.confirm = function (value) {
        mInstance.close(value);
      };

      modalScope.close = function () {
        mInstance.dismiss();
      };
    },
  ]);
