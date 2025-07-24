'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('OptionsModalController', [
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
