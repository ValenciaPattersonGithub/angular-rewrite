'use strict';

angular
  .module('Soar.Schedule')
  .controller('PatientAppointmentsController', [
    '$scope',
    '$filter',
    '$q',
    '$location',
    '$window',
    '$uibModal',
    'toastrFactory',
    'localize',
    'ListHelper',
    'PatientServices',
    'ScheduleViews',
    'StaticData',
    'ModalFactory',
    'ModalDataFactory',
    'ScheduleServices',
    'SaveStates',
    'ResourceService',
    'patSecurityService',
    '$interval',
    'AppointmentService',
    'CustomEvents',
    'ApiDefinitions',
    'ShareData',
    'UsersFactory',
    '$rootScope',
    'BoundObjectFactory',
    'TimeZoneFactory',
    '$timeout',
    'PatientPreventiveCareFactory',
    'PreventiveCareService',
    'PatientValidationFactory',
    'referenceDataService',
    'userSettingsDataService',
    'AppointmentModalLinksService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'AppointmentViewLoadingService',
    'AppointmentTimeService',
    'tabLauncher',
    'AppointmentStatusService',
    'locationService',
    'PatientAppointmentsFactory',
    'FeatureFlagService',
    'FuseFlag',
    'CommonServices',
    'schedulingMFENavigator',
    'NewRoomsService',
    PatientAppointmentsController,
  ]);
