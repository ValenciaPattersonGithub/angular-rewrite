'use strict';

angular.module('common.controllers').controller('DeleteModalController', [
  '$scope',
  '$uibModalInstance',
  'item',
  function (modalScope, mInstance, item) {
    modalScope.item = item;

    modalScope.confirmDiscard = function () {
      mInstance.close();
    };

    modalScope.cancelDiscard = function () {
      mInstance.dismiss();
    };
  },
]);
