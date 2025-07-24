angular
  .module('common.controllers')
  .controller('AppointmentStatusController', [
    '$scope',
    '$location',
    '$uibModal',
    '$window',
    'StaticData',
    'ListHelper',
    'ModalFactory',
    'ModalDataFactory',
    'ScheduleServices',
    'SaveStates',
    '$timeout',
    'toastrFactory',
    'localize',
    '$rootScope',
    'PatientAppointmentsFactory',
    'locationService',
    'userSettingsDataService',
    'tabLauncher',
    AppointmentStatusController,
  ])
  .filter('removeSpaces', function () {
    return function (string) {
      if (!angular.isString(string)) {
        return string;
      }
      return string.replace(/[\s]/g, '');
    };
  });
function AppointmentStatusController(
  $scope,
  $location,
  $uibModal,
  $window,
  staticData,
  listHelper,
  modalFactory,
  modalDataFactory,
  scheduleServices,
  saveStates,
  $timeout,
  toastrFactory,
  localize,
  $rootScope,
  patientAppointmentsFactory,
  locationService,
  userSettingsDataService,
  tabLauncher
) {
  BaseCtrl.call(this, $scope, 'AppointmentStatusController');
  var ctrl = this;

  ctrl.elementId = '';
  ctrl.createdWidgets = [];
  $scope.sentForCheckout = false;
  ctrl.locations = JSON.parse(sessionStorage.getItem('activeLocations'));
  //get id for logged in location and appt location
  if (ctrl.locations === null || ctrl.locations === undefined) {
    ctrl.targetLocation = {
      id: 0,
      name: 'initialPractice',
      practiceid: 0,
      merchantid: '',
      description: '',
      timezone: 'Central Standard Time',
      deactivationTimeUtc: null,
    };
  } else {
    ctrl.targetLocation = ctrl.locations.find(
      element => element.id === $scope.appointment.LocationId
    );
  }

  $scope.$watch('person', function (nv) {
    if (!_.isNil(nv)) {
      ctrl.setHasRunningAppointments();
    }
  });

  ctrl.intializeScopeVariables = function () {
    ctrl.initializeStaticData();

    // default status on new appointment to Unconfirmed
    if ($scope.statusList && _.isNil($scope.appointment.AppointmentId)) {
      var unconfirmedStatus = _.find($scope.statusList, function (status) {
        return status.Description === 'Unconfirmed';
      });
      $scope.appointment.Status = $scope.appointment.Status
        ? $scope.appointment.Status
        : unconfirmedStatus.Value;
    }

    ctrl.setSelectedStatusById($scope.appointment.Status);

    $scope.$watch('appointment.Status', ctrl.appointmentStatusChanged);

    if ($scope.appointment.StartTime) {
      $scope.appointment.StartTime = new Date($scope.appointment.StartTime);
      $scope.appointment.EndTime = new Date($scope.appointment.EndTime);
    }
    var pth = $location.path();
    let patientPath = '/Patient/';

    if (!pth.includes(patientPath)) {
      if (
        !_.isNil($scope.appointment.ServiceCodes) &&
        $scope.appointment.ServiceCodes.length > 0 &&
        $scope.appointment.AppointmentId
      ) {
        patientAppointmentsFactory
          .AppointmentDataWithDetails($scope.appointment.AppointmentId)
          .then(function (res) {
            $scope.appointment.PlannedServices = angular.copy(
              res.Value.Appointment.PlannedServices
            );
            $scope.appointment.Patient.PersonAccount = angular.isDefined(
              $scope.appointment.Patient.PersonAccount
            )
              ? $scope.appointment.Patient.PersonAccount
              : angular.copy(res.Value.Person.PersonAccount);
            $scope.person.PersonAccount = angular.isDefined(
              $scope.person.PersonAccount
            )
              ? $scope.person.PersonAccount
              : angular.copy(res.Value.Person.PersonAccount);
            $scope.apptPatient = angular.copy($scope.person);
          });
      }
    }
    $scope.tomorrow = new Date();
    $scope.tomorrow.setHours(0, 0, 0, 0);
    $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);
  };
  $scope.isAppointmentDate = function (appointmentDate) {
    if (appointmentDate) {
      var today = new Date();
      return moment(appointmentDate)
        .startOf('day')
        .utc()
        .isSame(moment(today).startOf('day').utc());
    }
    return false;
  };
  $scope.canBeCheckedOut = function () {
    if (
      !_.isNil($scope.appointment.ServiceCodes) &&
      $scope.appointment.ServiceCodes.length > 0
    ) {
      return true;
    } else if (
      !_.isNil($scope.appointment.PlannedServices) &&
      $scope.appointment.PlannedServices.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  };
  ctrl.initializeControllerVariables = function () {
    ctrl.defaultStatus = $scope.statusList[0];
    ctrl.originalStatus = $scope.selectedStatus;

    ctrl.lastStatus = null;

    ctrl.encounterModalData = {};

    ctrl.onChange = $scope.onChange;
  };

  ctrl.initializeStaticData = function () {
    var appointmentStatusData = staticData.AppointmentStatuses();
    $scope.statusList = appointmentStatusData.List;
    $scope.statuses = appointmentStatusData.Enum;
    $scope.patient = null;
  };

  ctrl.getStatusById = function (statusId) {
    return listHelper.findItemByFieldValue(
      $scope.statusList,
      'Value',
      statusId
    );
  };

  ctrl.setSelectedStatusById = function (newId, oldId) {
    // do nothing if status is unchanged
    if (newId !== oldId) {
      var newStatus = ctrl.getStatusById(newId);
      switch (newStatus.Value) {
        case $scope.statuses.Unschedule:
          ctrl.ShowStatusModal();
          ctrl.lastStatusId = oldId;
          break;
        case $scope.statuses.CheckOut:
          let loggedInLocation = locationService.getCurrentLocation();
          if ($scope.appointment.LocationId !== loggedInLocation.id) {
            ctrl.showChangeLocationPromptModal();
          } else {
            ctrl.ShowCheckoutModal(oldId);
          }
          ctrl.lastStatusId = oldId;
          break;
        default:
          $scope.selectedStatus = ctrl.getStatusById(newId);
          $scope.selectedStatus =
            $scope.selectedStatus !== null
              ? $scope.selectedStatus
              : ctrl.defaultStatus;
          break;
      }
    }
  };

  ctrl.showChangeLocationPromptModal = function () {
    let locationWarningModal = $uibModal.open({
      templateUrl:
        'App/Common/components/appointment-status/modal/location-warning-modal.html',
      scope: $scope,
      controller: function () {
        $scope.negative = function () {
          locationWarningModal.close();
          ctrl.cancelAction();
        };
        $scope.locationDisplayName = ctrl.targetLocation.name;
      },
      size: 'sm',
      windowClass: 'center-modal',
    });
  };

  ctrl.confirmAction = function (
    appointment,
    autoSave,
    closeModal,
    afterSave,
    updatedAppointments
  ) {
    if (ctrl.onChange !== null) {
      ctrl.onChange(
        appointment,
        autoSave,
        closeModal === true,
        afterSave,
        updatedAppointments
      );
    }
  };

  ctrl.cancelAction = function () {
    $scope.appointment.Status = ctrl.lastStatusId;
  };

  ctrl.ResponsiblePersonUpdated = function () {};

  ctrl.canCheckout = function (appt, oldStatusId) {
    appt.Status = oldStatusId;
    $scope.appointment = angular.copy(appt);
    $scope.patient = angular.copy(appt.Patient);
    if (ctrl.appointmentHasChanges(appt)) {
      $scope.route = $location.search();
      ctrl.showAppointmentSaveModal(appt, $scope.patient);
    } else {
      ctrl.setClean($scope);

      if ($scope.sentForCheckout === true) {
        $scope.sentForCheckout = false;
        return;
      }

      if (_.isNil(appt.PlannedServices) || appt.PlannedServices.length <= 0) {
        $scope.sentForCheckout = true;
        // call get encounter ID API
        scheduleServices.Lists.Appointments.GetEncounterIdForAppointment(
          { AppointmentId: appt.AppointmentId },
          function (res) {
            if (!_.isNil(res) && !_.isNil(res.Value)) {
              //check for IsCompleted and act
              if (res.Value.IsCompleted === true) {
                ctrl.showAppointmentCheckedOutMessage(appt);
              } else {
                if (
                  !_.isNil(res.Value.EncounterId) &&
                  appt.Status !== $scope.statuses.ReadyForCheckout
                ) {
                  // encounter exists but isn't complete, therefore appointment status is ReadyForCheckout
                  appt.Status = $scope.statuses.ReadyForCheckout;
                  $scope.appointment.originalStatus =
                    $scope.statuses.ReadyForCheckout;
                  $scope.appointment.Status = $scope.statuses.ReadyForCheckout;
                  ctrl.onChange(appt, false);
                }
                ctrl.sendForCheckout(res.Value.EncounterId, appt);
              }
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve encounter for appointment. Please try again.'
              ),
              'Error'
            );
          }
        );
      } else {
        var encounterId = null;
        if (typeof appt.PlannedServices[0].EncounterId === 'string') {
          encounterId = appt.PlannedServices[0].EncounterId;
        }
        ctrl.sendForCheckout(encounterId, appt);
      }
    }
  };

  ctrl.showAppointmentCheckedOutMessage = function (appt) {
    var title = localize.getLocalizedString('Appointment Checked Out');
    var message = localize.getLocalizedString(
      'This appointment has already been checked out.'
    );
    var button1Text = localize.getLocalizedString('OK');

    return modalFactory
      .ConfirmModal(title, message, button1Text)
      .then(function () {
        patientAppointmentsFactory.setLoadHistory(true);
        appt.Status = $scope.statuses.Completed;
        ctrl.onChange(appt, false);
      });
  };

  ctrl.sendForCheckout = function (encounterId, appt) {
    var basePath = '';
    var path = '';
    var hasServices =
      _.isNil(appt.PlannedServices) || appt.PlannedServices.length <= 0
        ? false
        : true;

    let patientPath = '#/Patient/';

    if (!_.isNil(encounterId) && hasServices === true) {
      if (
        appt.Patient != null &&
        angular.isDefined(appt.Patient.PersonAccount)
      ) {
        path =
          basePath +
          patientPath +
          appt.Patient.PatientId +
          '/Account/' +
          appt.Patient.PersonAccount.AccountId +
          '/Encounter/' +
          encounterId +
          '/Checkout/EncountersCartAccountSummary';
        $scope.sentForCheckout = true;
      }
    } else {
      path =
        basePath +
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
    if (path != null && path != '') {
      tabLauncher.launchNewTab(path);
    }
  };

  ctrl.setClean = function (scope) {
    if (scope.$parent && typeof scope.$parent.hasChanges === 'undefined') {
      ctrl.setClean(scope.$parent);
    } else if (
      scope.$parent &&
      typeof scope.$parent.hasChanges !== 'undefined'
    ) {
      scope.$parent.hasChanges = false;
      ctrl.setClean(scope.$parent);
    }
  };

  ctrl.ShowStatusModal = function () {
    modalFactory
      .AppointmentStatusModal({
        id: 'Reschedule',
        title: 'Reschedule this Appointment',
        appointment: $scope.appointment,
        reason: {
          id: 'RescheduleReason',
          labels: ['Cancellation', 'Missed', 'Other'],
          options: [0, 1, 2],
        },
        onChange: $scope.onChange,
        beforeDelete: $scope.beforeDelete,
        hasStatusNote: true,
        showDeleteCheckbox: false,
        ShowAppointmentInfo: true,
        ShowReason: true,
      })
      .then(ctrl.appointmentRescheduled, ctrl.cancelAction);
  };

  ctrl.ShowCheckoutModal = function (oldStatusId) {
    if (
      $scope.appointment.Patient.ResponsiblePersonId === null ||
      $scope.appointment.Patient.ResponsiblePersonId === undefined
    ) {
      $scope.appointment.Patient = $scope.apptPatient;
      if (
        $scope.apptPatient.ResponsiblePersonId === null &&
        $scope.apptPatient.ResponsiblePersonType !== 2
      ) {
        $scope.appointment.Patient.ResponsiblePersonId =
          $scope.apptPatient.PatientId;
      }
    }

    if ($scope.appointment.Patient.ResponsiblePersonId === null) {
      modalFactory
        .ResponsiblePartyModal({
          id: 'ResponsibleParty',
          title: 'Please assign a responsible person to continue',
          appointment: angular.copy($scope.appointment),
          patient: angular.copy($scope.appointment.Patient),
          hasStatusNote: false,
          showDeleteCheckbox: true,
          ShowAppointmentInfo: true,
          ShowReason: true,
        })
        .then(function (appts) {
          ctrl.canCheckout(appts, oldStatusId);
        });
    } else {
      ctrl.canCheckout($scope.appointment, oldStatusId);
    }
  };

  ctrl.appointmentHasChanges = function (appointment) {
    if (appointment !== null) {
      var appointmentHasChanged = appointment.ObjectState === saveStates.Update;
      var plannedServicesHaveChanged = appointment.PlannedServices
        ? listHelper.findIndexByPredicate(
            appointment.PlannedServices,
            ctrl.objectHasChanges
          ) > -1
        : false;
      var providerAppointmentsHaveChanged = appointment.ProviderAppointments
        ? listHelper.findIndexByPredicate(
            appointment.ProviderAppointments,
            ctrl.objectHasChanges
          ) > -1
        : false;

      return (
        appointmentHasChanged ||
        plannedServicesHaveChanged ||
        providerAppointmentsHaveChanged
      );
    } else {
      return false;
    }
  };

  ctrl.objectHasChanges = function (object) {
    return (
      object != null &&
      object.ObjectState != null &&
      object.ObjectState != saveStates.None
    );
  };

  ctrl.showAppointmentSaveModal = function (appt, patient) {
    // To prevent multiple confirmation modals from popping, we check if we already have one.
    if (ctrl.savingForCheckout) {
      return;
    }
    ctrl.savingForCheckout = true;

    // The scope isn't persisted through this logic, so we save the necessary information on the controller.
    ctrl.savedAppt = appt;
    ctrl.savedPatient = patient;
    var title = localize.getLocalizedString('Save Required', ['Appointment']);
    var message = localize.getLocalizedString(
      'Changes have been made to this {0}. These changes must be saved before continuing. Would you like to save this {0} now?',
      ['Appointment']
    );
    var button1Text = localize.getLocalizedString('Save & Continue');
    var button2Text = localize.getLocalizedString('Cancel Check out');
    var data = null;

    return modalFactory
      .ConfirmModal(title, message, button1Text, button2Text, data)
      .then(ctrl.confirmAppointmentSave_v2);
  };

  //ctrl.confirmAppointmentSave = function () {
  //    ctrl.confirmAction($scope.appointment, true, true, ctrl.appointmentSaved);
  //};

  ctrl.confirmAppointmentSave_v2 = function () {
    ctrl.confirmAction(
      $scope.appointment,
      true,
      true,
      ctrl.appointmentSaved_v2(ctrl.savedAppt),
      null
    );
    //ctrl.appointmentSaved_v2($scope.appointment);
  };

  //ctrl.appointmentSaved = function (updatedAppointment) {
  //    ctrl.showEncounterModal(updatedAppointment);
  //};

  ctrl.appointmentSaved_v2 = function (updatedAppointment) {
    // This fix prevents the event screen from popping up on certain scenario
    // Scenario: an open appointment modal has changes on the services (added / removed) and the appointment is checked out (via the status dropdown).
    //  Upon clicking "Save and continue" on the prompt, the event screen pops up and the user is taken to the encounter page
    $rootScope.$broadcast('schedule-suppress-refresh');
    // - end fix -
    let patientPath = '/Patient/';

    var path =
      patientPath +
      ctrl.savedPatient.PatientId +
      '/Account/' +
      ctrl.savedPatient.PersonAccount.AccountId +
      '/Encounters/Schedule?';
    angular.forEach($scope.route, function (value, key) {
      if (key !== 'newTab' && key !== 'newKey') {
        path += key + '=' + value + '&';
      }
    });
    path += 'appt=' + updatedAppointment.AppointmentId;
    ctrl.savingForCheckout = false;
    $location.url(path);
  };

  // GetEncounterModalData has been removed
  //ctrl.showEncounterModal = function (appointment) {
  //    var instance = null;

  //    var patientId = appointment.PersonId;
  //    var locationId = appointment.Location !== null ? appointment.Location.LocationId : null;
  //    var appointmentId = appointment.AppointmentId;
  //    var appointmentTypeId = appointment.AppointmentTypeId;
  //    var operationMode = 1;

  //    // Removed warning about not having services. User should have option of adding services from encounter modal. AV
  //    ctrl.encounterModalData.CurrentPatient = appointment.Patient;

  //    ctrl.encounterModalData.ActiveAppointment = { Params: { AppointmentId: appointmentId, FillProviders: true, FillServices: true }, Value: appointment };

  //    modalDataFactory.GetEncounterModalData(ctrl.encounterModalData, patientId, locationId, operationMode, appointmentId, appointmentTypeId).then(function (modalData) {
  //        ctrl.encounterModalData = modalData;

  //        instance = modalFactory.EncounterModal(ctrl.encounterModalData, ctrl.encounterSaved, ctrl.cancelAction);
  //    });

  //    return instance;
  //};

  ctrl.encounterSaved = function () {
    //var updatedAppointments = encounterData !== null && encounterData.updatedAppointments !== null ? encounterData.updatedAppointments : [];
    //var appointment = listHelper.findItemByFieldValue(updatedAppointments, "AppointmentId", $scope.appointment.AppointmentId);

    ctrl.confirmAction(null, false, true);
    $rootScope.$broadcast('checkoutCompleted');
  };

  ctrl.appointmentDeleted = function (appointment) {
    ctrl.confirmAction(appointment, false, true);
  };

  ctrl.appointmentRescheduled = function (appointment) {
    ctrl.confirmAction(appointment, false, true);
  };

  ctrl.setAppointmentStatusFromStatusObject = function (statusObject) {
    $scope.appointment.Status = statusObject ? statusObject.Value : null;

    $scope.appointment.Status =
      $scope.appointment.Status !== null
        ? $scope.appointment.Status
        : ctrl.defaultStatus.Value;

    /** check phase to see if need to apply. apply needs to activate if status is set by kendo dropdown */
    $timeout(function () {
      $scope.$apply();
    });
  };

  ctrl.appointmentStatusChanged = function (nv, ov) {
    //if (nv !== ov) {
    ctrl.setSelectedStatusById(nv, ov);
    // not sure why someone would do this.
    //$timeout(function () {
    ctrl.disableControls();
    if (nv && nv === ctrl.originalStatus.Value) {
      $scope.disableControl = false;
    }
    //}, 500);

    //}
  };

  $scope.$on('kendoWidgetCreated', function (event, widget) {
    if (widget.ns === '.kendoDropDownList') {
      widget.list[0].id = $scope.id;
      ctrl.elementId =
        widget.list !== null && widget.list.length > 0 ? widget.list[0].id : '';
      for (; angular.element('#' + ctrl.elementId + ' .k-item').length > 14; ) {
        angular.element('#' + ctrl.elementId + ' .k-item')[0].remove();
      }
      ctrl.disableControls();
    }

    if (widget && ctrl.createdWidgets) {
      ctrl.createdWidgets.push(widget);
    }
  });

  $scope.appointmentIsLate = function (status) {
    var late = false;

    if (status && status.Value === $scope.statuses.Late) {
      // prior code was throwing undefined exception for StartTime ... making it so that cannot happen any more.
      // this control will be replaced by another at some point so the logic will be better handled in the new version.
      if (
        $scope.appointment &&
        $scope.appointment.StartTime !== null &&
        $scope.appointment.StartDate !== undefined &&
        moment($scope.appointment.StartTime).utc() < moment().utc()
      ) {
        late = true;
      }
    }
    return late;
  };

  ctrl.disableControls = function () {
    if ($scope.appointment !== null) {
      //Not using type coercion (===) due to possibility of having to compare string to int
      if (
        $scope.appointment.Status !== $scope.statuses.InTreatment &&
        $scope.appointment.Status !== $scope.statuses.ReadyForCheckout &&
        $scope.appointment.Status !== $scope.statuses.StartAppointment
      ) {
        if (
          $scope.appointment.StartTime >= $scope.tomorrow ||
          $scope.person === null
        ) {
          ctrl.disableOption($scope.statuses.CheckOut);
          ctrl.disableOption($scope.statuses.Completed);
        }

        // if patient has another appointment with status StartAppointment disable this option
        if ($scope.hasRunningAppointment === true) {
          ctrl.disableOption($scope.statuses.StartAppointment);
        }

        if (moment($scope.appointment.StartTime).utc() > moment().utc()) {
          ctrl.hideOption($scope.statuses.Late);
          //per Mary Beth, an appointment can be started at any time on the day of.
          //ctrl.disableOption($scope.statuses.StartAppointment);
        } else {
          ctrl.showOption($scope.statuses.Late);
          ctrl.disableOption($scope.statuses.Late);
        }

        if ($scope.appointment.StartTime > $scope.tomorrow) {
          ctrl.disableOption($scope.statuses.InTreatment);
          ctrl.disableOption($scope.statuses.StartAppointment);
        }

        // Hide In Treatment and Ready for Checkout statuses. For now these can be set only from clinical timeline
        //ctrl.hideOption($scope.statuses.InTreatment);
        ctrl.hideOption($scope.statuses.ReadyForCheckout);
      } else if (
        $scope.appointment.Status === $scope.statuses.InTreatment &&
        $scope.appointment.ActualStartTime
      ) {
        // Hiding all statuses/actions for appointment in treatment for now
        ctrl.disableOption($scope.statuses.Confirmed);
        ctrl.disableOption($scope.statuses.Unconfirmed);
        ctrl.disableOption($scope.statuses.ReminderSent);
        ctrl.disableOption($scope.statuses.InReception);
        ctrl.disableOption($scope.statuses.InTreatment);
        ctrl.disableOption($scope.statuses.CheckOut);
        ctrl.disableOption($scope.statuses.StartAppointment);
        ctrl.disableOption($scope.statuses.Unschedule);
        ctrl.hideOption($scope.statuses.Late);
        ctrl.hideOption($scope.statuses.ReadyForCheckout);
        ctrl.hideOption($scope.statuses.Completed);
      } else if ($scope.appointment.Status === $scope.statuses.InTreatment) {
        // Hiding all statuses/actions for appointment in treatment for now
        ctrl.hideOption($scope.statuses.Late);
        ctrl.hideOption($scope.statuses.ReadyForCheckout);
        ctrl.hideOption($scope.statuses.Completed);
      } else if (
        $scope.appointment.Status === $scope.statuses.ReadyForCheckout ||
        $scope.appointment.Status === $scope.statuses.StartAppointment
      ) {
        // Hiding all statuses/actions for appointment in treatment and Ready for Checkout for now
        // ctrl.hideOption($scope.statuses.CheckOut); // PBI 200424 - Allow User to Checkout a "Ready for Checkout" Appointment from Schedule
        ctrl.hideOption($scope.statuses.Confirmed);
        ctrl.hideOption($scope.statuses.ReminderSent);
        ctrl.hideOption($scope.statuses.Unschedule);
        ctrl.hideOption($scope.statuses.Unconfirmed);
        ctrl.hideOption($scope.statuses.Late);
        ctrl.hideOption($scope.statuses.Completed);

        if ($scope.appointment.Status === $scope.statuses.ReadyForCheckout) {
          ctrl.hideOption($scope.statuses.InTreatment);
          ctrl.hideOption($scope.statuses.StartAppointment);
        } else {
          ctrl.hideOption($scope.statuses.ReadyForCheckout);
        }
      } else {
        ctrl.disableOption($scope.statuses.CheckOut);
        ctrl.disableOption($scope.statuses.Confirmed);
        ctrl.disableOption($scope.statuses.ReminderSent);
        ctrl.disableOption($scope.statuses.Unschedule);
        ctrl.disableOption($scope.statuses.Unconfirmed);
        ctrl.disableOption($scope.statuses.InTreatment);
        ctrl.disableOption($scope.statuses.StartAppointment);
        ctrl.disableOption($scope.statuses.ReadyForCheckout);
        ctrl.hideOption($scope.statuses.Late);
      }
      if (
        ($scope.appointment.Status !== $scope.statuses.InReception &&
          !$scope.isAppointmentDate($scope.appointment.StartTime)) ||
        $scope.appointment.Status === $scope.statuses.ReadyForCheckout ||
        $scope.appointment.Status === $scope.statuses.CheckOut
      ) {
        ctrl.disableOption($scope.statuses.InReception);
      }
      if ($scope.checkRunningAppts($scope.appointment)) {
        ctrl.disableOption($scope.statuses.StartAppointment, true);
      }
      if (!$scope.showAddToClipboard) {
        ctrl.hideOption($scope.statuses.AddToClipboard);
      } else if (
        $scope.appointment.Status === $scope.statuses.Completed ||
        $scope.appointment.ActualStartTime ||
        $scope.appointment.IsPinned
      ) {
        ctrl.disableOption($scope.statuses.AddToClipboard);
      }
    }
  };

  ctrl.disableOption = function (value, hasRunningAppt) {
    var item = ctrl.getOptionItem(value);

    if (item !== null) {
      item.disabled = true;
      angular.element(item).addClass('text-muted');
      item.title = hasRunningAppt
        ? 'Patient already has a running appointment'
        : '';
    }
  };

  ctrl.hideOption = function (value) {
    var item = ctrl.getOptionItem(value);

    if (item !== null) {
      item.disabled = true;
      angular.element(item).addClass('hidden');
    }
  };

  ctrl.showOption = function (value) {
    var item = ctrl.getOptionItem(value);

    if (item !== null) {
      angular.element(item).removeClass('hidden');
    }
  };

  ctrl.getOptionItem = function (value) {
    var item = null;

    if (ctrl.elementId > '') {
      var itemIndex = listHelper.findIndexByFieldValue(
        $scope.statusList,
        'Value',
        value
      );

      if (itemIndex > -1) {
        item = angular.element('#' + ctrl.elementId + ' .k-item')[itemIndex];
      }
    }
    return item;
  };

  // fired by the soar select list sb-change event
  $scope.selectedStatusChange = function (selectedStatus) {
    $scope.appointment.originalStatus = ctrl.originalStatus;
    $timeout(function () {
      // convert status to int for comparisons
      var selectedStatusAsInt = parseInt(selectedStatus);
      // dont allow starting an appointment if one is running for this person
      if (
        $scope.hasRunningAppointment === true &&
        selectedStatusAsInt === $scope.statuses.StartAppointment
      ) {
        $scope.appointment.Status = $scope.appointment.originalStatus.Value;
        return;
      }
      // if event fired but the status hasn't changed do nothing
      // NOTE this happens when a new appointment is added to list
      if (selectedStatusAsInt === $scope.appointment.originalStatus.Value) {
        return;
      }
      // If user selects disabled item via keyboard navigation, revert the status back
      if (ctrl.getOptionItem(selectedStatus).disabled) {
        $scope.appointment.Status = $scope.appointment.originalStatus.Value;
        return;
      }
      if (selectedStatusAsInt === $scope.statuses.AddToClipboard) {
        if (angular.isFunction($scope.addToClipboardCallback)) {
          $scope.addToClipboardCallback();
        }
      } else if (selectedStatusAsInt === $scope.statuses.Unschedule) {
        // not an actual status, will trigger a modal so do nothing here
      } else if (
        $scope.onChange !== null &&
        (ctrl.originalStatus === null ||
          ctrl.originalStatus.Value !== selectedStatusAsInt)
      ) {
        if (selectedStatusAsInt === $scope.statuses.StartAppointment) {
          $scope.startAppointment();
        } else {
          var autoSave =
            selectedStatusAsInt <= 4 || selectedStatusAsInt === 6
              ? true
              : false;
          var closeModal = selectedStatusAsInt === 10;
          $scope.onChange(
            $scope.appointment,
            autoSave,
            closeModal,
            null,
            null,
            selectedStatusAsInt === $scope.statuses.Completed ||
              ctrl.originalStatus.Value === $scope.statuses.Completed
          );
        }
      }
    });
  };

  $scope.selectedStatusChanged = function (event, status, disabled) {
    // set hasRunningAppointment after status change to StartAppointment
    // dont allow starting an appointment if one is running for this person
    if (
      $scope.hasRunningAppointment === true &&
      status.Value === $scope.statuses.StartAppointment
    ) {
      return;
    }
    if (disabled === true) return;
    var selectedStatus = status ? status : $scope.selectedStatus;
    ctrl.setAppointmentStatusFromStatusObject(selectedStatus);
    $scope.appointment.originalStatus = ctrl.originalStatus;
    if ($scope.onChange !== null) {
      if (selectedStatus.Value === $scope.statuses.StartAppointment) {
        $scope.startAppointment();
      } else {
        var autoSave =
          selectedStatus.Value <= 4 || selectedStatus.Value === 6
            ? true
            : false;
        var closeModal = selectedStatus.Value === 10;
        $scope.onChange(
          $scope.appointment,
          autoSave,
          closeModal,
          null,
          null,
          selectedStatus.Value === $scope.statuses.Completed ||
            ctrl.originalStatus.Value === $scope.statuses.Completed
        );
      }
    }
  };

  $scope.startAppointment = function () {
    var loggedInLocation = locationService.getCurrentLocation();

    if (loggedInLocation.id === $scope.appointment.LocationId) {
      ctrl.updateAppointmentStatusForStart();
    } else {
      modalFactory.LocationChangeForStartAppointmentModal().then(
        () => ctrl.updateAppointmentStatusForStart(true),
        result => $scope.afterBeginFailed(result, true)
      );
    }
  };

  ctrl.updateAppointmentStatusForStart = function (overrideLocation) {
    $scope.appointment.Status = $scope.statuses.InTreatment;
    var appointmentUpdate = {
      appointmentId: $scope.appointment.AppointmentId,
      DataTag: $scope.appointment.DataTag,
      NewAppointmentStatusId: $scope.appointment.Status,
      StartAppointment: true,
    };
    $scope.onChange = null;
    if (ctrl) {
      // onChange on scope was being lost in shuffle so ctrl.onChange was added
      // nulling it here to mirror the existing behavior even though the point is poorly understood
      ctrl.onChange = null;
    }
    scheduleServices.AppointmentStatus.Update(
      appointmentUpdate,
      result => $scope.afterBeginSuccess(result, overrideLocation),
      $scope.afterBeginFailed
    );
  };

  $scope.afterBeginSuccess = function (result, overrideLocation) {
    $timeout(function () {
      $rootScope.$broadcast('appointment:begin-appointment', result.Value);
      $rootScope.$broadcast('appointment:start-appointment', result.Value);
      $scope.hasChanges = false;

      var queryString = `activeSubTab=0${
        overrideLocation === true
          ? `&setLocation=${result.Value.LocationId}`
          : ''
      }`;
      let patientPath = '#/Patient/';
      $scope.PreviousLocationRoute = `${patientPath}${result.Value.PersonId}/Clinical/?${queryString}`;
      $location.search({});
      tabLauncher.launchNewTab($scope.PreviousLocationRoute);
    }, 100);
  };

  $scope.afterBeginFailed = function (result, suppressMessage) {
    $scope.appointment.Status = $scope.appointment.originalStatus.Value;
    if (suppressMessage !== true) {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to begin appointment. Please try again.'
        ),
        'Error'
      );
    }
    $scope.disableControl = false;
  };

  $scope.initialize = function () {
    ctrl.intializeScopeVariables();
    ctrl.initializeControllerVariables();
    $scope.apptPatient = angular.copy($scope.person);
    // NOTE setHasRunningAppointments is only called if no appointments are passed to directive (schedule, appointment modal)
    // if appointments are passed to appointment status directive those are searched for running appointment
    if (_.isEmpty($scope.appointments)) {
      ctrl.setHasRunningAppointments();
    }
  };

  // 'Running Appointment' means that the user has an appointment with a Status of InTreatment AND ActualStartTime is not null
  // A tooltip should appear when hovering stating Patient that already has a running appointment
  // This method sets scope.hasRunningAppointment indicating whether this person currently has a running appointment
  // this property should be used to prevent any other appointment for this person to have the 'StartAppointment' option selected while it is true
  $scope.hasRunningAppointment = false;
  ctrl.setHasRunningAppointments = function () {
    $scope.hasRunningAppointment = false;
    if (
      $scope.person !== null &&
      $scope.person !== undefined &&
      $scope.person.PatientId !== null &&
      $scope.person.PatientId !== undefined &&
      $scope.person.PatientId !== ''
    ) {
      patientAppointmentsFactory
        .PatientHasRunningAppointment($scope.person.PatientId)
        .then(function (res) {
          $scope.hasRunningAppointment = res.Value.HasRunningAppointment;
          ctrl.disableControls();
        });
    }
  };

  // If appointments are passed to the appointment-status directive use these to determine if
  // this patient has a running appointment
  // removing $grep because this is inefficient way to loop thru a list
  $scope.checkRunningAppts = function (appt) {
    if ($scope.appointments) {
      for (var i = 0, len = $scope.appointments.length; i < len; i++) {
        // if appointment has an InTreatment status and matches PatientId return true
        if (
          $scope.appointments[i].Status === $scope.statuses.InTreatment &&
          $scope.appointments[i].ActualStartTime &&
          appt.Patient &&
          $scope.appointments[i].Patient &&
          $scope.appointments[i].Patient.PatientId === appt.Patient.PatientId
        ) {
          $scope.hasRunningAppointment = true;
          return true;
        }
      }
      $scope.hasRunningAppointment = false;
      return false;
    } else {
      return false;
    }
  };

  $scope.checkIfFutureAppointment = function (appt) {
    if (
      appt.StartTime !== null &&
      appt.StatTime !== undefined &&
      appt.StartTime instanceof Date
    ) {
      var startDate = new Date(moment(appt.StartTime).utc()).getDate();
      var currentDate = new Date(moment().utc()).getDate();
      if (startDate > currentDate) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  $scope.$on('$destroy', function () {
    if (ctrl && ctrl.createdWidgets && ctrl.createdWidgets.length) {
      for (var i = ctrl.createdWidgets.length - 1; i >= 0; i--) {
        var widget = ctrl.createdWidgets[i];
        if (widget && widget.destroy && typeof widget.destroy === 'function') {
          try {
            widget.destroy();
            for (var widgetItem in widget) {
              if (widgetItem && widget.hasOwnProperty(widgetItem)) {
                widget[widgetItem] = null;
              }
            }
          } catch (err) {
            // do nothing
          }
        }
      }
    }
  });
}

AppointmentStatusController.prototype = Object.create(BaseCtrl.prototype);