function PatientAppointmentsController(
  $scope,
  $filter,
  $q,
  $location,
  $window,
  $uibModal,
  toastrFactory,
  localize,
  listHelper,
  patientServices,
  scheduleViews,
  staticData,
  modalFactory,
  modalDataFactory,
  scheduleServices,
  saveStates,
  resourceService,
  patSecurityService,
  $interval,
  appointmentService,
  CustomEvents,
  apiDefinitions,
  shareData,
  usersFactory,
  $rootScope,
  boundObjectFactory,
  timeZoneFactory,
  $timeout,
  patientPreventiveCareFactory,
  preventiveCareService,
  patientValidationFactory,
  referenceDataService,
  userSettingsDataService,
  appointmentModalLinksService,
  appointmentViewVisibleService,
  appointmentViewDataLoadingService,
  appointmentViewLoadingService,
  appointmentTimeService,
  tabLauncher,
  appointmentStatusService,
  locationService,
  patientAppointmentsFactory,
  featureFlagService,
  fuseFlag,
  commonServices,
  schedulingMfeNavigator,
  roomsService
) {
  BaseCtrl.call(this, $scope, 'PatientAppointmentsController');
  var ctrl = this;
  $scope.lastStatusId = '';

  $scope.enableNewAppointmentDrawerDisplay = userSettingsDataService.isNewAppointmentDrawerEnabled();

  $scope.accountValidation = patientValidationFactory.GetAllAccountValidation();
  if (
    $scope.accountValidation === null ||
    $scope.accountValidation.length === 0
  ) {
    patientValidationFactory
      .PatientSearchValidation($scope.patient)
      .then(function (patient) {
        $scope.accountValidation = patientValidationFactory.GetAllAccountValidation();
        if (
          $scope.appointments &&
          $scope.appointments.length > 0 &&
          $scope.accountValidation &&
          $scope.accountValidation.length > 0
        ) {
          for (let i = 0; i < $scope.appointments.length; i++) {
            ctrl.checkAuthorizedForPatientLocation($scope.appointments[i]);
          }
        }
      });
  }

  $scope.layout =
    $scope.layout !== null && typeof $scope.layout !== 'undefined'
      ? $scope.layout
      : 1;

  ctrl.setSectionTitle = function () {
    switch ($scope.showAppointments) {
      case 'All':
        $scope.title = 'Appointments';
        $scope.id = 'appointmentsSection';
        break;
      case 'Scheduled':
        $scope.title = 'Scheduled Appointments';
        $scope.id = 'scheduledAppointmentsSection';
        break;
      case 'Unscheduled':
        $scope.title = 'Unscheduled Appointments';
        $scope.id = 'unscheduledAppointmentsSection';
        break;
    }
  };

  $scope.appointmentStatusChangedNew = appointmentStatusChangedNew;
  function appointmentStatusChangedNew(appointment) {
    //console.log("New Value: " + appointment);

    //Possible modals to display when Appointment Status is set to CheckOut
    if (
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.CheckOut
    ) {
      let loggedInLocation = locationService.getCurrentLocation();
      if (appointment.LocationId !== loggedInLocation.id) {
        ctrl.blockModalClose = true;
        ctrl.showChangeLocationPromptModal(appointment);
        appointment.Status = appointment.$$originalStatus;
        //Save here if the original status was ReadyForCheckout
        if (
          appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        ) {
          $scope.autoSaveAppointment(appointment, true);
        }
      } else {
        ctrl.ShowCheckoutModal(appointment, '');
      }
    }

    //Open up the schedule grid and the clipboard when Schedule Status clicked
    if (appointment.showClipboard === true) {
      launchScheduleGrid();
    }

    //Modal to display when Appointment Status is set to Unschedule
    if (
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.Unschedule
    ) {
      ctrl.unscheduledModalClose = true;
      ctrl.ShowStatusModal(appointment);
    }

    //Update When Start Appointment Status is Selected
    if (
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.StartAppointment
    ) {
      updateAppointmentStatusForStart(appointment);
    }

    //Only save when set to these status's
    else if (
      (!appointment.showClipboard &&
        appointment.Status ===
        appointmentStatusService.appointmentStatusEnum.Unconfirmed) ||
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.ReminderSent ||
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.Confirmed ||
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.InReception ||
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.Completed ||
      appointment.Status ===
      appointmentStatusService.appointmentStatusEnum.InTreatment
    ) {
      $scope.autoSaveAppointment(appointment, true);
    }
  }

  // Start Section - Modals to display on certain status selections

  ctrl.launchScheduleGrid = launchScheduleGrid;
  function launchScheduleGrid() {
    if ($scope.useV2Schedule) {
      schedulingMfeNavigator.navigateToSchedule();
    }
    else {
      const path = '#/Schedule/?showClipboard=true';
      tabLauncher.launchNewTab(path);
    }
  }

  ctrl.updateAppointmentStatusForStart = updateAppointmentStatusForStart;
  function updateAppointmentStatusForStart(appointment) {
    //Logging//console.log('OldStatusControlCode.updateAppointmentStatusForStart');
    appointment.Status =
      appointmentStatusService.appointmentStatusEnum.InTreatment;
    var appointmentUpdate = {
      appointmentId: appointment.AppointmentId,
      DataTag: appointment.DataTag,
      NewAppointmentStatusId: appointment.Status,
      StartAppointment: true,
    };
    scheduleServices.AppointmentStatusUpdate.Update(
      appointmentUpdate,
      result => $scope.afterBeginSuccess(result, true),
      result => $scope.afterBeginFailed(result)
    );
  }

  $scope.afterBeginSuccess = afterBeginSuccess;
  function afterBeginSuccess(result, overrideLocation) {
    //Logging//console.log('afterBeginSuccess');
    $timeout(function () {
      $rootScope.$broadcast('appointment:start-appointment', result.Value); // broadcast used in timeline to tell when to re-set items

      var queryString = `activeSubTab=0${overrideLocation === true
          ? `&setLocation=${result.Value.LocationId}`
          : ''
        }`;
      let patientPath = '#/Patient/';
      $scope.PreviousLocationRoute = `${patientPath}${result.Value.PersonId}/Clinical/?${queryString}`;

      tabLauncher.launchNewTab($scope.PreviousLocationRoute);
      appointmentViewVisibleService.changeAppointmentViewVisible(false, false);
      // keep it simple, even though the change is minor, reload view
      ctrl.retrieveData();
    }, 100);
  }

  $scope.afterBeginFailed = afterBeginFailed;
  function afterBeginFailed(result) {
    //Logging//console.log('afterBeginFailed');
    result.Status = result.$$originalStatus;
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to begin appointment. Please try again.'
      ),
      'Error'
    );
  }

  ctrl.showChangeLocationPromptModal = function (appointment) {
    $scope.locationWarningModal = $uibModal.open({
      templateUrl:
        'App/Common/components/appointment-status/modal/location-warning-modal.html',
      scope: $scope,
      controller: function () {
        $scope.negative = function () {
          $scope.locationWarningModal.close();
          ctrl.cancelAction(appointment);
        };
        $scope.locationDisplayName = appointment.Location.NameLine1;
      },
      size: 'sm',
      windowClass: 'center-modal',
    });
  };

  ctrl.ShowStatusModal = ShowStatusModal;
  function ShowStatusModal(appointment) {
    modalFactory
      .AppointmentStatusModal({
        id: 'Reschedule',
        title: 'Reschedule this Appointment',
        appointment: appointment,
        reason: {
          id: 'RescheduleReason',
          labels: ['Cancellation', 'Missed', 'Other'],
          options: [0, 1, 2],
        },
        onChange: $scope.statusChanged,
        beforeDelete: $scope.beforeDelete,
        hasStatusNote: true,
        showDeleteCheckbox: false,
        ShowAppointmentInfo: true,
        ShowReason: true,
      })
      .then(
        ctrl.appointmentRescheduled(appointment),
        ctrl.cancelAction(appointment)
      );
  }

  ctrl.appointmentRescheduled = appointmentRescheduled;
  function appointmentRescheduled(appointment) {
    //Logging//console.log('OldStatusControlCode.appointmentRescheduled');
    ctrl.confirmAction(appointment, false, true);
  }

  ctrl.confirmAction = confirmAction;
  function confirmAction(
    appointment,
    autoSave,
    closeModal,
    afterSave,
    updatedAppointments
  ) {
    //Logging//console.log('OldStatusControlCode.confirmAction');
    if ($scope.statusChanged !== null && $scope.statusChanged !== undefined) {
      $scope.statusChanged(
        appointment,
        autoSave,
        closeModal === true,
        afterSave,
        updatedAppointments
      );
    }
  }

  ctrl.cancelAction = cancelAction;
  function cancelAction(appointment) {
    //Logging//console.log('OldStatusControlCode.cancelAction');
    $scope.appointment.Status = appointment.$$originalStatus;
  }

  ctrl.ShowCheckoutModal = ShowCheckoutModal;
  function ShowCheckoutModal(appointment) {
    //Logging//console.log('OldStatusControlCode.ShowCheckoutModal');

    // I do not understand why this is a required check ...
    if (
      appointment.Patient.ResponsiblePersonId === null ||
      appointment.Patient.ResponsiblePersonId === undefined
    ) {
      appointment.Patient = $scope.apptPatient;
      if (
        $scope.apptPatient.ResponsiblePersonId === null &&
        $scope.apptPatient.ResponsiblePersonType !== 2
      ) {
        appointment.Patient.ResponsiblePersonId = $scope.apptPatient.PatientId;
      }
    }

    if (appointment.Patient.ResponsiblePersonId === null) {
      modalFactory
        .ResponsiblePartyModal({
          id: 'ResponsibleParty',
          title: 'Please assign a responsible person to continue',
          appointment: angular.copy(appointment),
          patient: angular.copy(appointment.Patient),
          hasStatusNote: false,
          showDeleteCheckbox: true,
          ShowAppointmentInfo: true,
          ShowReason: true,
        })
        .then(function (appts) {
          ctrl.canCheckout(appts);
        });
    } else {
      ctrl.canCheckout(appointment);
    }
  }

  ctrl.canCheckout = canCheckout;
  function canCheckout(appt) {
    // this prevents the operation from being done multiple times.
    if ($scope.sentForCheckout === true) {
      $scope.sentForCheckout = false; // not sure if we still want to do this or not.
      toastrFactory.error(
        localize.getLocalizedString(
          'There is already a checkout in progress for this appointment.'
        ),
        'Warning'
      );
      return;
    }

    // need to prevent the users from attempting the operation multiple times through a double click.
    $scope.sentForCheckout = true;

    // after review it was determined that we would ensure accuracy by always calling to get the current state of the appointment.
    // this covers any case where the appointment view as kept open for some length of time and the state of the appointment changing.
    // call to get the current state of the appointment and the encounter id.
    scheduleServices.Lists.Appointments.GetEncounterIdForAppointment(
      { AppointmentId: appt.AppointmentId },
      function (res) {
        if (
          res !== null &&
          res !== undefined &&
          res.Value !== null &&
          res.Value !== undefined
        ) {
          appt.EncounterId = res.Value.EncounterId;
          ctrl.sendForCheckout(appt);
        } else {
          $scope.sentForCheckout = false;
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve encounter for appointment. Please try again.'
            ),
            'Error'
          );
        }
      },
      function () {
        $scope.sentForCheckout = false;
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve encounter for appointment. Please try again.'
          ),
          'Error'
        );
      }
    );
  }

  ctrl.sendForCheckout = sendForCheckout;
  function sendForCheckout(appt) {
    let path = '';
    const patientPath = '#/Patient/';

    // so at this point we have a problem ... we have a PatientAccount some times other times we have PersonAccount.
    // I assume we still have operations returning the format in an object called PersonAccount from another location on the code still.
    if (
      appt.Patient.PatientAccount !== null &&
      appt.Patient.PatientAccount !== undefined
    ) {
      appt.Patient.PersonAccount = appt.Patient.PatientAccount;
    }

    if (
      appt.Patient !== null &&
      appt.Patient !== undefined &&
      appt.Patient.PatientId !== null &&
      appt.Patient.PatientId !== undefined &&
      appt.Patient.PersonAccount !== null &&
      appt.Patient.PersonAccount !== undefined &&
      appt.Patient.PersonAccount.AccountId !== null &&
      appt.Patient.PersonAccount.AccountId !== undefined
    ) {
      // prior to this we checked if the appointment had services and we doubled checked by checking the object in the database
      // because of this there is no need to check if the appointment has services again, if you have a valid encounter id you have services
      if (appt.EncounterId !== null && appt.EncounterId !== undefined) {
        path =
          patientPath +
          appt.Patient.PatientId +
          '/Account/' +
          appt.Patient.PersonAccount.AccountId +
          '/Encounter/' +
          appt.EncounterId +
          '/Checkout/EncountersCartAccountSummary';
      } else {
        path =
          patientPath +
          appt.Patient.PatientId +
          '/Account/' +
          appt.Patient.PersonAccount.AccountId +
          '/EncountersCart/Schedule?';
        $scope.sentForCheckout = true;
        angular.forEach($location.search(), function (value, key) {
          if (key !== 'newTab' && key !== 'newKey') {
            path += key + '=' + value + '&';
          }
        });
        path += 'appt=' + appt.AppointmentId;
      }

      // prevents double execution of the operation from the same appointment view
      $scope.sentForCheckout = true;

      $timeout(function () {
        tabLauncher.launchNewTab(path);

        // now we can remove the block on the operation
        $scope.sentForCheckout = false;
      }, 50);
    } else {
      // tell the user that something went wrong and suggest they reload the screen.
      // consider logging the event so we can get data on if this is actually happening in production.
      // users should not under any circumstances get to this place.
      $scope.sentForCheckout = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Could not retrieve patient data. Please try again or contact customer support for further assistance.'
        ),
        'Error'
      );
    }
  }

  // delete unscheduled appointment modal
  $scope.showDeleteAppointmentModal = function (appointment) {
    ctrl.appointmentToDelete = appointment;
    modalFactory
      .AppointmentDeleteModal(
        ctrl.appointmentToDelete.Classification,
        true,
        'Are you sure you want to remove this unscheduled appointment?'
      )
      .then(ctrl.confirmDelete, ctrl.cancelDelete);
  };

  ctrl.confirmDelete = function () {
    scheduleServices.Dtos.Appointment.Operations.Delete(
      { AppointmentId: ctrl.appointmentToDelete.AppointmentId },
      ctrl.appointmentDeleteOnSuccess,
      ctrl.appointmentDeleteOnError
    );
  };

  ctrl.cancelDelete = function () {
    ctrl.appointmentToDelete = null;
  };

  ctrl.appointmentDeleteOnSuccess = function () {
    if (ctrl.appointmentToDelete === null) {
      console.log('The appointment you are trying to delete is NULL');
      return;
    }

    // keeping the other appt panels on the appt page in sync with changes
    $rootScope.$broadcast(
      'soar:appt-deleted-via-pat-appt-ctrl',
      ctrl.appointmentToDelete
    );

    ctrl.appointmentToDelete = null;
    toastrFactory.success(
      localize.getLocalizedString('Successfully deleted the {0}.', [
        'appointment',
      ]),
      'Success'
    );
  };

  ctrl.appointmentDeleteOnError = function () {
    ctrl.appointmentToDelete = null;

    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to delete the {0}. Please try again.',
        ['appointment']
      ),
      'Error'
    );
  };
  // End Section -  Modals to display on certain status selections

  ctrl.setSectionTitle();
  //#region Authorization
  ctrl.authModifyAccess = function () {
    return patSecurityService.IsAuthorizedByAbbreviation(
      'soar-sch-sptapt-edit'
    );
  };
  $scope.canEditAppointment = ctrl.authModifyAccess();

  ctrl.overviewFromModalAppointment = function (modalAppointment) {
    var appt = {
      AppointmentId: modalAppointment.AppointmentId,
      AppointmentTypeId: modalAppointment.AppointmentTypeId,
      StartTime: modalAppointment.StartTime,
      EndTime: modalAppointment.EndTime,
      ProposedDuration: modalAppointment.ProposedDuration,
      Classification: modalAppointment.Classification,
      Status: modalAppointment.Status,
      TreatmentRoomId: modalAppointment.TreatmentRoomId,
      UserId: modalAppointment.UserId,
      LocationId: modalAppointment.LocationId,
      Patient: {},
      PersonId: modalAppointment.Patient.PatientId,
    };

    if (!_.isNil(modalAppointment.Patient)) {
      if (!_.isNil(modalAppointment.Patient.FirstName)) {
        appt.Patient.FirstName = modalAppointment.Patient.FirstName;
      } else if (!_.isNil(modalAppointment.Patient.Profile)) {
        appt.Patient.FirstName = modalAppointment.Patient.Profile.FirstName;
      }
    }
    var modalType = _.find(
      referenceDataService.get(
        referenceDataService.entityNames.appointmentTypes
      ),
      { AppointmentTypeId: modalAppointment.AppointmentTypeId }
    );
    if (_.isNil(modalType)) {
      appt.AppointmentType = {
        Name: 'No Appointment Type',
        AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
        FontColor: 'rgb(0, 0, 0)',
      };
    } else {
      appt.AppointmentType = {
        Name: modalType.Name,
        AppointmentTypeColor: modalType.AppointmentTypeColor,
        FontColor: modalType.FontColor,
      };
    }

    if (!_.isNil(modalAppointment.TreatmentRoomId)) {
      // If we already have the correct room data (because this function is called 4 times back to back to back to back)
      // then don't do anything, just use the data we have
      if (modalAppointment.Room?.TreatmentRoomId == modalAppointment.TreatmentRoomId) {
        appt.Room = modalAppointment.Room;
      }
      else {
        // otherwise try to find the room and create the object for next time
        var room = roomsService.findByRoomId(modalAppointment.TreatmentRoomId);
        if (!_.isNil(room)) {
          appt.Room = {
            Name: room.Name,
            TreatmentRoomId: modalAppointment.TreatmentRoomId
          };
        } else {
          appt.Room = {
            Name: 'Room not found!',
            TreatmentRoomId: modalAppointment.TreatmentRoomId
          };
        }
        modalAppointment.Room = appt.Room;
      }
    } else {
      appt.Room = {
        Name: 'Assign Room',
        TreatmentRoomId: modalAppointment.TreatmentRoomId
      };
      modalAppointment.Room = appt.Room;
    }
    
    appt.ProviderId = modalAppointment.UserId;
    if (modalAppointment.ProviderAppointments.length > 0) {
      var index = 0;
      while (
        modalAppointment.ProviderAppointments[index].ObjectState === 'Delete' &&
        index < modalAppointment.ProviderAppointments.length
      )
        ++index;
      if (index < modalAppointment.ProviderAppointments.length) {
        appt.ProviderId = modalAppointment.ProviderAppointments[index].UserId;
        appt.UserId = appt.ProviderId;
      }
    }

    if (_.isNil(appt.ProviderId)) {
      appt.Provider = {
        Name: 'Assign Provider',
        IsActive: false,
        ProviderTypeId: 0,
      };
    } else {
      var provider = _.find(
        referenceDataService.get(referenceDataService.entityNames.users),
        { UserId: appt.ProviderId }
      );
      var providerName = provider.FirstName + ' ' + provider.LastName + ' ';
      if (!_.isNil(provider.ProfessionalDesignation))
        providerName += provider.ProfessionalDesignation;
      appt.Provider = {
        Name: providerName,
        IsActive: provider.IsActive,
        ProviderTypeId: provider.ProviderTypeId,
      };
    }

    var ofcLocation = _.find(
      referenceDataService.get(referenceDataService.entityNames.locations),
      { LocationId: modalAppointment.LocationId }
    );
    appt.Location = {
      NameAbbreviation: ofcLocation.NameAbbreviation,
      Timezone: ofcLocation.Timezone,
    };
    appt.DataTag = modalAppointment.DataTag;

    return appt;
  };

  ctrl.updateItem = function (updatedAppointment) {
    var appt = null;
    var index = null;
    for (let i = 0; i < $scope.appointments.length; i++) {
      if (
        $scope.appointments[i].AppointmentId == updatedAppointment.AppointmentId
      ) {
        appt = $scope.appointments[i];
        index = i;
        break;
      }
    }
    if (appt) {
      if (
        appt.StartTime !== updatedAppointment.StartTime ||
        appt.EndTime !== updatedAppointment.EndTime ||
        appt.ProposedDuration !== updatedAppointment.ProposedDuration ||
        appt.Classification !== updatedAppointment.Classification ||
        appt.Status !== updatedAppointment.Status ||
        appt.AppointmentType.Name !== updatedAppointment.AppointmentType.Name ||
        appt.TreatmentRoomId !== updatedAppointment.TreatmentRoomId ||
        appt.Provider.Name !== updatedAppointment.Provider.Name ||
        appt.LocationId !== updatedAppointment.LocationId ||
        appt.DataTag !== updatedAppointment.DataTag
      ) {
        // this update changes real values
        var updatedCopy = _.cloneDeep(appt);
        updatedCopy.StartTime = updatedAppointment.StartTime;
        updatedCopy.EndTime = updatedAppointment.EndTime;
        updatedCopy.ProposedDuration = updatedAppointment.ProposedDuration;
        updatedCopy.Classification = updatedAppointment.Classification;
        updatedCopy.Status = updatedAppointment.Status;
        updatedCopy.AppointmentType.Name =
          updatedAppointment.AppointmentType.Name;
        updatedCopy.AppointmentType.AppointmentTypeColor =
          updatedAppointment.AppointmentType.AppointmentTypeColor;
        updatedCopy.AppointmentType.FontColor =
          updatedAppointment.AppointmentType.FontColor;
        updatedCopy.TreatmentRoomId = updatedAppointment.TreatmentRoomId;
        updatedCopy.Room.Name = updatedAppointment.Room.Name;
        updatedCopy.Provider.Name = updatedAppointment.Provider.Name;
        updatedCopy.Provider.IsActive = updatedAppointment.Provider.IsActive;
        updatedCopy.Provider.ProviderTypeId =
          updatedAppointment.Provider.ProviderTypeId;
        updatedCopy.LocationId = updatedAppointment.LocationId;
        updatedCopy.Location.NameAbbreviation =
          updatedAppointment.Location.NameAbbreviation;
        updatedCopy.Location.Timezone = updatedAppointment.Location.Timezone;
        updatedCopy.DataTag = updatedAppointment.DataTag;
        // ConvertAppointmentDatesTZ was throwing errors for ProviderAppointments with Add status and no StartTime
        // storing and restoring them after the call is an ugly hack but I wasn't ready to tackle timeZoneFactory
        var provAppts = updatedCopy.ProviderAppointments;
        updatedCopy.ProviderAppointments = null;
        updatedCopy = appointmentTimeService.convertAppointmentDates(
          updatedCopy
        );
        updatedCopy.ProviderAppointments = provAppts;
        updatedCopy = ctrl.appendStartTimeFormat(updatedCopy);
        ctrl.appendAppointmentStatusData(updatedCopy);
        // this change can trigger a $digest
        updatedCopy.isInactivePreferredDentist =
          typeof updatedCopy.Provider.IsActive !== 'undefined' &&
          (!updatedCopy.Provider.IsActive ||
            updatedCopy.Provider.ProviderTypeId === 4);
        updatedCopy.MostRecentUnscheduledAppt = false;
        $scope.appointments[index] = updatedCopy;
        ctrl.counter();
      }
    }
  };

  ctrl.updateItemStatus = function (updatedAppointment) {
    if (updatedAppointment.Status === $scope.statusList.Enum.Completed) {
      // if status is being updated to completed, remove the appointment from the list
      ctrl.deleteItem(updatedAppointment.AppointmentId);
    } else {
      var appt = null;
      for (let i = 0; i < $scope.appointments.length; i++) {
        if (
          $scope.appointments[i].AppointmentId ==
          updatedAppointment.AppointmentId
        ) {
          appt = $scope.appointments[i];
          break;
        }
      }

      if (appt !== undefined) {
        if (
          appt.StartTime !== updatedAppointment.StartTime ||
          appt.EndTime !== updatedAppointment.EndTime ||
          appt.ProposedDuration !== updatedAppointment.ProposedDuration ||
          appt.Classification !== updatedAppointment.Classification ||
          appt.Status !== updatedAppointment.Status ||
          appt.DataTag !== updatedAppointment.DataTag
        ) {
          // this update changes real values
          var updatedCopy = _.cloneDeep(appt);
          updatedCopy.StartTime = updatedAppointment.StartTime;
          updatedCopy.EndTime = updatedAppointment.EndTime;
          updatedCopy.ProposedDuration = updatedAppointment.ProposedDuration;
          updatedCopy.Classification = updatedAppointment.Classification;
          updatedCopy.Status = updatedAppointment.Status;
          updatedCopy.DataTag = updatedAppointment.DataTag;
          // ConvertAppointmentDatesTZ was throwing errors for ProviderAppointments with Add status and no StartTime
          // storing and restoring them after the call is an ugly hack but I wasn't ready to tackle timeZoneFactory
          var provAppts = updatedCopy.ProviderAppointments;
          updatedCopy.ProviderAppointments = null;
          timeZoneFactory.ConvertAppointmentDatesTZ(
            updatedCopy,
            updatedCopy.Location.Timezone
          );
          updatedCopy.ProviderAppointments = provAppts;
          updatedCopy = ctrl.appendStartTimeFormat(updatedCopy);
          ctrl.appendAppointmentStatusData(updatedCopy);
          // this change can trigger a $digest
          updatedCopy.isInactivePreferredDentist =
            typeof updatedCopy.Provider.IsActive !== 'undefined' &&
            (!updatedCopy.Provider.IsActive ||
              updatedCopy.Provider.ProviderTypeId === 4);
          updatedCopy.MostRecentUnscheduledAppt = false;
          $scope.appointments[updatedCopy.$$index] = updatedCopy;
          ctrl.counter();
        }
      }
    }
  };

  ctrl.deleteItem = function (appointmentId) {
    for (var i = 0; i < $scope.appointments.length; i++) {
      if ($scope.appointments[i].AppointmentId === appointmentId) {
        $scope.appointments.splice(i, 1);
        ctrl.counter();
        break;
      }
    }
  };

  ctrl.idIndex = 0;
  ctrl.addItem = function (appointments, newAppointment) {
    ctrl.checkAuthorizedForPatientLocation(newAppointment);
    var isLateAddition = false;
    if (_.isNil(appointments)) {
      // adding appointment via broadcast message
      appointments = $scope.appointments;
      isLateAddition = true;
    }
    // $$SortingId is used to make sure that the current patient's appts always come first
    if ($scope.patientId === newAppointment.PersonId) {
      newAppointment.$$SortingId = 0;
    } else {
      newAppointment.$$SortingId = 1;
    }
    if (_.isNil(newAppointment.Provider)) {
      newAppointment.Provider = {};
    }
    timeZoneFactory.ConvertAppointmentDatesTZ(
      newAppointment,
      newAppointment.Location.Timezone
    );
    ctrl.appendAppointmentStatusData(newAppointment);
    newAppointment = ctrl.appendStartTimeFormat(newAppointment);

    if ($scope.layout === 2) {
      newAppointment.DisplayProviders = ctrl.getAppointmentProviders(
        newAppointment
      );
    }

    if (_.isNil(newAppointment.$$index))
      newAppointment.$$index = ctrl.idIndex++;

    newAppointment.isInactivePreferredDentist =
      typeof newAppointment.Provider.IsActive !== 'undefined' &&
      (!newAppointment.Provider.IsActive ||
        newAppointment.Provider.ProviderTypeId === 4);
    newAppointment.MostRecentUnscheduledAppt = false;
    appointments.push(newAppointment);
  };

  ctrl.appointmentRetrievalSuccess = function (result) {
    var appointments = [];
    _.forEach(result.Value, function (appointment) {
      ctrl.checkAuthorizedForPatientLocation(appointment);
      // set to false ... if something overrides it later ... then it will be set to true
      appointment.MostRecentUnscheduledAppt = false;
      ctrl.addItem(appointments, appointment);
    });
    switch ($scope.tabIdentifier) {
      case 1:
        //Treatment Plans Tab
        var soonestTxPlanAppointment = null;
        var initialApptIndex = null;
        var dateNow = moment();
        var appointmentIdsWithTxPlan = [];

        $timeout(function () {
          patientServices.TreatmentPlans.getAllHeaders(
            { Id: $scope.patientId },
            function (headers) {
              var treatmentPlanHeaders = headers.Value;
              angular.forEach(treatmentPlanHeaders, function (header) {
                patientServices.TreatmentPlans.get(
                  {
                    Id: $scope.patientId,
                    TreatmentPlanId: header.TreatmentPlanId,
                  },
                  function (txPlans) {
                    var treatmentPlans = txPlans.Value;
                    angular.forEach(
                      treatmentPlans.TreatmentPlanServices,
                      function (treatmentPlanService) {
                        if (
                          treatmentPlanService &&
                          treatmentPlanService.ServiceTransaction.AppointmentId
                        ) {
                          appointmentIdsWithTxPlan.push(
                            treatmentPlanService.ServiceTransaction
                              .AppointmentId
                          );
                        }
                      }
                    );

                    for (var i = 0; i < appointments.length; i++) {
                      if (
                        appointmentIdsWithTxPlan.includes(
                          appointments[i].AppointmentId
                        ) &&
                        appointments[i].PersonId === $scope.patientId
                      ) {
                        if (
                          !soonestTxPlanAppointment &&
                          appointments[i].StartTime > dateNow
                        ) {
                          soonestTxPlanAppointment = appointments[i];
                          appointments[i].MostRecentTxPlanAppt = true;
                          initialApptIndex = i;
                        } else {
                          if (appointments[i].StartTime > dateNow) {
                            if (
                              appointments[i].StartTime <
                              soonestTxPlanAppointment.StartTime
                            ) {
                              soonestTxPlanAppointment = appointments[i];
                              appointments[i].MostRecentTxPlanAppt = true;
                              if (
                                initialApptIndex !== null &&
                                initialApptIndex >= 0
                              ) {
                                appointments[
                                  initialApptIndex
                                ].MostRecentTxPlanAppt = false;
                              }
                            }
                          }
                        }
                      }
                    }

                    //when no scheduled appointment w/ tx plan is present
                    var scheduledAppts = $.grep(
                      appointments,
                      function (appt, i) {
                        return (
                          appointmentIdsWithTxPlan.includes(
                            appt.AppointmentId
                          ) &&
                          appt.PersonId === $scope.patientId &&
                          appt.Classification === 0
                        );
                      }
                    );

                    var soonestUnscheduledAppointment = null;
                    var initialApptIndex = null;

                    if (scheduledAppts.length === 0) {
                      //order unscheduled appts w/ tx plan by creation date & highlight the soonest one
                      for (var i = 0; i < appointments.length; i++) {
                        if (
                          appointmentIdsWithTxPlan.includes(
                            appointments[i].AppointmentId
                          ) &&
                          appointments[i].PersonId === $scope.patientId
                        ) {
                          if (!soonestUnscheduledAppointment) {
                            soonestUnscheduledAppointment = appointments[i];
                            appointments[i].MostRecentUnscheduledAppt = true;
                            initialApptIndex = i;
                          } else {
                            if (
                              appointments[i].DateModified >
                              soonestUnscheduledAppointment.DateModified
                            ) {
                              soonestUnscheduledAppointment = appointments[i];
                              appointments[i].MostRecentUnscheduledAppt = true;
                              if (
                                initialApptIndex !== null &&
                                initialApptIndex >= 0
                              ) {
                                appointments[
                                  initialApptIndex
                                ].MostRecentUnscheduledAppt = false;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      ctrl.clearHighlightsForUnscheduledAppts();
                    }
                    ctrl.autoScroll();
                  },
                  function () {
                    toastrFactory.error(
                      localize.getLocalizedString(
                        'There was an error while attempting to retrieve the treatment plans.'
                      ),
                      localize.getLocalizedString('Server Error')
                    );
                  }
                );
              });
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'There was an error while attempting to retrieve the treatment plan headers.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        });

        break;
      case 2:
        //Preventive Care Tab
        var soonestPcPlanAppointment = null;
        var initialApptIndex = null;
        var dateNow = moment();
        var deferred = $q.defer();
        var preventiveServices = [];
        $scope.preventiveServices = [];

        $timeout(function () {
          patientPreventiveCareFactory.GetAllServicesDue($scope.patientId).then(
            function (result) {
              preventiveCareService.accessForServiceType();
              var authAccessServiceCode = preventiveCareService.accessForServiceCode();

              var servicePromises = [];

              if (authAccessServiceCode.View == true) {
                $timeout(function () {
                  angular.forEach(result.Value, function (type) {
                    var found = listHelper.findIndexByFieldValue(
                      preventiveServices,
                      'PreventiveServiceTypeId',
                      type.PreventiveServiceTypeId
                    );
                    if (found >= 0) {
                      preventiveServices[found] = type;
                    } else {
                      preventiveServices.push(type);
                    }
                    servicePromises.push(
                      preventiveCareService
                        .GetPreventiveServicesForServiceType(
                          type.PreventiveServiceTypeId
                        )
                        .then(function (serviceResult) {
                          type.ServiceCodes = serviceResult.Value;
                          if (type.ServiceCodes.length > 0) {
                            angular.forEach(
                              type.ServiceCodes,
                              function (preventiveService) {
                                $scope.preventiveServices.push(
                                  preventiveService.ServiceCodeId
                                );
                              }
                            );
                          }

                          for (var i = 0; i < appointments.length; i++) {
                            if (
                              appointments[i].ServiceCodes &&
                              appointments[i].ServiceCodes.length > 0 &&
                              appointments[i].PersonId === $scope.patientId
                            ) {
                              angular.forEach(
                                appointments[i].ServiceCodes,
                                function (serviceCode) {
                                  if (
                                    $scope.preventiveServices.includes(
                                      serviceCode.ServiceCodeId
                                    )
                                  ) {
                                    if (
                                      !soonestPcPlanAppointment &&
                                      appointments[i].StartTime > dateNow
                                    ) {
                                      soonestPcPlanAppointment =
                                        appointments[i];
                                      appointments[i].MostRecentPcAppt = true;
                                      initialApptIndex = i;
                                    } else {
                                      if (appointments[i].StartTime > dateNow) {
                                        if (
                                          appointments[i].StartTime <
                                          soonestPcPlanAppointment.StartTime
                                        ) {
                                          soonestPcPlanAppointment =
                                            appointments[i];
                                          appointments[
                                            i
                                          ].MostRecentPcAppt = true;
                                          if (
                                            initialApptIndex !== null &&
                                            initialApptIndex >= 0
                                          ) {
                                            appointments[
                                              initialApptIndex
                                            ].MostRecentPcAppt = false;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              );
                            }
                          }

                          //when no scheduled appointment w/ preventive care is present
                          var scheduledAppts = [];

                          angular.forEach(appointments, function (appt, i) {
                            if (
                              appt.PersonId === $scope.patientId &&
                              appt.Classification === 0
                            ) {
                              angular.forEach(
                                appt.ServiceCodes,
                                function (code, i) {
                                  if (
                                    $scope.preventiveServices.includes(
                                      code.ServiceCodeId
                                    )
                                  ) {
                                    scheduledAppts.push(appt);
                                  }
                                }
                              );
                            }
                          });

                          var soonestUnscheduledAppointment = null;
                          var initialApptIndex = null;

                          if (scheduledAppts.length === 0) {
                            //order unscheduled appts w/ preventive care by creation date & highlight the soonest one
                            for (var i = 0; i < appointments.length; i++) {
                              if (
                                appointments[i].ServiceCodes &&
                                appointments[i].ServiceCodes.length > 0 &&
                                appointments[i].PersonId === $scope.patientId
                              ) {
                                angular.forEach(
                                  appointments[i].ServiceCodes,
                                  function (serviceCode) {
                                    if (
                                      $scope.preventiveServices.includes(
                                        serviceCode.ServiceCodeId
                                      )
                                    ) {
                                      if (!soonestUnscheduledAppointment) {
                                        soonestUnscheduledAppointment =
                                          appointments[i];
                                        appointments[i].MostRecentPcAppt = true;
                                        initialApptIndex = i;
                                      } else {
                                        if (
                                          appointments[i].DateModified >
                                          soonestUnscheduledAppointment.DateModified
                                        ) {
                                          soonestUnscheduledAppointment =
                                            appointments[i];
                                          appointments[
                                            i
                                          ].MostRecentPcAppt = true;
                                          if (
                                            initialApptIndex !== null &&
                                            initialApptIndex >= 0
                                          ) {
                                            appointments[
                                              initialApptIndex
                                            ].MostRecentPcAppt = false;
                                          }
                                        }
                                      }
                                    }
                                  }
                                );
                              }
                            }
                          } else {
                            ctrl.clearHighlightsForUnscheduledAppts();
                          }
                          ctrl.autoScroll();
                        })
                    );
                  });
                });
              } else {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'User is not authorized to access this area'
                  ),
                  'Not Authorized'
                );
              }

              $q.all(servicePromises).then(
                function () {
                  deferred.resolve(preventiveServices);
                },
                function () {
                  deferred.reject();
                }
              );
            },
            function () {
              deferred.reject();
            }
          );
        });
        break;
      case 3:
        //Other To Do Tab
        //do nothing, no highlighting of any appointment
        break;
      default:
        //All Patients Tab
        //When no scheduled appointment is present...

        var soonestUnscheduledAppointment = null;
        var initialApptIndex = null;

        //order unscheduled appts by modified date & highlight the soonest appt
        for (var i = 0; i < appointments.length; i++) {
          if (
            appointments[i].Classification === 0 &&
            appointments[i].PersonId === $scope.patientId &&
            appointments[i].PersonId === $scope.patientId
          ) {
            if (!soonestUnscheduledAppointment) {
              soonestUnscheduledAppointment = appointments[i];
              appointments[i].MostRecentUnscheduledAppt = true;
              initialApptIndex = i;
            } else {
              if (
                appointments[i].DateModified >
                soonestUnscheduledAppointment.DateModified
              ) {
                soonestUnscheduledAppointment = appointments[i];
                appointments[i].MostRecentUnscheduledAppt = true;
                if (initialApptIndex !== null && initialApptIndex >= 0) {
                  appointments[
                    initialApptIndex
                  ].MostRecentUnscheduledAppt = false;
                }
              }
            }
          }
        }
        ctrl.autoScroll();
        break;
    }

    // did this to remove constant ng-show checks.
    for (let i = 0; i < appointments.length; i++) {
      appointments[i].isInactivePreferredDentist =
        typeof appointments[i].Provider.IsActive !== 'undefined' &&
        (!appointments[i].Provider.IsActive ||
          appointments[i].Provider.ProviderTypeId === 4);
    }

    $scope.appointments = appointments;

    $scope.loading = false;

    // Update the patient appointment and appointment counts
    ctrl.counter();

    // Check for late status after appointments load
    appointmentService.FlagAppointmentsAsLateIfNeeded($scope.appointments);

    ctrl.updateViewAppointmentActionText();
  };

  ctrl.autoScroll = function () {
    $timeout(function () {
      var topOffSet = 16;
      if ($('.trInitiallyClicked').length && !$scope.trInitiallyClicked) {
        $('.patientAppt__content').scrollTop(
          $('.trInitiallyClicked').position().top - topOffSet
        );
        $scope.trInitiallyClicked = true;
      }
    });
  };

  ctrl.appointmentRetrievalFailed = function () {
    ctrl.ShowErrorMessage(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['appointments for the account']
      )
    );
  };

  ctrl.counter = function () {
    // Get the appointment count, if any
    $scope.appointmentCount = 0;
    if ($scope.appointments && $scope.appointments.length > 0) {
      $scope.appointmentCount = $filter('filter')(
        $scope.appointments,
        $scope.appointmentsFilter
      ).length;
    }
    // Get the patient appointment count
    $scope.patientAppointmentCount = ctrl.getPatientAppointmentsCount();

    if (!_.isNil($scope.patient)) {
      $scope.patient.appointmentCount = $scope.accountView
        ? $scope.appointmentCount
        : $scope.patientAppointmentCount;
    }
  };
  $scope.showIfInactivePreferredDentist = function (appointment) {
    return (
      typeof appointment.Provider.IsActive !== 'undefined' &&
      (!appointment.Provider.IsActive ||
        appointment.Provider.ProviderTypeId === 4)
    );
  };

  ctrl.getPatientAppointmentsCount = function () {
    var patientAppointmentCount = 0;
    angular.forEach($scope.appointments, function (appointment) {
      if (!$scope.accountView || appointment.PersonId === $scope.patientId) {
        if ($scope.showAppointments === 'All') {
          patientAppointmentCount++;
        } else if (
          $scope.showAppointments === 'Scheduled' &&
          appointment.StartTime
        ) {
          patientAppointmentCount++;
        } else if (
          $scope.showAppointments === 'Unscheduled' &&
          !appointment.StartTime
        ) {
          patientAppointmentCount++;
        }
      }
    });
    return patientAppointmentCount;
  };

  ctrl.appendPatientData = function (appointment, patient) {
    if (!_.isNil(appointment)) {
      appointment.Patient = _.isNil(patient) ? {} : patient;
    }
  };

  ctrl.appendTreatmentRoomData = function (appointment, treatmentRoom) {
    if (!_.isNil(appointment)) {
      var emptyTreatmentRoom = { Name: '' };

      appointment.Room = _.isNil(treatmentRoom)
        ? emptyTreatmentRoom
        : treatmentRoom;
    }
  };

  ctrl.appendLocationData = function (appointment, location) {
    if (!_.isNil(appointment)) {
      appointment.Location = _.isNil(location) ? null : location;
    }
  };

  ctrl.appendProviderData = function (appointment, provider) {
    if (!_.isNil(appointment)) {
      if (!_.isNil(provider)) {
        provider.Name =
          provider.Name > ''
            ? provider.Name
            : provider.FirstName +
            ' ' +
            provider.LastName +
            (provider.ProfessionalDesignation > ''
              ? ', ' + provider.ProfessionalDesignation
              : '');
        appointment.Provider = provider;
      } else {
        appointment.Provider =
          appointment.Classification !== 2
            ? {}
            : { Name: localize.getLocalizedString('Any Provider') };
      }
    }
  };

  ctrl.appendAppointmentTypeData = function (appointment, appointmentType) {
    if (!_.isNil(appointment)) {
      appointment.AppointmentType = _.isNil(appointmentType)
        ? {
          Name: localize.getLocalizedString('No Appointment Type'),
          AppointmentTypeColor: 'rgba(100, 100, 100, 0.34902)',
          FontColor: 'rgb(0, 0, 0)',
        }
        : appointmentType;
    }
  };

  ctrl.appendAppointmentStatusData = function (appointment) {
    if (!_.isNil(appointment)) {
      var status = ctrl.getStatusById(appointment.Status);

      if (!_.isNil(status)) {
        appointment.StatusName = status.Description;
        appointment.StatusIcon = status.Icon;
      }
    }
  };

  ctrl.appendStartTimeFormat = function (appointment) {
    if (!_.isNil(appointment)) {
      var startPM = new Date(appointment.StartTime).getHours() > 11;
      var endPM = new Date(appointment.EndTime).getHours() > 11;

      appointment.StartTimeFormat =
        startPM === endPM ? 'MMM dd, yyyy h:mm' : 'MMM dd, yyyy h:mm a';
    }
    return appointment;
  };

  ctrl.getStatusById = function (statusId) {
    // this check is here until we figure out how this gets called before the list is filled in
    if (_.isNil($scope.statusList)) {
      ctrl.initializeStatusList();
    }
    return listHelper.findItemByFieldValue(
      $scope.statusList.List,
      'Value',
      statusId
    );
  };

  ctrl.ShowErrorMessage = function (message) {
    toastrFactory.error(message, 'Error');
  };

  ctrl.appointmentSaved = function (updatedAppointment) {
    $rootScope.$broadcast(
      'soar:appt-updated-via-pat-appt-ctrl',
      updatedAppointment
    );
    $rootScope.$broadcast('fuse:overview-refresh-odontogram');
  };

  $scope.$on(
    'soar:appt-changed-via-pat-appt-ctrl',
    function (event, appointment) {
      var appt = listHelper.findItemByFieldValue(
        $scope.appointments,
        'AppointmentId',
        appointment.AppointmentId
      );

      if ($scope.patientId === appointment.PersonId) {
        appointment.$$SortingId = 0;
      } else {
        appointment.$$SortingId = 1;
      }

      appointment = ctrl.appendStartTimeFormat(appointment);
      ctrl.counter();
      if (appt) {
        $rootScope.$broadcast(
          'soar:appt-updated-via-pat-appt-ctrl',
          appointment
        );
      } else {
        $rootScope.$broadcast('soar:appt-added-via-pat-appt-ctrl', appointment);
      }
      $rootScope.$broadcast('fuse:overview-refresh-odontogram');
    }
  );

  ctrl.newAppointmentSaved = function (newAppointment) {
    var appt = listHelper.findItemByFieldValue(
      $scope.appointments,
      'AppointmentId',
      newAppointment.AppointmentId
    );
    if (appt) {
      $rootScope.$broadcast(
        'soar:appt-updated-via-pat-appt-ctrl',
        newAppointment
      );
    } else {
      $rootScope.$broadcast(
        'soar:appt-added-via-pat-appt-ctrl',
        newAppointment
      );
    }
    $rootScope.$broadcast('fuse:overview-refresh-odontogram');
  };

  ctrl.initializeStatusList = function () {
    $scope.statusList = staticData.AppointmentStatuses();

    commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
      const practiceSettings = res.Value;
      $scope.timeIncrement = _.isNil(practiceSettings) ? null : practiceSettings.DefaultTimeIncrement;
    })
  };

  ctrl.retrieveData = function () {
    if ($scope.accountId !== null) {
      patientServices.PatientAppointment.OverviewByAccount(
        {
          accountId: $scope.accountId,
          includeServiceCodes: $scope.tabIdentifier === 2,
        },
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    } else {
      patientServices.PatientAppointment.OverviewByPatient(
        {
          patientId: $scope.patient.PatientId,
          includeServiceCodes: $scope.tabIdentifier === 2,
        },
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    }
  };

  $scope.autoSaveAppointmentFailed = autoSaveAppointmentFailed;
  function autoSaveAppointmentFailed(error) {
    if (ctrl.updatingAppointment) {
      ctrl.updatingAppointment.Status =
        ctrl.updatingAppointment.originalStatus.Value;
    }
    ctrl.ShowErrorMessage(
      localize.getLocalizedString('Failed to update status of {0}.', [
        'Appointment',
      ])
    );
  }

  $scope.autoSaveAppointmentSuccessful = autoSaveAppointmentSuccessful;
  function autoSaveAppointmentSuccessful(result) {
    toastrFactory.success(
      localize.getLocalizedString('{0} status updated successfully.', [
        'Appointment',
      ]),
      'Success'
    );

    // keep it simple, even though the change is minor, reload view
    ctrl.retrieveData();
  }

  ctrl.toggleAccountView = function () {
    $scope.accountView = !$scope.accountView;

    ctrl.updateViewAppointmentActionText();
  };

  ctrl.updateViewAppointmentActionText = function () {
    $scope.patientAppointmentActions[0].Text = ctrl.getViewAppointmentsText();
  };

  ctrl.getViewAppointmentsText = function () {
    switch ($scope.showAppointments) {
      case 'All':
        return (
          ($scope.accountView
            ? 'View Appointments for Patient'
            : 'View Appointments for Account') +
          ' (' +
          ($scope.accountView
            ? $scope.appointmentCount
            : $scope.patientAppointmentCount) +
          ')'
        );
      case 'Scheduled':
        return (
          ($scope.accountView
            ? 'View Scheduled Appointments for Patient'
            : 'View Scheduled Appointments for Account') +
          ' (' +
          ($scope.accountView
            ? $scope.appointmentCount
            : $scope.patientAppointmentCount) +
          ')'
        );
      case 'Unscheduled':
        return (
          ($scope.accountView
            ? 'View Unscheduled Appointments for Patient'
            : 'View Unscheduled Appointments for Account') +
          ' (' +
          ($scope.accountView
            ? $scope.appointmentCount
            : $scope.patientAppointmentCount) +
          ')'
        );
    }
  };

  ctrl.filterActionsByAppointmentType = function () {
    var tooltipText = ctrl.getTooltip();
    var newApptText = localize.getLocalizedString('New Appointment');

    if ($scope.showAppointments !== 'All') {
      $scope.patientAppointmentActions = [
        {},
        {
          Function: ctrl.createNewAppointment,
          Path: '',
          Text: newApptText,
          Inactive: $scope.patient.IsActive === false,
          toolTip: tooltipText,
        },
      ];
    } else {
      $scope.patientAppointmentActions = [
        {
          Function: ctrl.toggleAccountView,
          Path: '',
          Text: ctrl.getViewAppointmentsText(),
        },
        {
          Function: ctrl.createNewAppointment,
          Path: '',
          Text: newApptText,
          Inactive: $scope.patient.IsActive === false,
          toolTip: tooltipText,
        },
      ];
    }
  };

  ctrl.initializeScopeVariables = function () {
    $scope.accountView = false;
    $scope.loading = true;
    $scope.timeIncrement = 5;

    $scope.appointments = [];

    $scope.loadingMessageNoResults = localize.getLocalizedString(
      'No Appointments'
    );

    $scope.patientId =
      $scope.patient !== null ? $scope.patient.PatientId : null;

    $scope.accountId =
      $scope.patient !== null && $scope.patient.PersonAccount !== null
        ? $scope.patient.PersonAccount.AccountId
        : null;

    $scope.originalPatient = angular.copy($scope.patient);

    //$scope.filteredList = [];

    var now = new Date();
    $scope.today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    $scope.appointmentCount = 0;
    $scope.patientAppointmentCount = 0;
    $scope.appointment = boundObjectFactory.Create(
      scheduleServices.Dtos.Appointment
    );

    ctrl.initializeStatusList();

    var targetTab = 'Overview'; // this is a safe default return route
    if (
      location.href.toUpperCase().match('OVERVIEW/') ||
      location.href.toUpperCase().match('OVERVIEW')
    ) {
      targetTab = 'Overview';
    }
    if (
      location.href.toUpperCase().match('APPOINTMENTS/') ||
      location.href.toUpperCase().match('APPOINTMENTS')
    ) {
      targetTab = 'Appointments';
    }
    if (
      location.href.toUpperCase().match('CLINICAL/') ||
      location.href.toUpperCase().match('CLINICAL')
    ) {
      targetTab = 'Clinical';
    }

    // .endsWith function is not compatible in IE 11. Change to .match function
    var tooltipText = ctrl.getTooltip();
    var newApptText = localize.getLocalizedString('New Appointment');
    switch ($scope.layout) {
      case 1:
        ctrl.filterActionsByAppointmentType();
        break;
      case 2:
        $scope.patientAppointmentActions = [
          {
            Function: function () {
              let patientPath = '/Patient/';
              var path = $location.absUrl().replace($location.url(), '');
              path +=
                patientPath + $scope.patientId + '/Appointments?selected=All';
              tabLauncher.launchNewTab(path);
            },
            Path: '',
            Text: ctrl.getViewAppointmentsText(),
          },
          {
            Function: ctrl.createNewAppointment,
            Path: '',
            Text: newApptText,
            Inactive: $scope.patient.IsActive === false,
            toolTip: tooltipText,
          },
        ];
        break;
    }
  };

  ctrl.getTargetTab = function () {
    var targetTab = 'Overview';
    if (
      location.href.toUpperCase().match('OVERVIEW/') ||
      location.href.toUpperCase().match('OVERVIEW')
    ) {
      targetTab = 'Overview';
    }
    if (
      location.href.toUpperCase().match('APPOINTMENTS/') ||
      location.href.toUpperCase().match('APPOINTMENTS')
    ) {
      targetTab = 'Appointments';
    }
    if (
      location.href.toUpperCase().match('CLINICAL/') ||
      location.href.toUpperCase().match('CLINICAL')
    ) {
      targetTab = 'Clinical';
    }
    return targetTab;
  };

  ctrl.scheduleNewAppointment = function () {
    var targetTab = ctrl.getTargetTab();
    $location
      .path('/Schedule')
      .search(
        'ref',
        '/?open=new&patient=' + $scope.patientId + '&targetTab=' + targetTab
      );
  };

  ctrl.getTooltip = function () {
    var message = '';
    if ($scope.patient.IsActive === false) {
      message = localize.getLocalizedString(
        'Cannot create appointment for inactive patient'
      );
    } else {
      message = localize.getLocalizedString('Create appointment');
    }
    return message;
  };

  ctrl.initializeControllerVariables = function () {
    ctrl.appointmentEditModalData = null;
  };

  /*
   * Filters the appointments by the show-appointments attribute and sets the title and filters
   * the output of the rows to only show the type of appointment specified.
   */
  $scope.appointmentsFilter = function (appointment) {
    switch ($scope.showAppointments) {
      case 'All':
        //$scope.title = 'Appointments';
        if ($scope.accountView) {
          return (
            $scope.accountView || appointment.PersonId === $scope.patientId
          );
        } else if (!$scope.accountView) {
          return (
            !$scope.accountView && appointment.PersonId === $scope.patientId
          );
        }
        break;
      case 'Scheduled':
        //$scope.title = 'Scheduled Appointments';
        if ($scope.accountView) {
          return $scope.accountView && appointment.StartTime;
        } else if (!$scope.accountView) {
          return (
            !$scope.accountView &&
            appointment.PersonId === $scope.patientId &&
            appointment.StartTime
          );
        }
        break;
      case 'Unscheduled':
        //$scope.title = 'Unscheduled Appointments';
        if ($scope.accountView) {
          return $scope.accountView && !appointment.StartTime;
        } else if (!$scope.accountView) {
          return (
            !$scope.accountView &&
            appointment.PersonId === $scope.patientId &&
            !appointment.StartTime
          );
        }
        break;
    }
  };

  ctrl.getProviders = function () {
    usersFactory.Users().then(ctrl.UsersGetOnSuccess, ctrl.UsersGetOnError);
  };

  ctrl.UsersGetOnSuccess = function (res) {
    ctrl.providers = res.Value;

    /* don't want to hold up the patient page
     * so get providers for unscheduled appointments then appointments for account
     */
    ctrl.retrieveData();
  };

  ctrl.UsersGetOnError = function (err) {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve from list {0}. Please try again',
        ['users']
      ),
      'Error'
    );
  };

  $scope.initialize = function () {
    ctrl.initializeScopeVariables();
    ctrl.initializeControllerVariables();
    if (shareData.allProviders) {
      ctrl.UsersGetOnSuccess({ Value: shareData.allProviders });
    } else {
      ctrl.getProviders();
    }

    featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
      $scope.useV2Schedule = value;
    });
  };

  $scope.showAppointmentModal = function (appointment) {
    var appointmentCopy = angular.copy(appointment);
    ctrl.checkAuthorizedForPatientLocation(appointmentCopy);

    $rootScope.appointment = appointmentCopy;
    if (appointmentCopy.$$authorized) {
      if ($scope.useV2Schedule) {
        schedulingMfeNavigator.navigateToAppointmentModal({
          id: appointmentCopy.AppointmentId
        });
      }
      else if (appointmentCopy.Classification === 2) {
        appointment.ProviderAppointments = [
          {
            UserId: appointment.UserId,
            StartTime: null,
            EndTime: null,
            ObjectState: saveStates.Add,
          },
        ];
      }

      /** Need to make sure the ObjectState is None before going to edit the appointment. */
      appointmentCopy.ObjectState = saveStates.None;

      var cachedLocation = JSON.parse(localStorage.getItem('usersLocations'));
      var locationId =
        appointmentCopy.Location !== null
          ? appointmentCopy.Location.LocationId
          : appointmentCopy.Patient.PreferredLocation;
      if (!locationId && !appointmentCopy.Location) {
        locationId = ctrl.getLoggedInLocation();
        appointmentCopy.Location = { LocationId: locationId };
      }

      var providerId = appointmentCopy.UserId;

      if (
        appointmentCopy.AppointmentId === null ||
        appointmentCopy.AppointmentId === undefined
      ) {
        appointmentCopy.LocationId = locationId;
        appointmentCopy.UserId = providerId;
      }

      appointmentViewDataLoadingService
        .getViewData(
          appointmentCopy,
          false,
          'soar:appt-changed-via-pat-appt-ctrl'
        )
        .then(
          function (res) {
            appointmentViewVisibleService.changeAppointmentViewVisible(
              true,
              false
            );
            appointmentViewVisibleService.changeAppointmentViewVisible(
              false,
              true
            );
          },
          function (error) {
            console.log(error);
            toastrFactory.error(
              'Ran into a problem loading the appointment',
              'Error'
            );
          }
        );
    } else {
      appointmentCopy.profile = appointmentCopy.Patient;
      appointmentCopy.authorization = appointmentCopy.$$account;
      patientValidationFactory.LaunchPatientLocationErrorModal(appointmentCopy);
      return;
    }
  };

  $scope.statusChanged = function (
    appointment,
    autoSave,
    closeModal,
    afterSave,
    updatedAppointments,
    setManualUpdateFlag
  ) {
    if (appointment.ObjectState === 'Delete')
      $rootScope.$broadcast('soar:appt-deleted-via-pat-appt-ctrl', appointment);
    else {
      $rootScope.$broadcast(
        'soar:appt-status-updated-via-pat-appt-ctrl',
        appointment
      );
      if (autoSave) {
        $scope.autoSaveAppointment(appointment, setManualUpdateFlag);
      }
    }
  };

  ctrl.appointmentsUpdated = function (sender, updatedAppointments) {
    // hunting for changes and doing updates is more error prone than
    // just going to the server for a current copy of the list
    ctrl.retrieveData();
  };

  $scope.autoSaveAppointment = function (appointment, setManualUpdateFlag) {
    var status = ctrl.getStatusById(appointment.Status);
    if (
      status &&
      (status.Description === 'Remove' || status.Description === 'Reschedule')
    )
      return;

    // check for late status and set back to original status
    if (status && status.Description === 'Late') {
      appointment.Status = appointment.$$originalStatus;
    }

    var appointmentUpdate = {
      appointmentId: appointment.AppointmentId,
      DataTag: appointment.DataTag,
      NewAppointmentStatusId: status.Value,
      StartAppointment: false,
    };

    if (setManualUpdateFlag === true) {
      appointmentUpdate.manuallyUpdateStatus = true;
    }

    scheduleServices.AppointmentStatus.Update(
      appointmentUpdate,
      result => $scope.autoSaveAppointmentSuccessful(result),
      result => $scope.autoSaveAppointmentFailed(result)
    );
  };

  ctrl.getAppointmentStatusIcon = function (statusId) {
    // this check is here until we figure out how this gets called before the list is filled in
    if (_.isNil($scope.statusList)) {
      ctrl.initializeStatusList();
    }
    var appointmentStatus = listHelper.findItemByFieldValue(
      $scope.statusList.List,
      'Value',
      statusId
    );

    return appointmentStatus ? appointmentStatus.Icon : '';
  };

  // start late status timer
  ctrl.checkForLateAppointmentsCounter = $interval(function () {
    appointmentService.FlagAppointmentsAsLateIfNeeded($scope.appointments);
  }, 10000);

  ctrl.appointmentToDelete = null;

  ctrl.onControllerDestruction = function () {
    $interval.cancel(ctrl.checkForLateAppointmentsCounter);
  };

  ctrl.createNewAppointment = function () {
    if ($scope.patient.PatientId === 0) {
      $scope.allMembers = angular.copy($scope.patient);
      $scope.patient = angular.copy($scope.originalPatient);
      $scope.patientId = $scope.patient.PatientId;
    }

    var classification = 0;
    if (
      $scope.showAppointments === 'Unscheduled' ||
      $scope.showAppointments === 'All'
    ) {
      classification = 2;
    }

    var tmpAppt = {
      AppointmentId: null,
      AppointmentTypeId: null,
      Classification: 2,
      EndTime: null,
      PersonId: $scope.patientId,
      PlannedServices: [],
      ProposedDuration: 15,
      ProviderAppointments: [],
      ServiceCodes: [],
      StartTime: null,
      TreatmentRoomId: null,
      UserId: null,
      WasDragged: false,
      Location: {
        LocationId: $scope.patient.PreferredLocation
          ? $scope.patient.PreferredLocation
          : ctrl.getLoggedInLocation(),
      },
      LocationId: $scope.patient.PreferredLocation
        ? $scope.patient.PreferredLocation
        : ctrl.getLoggedInLocation(),
      ObjectState: saveStates.Add,
      Person: {},
    };

    if ($scope.useV2Schedule) {
      schedulingMfeNavigator.navigateToAppointmentModal({
        patientId: tmpAppt.PersonId,
        locationId: tmpAppt.LocationId,
      });
    }
    else {
      appointmentViewDataLoadingService
        .getViewData(tmpAppt, false, 'soar:appt-changed-via-pat-appt-ctrl')
        .then(
          function (res) {
            appointmentViewVisibleService.changeAppointmentViewVisible(
              true,
              false
            );
          },
          function (error) {
            console.log(error);
            toastrFactory.error(
              'Ran into a problem loading the appointment',
              'Error'
            );
          }
        );
    }
  };

  ctrl.getLoggedInLocation = function () {
    // retrieve the location that the user is currently logged into (the location dropdown in the header)
    var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    return loggedInLocation.id;
  };

  ctrl.getAppointmentProviders = function (appointment) {
    var providers = '';
    angular.forEach(appointment.ProviderUsers, function (user) {
      providers += user.LastName + ', ' + user.FirstName + '\n';
    });
    return providers;
  };

  $scope.$on('$destroy', ctrl.onControllerDestruction);

  $scope.$on(CustomEvents.AppointmentsUpdated, ctrl.appointmentsUpdated);

  // patient is updated via the dropdown on the appointments tab, updating $scope.patientId to show the correct appointments
  $scope.$watch('patient', function (nv, ov) {
    if (nv && nv.PatientId && !angular.equals(nv.PatientId, ov.PatientId)) {
      $scope.accountView = false;
      ctrl.updateViewAppointmentActionText();
      $scope.patientId = nv.PatientId;
    } else if (nv && nv.PatientId === 0) {
      $scope.accountView = true;
      ctrl.updateViewAppointmentActionText();
    }
    //Loop through the appointments list to update account view with new $$SortingId
    angular.forEach($scope.appointments, function (appointment) {
      // $$SortingId is used to make sure that the current patient's appts always come first
      if ($scope.patientId === appointment.PersonId) {
        appointment.$$SortingId = 0;
      } else {
        appointment.$$SortingId = 1;
      }
    });

    // Update the patient appointment and appointment counts when updating patientId
    ctrl.counter();
  });
  $scope.rowClicked = null;
  $scope.selectAppointment = function (ci, tabIdentifier, isInitialLoad) {
    if (!tabIdentifier) {
      $scope.rowClicked = ci;
      if (angular.element('.hoverAppt')[0]) {
        angular.element(angular.element('.hoverAppt')[0]).trigger('click');
      }
      $scope.$parent.$parent.appointmentId = $scope.rowClicked.AppointmentId;
      ctrl.clearHighlightsForUnscheduledAppts();
      $scope.tabIdentifier = null;
      $scope.isInitialLoad = isInitialLoad;
    }
  };

  $scope.appointmentSetup = function (ci, tabIdentifier, isInitialLoad) {
    if (!tabIdentifier) {
      $scope.rowClicked = ci;
      if (angular.element('.hoverAppt')[0]) {
        angular.element(angular.element('.hoverAppt')[0]).trigger('click');
      }
      $scope.$parent.$parent.appointmentId = $scope.rowClicked.AppointmentId;
      $scope.tabIdentifier = null;
      $scope.isInitialLoad = isInitialLoad;
    }
  };

  ctrl.clearHighlightsForUnscheduledAppts = function () {
    angular.forEach($scope.appointments, function (appointment) {
      appointment.MostRecentUnscheduledAppt = false;
    });
  };

  $scope.displayDefaultAppointment = function () {
    var appts = $filter('orderBy')($scope.appointments, 'StartTime');
    var dateNow = moment();
    var isbreak = false;

    if ($scope.$parent.$parent.appointmentId !== undefined) {
      var data = $filter('filter')(
        $scope.appointments,
        { AppointmentId: $scope.$parent.$parent.appointmentId },
        true
      )[0];
      data.MostRecentUnscheduledAppt = false;
      $scope.appointmentSetup(data, $scope.tabIdentifier, true);
    } else {
      angular.forEach(appts, function (data) {
        if (!isbreak) {
          if (data.StartTime > dateNow) {
            data.MostRecentUnscheduledAppt = false;
            //$scope.appointmentSetup(data, $scope.tabIdentifier, true);

            if (!$scope.tabIdentifier) {
              $scope.rowClicked = data;
              if (angular.element('.hoverAppt')[0]) {
                angular
                  .element(angular.element('.hoverAppt')[0])
                  .trigger('click');
              }
              $scope.$parent.$parent.appointmentId =
                $scope.rowClicked.AppointmentId;
              //ctrl.clearHighlightsForUnscheduledAppts();
              $scope.tabIdentifier = null;
              $scope.isInitialLoad = true;
            }

            isbreak = true;
          }
        }
      });
    }
    ctrl.autoScroll();
  };

  ctrl.saveUnscheduledAppointmentSuccessful = function (result) {
    toastrFactory.success(
      localize.getLocalizedString('{0} updated successfully.', ['Appointment']),
      'Success'
    );

    var appointment = listHelper.findItemByFieldValue(
      $scope.appointments,
      'AppointmentId',
      result.Value.AppointmentId
    );

    if (appointment !== null) {
      appointment.DataTag = result.Value.DataTag;
      appointment.Saving = false;
    }

    var path = '/Schedule';
    $location.path(path);
    $rootScope.openClipboard = true;
  };

  $scope.scheduleUnscheduledAppointment = function (appointment) {
    appointment.IsPinned = true;
    appointment.IsBeingClipped = true;
    patientServices.PatientAppointment.FlagForScheduling(
      { appointmentId: appointment.AppointmentId },
      ctrl.saveUnscheduledAppointmentSuccessful,
      ctrl.autoSaveAppointmentFailed
    );
  };

  $scope.$on(
    'soar:appt-updated-via-pat-appt-ctrl',
    function (event, updatedAppointment) {
      if (
        _.isNil(updatedAppointment.Provider) ||
        _.isNil(updatedAppointment.AppointmentType) ||
        _.isNil(updatedAppointment.Room)
      ) {
        ctrl.updateItem(ctrl.overviewFromModalAppointment(updatedAppointment));
      } else {
        ctrl.updateItem(updatedAppointment);
      }
    }
  );

  $scope.$on(
    'soar:appt-status-updated-via-pat-appt-ctrl',
    function (event, newAppointment) {
      ctrl.updateItemStatus(newAppointment);
    }
  );

  $scope.$on(
    'soar:appt-added-via-pat-appt-ctrl',
    function (event, newAppointment) {
      ctrl.addItem(null, ctrl.overviewFromModalAppointment(newAppointment));
    }
  );

  $scope.$on(
    'soar:appt-deleted-via-pat-appt-ctrl',
    function (event, deadAppointment) {
      ctrl.deleteItem(deadAppointment.AppointmentId);
    }
  );

  //#region set $$authorized property

  $scope.checkAppointmentMember = function (appointments) {
    if (
      appointments &&
      appointments.length > 0 &&
      $scope.accountValidation &&
      $scope.accountValidation.length > 0
    ) {
      angular.forEach(appointments, function (appointment) {
        ctrl.checkAuthorizedForPatientLocation(appointment);
      });
    }
    return appointments;
  };

  ctrl.checkAuthorizedForPatientLocation = function (appointment) {
    appointment.$$authorized = true;
    var account = listHelper.findItemByFieldValue(
      $scope.accountValidation,
      'PatientId',
      appointment.PersonId
    );
    appointment.$$account = account;
    if (account && !account.UserIsAuthorizedToAtLeastOnePatientLocation) {
      appointment.$$authorized = false;
    }
  };

  $scope.formatApptCount = function () {
    var apptCount = '';

    if ($scope.title !== 'Appointments') {
      apptCount = '(' + $scope.appointmentCount + ')';
    }

    return apptCount;
  };

  //#endregion
}

PatientAppointmentsController.prototype = Object.create(BaseCtrl.prototype);
