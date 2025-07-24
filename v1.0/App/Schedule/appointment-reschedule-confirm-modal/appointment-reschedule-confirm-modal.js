'use strict';

angular
  .module('Soar.Schedule')
  .controller('AppointmentRescheduleConfirmModalController', [
    '$scope',
    '$uibModalInstance',
    'appointment',
    AppointmentRescheduleConfirmModalController,
  ]);
function AppointmentRescheduleConfirmModalController(
  modalScope,
  mInstance,
  appointment
) {
  BaseCtrl.call(
    this,
    modalScope,
    'AppointmentRescheduleConfirmModalController'
  );
  modalScope.appointment = appointment;
  modalScope.checkBoxAction = true;

  modalScope.confirmReschedule = function () {
    if (modalScope.checkBoxAction) {
      // Appointment Status - Unconfirmed
      modalScope.appointment.Status = 0;
    }

    mInstance.close(modalScope.appointment);
  };

  modalScope.cancelReschedule = function () {
    mInstance.dismiss(modalScope.appointment);
  };
}

AppointmentRescheduleConfirmModalController.prototype = Object.create(
  BaseCtrl.prototype
);
