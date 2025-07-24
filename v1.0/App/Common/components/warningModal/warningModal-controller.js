'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('WarningModalController', [
  '$scope',
  '$uibModalInstance',
  'item',
  function (modalScope, mInstance, item) {
    modalScope.item = item;

    modalScope.confirmDiscard = function () {
      mInstance.close(true);
    };

    modalScope.cancelDiscard = function () {
      mInstance.close(false);
    };
  },
]);
