'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('CancelModalController', [
  '$scope',
  '$uibModalInstance',
  function (modalScope, mInstance) {
    modalScope.confirmDiscard = function () {
      mInstance.close();
    };

    modalScope.cancelDiscard = function () {
      mInstance.dismiss();
    };
  },
]);
