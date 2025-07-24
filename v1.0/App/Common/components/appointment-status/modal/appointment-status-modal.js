/// <reference path="appointment-status-modal_test.js" />
'use strict';

angular
  .module('common.controllers')
  .controller('AppointmentStatusModalController', [
    '$scope',
    '$uibModalInstance',
    'item',
    'localize',
    'SaveStates',
    '$location',
    'toastrFactory',
    'ModalFactory',
    'PatientAppointmentsFactory',
    'PatientServices',
    AppointmentStatusModalController,
  ]);
function AppointmentStatusModalController(
  modalScope,
  mInstance,
  item,
  localize,
  saveStates,
  $location,
  toastrFactory,
  modalFactory,
  patientAppointmentsFactory,
  patientServices
) {
  BaseCtrl.call(this, modalScope, 'AppointmentStatusModalController');
  modalScope.display = item;

  /** default DeletedReason to 'Other' */
  modalScope.deletedReason = 2;

  modalScope.addNote = false;
  modalScope.checkBoxAction = false;
  modalScope.noAppointmentType = localize.getLocalizedString(
    'No Appointment Type'
  );

  if (modalScope.display.appointment !== null) {
    var startPM =
      new Date(modalScope.display.appointment.StartTime).getHours() > 11;
    var endPM =
      new Date(modalScope.display.appointment.EndTime).getHours() > 11;

    modalScope.display.appointment.StartTimeFormat =
      startPM === endPM ? 'MMM dd, yyyy h:mm' : 'MMM dd, yyyy h:mm a';
  }

  modalScope.rescheduleNow = function () {
    if (window.location.href.includes('/Schedule/')) {
      modalScope.Route = null;
    } else {
      modalScope.Route = '/Schedule/';
    }
    modalScope.convertToUnscheduled(true);
  };

  modalScope.rescheduleLater = function () {
    modalScope.Route = null;
    modalScope.convertToUnscheduled(false);
  };

  modalScope.deleteAppointment = function () {
    var title = localize.getLocalizedString('Delete {0}?', ['Appointment']);
    var message = localize.getLocalizedString(
      'This action will remove the {0} from the patient record. Are you sure you wish to proceed?',
      ['appointment']
    );
    var button1Text = localize.getLocalizedString('Yes');
    var button2Text = localize.getLocalizedString('No');
    modalFactory
      .ConfirmModal(title, message, button1Text, button2Text)
      .then(function () {
        // save reason from modal to appointment
        modalScope.display.appointment.DeletedReason = modalScope.deletedReason;
        // for purposes of tracking missed and canceled appointments we will pass an
        // enum MissedAppointmentType with the following values: 0 - Canceled or   1 - Missed
        // Since we need to track this appointment we need to call appointments/hardDeletedDueToBeingMissed
        if (modalScope.deletedReason === 0 || modalScope.deletedReason === 1) {
          modalScope.display.appointment.MissedAppointmentTypeId =
            modalScope.deletedReason;
        }

        if (modalScope.display.beforeDelete) {
          modalScope.display.beforeDelete(modalScope.display.appointment);
        }

        let tempAppointment = modalScope.display.appointment;

        // a couple of pages utilize this and we need to adapt the two usages to work.
        if (
          modalScope.display.appointment.AppointmentId === null ||
          modalScope.display.appointment.AppointmentId === undefined
        ) {
          tempAppointment = modalScope.display.appointment.Data;
        }

        patientServices.PatientAppointment.HardDeletedDueToBeingMissed(
          tempAppointment,
          modalScope.onDeleteSuccess,
          modalScope.onDeleteError
        );
      });
  };

  modalScope.cancelChanges = function () {
    mInstance.dismiss();
  };

  modalScope.convertToUnscheduled = function (isPinned) {
    var conversionParams = {
      AppointmentId: modalScope.display.appointment.AppointmentId,
      DeletedReason: modalScope.deletedReason,
      StatusNote: modalScope.display.appointment.StatusNote,
      IsPinned: isPinned,
    };
    patientServices.PatientAppointment.ConvertToUnscheduled(
      conversionParams,
      modalScope.onUpdateSuccess,
      modalScope.onUpdateError
    );
  };

  modalScope.onUpdateSuccess = function (res) {
    var route = modalScope.Route;
    res.Value.ObjectState = modalScope.Action;

    if (route) {
      res.Value.WantsToRoute = true;
      $location.url(_.escape(route));
    } else {
      res.Value.WantsToRoute = false;
    }
    modalScope.confirmDiscard(res.Value);
    // set property to notify that the missed and canceled appointments counts should be reloaded
    patientAppointmentsFactory.setLoadHistory(true);
    modalScope.display.onChange(res.Value, false);
    toastrFactory.success(
      localize.getLocalizedString('Successfully saved {0}', ['appointment']),
      'Success'
    );
  };

  modalScope.onUpdateError = function (err) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to save {0}', ['appointment']),
      'Error'
    );
  };

  modalScope.onDeleteSuccess = function (res) {
    modalScope.display.appointment.ObjectState = 'Delete';
    modalScope.confirmDiscard(modalScope.display.appointment);
    // set property to notify that the missed and canceled appointments counts should be reloaded
    patientAppointmentsFactory.setLoadHistory(true);
    modalScope.display.onChange(modalScope.display.appointment, false);
    toastrFactory.success(
      localize.getLocalizedString('Successfully deleted {0}', ['appointment']),
      'Success'
    );
  };

  modalScope.onDeleteError = function (res) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to delete {0}', ['appointment']),
      'Error'
    );
  };

  modalScope.confirmDiscard = function (appointment) {
    mInstance.close(appointment);
  };

  modalScope.cancelDiscard = function () {
    mInstance.dismiss();
  };
}

AppointmentStatusModalController.prototype = Object.create(BaseCtrl.prototype);
