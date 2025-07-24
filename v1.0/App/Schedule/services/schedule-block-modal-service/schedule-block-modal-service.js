(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .service('ScheduleBlockModalService', scheduleBlockModalService);
  scheduleBlockModalService.$inject = [
    '$http',
    '$q',
    '$resource',
    'SaveStates',
    'ScheduleModalFactory',
    'toastrFactory',
    'localize',
  ];

  function scheduleBlockModalService(
    $http,
    $q,
    $resource,
    saveStates,
    scheduleModalFactory2,
    toastrFactory,
    localize
  ) {
    var self = this;

    self.createBlock = createBlock;
    self.createNewBlock = createNewBlock;
    self.switchToBlock = switchToBlock;
    self.editBlock = editBlock;
    self.openBlockModal = openBlockModal;
    self.saveAppointment = saveAppointment;

    // These get set later, and are used after making the HTTP request to save an appointment.
    self.afterAppointmentSaved = null;
    self.appointmentSaveOnError = null;
    self.getSavingFlag = getSavingFlag;

    function createBlock(
      tmpAppt,
      block,
      providers,
      appointments,
      saved,
      cancelled
    ) {
      block = tmpAppt;

      var appointmentData = {};
      appointmentData.existingAppointment = angular.copy(block);
      appointmentData.existingAppointment.StartTime = block.StartTime
        ? new Date(block.StartTime)
        : null;
      appointmentData.existingAppointment.EndTime = block.EndTime
        ? new Date(block.EndTime)
        : null;
      appointmentData.existingAppointment.LocationId =
        block.Location.LocationId;
      var appointmentEditModalData = appointmentData;
      appointmentEditModalData.providers = { Value: providers };
      appointmentEditModalData.appointments = appointments;

      // pass items to modal creation ... then open modal.
      self.openBlockModal(appointmentEditModalData, saved, cancelled);
    }

    function createNewBlock(block, providers, appointments, saved, cancelled) {
      var appointmentData = {};
      appointmentData.existingAppointment = {
        StartTime: null,
        EndTime: null,
        LocationId: null,
      };

      appointmentData.existingAppointment.StartTime = block.StartTime
        ? new Date(block.StartTime)
        : null;
      appointmentData.existingAppointment.EndTime = block.EndTime
        ? new Date(block.EndTime)
        : null;
      appointmentData.existingAppointment.LocationId =
        block.Location.LocationId;
      appointmentData.existingAppointment.Location = block.Location;
      appointmentData.existingAppointment.TreatmentRoomId =
        block.TreatmentRoomId;
      appointmentData.existingAppointment.UserId = block.UserId;

      var appointmentEditModalData = appointmentData;
      appointmentEditModalData.providers = { Value: providers };
      appointmentEditModalData.appointments = appointments;

      // pass items to modal creation ... then open modal.
      self.openBlockModal(appointmentEditModalData, saved, cancelled);
    }

    function switchToBlock(
      appointment,
      block,
      isInRoomView,
      providers,
      locations,
      saved,
      cancelled
    ) {
      // If double-click opened the appointment modal then getDragAppointment will return null
      // Use the information passed in from appointment modal
      if (_.isNil(appointment) && !_.isNil(block)) {
        let existing = block;
        appointment = {
          StartTime: existing.StartTime,
          EndTime: existing.EndTime,
          ProposedDuration: existing.ProposedDuration,
          TreatmentRoomId: existing.TreatmentRoomId,
          UserId:
            existing.ProviderAppointments &&
            existing.ProviderAppointments.length > 0
              ? existing.ProviderAppointments[0].UserId
              : null,
          LocationId: existing.LocationId,
          WasDragged: false,
        };
      } else {
        appointment.ProposedDuration = null;
        appointment.StartTime = block.StartTime;
        appointment.EndTime = block.EndTime;
      }

      // not sure about the WasDragged property

      appointment.AppointmentId = null;
      appointment.AppointmentTypeId = null;
      appointment.Classification = 1;
      appointment.Patient = undefined;
      appointment.PersonId = '00000000-0000-0000-0000-000000000000';
      appointment.PlannedServices = [];

      appointment.ProviderAppointments = [];
      appointment.ServiceCodes = [];

      // if we are in room view populate otherwise clear out
      if (isInRoomView) {
        appointment.TreatmentRoomId = block.TreatmentRoomId;
        appointment.UserId = null;
      } else {
        appointment.TreatmentRoomId = null;
        appointment.Room = null;
        appointment.UserId = block.UserId ? block.UserId : null;

        // ensure that we utilize the provider hours if the user id is not set for some reason.
        if (appointment.UserId === null || appointment.UserId === undefined) {
          appointment.UserId =
            block.ProviderAppointments && block.ProviderAppointments.length > 0
              ? block.ProviderAppointments[0].UserId
              : null;
        }
      }

      // not sure how or if this is used. part of the original object definition in old method.
      appointment.Providers = [];

      appointment.Status = 0;
      appointment.ObjectState = saveStates.Add;
      appointment.Location = _.find(locations, {
        LocationId: appointment.LocationId,
      });
      appointment.WasDragged = false;
      appointment.start = appointment.StartTime;
      appointment.end = appointment.EndTime;

      var blockModalResolve = {};
      blockModalResolve.existingAppointment = appointment;
      blockModalResolve.providers = { Value: providers };
      // who the fuck writes methods like this.
      // pass items to modal creation ... then open modal.
      self.openBlockModal(blockModalResolve, saved, cancelled);
    }

    function editBlock(dataItem, providers, saved, cancelled) {
      if (_.isNil(dataItem.AppointmentId)) {
        getModalDataSuccessNew(dataItem, providers, saved, cancelled);
      } else {
        var Appt = $resource(
          '_soarapi_/AppointmentModal/apptInfoWithPatient',
          {},
          {
            get: {
              method: 'GET',
              params: { apptId: '@dataItem.AppointmentId' },
            },
          }
        );
        Appt.get({ apptId: dataItem.AppointmentId }).$promise.then(function (
          result
        ) {
          getModalDataSuccessNew(result.Value, providers, saved, cancelled);
        },
        getAppointmentModalDataFailed);
      }

      return;
    }

    function openBlockModal(block, saved, cancelled) {
      //debugger;
      scheduleModalFactory2.ScheduleBlockModal(block, true).then(
        response => {
          saved(response);
        },
        () => {
          //console.log('failure');
          // this is really a modal close scenario only, not for save failures. hence commented.
          // showFailureToastr();
          cancelled();
        }
      );
    }

    function showSuccessToastr() {
      var successMessage = 'Block saved successfully.';

      toastrFactory.success(
        localize.getLocalizedString(successMessage),
        'Success'
      );
    }

    function showFailureToastr(response) {
      let errors = '';
      if (response.data.InvalidProperties.length > 0) {
        if (response.data.InvalidProperties.length === 1) {
          let arrayMessages = response.data.InvalidProperties.map(
            a => a.ValidationMessage
          );
          errors = '<ul><li>' + arrayMessages.join('</li><li>');
          +'</li></ul>';
        } else {
          let arrayMessages = response.data.InvalidProperties.map(
            a => a.ValidationMessage
          );
          errors = '<ul><li>' + arrayMessages.join('</li><li>');
          +'</li></ul>';
          errors = errors.substring(0, errors.length - 1); //this adds extra bullet point to toaster message, so I remove it
        }
      }

      toastrFactory.error(errors, 'Server Error');
    }

    function getModalDataSuccessNew(
      appointmentEditData,
      providers,
      saved,
      cancelled
    ) {
      var data = {};

      /// need to set the location.
      data.existingAppointment = appointmentEditData;
      data.providers = { Value: providers };

      self.openBlockModal(data, saved, cancelled);
    }

    function getAppointmentModalDataFailed() {
      toastrFactory.error(
        'Failed to retrieve the data necessary for editing a block. Please try again',
        'Error'
      );
    }

    function updateDateTimeStringsToDateObjects(appointment) {
      // NOTE: This was added because they don't come back at Date() objects,
      //  and the scheduler needs them to be Date() objects
      appointment.StartTime = new Date(appointment.StartTime);
      appointment.EndTime = new Date(appointment.EndTime);
      appointment.start = new Date(appointment.StartTime.getTime());
      appointment.end = new Date(appointment.EndTime.getTime());
    }

    var saving = true;
    function setSavingFlag(isSaving) {
      saving = isSaving;
    }

    function getSavingFlag() {
      return saving;
    }

    function saveAppointment(
      appointmentDto,
      afterAppointmentSaved,
      appointmentSaveOnError
    ) {
      var deferred = $q.defer();
      self.afterAppointmentSaved = afterAppointmentSaved;
      self.appointmentSaveOnError = appointmentSaveOnError;
      if (
        appointmentDto.AppointmentId === null ||
        appointmentDto.AppointmentId === undefined
      ) {
        $http.post('_sapischeduleapi_/appointments', appointmentDto).then(
          function (response) {
            var appointment = response.data.Value;

            // TODO: Update the save api to include the patient object
            // NOTE: Since the save api does NOT include the Patient object on the
            //  response, I'm grabbing it from our previous storage of it and tacking it on
            //  to the response here. The schedule depends on this being set to build the name
            //  of the patient.
            //debugger;
            updateDateTimeStringsToDateObjects(appointment);
            setSavingFlag(true);
            deferred.resolve(response);
            showSuccessToastr();
            self.afterAppointmentSaved(appointment);
          },
          function (response) {
            setSavingFlag(false);
            self.appointmentSaveOnError();
            deferred.resolve(response);
            showFailureToastr(response);
          }
        );
        return deferred.promise;
      } else {
        $http.put('_soarapi_/appointments', appointmentDto).then(
          function (response) {
            var appointment = response.data.Value;

            updateDateTimeStringsToDateObjects(appointment);

            setSavingFlag(true);
            deferred.resolve(response);
            showSuccessToastr();

            self.afterAppointmentSaved(appointment);
          },
          function (response) {
            setSavingFlag(false);
            self.appointmentSaveOnError();
            deferred.resolve(response);
            showFailureToastr(response);
          }
        );

        return deferred.promise;
      }
    }
  }
})();
