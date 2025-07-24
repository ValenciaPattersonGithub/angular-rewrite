'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('ConfirmModalController', [
  '$scope',
  '$uibModalInstance',
  'item',
  function (modalScope, mInstance, item) {
    modalScope.item = item;

    modalScope.confirm = function () {
      if (modalScope.item.Data == 'keepProposedServices') {
        mInstance.close(true);
      } else {
        mInstance.close(modalScope.item.Data);
      }
    };

    modalScope.close = function () {
      if (modalScope.item.Data == 'keepProposedServices') {
        mInstance.close(false);
      } else {
        mInstance.dismiss();
      }
    };
  },
]);
