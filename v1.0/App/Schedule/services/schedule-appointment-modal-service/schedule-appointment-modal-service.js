(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .factory(
      'ScheduleAppointmentModalService',
      scheduleAppointmentModalService
    );
  scheduleAppointmentModalService.$inject = [
    '$http',
    '$q',
    '$resource',
    'ScheduleServices',
    'SaveStates',
    'PreventiveCareService',
    'PatientPreventiveCareFactory',
    'ModalFactory',
    'patSecurityService',
    'ListHelper',
    'AppointmentClassificationService',
    'ModalDataFactory',
    'ScheduleModalFactory',
    'toastrFactory',
    'localize',
    'RequestHelper',
    'PatientServices',
    'referenceDataService',
    'StaticData',
    'TimeZoneFactory',
    'PatientValidationFactory',
    'AppointmentStatusService',
    'SchedulingApiService',
    'AppointmentViewValidationNewService',
  ];

  function scheduleAppointmentModalService(
    $http,
    $q,
    $resource,
    scheduleServices,
    saveStates,
    preventiveCareService,
    patientPreventiveCareFactory,
    modalFactory,
    patSecurityService,
    listHelper,
    appointmentClassificationService,
    modalDataFactory,
    scheduleModalFactory2,
    toastrFactory,
    localize,
    requestHelper,
    patientServices,
    referenceDataService,
    staticData,
    timeZoneFactory,
    patientValidationFactory,
    appointmentStatusService,
    schedulingApiService,
    appointmentViewValidationNewService
  ) {
    var self = this;

    //debugger;
    self.appointmentCreated = appointmentCreated;
    self.appointmentEdited = appointmentEdited;
    self.appointmentDeleted = appointmentDeleted;
    self.saveAppointment = saveAppointment;
    self.saveTruncatedAppointment = saveTruncatedAppointment;
    self.openEditClipboardAppointmentModalByAppointmentId = openEditClipboardAppointmentModalByAppointmentId;
    self.createNewEmptyAppointmentDto = createNewEmptyAppointmentDto;
    self.getPreventiveServiceInfo = getPreventiveServiceInfo;
    self.alertSymbolList = staticData.AlertIcons();
    self.getOriginalDataTagBeforeSave = getOriginalDataTagBeforeSave;
    self.updateNote = updateNote;

    // This gets set to a promise that is returned from checking the patient's preventive services
    self.servicesDuePromise = null;
    self.originalAppointmentStatus = null; // used to store the original status of the appointment prior to calling save. the status of the appt may get overridden by this value. see the code below for more details

    // These get set later, and are used after making the HTTP request to save an appointment.
    self.afterAppointmentSavedSuccess = null;
    self.appointmentSaveOnError = null;

    self.emptyGuid = '00000000-0000-0000-0000-000000000000';

    // This is used to store the current patient
    // This was added because the Save API does not return the Patient object ater
    //  a successful save, which was causing problems for the scheduler after we saved an appointment.
    // TODO: we need to tack on the curentAlerts, the medicalalerts, so that we can send them back
    self.currentPatient = null;
    self.currentAlerts = null;
    self.currentMedicalAlerts = null;

    self.locations = referenceDataService.get(
      referenceDataService.entityNames.locations
    );

    // this seems silly. would be nice to refactor.
    self.hasPreventiveCareViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perps-view'
    );

    // TODO: what is this?
    self.preventiveCareServices = null;

    // this is the thing that the bound object gets assigned to
    self.internalAppointment = null;

    //debugger;
    // this isn't used yet.
    self.appointmentClassificationTypes = appointmentClassificationService.getAppointmentClassificationTypes();

    self.getSavingFlag = getSavingFlag;

    var saving = true;

    // This function was created as part of the effort to move away from the BoundObject factory. The initial version
    //  of this function is cloning the functionality from this call: `boundObjectFactory.Create(scheduleServices.Dtos.Appointment);`
    //  So we're pulling in the `scheduleServices.Dtos.Appointment` object, and copying over the necessary functionality
    //  from the boundObjectFactory.Create function.
    function createNewEmptyAppointmentDto() {
      //debugger;

      var dto = getNewEmptyAppointmentDto();

      return dto;
    }

    function appointmentCreated(appointment) {
      console.log('appointment created!!');
      return appointment;
    }

    function appointmentEdited(appointment) {
      return appointment;
    }

    function appointmentDeleted(appointmentId) {
      return appointmentId;
    }

    function updateMedicalAlertObject(medicalHistoryAlert) {
      medicalHistoryAlert.TypeId =
        medicalHistoryAlert.MedicalHistoryAlertTypeId;
      medicalHistoryAlert.Description =
        medicalHistoryAlert.MedicalHistoryAlertDescription;
      medicalHistoryAlert.IsMedicalHistoryAlert = true;
    }

    //This is set so we can keep track of DataTag Before being updated in saveAppointment in this Service
    var dataTagBeforeAppointmentModified = '';
    function setOriginalDataTagBeforeSave(value) {
      dataTagBeforeAppointmentModified = value;
    }

    //This is retrieved in scheduler-controller.js to check against the original data tag
    function getOriginalDataTagBeforeSave() {
      return dataTagBeforeAppointmentModified;
    }

    function saveAppointment(
      appointmentDto,
      originalAppointmentStatus,
      afterAppointmentSavedSuccess,
      appointmentSaveOnError,
      wasPinned = false,
      showToast = true
    ) {
      setOriginalDataTagBeforeSave(appointmentDto.DataTag);
      // set the patient object to appointmentDto.patient cuz the save api doesn't return it
      self.currentPatient = appointmentDto.Patient;
      if (appointmentDto.Patient) {
        self.currentAlerts = _.cloneDeep(appointmentDto.Patient.PatientAlerts);
      }

      self.afterAppointmentSavedSuccess = afterAppointmentSavedSuccess;
      self.appointmentSaveOnError = appointmentSaveOnError;

      self.originalAppointmentStatus = originalAppointmentStatus;
      //debugger;

      // holy guacamole. another bound object!
      //self.internalAppointment = boundObjectFactory.Create(scheduleServices.Dtos.Appointment);
      self.internalAppointment = getNewEmptyAppointmentDto();

      //self.internalAppointment.returnResult = true; // this is j-a-n-k-y. we'll remove this when we drop bound object
      //initInternalAppointment(afterAppointmentSavedSuccess, appointmentSaveOnError);
      self.internalAppointment.AfterSaveSuccess = afterAppointmentSavedSuccess;
      self.internalAppointment.AfterSaveError = appointmentSaveOnError;
      self.internalAppointment.Data.Classification = angular.isUndefined(
        self.internalAppointment.Data.Classification
      )
        ? 0
        : self.internalAppointment.Data.Classification;

      self.internalAppointment.Data = appointmentDto;
      var saveImmediately = true;

      if (
        appointmentDto.PlannedServices &&
        appointmentDto.PlannedServices.length > 0
      ) {
        var remainingPlannedServices = listHelper.findAllByPredicate(
          appointmentDto.PlannedServices,
          function (item, index) {
            return item.ObjectState != saveStates.Delete;
          }
        );

        if (remainingPlannedServices && remainingPlannedServices.length > 0) {
          saveImmediately = false;

          // check against preventive care schedule and show message if needed
          preventiveCareService.accessForServiceType();
          preventiveCareService.accessForServiceCode();

          // get patient preventive care due dates
          var showMessagePreventiveCareEarlyScheduleConfirmMessage = false; //renamed from `showMessage`

          if (!self.servicesDuePromise) {
            self.servicesDuePromise = getPreventiveServiceInfo(
              appointmentDto.PersonId
            );
          }

          var deferred = $q.defer();
          self.servicesDuePromise.then(
            function (preventiveServices) {
              // get services for preventive care types
              _.forEach(preventiveServices, function (type) {
                if (type.DateServiceDue) {
                  var dueDate = moment.utc(type.DateServiceDue);
                  var apptDate = moment.utc(
                    self.internalAppointment.Data.StartTime
                  );
                  if (apptDate.local().isBefore(dueDate.local(), 'day')) {
                    _.forEach(type.ServiceCodes, function (codeItem) {
                      if (
                        listHelper.findIndexByFieldValue(
                          remainingPlannedServices,
                          'ServiceCodeId',
                          codeItem.ServiceCodeId
                        ) >= 0
                      ) {
                        showMessagePreventiveCareEarlyScheduleConfirmMessage = true;
                      }
                    });
                  }
                }
              });

              if (showMessagePreventiveCareEarlyScheduleConfirmMessage) {
                var title = 'Confirm';
                var message = localize.getLocalizedString(
                  'Are you sure you want to schedule this appointment before the due date?'
                );
                modalFactory
                  .ConfirmModal(title, message, 'Yes', 'No')
                  .then(preventiveCheckConfirm, preventiveCheckCancel);
              } else {
                appointmentViewValidationNewService.validateAppointment(
                  self.internalAppointment.Data,
                  wasPinned
                );
                var appointmentValidationErrors = appointmentViewValidationNewService.getValidationErrors();

                if (
                  appointmentValidationErrors !== null &&
                  appointmentValidationErrors !== '' &&
                  appointmentValidationErrors !== undefined
                ) {
                  toastrFactory.error(
                    localize.getLocalizedString(appointmentValidationErrors),
                    localize.getLocalizedString('Client Error'),
                    {
                      timeOut: 0,
                      extendedTimeout: 0,
                    }
                  );
                  return;
                }

                //post to api
                save(showToast).then(function (res) {
                  deferred.resolve(res);
                });
              }
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to check preventive care status. Please try again.',
                  'Client Error'
                )
              );
              self.servicesDuePromise = null;
              preventiveCheckCancel();
            }
          );
          return deferred.promise;
        }
      }

      if (saveImmediately) {
        appointmentViewValidationNewService.validateAppointment(
          self.internalAppointment.Data,
          wasPinned
        );
        var appointmentValidationErrors = appointmentViewValidationNewService.getValidationErrors();

        if (
          appointmentValidationErrors !== null &&
          appointmentValidationErrors !== '' &&
          appointmentValidationErrors !== undefined
        ) {
          toastrFactory.error(
            localize.getLocalizedString(appointmentValidationErrors),
            localize.getLocalizedString('Client Error'),
            {
              timeOut: 0,
              extendedTimeout: 0,
            }
          );
          return;
        }

        //post to api
        var deferred = $q.defer();
        save(showToast).then(function (res) {
          deferred.resolve(res);
        });

        return deferred.promise;
      }
    }

    function saveTruncatedAppointment(
      appointmentDto,
      originalAppointmentStatus,
      afterAppointmentSavedSuccess,
      appointmentSaveOnError,
      showToast = true
    ) {
      // set the patient object to appointmentDto.patient cuz the save api doesn't return it
      self.currentPatient = appointmentDto.Patient;
      if (appointmentDto.Patient) {
        self.currentAlerts = _.cloneDeep(appointmentDto.Patient.PatientAlerts);
      }

      self.afterAppointmentSavedSuccess = afterAppointmentSavedSuccess;
      self.appointmentSaveOnError = appointmentSaveOnError;

      self.originalAppointmentStatus = originalAppointmentStatus;

      // holy guacamole. another bound object!
      //self.internalAppointment = boundObjectFactory.Create(scheduleServices.Dtos.Appointment);
      self.internalAppointment = getNewEmptyAppointmentDto();

      //self.internalAppointment.returnResult = true; // this is j-a-n-k-y. we'll remove this when we drop bound object
      //initInternalAppointment(afterAppointmentSavedSuccess, appointmentSaveOnError);
      self.internalAppointment.AfterSaveSuccess = afterAppointmentSavedSuccess;
      self.internalAppointment.AfterSaveError = appointmentSaveOnError;
      self.internalAppointment.Data.Classification = angular.isUndefined(
        self.internalAppointment.Data.Classification
      )
        ? 0
        : self.internalAppointment.Data.Classification;

      self.internalAppointment.Data = appointmentDto;

      $http
        .put(
          '_sapischeduleapi_/appointments2/cardmove',
          self.internalAppointment.Data
        )
        .then(response => {
          let appointment = response.data.Value;

          appointment.ObjectState = saveStates.Update;

          updateDateTimeStringsToDateObjects(appointment);
          if (showToast) {
            showSuccessToastr();
          }
          self.afterAppointmentSavedSuccess(appointment);
        }, self.appointmentSaveOnError);
    }

    // For Clipboard Appointments after drag.
    function openEditClipboardAppointmentModalByAppointmentId(
      appt,
      slot,
      providerId,
      roomId,
      apptSaved,
      apptEditCanceled
    ) {
      schedulingApiService
        .getAppointmentModalAndPatientData(appt.AppointmentId)
        .then(function (result) {
          // need to augment the returned appointment with the values set on the clipboard Drag event.
          var appt = angular.copy(result);

          var startTime, endTime;

          startTime = slot ? slot.startDate : null;
          endTime = startTime
            ? new Date(startTime.getTime() + appt.ProposedDuration * 60000)
            : null;

          if (startTime && endTime) {
            appt.Classification = 0;
            appt.ProposedDuration = null;
          }

          /* Manually add the provider appointments */
          appt.ProviderAppointments = [
            {
              UserId: providerId,
              StartTime: angular.copy(startTime),
              EndTime: angular.copy(endTime),
              ObjectState: saveStates.Update,
            },
          ];

          appt.ObjectState = saveStates.Update;

          // I don't think we need this - the api returns them maybe?
          // appt.Alerts = dataItem.Alerts;
          // appt.MedicalAlerts = dataItem.MedicalAlerts;
          // appt.ContactInfo = dataItem.ContactInformation;
          appt.Providers = [];
          appt.TreatmentRoomId = roomId;
          appt.StartTime = angular.copy(startTime);
          appt.EndTime = angular.copy(endTime);
          appt.start = appt.StartTime;
          appt.end = appt.EndTime;

          appt.originalStart = appt.StartTime;
          appt.originalEnd = appt.EndTime;
          getAppointmentModalDataSuccessNew(appt, apptSaved, apptEditCanceled);
        }, getAppointmentModalDataFailed);

      return;
    }

    return self;

    // *************************************************************************
    //             INTERNAL FUNCTIONS

    // This function replicates `standardServices.Dtos.Appointment` object. This function as created as part
    //  of the effort to move away from the BoundObject factory
    // NOTE: for the first iteration, the operations part is removed.
    // NOTE FOR REVIEW: i think we're fine without the operations stuff - since we'll be doing our own GET and POST we shouldn't have to use them anymore. Double check this during review please
    function getNewEmptyAppointmentDto() {
      // okay. this should probably be renamed. but the name expresses my emotion.
      var nonBoundObjectLewl = {
        Data: {},
        OriginalData: {},
        Valid: true, // this is set to true by default in boundobject factory.
        ObjectName: 'Appointment',
        IdField: 'AppointmentId',
        IsValid: validateAppointment,
        Operations: function () {
          // NOTE FOR REVIEW:
          // TODO: remove? i don't know when this is used
          // TODO: find whe nthis is used maybe
          //console.log('oh hi silly head'); // we can probably remove this.
          //debugger;
        },
        Validate: function () {
          //debugger;
          this.Valid = this.IsValid(this.Data);

          return this.Valid;
        },
      };

      return nonBoundObjectLewl;
    }

    // This function was pulled from `standardServices.Dtos.Appointment` - it's the validation function
    //  passed in to `standardServices.validationFunction`.
    function validateAppointment(appointment) {
      var c1, c2, c3, c4, c5, c6, c7;

      var validateProviderTimes = function () {
        if (
          appointment.ProviderAppointments &&
          appointment.ProviderAppointments.length > 0
        ) {
          for (var i = 0; i < appointment.ProviderAppointments.length; i++) {
            if (
              appointment.ProviderAppointments[i].UserId != '' &&
              appointment.ProviderAppointments[i].UserId != null &&
              appointment.ProviderAppointments[i].StartTime != null &&
              appointment.ProviderAppointments[i].EndTime != null
            ) {
              // Do nothing
            } else {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      };

      var validatePlannedServices = function () {
        if (
          appointment.PlannedServices &&
          appointment.PlannedServices.length > 0
        ) {
          for (var i = 0; i < appointment.PlannedServices.length; i++) {
            if (
              appointment.PlannedServices[i].AffectedAreaId == 5 &&
              (appointment.PlannedServices[i].Tooth == null ||
                appointment.PlannedServices[i].Tooth == '')
            ) {
              // Do nothing
              return false;
            } else if (
              appointment.PlannedServices[i].AffectedAreaId == 4 &&
              (appointment.PlannedServices[i].Surface == null ||
                appointment.PlannedServices[i].Surface == '')
            ) {
              // Do nothing
              return false;
            } else if (
              appointment.PlannedServices[i].AffectedAreaId == 3 &&
              (appointment.PlannedServices[i].Roots == null ||
                appointment.PlannedServices[i].Roots == '')
            ) {
              //Do nothing
              return false;
            } else if (
              appointment.PlannedServices[i].Fee < 0 ||
              appointment.PlannedServices[i].Fee > 999999.99
            ) {
              // Do nothing
              return false;
            }
          }

          return true;
        } else {
          return true;
        }
      };

      /** Block Appointment*/
      if (
        !angular.isUndefined(appointment.Classification) &&
        appointment.Classification == 1
      ) {
        c1 = appointment.Classification == 1;
        c2 =
          appointment.StartTime != undefined && appointment.StartTime != null;
        c3 = appointment.EndTime != undefined && appointment.EndTime != null;
        c4 = appointment.EndTime > appointment.StartTime;
        c5 =
          (appointment.TreatmentRoomId &&
            appointment.TreatmentRoomId != null) ||
          (appointment.UserId && appointment.UserId != null);

        return c1 && c2 && c3 && c4 && c5;
      } else if (
        /** Unscheduled Appointment*/
        !angular.isUndefined(appointment.Classification) &&
        appointment.Classification == 2
      ) {
        c1 = appointment.Classification == 2;
        c2 = appointment.PersonId && appointment.PersonId != '';
        c3 = appointment.ProposedDuration != null;
        c4 = angular.isNumber(appointment.ProposedDuration);

        return c1 && c2 && c3 && c4;
      } else {
        /** Regular Appointment */
        //debugger;
        c1 = appointment.PersonId && appointment.PersonId != '';
        c2 =
          appointment.StartTime != undefined && appointment.StartTime != null;
        c3 = appointment.EndTime != undefined && appointment.EndTime != null;
        c4 = appointment.EndTime > appointment.StartTime;
        c5 = appointment.TreatmentRoomId && appointment.TreatmentRoomId != null;
        c6 = validateProviderTimes();
        c7 = validatePlannedServices();

        return c1 && c2 && c3 && c4 && c5 && c6 && c7;
      }
    }

    function getAppointmentModalDataFailed() {
      toastrFactory.error(
        'Failed to retrieve the data necessary for editing an appointment. Please try again',
        'Error'
      );
    }

    function updateDateTimeStringsToDateObjects(appointment) {
      // NOTE: This was added because they don't come back at Date() objects,
      //  and the scheduler needs them to be Date() objects
      appointment.StartTime = self.internalAppointment.Data.StartTime;
      appointment.EndTime = self.internalAppointment.Data.EndTime;

      // NOTE: This was added because the scheduler expects the start and end time to be
      //  present on `appt.start` and `appt.end`:
      //    ```
      //         var startPM = (appt.start.getHours() > 11);
      //         var endPM = (appt.end.getHours() > 11);
      //    ```
      //  so instead of changing the scheduler, we're setting those here
      // the values are being added because they are used on the schedule to place cards in locations

      appointment.start = self.internalAppointment.Data.start;
      appointment.end = self.internalAppointment.Data.end;
    }

    function getAppointmentModalDataSuccessNew(
      appointmentEditData,
      apptSaved,
      apptEditCancelled
    ) {
      // set the current patient object, so we have it
      // TODO: the Save Appointment API should return this. Since it doesn't, we need to store the
      //  current patient object for if the user updates the appointment
      self.currentPatient = appointmentEditData.Patient;

      patientValidationFactory.SetPatientData(appointmentEditData.Patient);

      scheduleModalFactory2
        .ScheduleAppointmentModal(appointmentEditData, true)
        .then(
          response => {
            //console.log('success');
            // only process if it is defined.
            if (response) {
              apptSaved(response);
            }
          },
          () => {
            apptEditCancelled();
          }
        );
    }

    function showSuccessToastr() {
      toastrFactory.success(
        localize.getLocalizedString('Appointment saved successfully.'),
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

    function setSavingFlag(isSaving) {
      saving = isSaving;
    }

    function getSavingFlag() {
      return saving;
    }

    // This is the function that posts the appointment to the api.
    function save(showToast = true) {
      var deferred = $q.defer();
      if (self.internalAppointment.Data.AppointmentId === null) {
        let appointmentData = _.cloneDeep(self.internalAppointment.Data);
        delete appointmentData.AppointmentId;
        $http.post('_sapischeduleapi_/appointments2', appointmentData).then(
          function (response) {
            let appointment = response.data.Value;
            appointment.ObjectState = saveStates.Add;

            updateDateTimeStringsToDateObjects(appointment);

            setSavingFlag(true);
            deferred.resolve(response);
            showSuccessToastr();

            self.afterAppointmentSavedSuccess(appointment);
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
        $http
          .put('_sapischeduleapi_/appointments2', self.internalAppointment.Data)
          .then(
            function (response) {
              let appointment = response.data.Value;

              appointment.ObjectState = saveStates.Update;

              updateDateTimeStringsToDateObjects(appointment);

              setSavingFlag(true);
              deferred.resolve(response);
              showSuccessToastr();

              self.afterAppointmentSavedSuccess(appointment);
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

    function updateNote(
      appointment,
      afterAppointmentSavedSuccess,
      appointmentSaveOnError
    ) {
      var deferred = $q.defer();
      self.afterAppointmentSavedSuccess = afterAppointmentSavedSuccess;
      self.appointmentSaveOnError = appointmentSaveOnError;

      $http.put('_sapischeduleapi_/appointments2/note', appointment).then(
        function (response) {
          let appointment = response.data.Value;

          appointment.ObjectState = saveStates.Update;

          setSavingFlag(true);
          deferred.resolve(response);
          showSuccessToastr();

          self.afterAppointmentSavedSuccess(appointment);
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

    function getPreventiveServiceInfo(personId) {
      var deferred = $q.defer();
      if (self.hasPreventiveCareViewAccess) {
        patientPreventiveCareFactory
          .PreventiveCareServices(personId, true)
          .then(function (res) {
            self.preventiveCareServices = res;
            deferred.resolve(res);
          });
      }
      return deferred.promise;
    }

    function preventiveCheckConfirm() {
      // check for late status and set back to original status // NOTE: WHY?? potentially we want to display the appt as late, but not save it as late?
      // I'm going to comment this out and re-do it in a dirty way, to speed up the decoupling.
      // var appointmentStatus = listHelper.findItemByFieldValue(ctrl.appointmentStatuses.List, "Value", self.internalAppointment.Status);
      // var item = listHelper.findItemByFieldValue(ctrl.appointmentStatuses.List, "Description", "Late");
      //
      // if (appointmentStatus && appointmentStatus.Value == item.Value) {
      //    self.internalAppointment.Status = $scope.appointment.Data.OriginalStatus;
      // }

      if (self.internalAppointment.Status === 'Late') {
        // yes magic string i know - refactor!! also verify why we're doing this check. see the commented out code above for the original
        self.internalAppointment.Status = self.originalAppointmentStatus; // this gets passed in to the self. janky, janky, janky. doing it this way to speed decoupling. NOTE: REFACTOR
      }

      self.internalAppointment.Save();
    }

    function preventiveCheckCancel() {
      // what?? i'm commenting this out.
      // NOTE: to test this, schedule a preventive care appointment before the due date for that patent's preventive care (I could be using incorrect terminology here, I'm unfamiliar with this)
      ///          a confirmation modal will appear if `showMessagePreventiveCareEarlyScheduleConfirmMessage` is set to true. when you click cancel on that modal, execution gets here.
      //$scope.appointment.Data.StartTime = new Date($scope.appointment.Data.StartTime);
      //$scope.appointment.Data.EndTime = new Date($scope.appointment.Data.EndTime);
      // TODO: figure out a nice way to get this back to the modal controller
      // the service doesn't have a concept of saveClicked.
      // i think in the .then() call after he modal controller calls this, we just set this to false anyway. prolly will work...maybe....on tuesdays....30% of the time.......
      //$scope.saveClicked = false;
    }
  }
})();
