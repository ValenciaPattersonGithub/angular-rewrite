'use strict';

angular
  .module('Soar.Schedule')
  .controller('ScheduleInactiveProviderModalController', [
    '$scope',
    '$uibModalInstance',
    ScheduleInactiveProviderModalController,
  ]);
function ScheduleInactiveProviderModalController(modalScope, mInstance) {
  BaseCtrl.call(this, modalScope, 'ScheduleInactiveProviderModalController');

  modalScope.close = function () {
    mInstance.dismiss();
  };
}

ScheduleInactiveProviderModalController.prototype = Object.create(
  BaseCtrl.prototype
);
