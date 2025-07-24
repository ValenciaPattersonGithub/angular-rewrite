'use strict';

/* Until converted to a factory */
angular.module('common.controllers').controller('NoteModalController', [
  '$scope',
  '$uibModalInstance',
  'item',
  function (modalScope, mInstance, item) {
    modalScope.item = item;

    modalScope.close = function () {
      if (modalScope.item.Data == 'keepProposedServices') {
        mInstance.close(false);
      } else {
        mInstance.dismiss();
      }
    };
  },
]);
