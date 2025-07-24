'use strict';

/* Until converted to a factory */
angular
  .module('common.controllers')
  .controller('NotAuthorizedModalController', [
    '$scope',
    '$uibModalInstance',
    function (modalScope, mInstance) {
      modalScope.closeModal = function () {
        mInstance.close();
      };
    },
  ]);
