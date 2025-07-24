'use strict';

angular
  .module('common.controllers')
  .controller('ErrorResponseModalController', [
    '$scope',
    '$uibModalInstance',
    'item',
    function (modalScope, mInstance, item) {
      modalScope.item = item;

      modalScope.confirm = function () {
        location.reload();
      };

      modalScope.close = function () {
        mInstance.dismiss();
      };
    },
  ]);
