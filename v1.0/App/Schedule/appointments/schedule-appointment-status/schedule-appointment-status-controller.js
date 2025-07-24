angular
  .module('Soar.Schedule')
  .controller('ScheduleAppointmentStatusController', [
    '$scope',
    '$uibModal',
    '$location',
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
    'locationService',
    'AppointmentStatusService',
    'userSettingsDataService',
    'tabLauncher',
    ScheduleAppointmentStatusController,
  ]);

function ScheduleAppointmentStatusController(
  $scope,
  $uibModal,
  $location,
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
  locationService,
  appointmentStatusService,
  userSettingsDataService,
  tabLauncher
) {
  BaseCtrl.call(this, $scope, 'ScheduleAppointmentStatusController');
  var ctrl = this;
  ctrl.elementId = '';
  ctrl.createdWidgets = [];
  $scope.sentForCheckout = false;

  ctrl.intializeScopeVariables = function () {
    ctrl.initializeStaticData();

    ctrl.setSelectedStatusById($scope.appointment.Status);

    $scope.$watch('appointment.Status', ctrl.appointmentStatusChanged);

    if ($scope.appointment.StartTime) {
      $scope.appointment.StartTime = new Date($scope.appointment.StartTime);
      $scope.appointment.EndTime = new Date($scope.appointment.EndTime);
    }
    var pth = $location.path();
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
    ctrl.defaultStatus = appointmentStatusService.getStatuses()[0];

    if ($scope.selectedStatus !== null && $scope.selectedStatus !== undefined) {
      ctrl.originalStatus = $scope.selectedStatus;
    } else {
      ctrl.originalStatus = ctrl.defaultStatus;
    }

    ctrl.lastStatus = null;

    ctrl.encounterModalData = {};

    ctrl.onChange = $scope.onChange;
  };
  ctrl.initializeStaticData = function () {
    $scope.statusList = appointmentStatusService.getStatuses();
    $scope.statuses = appointmentStatusService.appointmentStatusEnum;
    $scope.patient = null;
  };
  ctrl.setSelectedStatusById = function (newId, oldId) {
    // do nothing if status is unchanged
    if (newId !== oldId && newId !== 0) {
      var newStatus = appointmentStatusService.findStatusByEnumValue(
        Number(newId)
      );
      if (
        newStatus.id ===
        appointmentStatusService.appointmentStatusEnum.Unschedule
      ) {
        ctrl.ShowStatusModal();
        ctrl.lastStatusId = oldId;
      } else if (
        newStatus.id === appointmentStatusService.appointmentStatusEnum.CheckOut
      ) {
        ctrl.ShowCheckoutModal(oldId);
        ctrl.lastStatusId = oldId;
      } else {
        $scope.selectedStatus = newStatus;
        $scope.selectedStatus =
          $scope.selectedStatus !== null
            ? $scope.selectedStatus
            : ctrl.defaultStatus;
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
        };
        $scope.locationDisplayName = $scope.appointment.Location.NameLine1;
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
                  appt.Status !==
                    appointmentStatusService.appointmentStatusEnum
                      .ReadyForCheckout
                ) {
                  // encounter exists but isn't complete, therefore appointment status is ReadyForCheckout
                  appt.Status =
                    appointmentStatusService.appointmentStatusEnum.ReadyForCheckout;
                  $scope.appointment.OriginalStatus =
                    appointmentStatusService.appointmentStatusEnum.ReadyForCheckout;
                  $scope.appointment.Status =
                    appointmentStatusService.appointmentStatusEnum.ReadyForCheckout;
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
        appt.Status = appointmentStatusService.appointmentStatusEnum.Completed;
        ctrl.onChange(appt, false);
      });
  };

  ctrl.sendForCheckout = function (encounterId, appt) {
    var basePath = '';
    var path = '';

    // so at this point we have a problem ... we have a PatientAccount some times other times we have PersonAccount.
    // I assume we still have operations returning the format in an object called PersonAccount from another location on the code still.
    if (
      appt.Patient.PatientAccount !== null &&
      appt.Patient.PatientAccount !== undefined
    ) {
      appt.Patient.PersonAccount = appt.Patient.PatientAccount;
    }

    var hasServices =
      _.isNil(appt.PlannedServices) || appt.PlannedServices.length <= 0
        ? false
        : true;

    let patientPath = '#/Patient/';

    if (!_.isNil(encounterId) && hasServices === true) {
      if (
        appt.Patient != null &&
        angular.isDefined(appt.Patient.PatientAccount)
      ) {
        path =
          _.escape(basePath) +
          _.escape(patientPath) +
          _.escape(appt.Patient.PatientId) +
          '/Account/' +
          _.escape(appt.Patient.PatientAccount.AccountId) +
          '/Encounter/' +
          _.escape(encounterId) +
          '/Checkout/EncountersCartAccountSummary';
        $scope.sentForCheckout = true;
      } else {
        path =
          _.escape(basePath) +
          _.escape(patientPath) +
          _.escape(appt.Patient.PatientId) +
          '/Account/' +
          _.escape(appt.Patient.AccountId) +
          '/Encounter/' +
          _.escape(encounterId) +
          '/Checkout/EncountersCartAccountSummary';
      }
    } else {
      if (
        appt.Patient != null &&
        angular.isDefined(appt.Patient.PersonAccount)
      ) {
        path =
          _.escape(basePath) +
          _.escape(patientPath) +
          _.escape(appt.Patient.PatientId) +
          '/Account/' +
          _.escape(appt.Patient.PersonAccount.AccountId) +
          '/EncountersCart/Schedule?';
      } else {
        path =
          _.escape(basePath) +
          _.escape(patientPath) +
          _.escape(appt.Patient.PatientId) +
          '/Account/' +
          _.escape(appt.Patient.AccountId) +
          '/EncountersCart/Schedule?';
      }
      $scope.sentForCheckout = true;
      angular.forEach($location.search(), function (value, key) {
        if (key !== 'newTab' && key !== 'newKey') {
          path += key + '=' + value + '&';
        }
      });
      path += 'appt=' + _.escape(appt.AppointmentId);
    }
    if (path != null && path != '') {
      // for some reason without doing this the operations is not working
      // I will blame all the hoops we had to go through to get here.
      $timeout(function () {
        tabLauncher.launchNewTab(path);
      }, 50);
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

  ctrl.appointmentSaved_v2 = function (updatedAppointment) {
    // This fix prevents the event screen from popping up on certain scenario
    // Scenario: an open appointment modal has changes on the services (added / removed) and the appointment is checked out (via the status dropdown).
    //  Upon clicking "Save and continue" on the prompt, the event screen pops up and the user is taken to the encounter page
    $rootScope.$broadcast('schedule-suppress-refresh');
    // - end fix -

    let patientPath = '/Patient/';

    var path =
      _.escape(patientPath) +
      _.escape(ctrl.savedPatient.PatientId) +
      '/Account/' +
      _.escape(ctrl.savedPatient.PersonAccount.AccountId) +
      '/Encounters/Schedule?';
    angular.forEach($scope.route, function (value, key) {
      if (key !== 'newTab' && key !== 'newKey') {
        path += key + '=' + value + '&';
      }
    });
    path += 'appt=' + _.escape(updatedAppointment.AppointmentId);
    ctrl.savingForCheckout = false;
    $location.url(path);
  };

  ctrl.encounterSaved = function () {
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
    $scope.appointment.Status = statusObject ? statusObject.id : null;

    $scope.appointment.Status =
      $scope.appointment.Status !== null
        ? $scope.appointment.Status
        : ctrl.defaultStatus.id;

    /** check phase to see if need to apply. apply needs to activate if status is set by kendo dropdown */
    $timeout(function () {
      $scope.$apply();
    });
  };

  ctrl.appointmentStatusChanged = function (nv, ov) {
    ctrl.setSelectedStatusById(nv, ov);
    // not sure why someone would do this.
    ctrl.disableControls();
    if (nv && nv === ctrl.originalStatus.id) {
      $scope.disableControl = false;
    }
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

    if (
      status &&
      status.id === appointmentStatusService.appointmentStatusEnum.Late
    ) {
      if (
        $scope.appointment.StartTime &&
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
        $scope.appointment.Status !==
          appointmentStatusService.appointmentStatusEnum.InTreatment &&
        $scope.appointment.Status !==
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout &&
        $scope.appointment.Status !==
          appointmentStatusService.appointmentStatusEnum.StartAppointment
      ) {
        if (
          $scope.appointment.StartTime >= $scope.tomorrow ||
          $scope.person === null
        ) {
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.CheckOut
          );
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.Completed
          );
        }

        // if patient has another appointment with status StartAppointment disable this option
        if (
          $scope.hasRunningAppointment === true ||
          !$scope.appointment.hasOwnProperty('AppointmentId') ||
          $scope.appointment.AppointmentId === undefined ||
          $scope.appointment.AppointmentId === null
        ) {
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.StartAppointment
          );
        }

        if (moment($scope.appointment.StartTime).utc() > moment().utc()) {
          ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Late);
          //per Mary Beth, an appointment can be started at any time on the day of.
          //ctrl.disableOption(appointmentStatusService.appointmentStatusEnum.StartAppointment);
        } else {
          ctrl.showOption(appointmentStatusService.appointmentStatusEnum.Late);
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.Late
          );
        }

        if ($scope.appointment.StartTime > $scope.tomorrow) {
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.InTreatment
          );
          ctrl.disableOption(
            appointmentStatusService.appointmentStatusEnum.StartAppointment
          );
        }

        // Hide In Treatment and Ready for Checkout statuses. For now these can be set only from clinical timeline
        //ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.InTreatment);
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        );
      } else if (
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.InTreatment &&
        $scope.appointment.ActualStartTime
      ) {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.StartAppointment
        );

        // Hiding all statuses/actions for appointment in treatment for now
        ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Late);
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        );
        //ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Completed);
      } else if (
        $scope.appointment.Status ===
        appointmentStatusService.appointmentStatusEnum.InTreatment
      ) {
        // Hiding all statuses/actions for appointment in treatment for now
        ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Late);
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        );
        //ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Completed);
      } else if (
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout ||
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.StartAppointment
      ) {
        // Hiding all statuses/actions for appointment in treatment and Ready for Checkout for now
        // ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.CheckOut); // PBI 200424 - Allow User to Checkout a "Ready for Checkout" Appointment from Schedule
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.Confirmed
        );
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.ReminderSent
        );
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.Unschedule
        );
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.Unconfirmed
        );
        ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Late);
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.Completed
        );

        if (
          $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        ) {
          ctrl.hideOption(
            appointmentStatusService.appointmentStatusEnum.InTreatment
          );
          ctrl.hideOption(
            appointmentStatusService.appointmentStatusEnum.StartAppointment
          );
        } else {
          ctrl.hideOption(
            appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
          );
        }
      } else {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.CheckOut
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.Confirmed
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.ReminderSent
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.Unschedule
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.Unconfirmed
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.InTreatment
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.StartAppointment
        );
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout
        );
        ctrl.hideOption(appointmentStatusService.appointmentStatusEnum.Late);
      }
      if (
        ($scope.appointment.Status !==
          appointmentStatusService.appointmentStatusEnum.InReception &&
          !$scope.isAppointmentDate($scope.appointment.StartTime)) ||
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.ReadyForCheckout ||
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.CheckOut
      ) {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.InReception
        );
      }
      if ($scope.checkRunningAppts($scope.appointment)) {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.StartAppointment,
          true
        );
      }
      if (!$scope.showAddToClipboard) {
        ctrl.hideOption(
          appointmentStatusService.appointmentStatusEnum.AddToClipboard
        );
      } else if (
        $scope.appointment.Status ===
          appointmentStatusService.appointmentStatusEnum.Completed ||
        $scope.appointment.ActualStartTime ||
        $scope.appointment.IsPinned
      ) {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.AddToClipboard
        );
      }

      if (
        $scope.appointment.Status ===
        appointmentStatusService.appointmentStatusEnum.Completed
      ) {
        ctrl.disableOption(
          appointmentStatusService.appointmentStatusEnum.CheckOut
        );
      }
    }
  };

  ctrl.disableOption = function (value, hasRunningAppt) {
    var item = ctrl.getOptionItem(value);
    if (item !== null && item !== undefined) {
      item.disabled = true;
      angular.element(item).addClass('text-muted');
      item.title = hasRunningAppt
        ? 'Patient already has a running appointment'
        : '';
    }
  };

  ctrl.hideOption = function (value) {
    var item = ctrl.getOptionItem(value);
    if (item !== null && item !== undefined) {
      item.disabled = true;
      angular.element(item).addClass('hidden');
    }
  };

  ctrl.showOption = function (value) {
    var item = ctrl.getOptionItem(value);

    if (item !== null && item !== undefined) {
      angular.element(item).removeClass('hidden');
    }
  };

  ctrl.getOptionItem = function (value) {
    var item = null;

    if (ctrl.elementId > '') {
      var itemIndex = appointmentStatusService.findStatusIndexByEnumValue(
        Number(value)
      );

      if (itemIndex > -1) {
        item = angular.element('#' + ctrl.elementId + ' .k-item')[itemIndex];
      }
    }
    return item;
  };

  // fired by the soar select list sb-change event
  $scope.selectedStatusChange = function (selectedStatus) {
    // logs show that OriginalStatus is coming through as null and throwing an exception later on in this method.
    // that means that ctrl.originalStatus is null for some reason.
    // we need to check that ctrl.originalStatis is set before using it to populate another value.
    // either that or we need to understand why ctrl.originalStatus is not set right some times.
    if (ctrl.originalStatus !== null && ctrl.originalStatus !== undefined) {
      $scope.appointment.OriginalStatus = ctrl.originalStatus;

      $timeout(function () {
        // convert status to int for comparisons
        var selectedStatusAsInt = parseInt(selectedStatus);
        // dont allow starting an appointment if one is running for this person
        if (
          $scope.hasRunningAppointment === true &&
          selectedStatusAsInt ===
            appointmentStatusService.appointmentStatusEnum.StartAppointment
        ) {
          $scope.appointment.Status = $scope.appointment.OriginalStatus.id;
          return;
        }
        // if event fired but the status hasn't changed do nothing
        // NOTE this happens when a new appointment is added to list
        if (selectedStatusAsInt === $scope.appointment.OriginalStatus.id) {
          return;
        }
        // If user selects disabled item via keyboard navigation, revert the status back
        if (ctrl.getOptionItem(selectedStatus).disabled) {
          $scope.appointment.Status = $scope.appointment.OriginalStatus.id;
          return;
        }
        if (
          selectedStatusAsInt ===
          appointmentStatusService.appointmentStatusEnum.AddToClipboard
        ) {
          if (angular.isFunction($scope.addToClipboardCallback)) {
            $scope.addToClipboardCallback();
          }
        } else if (
          selectedStatusAsInt ===
          appointmentStatusService.appointmentStatusEnum.Unschedule
        ) {
          // not an actual status, will trigger a modal so do nothing here
        } else if (
          $scope.onChange !== null &&
          (ctrl.originalStatus === null ||
            ctrl.originalStatus.id !== selectedStatusAsInt)
        ) {
          if (
            selectedStatusAsInt ===
            appointmentStatusService.appointmentStatusEnum.StartAppointment
          ) {
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
              selectedStatusAsInt ===
                appointmentStatusService.appointmentStatusEnum.Completed ||
                ctrl.originalStatus.id ===
                  appointmentStatusService.appointmentStatusEnum.Completed
            );
          }
        }
      });
    }
  };

  $scope.selectedStatusChanged = function (event, status, disabled) {
    let loggedInLocation = locationService.getCurrentLocation();
    let checkoutValue = 10;
    if (
      status.id === checkoutValue &&
      $scope.appointment.LocationId !== loggedInLocation.id
    ) {
      ctrl.showChangeLocationPromptModal();
      return;
    } else {
      // set hasRunningAppointment after status change to StartAppointment
      // don't allow starting an appointment if one is running for this person
      if (
        $scope.hasRunningAppointment === true &&
        status.id ===
          appointmentStatusService.appointmentStatusEnum.StartAppointment
      ) {
        return;
      }
      if (disabled === true) return;
      var selectedStatus = status ? status : $scope.selectedStatus;
      ctrl.setAppointmentStatusFromStatusObject(selectedStatus);

      $scope.appointment.OriginalStatus = ctrl.originalStatus;
      if ($scope.onChange !== null) {
        if (
          selectedStatus.id ===
          appointmentStatusService.appointmentStatusEnum.StartAppointment
        ) {
          $scope.startAppointment();
        } else {
          var autoSave =
            selectedStatus.id <= 4 || selectedStatus.id === 6 ? true : false;
          var closeModal = selectedStatus.id === 10;
          $scope.onChange(
            $scope.appointment,
            autoSave,
            closeModal,
            null,
            null,
            selectedStatus.id ===
              appointmentStatusService.appointmentStatusEnum.Completed ||
              ctrl.originalStatus.id ===
                appointmentStatusService.appointmentStatusEnum.Completed
          );
        }
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
    $scope.appointment.Status =
      appointmentStatusService.appointmentStatusEnum.InTreatment;
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
    scheduleServices.AppointmentStatusUpdate.Update(
      appointmentUpdate,
      result => $scope.afterBeginSuccess(result, overrideLocation),
      $scope.afterBeginFailed
    );
  };

  $scope.afterBeginSuccess = function (result, overrideLocation) {
    $timeout(function () {
      if (result && result.Value) {
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
      }
    }, 100);
  };

  $scope.afterBeginFailed = function (result, suppressMessage) {
    $scope.appointment.Status = $scope.appointment.OriginalStatus.id;
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
  };

  // If appointments are passed to the appointment-status directive use these to determine if
  // this patient has a running appointment
  // removing $grep because this is inefficient way to loop through a list
  $scope.checkRunningAppts = function (appt) {
    if ($scope.appointments) {
      for (var i = 0, len = $scope.appointments.length; i < len; i++) {
        // if appointment has an InTreatment status and matches PatientId return true
        if (
          $scope.appointments[i].Status ===
            appointmentStatusService.appointmentStatusEnum.InTreatment &&
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
    var startDate = new Date(moment(appt.StartTime).utc()).getDate();
    var currentDate = new Date(moment().utc()).getDate();
    if (startDate > currentDate) {
      return true;
    } else {
      return false;
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

ScheduleAppointmentStatusController.prototype = Object.create(
  BaseCtrl.prototype
);
