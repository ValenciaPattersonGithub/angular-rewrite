// Copy of appointment-modal-controller
// Not cleaned up to remove appointment logic (Jan 2019)

(function () {
  angular
    .module('Soar.Schedule')
    .controller('ScheduleBlockModalController', ScheduleBlockModalController);
  ScheduleBlockModalController.$inject = [
    '$scope',
    '$window',
    '$timeout',
    '$uibModal',
    '$filter',
    '$q',
    'ScheduleTextService',
    'ListHelper',
    'toastrFactory',
    'patSecurityService',
    'localize',
    'BoundObjectFactory',
    'CommonServices',
    'PatientServices',
    'ScheduleServices',
    'ScheduleAppointmentConflictCheck',
    '$uibModalInstance',
    'ModalFactory',
    'modalResolve',
    'fromSchedule',
    'SaveStates',
    'StaticData',
    '$routeParams',
    'ResourceService',
    '$interval',
    'AppointmentService',
    'ApiDefinitions',
    'SurfaceHelper',
    'FinancialService',
    'TreatmentPlansFactory',
    'PatientPreventiveCareFactory',
    '$location',
    '$rootScope',
    '$parse',
    'PatientLogic',
    'UserServices',
    'TimeZoneFactory',
    'PatientMedicalHistoryAlertsFactory',
    'PatientOdontogramFactory',
    'locationService',
    'PersonFactory',
    'PatientValidationFactory',
    'RolesFactory',
    'PatientAppointmentsByClassificationFactory',
    'AppointmentModalFactory',
    'ProviderRoomOccurrenceFactory',
    'AppointmentUtilities',
    'RoleNames',
    'GlobalSearchFactory',
    'AppointmentConflictFactory',
    'PatientServicesFactory',
    'referenceDataService',
    'ScheduleBlockModalService',
    'ProviderShowOnScheduleFactory',
    'NewRoomsService',
    'NewLocationsService',
    'ScheduleProvidersService',
    'userSettingsDataService',
    'tabLauncher',
    'AppointmentViewValidationNewService',
    'FeatureFlagService',
    'FuseFlag',
  ];

  function ScheduleBlockModalController(
    $scope,
    $window,
    $timeout,
    $uibModal,
    $filter,
    $q,
    scheduleTextService,
    listHelper,
    toastrFactory,
    patSecurityService,
    localize,
    boundObjectFactory,
    commonServices,
    patientServices,
    scheduleServices,
    scheduleAppointmentConflictCheck,
    $uibModalInstance,
    modalFactory,
    modalResolve,
    fromSchedule,
    saveStates,
    staticData,
    $routeParams,
    resourceService,
    $interval,
    appointmentService,
    apiDefinitions,
    surfaceHelper,
    financialService,
    treatmentPlansFactory,
    patientPreventiveCareFactory,
    $location,
    $rootScope,
    $parse,
    patientLogic,
    userServices,
    timeZoneFactory,
    patientMedicalHistoryAlertsFactory,
    patientOdontogramFactory,
    locationService,
    personFactory,
    patientValidationFactory,
    rolesFactory,
    patientAppointmentsByClassificationFactory,
    appointmentModalFactory,
    providerRoomOccurrenceFactory,
    appointmentUtilities,
    roleNames,
    globalSearchFactory,
    appointmentConflictFactory,
    patientServicesFactory,
    referenceDataService,
    scheduleBlockModalService,
    providerShowOnScheduleFactory,
    roomsService,
    newLocationsService,
    scheduleProvidersService,
    userSettingsDataService,
    tabLauncher,
    appointmentViewValidationNewService,
    featureFlagService,
    fuseFlag,
  ) {
    BaseSchedulerCtrl.call(this, $scope, 'ScheduleBlockModalController');
    var ctrl = this;

    ctrl.minutes = [];
    $scope.minutesString = [];
    ctrl.minutesIncrementString = [];

    // load text for the view
    $scope.blockModalText = scheduleTextService.getBlockModalText();

    //#region auth
    if (!appointmentModalFactory.access().View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-sch-sptapt-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    //#region support showOnSchedule

    // determine if user has a current exception for this location
    ctrl.findMatchingException = function (provider, locationId) {
      var exception = _.filter(
        provider.ShowOnScheduleExceptions,
        function (exc) {
          return exc.LocationId === locationId;
        }
      );
      return exception.length > 0 ? exception[0] : null;
    };

    // get rooms by location only when the location changes
    ctrl.getLocationRooms = function (locationId) {
      // I think i can grab the values in this 'roomsService.rooms' collection and filter by locaitonId,
      // but I need to verify that better so doing this in the mean time.

      var roomLocation = _.find($scope.rooms, function (room) {
        return room.LocationId === locationId;
      });
      // empty object indicates the current rooms are for another location and we need to filter records again
      if (_.isEmpty(roomLocation)) {
        var ofcLocation = newLocationsService.findByLocationId(locationId);
        var tempRooms = _.forEach(ofcLocation.Rooms, function (room) {
          room.timezone = ofcLocation ? ofcLocation.Timezone : '';
          room.tz = ofcLocation ? ofcLocation.timezoneInfo.Abbr : '';
          // determine locationAbbr
          var abbr = ofcLocation ? ofcLocation.NameAbbreviation : '';
          room.locationAbbr = abbr + ' (' + room.tz + ')';
          return room;
        });

        $scope.rooms = tempRooms;
        ctrl.getRoomAssignmentsForExistingAppointment();

        //ctrl.sortRooms();
        if (
          $scope.appointment &&
          $scope.appointment.Data &&
          $scope.appointment.Data.TreatmentRoomId
        ) {
          $scope.selectedTreatmentRoomId =
            $scope.appointment.Data.TreatmentRoomId;
        }
        ctrl.sortingRooms = true;
        $scope.rooms = _.orderBy($scope.rooms, 'Name');
      }
    };

    //#endregion
    //#region modal resolves to set scope vars
    $scope.appointmentTypes = referenceDataService.get(
      referenceDataService.entityNames.appointmentTypes
    );
    // NOTE should we check to see if the appointmentTypes have been satisfied or should we rely on this
    ctrl.location = modalResolve.existingAppointment.Location;
    ctrl.serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );

    ctrl.initPracticeSettings = async function () {
      const practiceSettings = (await commonServices.PracticeSettings.Operations.Retrieve()).Value;

      // timeIncrement based on practice settings
      $scope.timeIncrement = practiceSettings.DefaultTimeIncrement;
      $scope.timeIncrementObject = {
        TimeIncrement: _.cloneDeep($scope.timeIncrement),
      };

      var step = $scope.timeIncrement ? $scope.timeIncrement : 5;

      for (var i = step; i < 996; i += step) {
        ctrl.minutes.push(i);
        $scope.minutesString.push({ duration: i.toString() });
        if (i <= 30) {
          ctrl.minutesIncrementString.push({ duration: i.toString() });
        }
      }
    }

    $scope.appointments = modalResolve.appointments;
    $scope.editing = !(
      angular.isUndefined(modalResolve.existingAppointment.AppointmentId) ||
      modalResolve.existingAppointment.AppointmentId == null ||
      modalResolve.existingAppointment.AppointmentId == ctrl.emptyGuid
    );
    $scope.overwriteHasChange =
      $scope.editing &&
      modalResolve.existingAppointment.ObjectState == saveStates.Update;

    $scope.saveStates = saveStates;

    //#endregion modal resolves

    //#region flyout functions

    //new flyout functions, use from now forward, remove above
    $scope.preventiveDate = { dueDate: '' };
    $scope.dataLoadingProposed = { loading: false };
    $scope.dataLoadingTreatment = { loading: false };
    $scope.dataLoadingPreventive = { loading: false };
    $scope.dataLoadingNewService = { loading: false };
    $scope.popOverTracker = { closeAllCharge: false, closeAllEstIns: false };
    $scope.showProposedFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      $rootScope.$broadcast('openProposedSelectorFlyout');
    };

    $scope.showPreventiveFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      ctrl.applyProviderSchedules();
      $rootScope.$broadcast('openPreventiveCareFlyout');
    };
    $scope.showServiceFlyout = function () {
      $rootScope.$broadcast('closeFlyouts');
      ctrl.applyProviderSchedules();
      $rootScope.$broadcast('openNewServicesFlyout');
    };
    $scope.isChrome = window.PattersonWindow.isChrome;

    //#endregion

    //#region ctrl and scope vars initialized

    // lists vars
    $scope.unscheduledPatientAppointments = [];
    ctrl.baseServiceCodes = [];

    ctrl.servicesToEdit = [];
    ctrl.servicesToAdd = [];
    ctrl.providerValidation = [];
    ctrl.providerValidationMissingHours = [];
    $scope.providers = [];

    ctrl.backupProviderAppointments = [];

    $scope.disableIfStatusComplete = false;
    ctrl.kendoWidgets = [];

    // provider times are valid indicator
    $scope.validStartAndEndTime = true;

    // toggle var for unscheduled appointments dropdown
    $scope.open = false;
    $scope.apptTime = {
      startDate: null,
      endDate: null,
    };
    // bool vars
    $scope.fromUnscheduled = false;
    $scope.addNote = false;
    $scope.loadingAlerts = false;
    $scope.readOnly = false;
    $scope.filteredProviders = false;
    $scope.providersLoaded = false;
    $scope.saveClicked = false;
    $scope.deleteClicked = false;
    $scope.removeClicked = false;
    $scope.hasChanges = false;
    $scope.treatmentRoomAssigned = true;
    $scope.loadingDependancies = true;

    $scope.patientIsInactive = false;
    ctrl.fromClipboard = true;
    $scope.hasRunningAppointment = false;
    ctrl.providersWithPracticeRolePromise = null;
    ctrl.providersWithLocationRolePromise = null;
    $scope.disableWhenPatientInactive = false;
    $scope.needToApplyPropTag = false;

    $scope.minDate = new Date();
    $scope.minDate.setHours(0, 0, 0, 0);
    $scope.maxDate = new Date(9999, 12, 31, 23, 59, 59, 999);
    ctrl.lastProviderChecked = null;
    ctrl.lastUsedProviderTimeout;

    // initialized states
    ctrl.lastLocationRooms = null;
    $scope.appointmentDuration = null;
    $scope.dropDownLocation = null;
    $scope.estimatedAmount = 0.0;
    $scope.estimatedInsurance = 0.0;
    ctrl.oldAppointmentTimeByAppointmentType = null;
    $scope.datePickerTooltip = '';
    $scope.serviceButtonTooltip = '';
    $scope.txPlanButtonTooltip = '';
    $scope.preventiveButtonTooltip = '';
    $scope.patientSelected = false;
    $scope.disableStatusSelector = false;

    $scope.multiSelect = {
      open: false,
    };
    ctrl.queueToAdd = [];
    ctrl.params = {
      Active: true,
      Dentist: true,
      Hygienist: true,
      Assistant: true,
      Other: true,
      FillLocations: true,
      FillShowOnSchedule: true,
    };

    ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';

    //#region helper methods

    // set button state for buttons based on active state of patient
    ctrl.setButtonState = function () {
      if ($scope.patient) {
        if ($scope.patient.IsActive === false) {
          $scope.datePickerTooltip = localize.getLocalizedString(
            'Cannot schedule appointment for inactive patient'
          );
          $scope.serviceButtonTooltip = localize.getLocalizedString(
            'Cannot add a proposed service for inactive patient'
          );
          $scope.txPlanButtonTooltip = localize.getLocalizedString(
            'Cannot add a proposed service for inactive patient'
          );
          $scope.preventiveButtonTooltip = localize.getLocalizedString(
            'Cannot add preventive care for inactive patient'
          );
          // clearing date
          if ($scope.appointmentDate !== null) {
            $scope.backupApptDate = $scope.appointmentDate;
          }
          if ($scope.blockDate !== null) {
            $scope.backupBlockDate = $scope.blockDate;
          }
          if ($scope.appointmentTime.start !== null) {
            $scope.backupTime = $scope.appointmentTime;
          }
          $scope.blockDate = null;
          $scope.appointmentDate = null;
          $scope.disableWhenPatientInactiveOrReadOnly = true;
          $scope.disableWhenPatientInactive = true;
        } else if (
          !listHelper.findItemByFieldValue(
            $scope.providers,
            'Selected',
            true
          ) &&
          $scope.appointment.Data.Classification == 0
        ) {
          $scope.serviceButtonTooltip = localize.getLocalizedString(
            'Please select provider'
          );
          $scope.txPlanButtonTooltip = localize.getLocalizedString(
            'Please select provider'
          );
          $scope.preventiveButtonTooltip = localize.getLocalizedString(
            'Please select provider'
          );
        } else {
          $scope.datePickerTooltip = '';
          $scope.serviceButtonTooltip = '';
          $scope.txPlanButtonTooltip = '';
          $scope.preventiveButtonTooltip = '';
          if ($scope.blockDate === null) {
            $scope.blockDate = $scope.backupBlockDate;
          }
          if ($scope.appointmentDate === null) {
            $scope.appointmentDate = $scope.backupApptDate;
            setTimeout(function () {
              // only reset the appointment time if the backup time has been initialized
              // this happens only when a patient was inactive then re activated
              if (!_.isNil($scope.backupTime)) {
                $scope.appointmentTime = $scope.backupTime;
              }
            }, 0);
          }
          $scope.disableWhenPatientInactiveOrReadOnly = $scope.readOnly;
          $scope.disableWhenPatientInactive = false;
        }
      }
    };

    // emitted by each one of the tab content directives to tell the tabset to close as well
    $scope.$on('soar:appt-tab-action-canceled', function () {
      $scope.showTabset = false;
    });

    ctrl.inactivePatientMessage = function () {
      if ($scope.patient.IsActive === false) {
        var title = localize.getLocalizedString('Inactive Patient');
        var message = localize.getLocalizedString(
          'You cannot schedule an inactive patient. Do you want to reactivate this patient?'
        );
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(ctrl.setPatientActive, ctrl.cancelActivation);
      }
    };

    ctrl.setPatientActive = function () {
      personFactory
        .SetPersonActiveStatus($scope.patient.PatientId, true, false)
        .then(function (res) {
          if (res) {
            $scope.patient.IsActive = true;
            globalSearchFactory.SaveMostRecentPerson($scope.patient.PatientId);
            $rootScope.$broadcast('patient-personal-info-changed');
          }
        });
    };

    ctrl.cancelActivation = function () {
      $rootScope.$broadcast('soar:refresh-most-recent');
      $scope.patient = null;
    };

    //#endregion

    //#region helper functions for provider

    $scope.closeProviderDropdown = function () {
      if ($scope.multiSelect.open) {
        $scope.multiSelect.open = false;
      }
    };

    //#endregion

    //#region helper functions

    $scope.toggleIcon = function () {
      if (!$scope.open) {
        angular
          .element('#unschedPatientApptsCountIcon')
          .removeClass('fa-angle-up');
        angular
          .element('#unschedPatientApptsCountIcon')
          .addClass('fa-angle-down');
        angular.element('#unscheduledList').removeClass('collapse');
        $scope.open = true;
      } else {
        angular
          .element('#unschedPatientApptsCountIcon')
          .removeClass('fa-angle-down');
        angular
          .element('#unschedPatientApptsCountIcon')
          .addClass('fa-angle-up');
        angular.element('#unscheduledList').addClass('collapse');

        $scope.open = false;
      }
    };

    $scope.addStatusNote = function () {
      $scope.addNote = true;
    };

    ctrl.lookupAppointmentType = function (id) {
      return listHelper.findItemByFieldValue(
        $scope.appointmentTypes,
        'AppointmentTypeId',
        $scope.appointment.Data.AppointmentTypeId
      );
    };

    //#endregion

    function onReferenceDataServiceLocationChanged() {
      ctrl.serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      $scope.appointmentTypes = referenceDataService.get(
        referenceDataService.entityNames.appointmentTypes
      );
    }

    ctrl.referenceDataServiceLocationChangedReference = referenceDataService.registerForLocationSpecificDataChanged(
      onReferenceDataServiceLocationChanged
    );

    //#region calculate discount and tax

    //#endregion

    // call all factory methods required to initialize an appointment and load results
    ctrl.initDependancies = function () {
      ctrl.initPracticeSettings().then(() => {
        ctrl.initAppointmentProperties();
        ctrl.initializeAppointmentDate();
        ctrl.initializeAppointmentTimes();
        ctrl.initAppointment();
        $scope.initialize();

        if ($scope.editing && $scope.appointment.Data.Classification == 1) {
          //debugger;
          $scope.switchToBlock();
        }

        ctrl.updateSelectedProvidersTime();
        $scope.setExaminingDentist();
        ctrl.getPracticeLocations();
        ctrl.setDisableStatusSelector();

        // not sure if these are used ... so commeting them out ..
        ctrl.serviceCodes = null;
        ctrl.holidays = null;
        $scope.loadingDependancies = true;

        // We need to reload the providers because multiple locations could have been selected on the schedule
        // so the passed providers might not reflect the current location
        var currentLocation = locationService.getCurrentLocation();
        providerShowOnScheduleFactory
          .getProviderLocations(true)
          .then(function (res) {
            ctrl.loadScheduleProviders(res, currentLocation.id);
            var instanceVariable = _.cloneDeep(newLocationsService.locations);
            ctrl.processLocationData(instanceVariable);

            // NOTE ensure ctrl.filterProvidersByLocation needs to run after setProviders
            if ($scope.appointment.Data.LocationId) {
              ctrl.filterProvidersByLocation(
                $scope.appointment.Data.LocationId,
                true
              );
            }
            $scope.loadingDependancies = false;

            // load static data once
            ctrl.appointmentStatuses = staticData.AppointmentStatuses();

            if (modalResolve.existingAppointment) {
              // make the fields read-only when the appointment is either completed or Ready for Checkout
              if (ctrl.appointmentStatuses) {
                if (
                  modalResolve.existingAppointment.Status ==
                  ctrl.appointmentStatuses.Enum.Completed ||
                  modalResolve.existingAppointment.Status ==
                  ctrl.appointmentStatuses.Enum.ReadyForCheckout
                ) {
                  $scope.readOnly = true;
                  $scope.hasChanges = false;
                }

                $scope.isAppointmentInTreatment =
                  modalResolve.existingAppointment.Status ===
                  ctrl.appointmentStatuses.Enum.InTreatment &&
                  modalResolve.existingAppointment.ActualStartTime;

                if (modalResolve.existingAppointment.TreatmentRoomId > '') {
                  $scope.appointment.Data.Room = listHelper.findItemByFieldValue(
                    $scope.rooms,
                    'RoomId',
                    modalResolve.existingAppointment.TreatmentRoomId
                  );
                  // if we set the room when initializing we need to update the original data
                  ctrl.originalAppointmentData = _.cloneDeep(
                    $scope.appointment.Data
                  );
                }

                $scope.locationReadOnly =
                  $scope.readOnly ||
                  modalResolve.existingAppointment.Status ==
                  ctrl.appointmentStatuses.Enum.InTreatment ||
                  modalResolve.existingAppointment.Status ==
                  ctrl.appointmentStatuses.Enum.InReception;
              }
            }
          });
      });
    };

    //#region methods for initialize appointment properties on existing appointments

    ctrl.initAppointmentLocationAndTimeZone = function () {
      //Appointment Location Timezone processing
      if (
        angular.isUndefined(modalResolve.existingAppointment.Location) ||
        angular.isUndefined(
          modalResolve.existingAppointment.Location.Timezone
        ) ||
        !modalResolve.existingAppointment.Location ||
        !modalResolve.existingAppointment.Location.Timezone
      ) {
        modalResolve.existingAppointment.Location = _.cloneDeep(
          modalResolve.location.Value
        );
      }
      $scope.timezoneInfo =
        modalResolve.existingAppointment &&
          angular.isDefined(modalResolve.existingAppointment.Location)
          ? timeZoneFactory.GetTimeZoneInfo(
            modalResolve.existingAppointment.Location.Timezone,
            modalResolve.existingAppointment.StartTime
          )
          : null;
      if (
        $scope.editing &&
        modalResolve.existingAppointment.Classification == 0 &&
        angular.isUndefined(modalResolve.existingAppointment.originalStart)
      ) {
        timeZoneFactory.ConvertAppointmentDatesTZ(
          modalResolve.existingAppointment
        );
      }
    };

    ctrl.initAppointmentProperties = function () {
      ctrl.initAppointmentLocationAndTimeZone();
    };

    //#endregion


    //#region kendo method extensions

    ctrl.assignPreferredProviderByAppointmentType = function (appointmentType) {
      var appt = $scope.appointment.Data;
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      var selectedProviders = $scope.multipleProviders
        ? $scope.multipleProviders.selectedProviders
        : [];
      if (!patient) return;

      if (
        patient.PreferredDentist == undefined &&
        patient.PreferredHygienist == undefined
      ) {
        $scope.getPatientInfo();
        $timeout(function () {
          patient.PreferredDentist = $scope.pat.Profile.PreferredDentist;
          patient.PreferredHygienist = $scope.pat.Profile.PreferredHygienist;
        }, 1000);
      }

      if (
        appt.Classification == 0 &&
        !(
          (appt.Classification == 0 && appt.WasDragged) ||
          (appt.Classification == 0 &&
            selectedProviders.length > 0 &&
            (selectedProviders.length != 1 ||
              (selectedProviders[0].UserId != patient.PreferredHygienist &&
                selectedProviders[0].UserId != patient.PreferredDentist)))
        )
      ) {
        _.forEach($scope.providers, function (prov) {
          prov.Selected = false;
        });
        $scope.providerSchedules = [];
        if (appointmentType && appointmentType.PerformedByProviderTypeId == 2) {
          var prov = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            patient.PreferredHygienist
          );
          if (prov) {
            prov.Selected = true;
            $scope.multipleProviders = { selectedProviders: [prov] };
          }
        } else {
          appt.ExaminingDentist = null;
          var prov = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            patient.PreferredDentist
          );
          if (prov) {
            prov.Selected = true;
            $scope.multipleProviders = { selectedProviders: [prov] };
          }
        }
      } else if (
        appt.Classification == 2 &&
        !(
          appt.Classification == 2 &&
          appt.ProviderId != null &&
          appt.ProviderId != '' &&
          appt.UserId != null &&
          appt.UserId != '' &&
          appt.UserId != patient.PreferredHygienist &&
          appt.UserId != patient.PreferredDentist
        )
      ) {
        if (appointmentType && appointmentType.PerformedByProviderTypeId == 2) {
          appt.UserId = patient.PreferredHygienist;
          appt.ProviderId = patient.PreferredHygienist;
          appt.ExaminingDentist = patient.PreferredDentist;
        } else {
          appt.ExaminingDentist = null;
          appt.UserId = patient.PreferredDentist;
          appt.ProviderId = patient.PreferredDentist;
        }
      }

      if (
        appointmentType &&
        appointmentType.PerformedByProviderTypeId == 2 &&
        (appt.ExaminingDentist == null ||
          angular.isUndefined(appt.ExaminingDentist) ||
          appt.ExaminingDentist.length != ctrl.emptyGuid.length)
      ) {
        appt.ExaminingDentist = patient.PreferredDentist;
      }
    };
    ctrl.adjustAppointmentTimeByAppointmentType = function (appointmentType) {
      if ($scope.appointmentTime && $scope.appointmentTime.start) {
        var endTime = moment($scope.appointmentTime.start);

        if (appointmentType) {
          endTime.add(appointmentType.DefaultDuration, 'm');
        } else {
          // Until default interval is set
          endTime.add($scope.timeIncrement, 'm');
        }

        ctrl.oldAppointmentTimeByAppointmentType = $scope.appointmentTime.end;

        var appointmentWasDragged =
          $scope.appointment.Data.WasDragged &&
          $scope.appointment.Data.WasDragged == true &&
          false; //override wasdragged validation
        $scope.appointmentTime.end = appointmentWasDragged
          ? $scope.appointmentTime.end
          : endTime.toISOString();

        ctrl.setAppointmentDateTime(
          $scope.appointmentDate,
          $scope.appointmentTime
        );

        if ($scope.appointment.Data.Classification != 1) {
          ctrl.changeFirstProvidersTime();
        }

        $timeout($scope.forceRefresh, 100);
      } else if ($scope.appointmentTime) {
        $scope.appointmentTime.end = null;
        $scope.appointmentTime.Duration = appointmentType
          ? appointmentType.DefaultDuration
          : $scope.appointmentTime.Duration;
      } else {
        $scope.appointmentTime = { Duration: appointmentType.DefaultDuration };
      }
    };

    $scope.forceRefresh = function () {
      $scope.$apply();
    };

    $scope.appointmentTypeChanged = function (nv, ov) {
      if (nv && nv != ov) {
        $scope.selectedAppointmentType = ctrl.lookupAppointmentType(
          $scope.appointment.Data.AppointmentTypeId
        );

        if (!$scope.appointment.Data.WasDragged) {
          ctrl.adjustAppointmentTimeByAppointmentType(
            $scope.selectedAppointmentType
          );
        }

        ctrl.assignPreferredProviderByAppointmentType(
          $scope.selectedAppointmentType
        );
      } else if ((nv == '' || nv == null) && nv != ov) {
        ctrl.adjustAppointmentTimeByAppointmentType(null);
      }

      $scope.appointment.Data.AppointmentType = listHelper.findItemByFieldValue(
        $scope.appointmentTypes,
        'AppointmentTypeId',
        $scope.appointment.Data.AppointmentTypeId
      );
      ctrl.checkPreferredProviders();
      ctrl.checkIfAppointmentHasChanges();
    };
    $scope.appointmentDurationChanged = function (nv, ov) {
      ctrl.checkIfAppointmentHasChanges();
    };
    $scope.serviceDataChanged = function () {
      ctrl.checkIfAppointmentHasChanges();
    };
    $scope.appointmentDataChanged = function (nv, ov) {
      ctrl.checkIfAppointmentHasChanges();
    };

    $scope.appointmentDateChanged = function (nv, ov) {
      var newDate = new Date(nv);
      var oldDate = new Date(ov);
      if (
        (nv && newDate.getTime() != oldDate.getTime()) ||
        (nv && $scope.appointment.Data.IsPinned && ctrl.fromClipboard)
      ) {
        ctrl.fromClipboard = false;

        /** valid date turns unscheduled to scheduled */
        if ($scope.appointment.Data.Classification == 2) {
          /** get new hours of operations */
          $scope.appointment.Data.StartTime = new Date(nv);

          ctrl.switchToAppointment($scope.appointment, newDate);
        } else if ($scope.appointment.Data.Classification < 1) {
          if (!appointmentUtilities.dateIsWithinWeek(newDate, oldDate)) {
          }

          /** update time pickers */
          $scope.appointmentDate = newDate;

          $scope.appointmentDateWithoutTime = new Date();

          $scope.appointmentEndTimeLimit = ctrl.getAppointmentEndTimeLimit();

          ctrl.reinitializeAppointmentTimes();

          ctrl.getRoomAssignmentsWhenDateTimeChanged();
          _.forEach($scope.providerSchedules, function (sched) {
            sched.Start = new Date(
              $scope.appointmentDate.toDateString() +
              ' ' +
              sched.Start.toTimeString()
            );
            sched.End = new Date(
              $scope.appointmentDate.toDateString() +
              ' ' +
              sched.End.toTimeString()
            );
          });
        }
        ctrl.setAppointmentDateTime(
          $scope.appointmentDate,
          $scope.appointmentTime
        );
        ctrl.updateSelectedProvidersTime();
        if ($scope.selectedLocation === null) {
          $scope.selectedLocation = ctrl.lookupLocation(
            $scope.appointment.Data.LocationId
          );
        }
        if (
          angular.isUndefined($scope.selectedLocation) ||
          $scope.selectedLocation === null
        ) {
          $scope.selectedLocation = modalResolve.existingAppointment.Location;
        }
        $scope.timezoneInfo = timeZoneFactory.GetTimeZoneInfo(
          $scope.selectedLocation.Timezone,
          $scope.appointment.Data.StartTime
        );
      } else if (nv == null) {
        /** this prevents scheduled appointments from going unscheduled
         *  ProposedDuration is a required field for unscheduled appointments
         */

        // TODO: Remove this - literally not defined
        // ctrl.switchToUnscheduledAppointment($scope.appointment);
      }

      ctrl.checkIfAppointmentHasChanges();
    };

    //#region conflicts handling

    $scope.blockExistsMsg = null;
    $scope.examiningOutsideWorkingHours = false;
    $scope.loadingConflicts = false;
    $scope.examiningDentistBlockMsg = null;

    $scope.getConflicts = function () {
      $scope.loadingConflicts = true;
      $scope.blockExistsMsg = null;
      var appointment = _.cloneDeep($scope.appointment.Data);
      if (appointment.AppointmentId === null) delete appointment.AppointmentId;

      var conflictParams = appointmentConflictFactory.ConflictParams(
        appointment,
        $scope.providerSchedules
      );

      appointmentConflictFactory.Conflicts(conflictParams).then(function (res) {
        $scope.conflicts = res.Value;

        // process blocks that would prevent save
        ctrl.processConflictForSave($scope.conflicts);
        $scope.loadingConflicts = false;
      });
    };

    ctrl.processConflictForSave = function (conflict) {
      // format conflict if exists
      $scope.appointmentTime.Valid = !conflict.IsBlock;
      $scope.blockTime.Valid = !conflict.IsBlock;

      // set $scope.appointment.Valid based on block
      if (conflict.IsBlock === true) {
        $scope.appointment.Valid = false;
      }
      // handle blocks for provider
      if (conflict.IsBlock) {
        console.log(conflict.Block.IsAnotherLocation);
        if (!conflict.Block.IsAnotherLocation) {
          $scope.blockExistsMsg = localize.getLocalizedString(
            'An existing block or appointment is already scheduled from {0} to {1}. Please select another time.',
            [conflict.Block.$$From, conflict.Block.$$To]
          );
        } else {
          $scope.blockExistsMsg = localize.getLocalizedString(
            'The provider {0} is already scheduled from {1} to {2} at the {3} location. Please select another time.',
            [
              conflict.Block.$$ProviderName,
              conflict.Block.$$From,
              conflict.Block.$$To,
              conflict.Block.LocationName,
            ]
          );
        }
      }
      // handle blocks for examiningDentist
      if (conflict.IsExaminingDentistBlock) {
        $scope.examiningDentistBlockMsg = localize.getLocalizedString(
          'An existing block is already scheduled from {0} to {1}. Please select a different examining dentist.',
          [
            conflict.ExaminingDentistBlock.$$From,
            conflict.ExaminingDentistBlock.$$To,
          ]
        );
      }
    };

    //#endregion

    $scope.changedTreatmentRoom = function (e) {
      var index = e.sender.selectedIndex;

      if (index > 0) {
        $scope.appointment.Data.Room = $scope.rooms[index - 1];
        $scope.appointment.Data.TreatmentRoomId =
          $scope.appointment.Data.Room.RoomId;
      } else {
        $scope.appointment.Data.Room = null;
        $scope.appointment.Data.TreatmentRoomId = null;
      }

      ctrl.setRoomAssignedFlag();

      ctrl.checkIfAppointmentHasChanges();

      // get conflicts when room changes
      $scope.getConflicts();
    };

    $scope.changedBlockTreatmentRoom = function (e) {
      var index = e.sender.selectedIndex;

      if (index > 0) {
        $scope.appointment.Data.Room = $scope.rooms[index - 1];
        $scope.appointment.Data.TreatmentRoomId =
          $scope.appointment.Data.Room.RoomId;
      } else {
        $scope.appointment.Data.Room = null;
        $scope.appointment.Data.TreatmentRoomId = null;
      }

      ctrl.setRoomAssignedFlag();
      ctrl.checkIfAppointmentHasChanges();
    };

    $scope.serviceChangedProvider = function (e) {
      e.ObjectState = 'Update';
      ctrl.checkIfAppointmentHasChanges();
    };

    $scope.changedProvider = function (e) {
      var index = e.sender.selectedIndex;

      if (index > 0) {
        $scope.appointment.Data.Provider = $scope.providers[index - 1];
        ctrl.getRoomAssignmentsForProvider(
          ctrl.location.LocationId,
          $scope.providers[index - 1].UserId,
          $scope.appointment.Data.StartTime,
          $scope.appointment.Data.EndTime
        );
      } else {
        $scope.appointment.Data.Provider = null;
        e.sender.options.$angular[0].provider.UserId = null;
        ctrl.resetRoomAssignments();
      }
      ctrl.checkIfAppointmentHasChanges();
    };

    $scope.changedBlockProvider = function (e) {
      var index = e.sender.selectedIndex;

      if (index > 0) {
        $scope.appointment.Data.Provider = $scope.providers[index - 1];
        $scope.appointment.Data.UserId =
          $scope.appointment.Data.Provider.UserId;
        $scope.appointment.Data.ProviderId = $scope.appointment.Data.UserId;
        ctrl.getRoomAssignmentsForExistingAppointment();
      } else {
        $scope.appointment.Data.Provider = null;
        $scope.appointment.Data.UserId = null;
        $scope.appointment.Data.ProviderId = null;
        ctrl.resetRoomAssignments();
      }
      ctrl.checkIfAppointmentHasChanges();
    };

    ctrl.checkPreferredProviders = function () {
      _.forEach($scope.providers, function (provider) {
        provider.highlighted = $scope.isPrefferredProvider(provider);
      });
    };

    // if it is a hygiene appt and the preferred dentist is not selected as the examining dentist, show a message
    ctrl.checkForPreferredNotSelected = function () {
      var isHygieneAppointment =
        $scope.selectedAppointmentType &&
        $scope.selectedAppointmentType.PerformedByProviderTypeId == 2;
      if (isHygieneAppointment) {
        $scope.preferredDentistNotSelected = false;
        if (
          $scope.patient &&
          $scope.patient.PreferredDentist &&
          $scope.appointment.Data.ExaminingDentist
        ) {
          $scope.preferredDentistNotSelected =
            $scope.patient.PreferredDentist !==
            $scope.appointment.Data.ExaminingDentist;
        } else if (
          $scope.newAppt.patient &&
          $scope.newAppt.patient.PreferredDentist &&
          $scope.appointment.Data.ExaminingDentist
        ) {
          $scope.preferredDentistNotSelected =
            $scope.newAppt.patient.PreferredDentist !==
            $scope.appointment.Data.ExaminingDentist;
        }
      }
    };

    ctrl.hasChanges = function (
      changedObject,
      originalObject,
      excludedProperties
    ) {
      var hasChanged = false;
      if (_.isEmpty(excludedProperties)) {
        return _.isEqual(changedObject, originalObject);
      } else {
        var propertiesList = [];
        function mapObjectKeys(objectToMap, parent) {
          _.forOwn(objectToMap, function (value, key) {
            var propName =
              _.isNil(parent) || parent.trim().length === 0
                ? key
                : parent + '.' + key;
            if (_.isArray(value)) {
              if (!_.includes(excludedProperties, propName)) {
                _.forEach(value, function (arrayItem, index) {
                  if (_.isObject(arrayItem)) {
                    mapObjectKeys(arrayItem, propName);
                  }
                });
              }
              propertiesList.push(propName);
            } else if (_.isObject(value) && !_.isEmpty(value)) {
              if (_.includes(excludedProperties, propName)) {
                propertiesList.push(propName);
              } else {
                mapObjectKeys(value, propName);
              }
            } else {
              if (value !== '') {
                propertiesList.push(propName);
              }
            }
          });
        }

        var diffResult = ctrl.diff(changedObject, originalObject);
        if (_.isArray(diffResult)) {
          _.forEach(diffResult, function (diffItem) {
            mapObjectKeys(diffItem);
            var includedProperties = _.difference(
              propertiesList,
              excludedProperties
            );
            if (!_.isEmpty(includedProperties)) {
              hasChanged = true;
            }
            propertiesList = [];
          });
        } else {
          mapObjectKeys(diffResult);
          var includedProperties = _.difference(
            propertiesList,
            excludedProperties
          );
          hasChanged = !_.isEmpty(includedProperties);
        }
      }

      return hasChanged;
    };

    ctrl.diff = function (changedObject, originalObject) {
      function changes(changedObject, originalObject) {
        return _.transform(changedObject, function (result, value, key) {
          if (!_.isEqual(value, originalObject[key])) {
            result[key] =
              _.isObject(value) && _.isObject(originalObject[key])
                ? changes(value, originalObject[key])
                : value;
          }
        });
      }
      return changes(changedObject, originalObject);
    };

    ctrl.sortDate = function (firstDate, secondDate) {
      let fDate = moment.isMoment(firstDate) ? firstDate : moment(firstDate);
      let sDate = moment.isMoment(secondDate) ? secondDate : moment(secondDate);

      if (fDate.isSame(sDate)) {
        return 0;
      }

      return fDate.isBefore(sDate) ? -1 : 1;
    };

    ctrl.minDate = function (dateList) {
      if (_.isArray(dateList) && !_.isEmpty(dateList)) {
        return _.first(dateList.sort(ctrl.sortDate));
      }

      return null;
    };

    ctrl.minDateBy = function (dateList, iteratee) {
      return ctrl.minDate(_.map(dateList, iteratee));
    };

    ctrl.maxDate = function (dateList) {
      if (_.isArray(dateList) && !_.isEmpty(dateList)) {
        return _.last(dateList.sort(ctrl.sortDate));
      }

      return null;
    };

    ctrl.maxDateBy = function (dateList, iteratee) {
      return ctrl.maxDate(_.map(dateList, iteratee));
    };

    ctrl.checkIfAppointmentHasChanges = function () {
      if (!$scope.hasChanges && !$scope.readOnly) {
        let hasChanges = $scope.hasChanges;
        let originalAppointmentExclusions = [
          'Location',
          'OriginalStatus',
          'Status',
          'StatusIcon',
          'Alerts',
          'PlannedServices',
          'Room.Assigned',
        ];
        if (
          ctrl.originalAppointmentData &&
          !_.isEmpty(ctrl.originalAppointmentData.ProviderAppointments)
        ) {
          let firstProviderAppt =
            ctrl.originalAppointmentData.ProviderAppointments[0];
          if (
            firstProviderAppt.UserId === '' &&
            firstProviderAppt.ObjectState === 'Add' &&
            _.isNil(firstProviderAppt.StartTime) &&
            _.isNil(firstProviderAppt.EndTime)
          ) {
            originalAppointmentExclusions.push(
              'ProviderAppointments.StartTime'
            );
            originalAppointmentExclusions.push('ProviderAppointments.EndTime');
          }
        }

        hasChanges = ctrl.hasChanges(
          $scope.appointment.Data,
          ctrl.originalAppointmentData,
          originalAppointmentExclusions
        );
        hasChanges =
          hasChanges ||
          (_.isNil(ctrl.originalAppointmentData.PatientId) &&
            !_.isNil($scope.selectedPatient));
        // a bit of a hack to try and resolve the last regression bug for the release, this is probably not ideal but I am not familiar enough with the schedule code to try something more aggressive - sg
        // trying to keep the discard message from appearing when there are no changes
        if (
          !hasChanges &&
          !_.isEmpty($scope.providerSchedules) &&
          $scope.appointment.Data.ProviderAppointments[0] &&
          $scope.appointment.Data.ProviderAppointments[0].ObjectState !==
          'Add' &&
          $scope.providerSchedules.length !=
          $scope.appointment.Data.ProviderAppointments.length
        ) {
          if ($scope.appointment.Data.ProviderAppointments.length === 1) {
            let providerAppointment =
              $scope.appointment.Data.ProviderAppointments[0];
            let startTimeToUse =
              providerAppointment.originalStartTime &&
                providerAppointment.originalStartTime !=
                providerAppointment.StartTime
                ? providerAppointment.originalStartTime
                : providerAppointment.StartTime;
            let endTimeToUse =
              providerAppointment.originalEndTime &&
                providerAppointment.originalEndTime != providerAppointment.EndTime
                ? providerAppointment.originalEndTime
                : providerAppointment.EndTime;
            let startTime = timeZoneFactory.ConvertDateToMomentTZ(
              startTimeToUse,
              $scope.appointment.Data.Location.Timezone
            );
            let endTime = timeZoneFactory.ConvertDateToMomentTZ(
              endTimeToUse,
              $scope.appointment.Data.Location.Timezone
            );

            if (
              !startTime.isSame(
                ctrl.minDateBy($scope.providerSchedules, 'Start')
              ) ||
              !endTime.isSame(ctrl.maxDateBy($scope.providerSchedules, 'End'))
            ) {
              hasChanges = true;
            }
          } else {
            hasChanges = true;
          }
        }
        hasChanges =
          hasChanges ||
          $scope.providerSchedules.filter(function (item) {
            return typeof item.ProviderAppointmentId == 'undefined';
          }).length > 0;
        if (
          ctrl.originalAppointmentData &&
          ctrl.originalAppointmentData.ObjectState === 'Update'
        ) {
          hasChanges = true;
        }

        $scope.hasChanges = hasChanges;
      }
    };

    ctrl.setRoomAssignedFlag = function () {
      if ($scope.appointment.Data.TreatmentRoomId > '') {
        var room = listHelper.findItemByFieldValue(
          $scope.rooms,
          'RoomId',
          $scope.appointment.Data.TreatmentRoomId
        );
        if (!_.isNil(room)) {
          if (room.Assigned == false) {
            $scope.treatmentRoomAssigned = false;
          } else {
            $scope.treatmentRoomAssigned = true;
          }
        }
      }
    };

    $scope.changedExaminingDentist = function (nv, ov) {
      if (nv != ov || nv === 'any') {
        $scope.appointment.Data.IsExamNeeded =
          nv !== 'noexam' && nv != null && nv != '';
        var user = listHelper.findItemByFieldValue(
          $scope.examiningDentists,
          'UserId',
          nv
        );
        $scope.examiningDentist = {
          UserId: user ? user.UserId : null,
          WithinHours: true,
        };
        ctrl.checkIfAppointmentHasChanges();

        $timeout(function () {
          $scope.getConflicts();
          ctrl.checkForPreferredNotSelected();
        }, 100);
      }
      ctrl.checkForPreferredNotSelected();
    };

    $scope.statusChanged = function (
      appointment,
      autoSave,
      closeModal,
      afterSave,
      updatedAppointments
    ) {
      if (appointment != null) {
        ctrl.afterAppointmentStatusAutoSave = afterSave;

        $scope.returnedAppointments = [];

        // cancel late status timer if they have manually changed the status
        $interval.cancel(ctrl.checkForLateAppointmentsCounter);

        var appt = $.extend(true, $scope.appointment.Data, appointment);
        $scope.returnedAppointment = appt;

        ctrl.checkIfAppointmentHasChanges();

        if (updatedAppointments != null && updatedAppointments.length > 0) {
          $scope.returnedAppointments = updatedAppointments;
        } else {
          $scope.returnedAppointments = [appt];
        }

        if (closeModal == true && autoSave == true) {
          $scope.saveAppointment();
        }
      }
      if (closeModal === true) {
        $scope.closeModal();
      }
    };

    //#endregion

    //#region close / cancel modal methods

    $scope.closeModal = function () {
      $interval.cancel(ctrl.checkForLateAppointmentsCounter);

      $scope.appointment.Saving = false;
      $uibModalInstance.close($scope.returnedAppointment);

      var ele = document.getElementsByName('frmAppointment')[0];
      ele.style.cssText = 'display: none;';

      $uibModalInstance.dismiss();
    };

    $scope.cancelModal = function () {
      $interval.cancel(ctrl.checkForLateAppointmentsCounter);
      $uibModalInstance.dismiss();
    };

    ctrl.cleanupAppointmentDataForCancelModal = function (appointment) {
      if (!appointment) return;

      // delete properties that are not present in ctrl.originalAppointmentData before we compare
      if (
        appointment.ProviderAppointments &&
        !$scope.appointment.Data.AppointmentId
      ) {
        for (var p = 0; p < appointment.ProviderAppointments.length; p++) {
          delete appointment.ProviderAppointments[p].HoursForDay;
          delete appointment.ProviderAppointments[p].WithinHours;
          delete appointment.ProviderAppointments[p].startValid;
          delete appointment.ProviderAppointments[p].endValid;
          delete appointment.ProviderAppointments[p].Valid;
        }
      }

      if (appointment.start) delete appointment.start;
      if (appointment.end) delete appointment.end;
      if (appointment.TreatmentRoomId == null)
        delete appointment.TreatmentRoomId;
      if (appointment.UserId == null) delete appointment.UserId;
      if (
        appointment.ExaminingDentist == '' ||
        appointment.ExaminingDentist == 'any' ||
        appointment.ExaminingDentist == 'noexam'
      )
        appointment.ExaminingDentist = null;
      if (appointment.IsExamNeeded == null) appointment.IsExamNeeded = false;
      if (
        appointment.AppointmentTypeId == '' ||
        appointment.AppointmentTypeId == ctrl.emptyGuid
      )
        appointment.AppointmentType = null;
      if (
        $scope.editing &&
        $scope.appointment.Data.Status == ctrl.appointmentStatuses.Enum.Late &&
        $scope.appointment.Data.OriginalStatus !=
        ctrl.appointmentStatuses.Enum.Late
      ) {
        delete appointment.Status;
        delete appointment.OriginalStatus;
        delete appointment.StatusIcon;
      }
      if (appointment.Location) {
        delete appointment.Location.Rooms;
        delete appointment.Location.tzAbbr;
        delete appointment.tzAbbr;
      }
      return appointment;
    };

    //#endregion

    //#region add to clipboard

    $scope.addToClipboard = function () {
      $scope.appointment.Data.IsPinned = true;

      // if this is a scheduled appointment
      $scope.save(function () {
        // navigate to schedule
        $scope.cancelModal();
        if (fromSchedule) {
          $rootScope.$broadcast('open-clipboard');
        } else {
          $location.path('/Schedule/').search({
            location: $scope.appointment.Data.Location.NameAbbreviation,
          });
        }

        $rootScope.openClipboard = true;
      });
    };

    //#endregion

    //#region cancel / close / confirmation modals

    // close dialog on cancel
    $scope.showCancelModal = function () {
      $scope.hasChanges = false;
      ctrl.checkIfAppointmentHasChanges();
      if ($scope.hasChanges) {
        modalFactory.CancelModal().then($scope.cancelModal);
      } else {
        $scope.cancelModal();
      }
    };

    //#endregion

    //#region confirm modals

    // delete block modal
    $scope.showDeleteBlockModal = function () {
      $scope.deleteClicked = true;
      modalFactory
        .AppointmentDeleteModal($scope.appointment.Data.Classification)
        .then(ctrl.confirmDelete, ctrl.cancelDelete);
    };

    ctrl.confirmDelete = function (reason) {
      if ($scope.appointment.Data.Classification != 1) {
        $scope.appointment.MarkAsDeleted(reason);
      } else {
        $scope.appointment.Delete();
      }
    };

    ctrl.cancelDelete = function () {
      $scope.deleteClicked = false;
    };

    ctrl.confirmRemove = function (appointment) {
      $scope.returnedAppointment = _.cloneDeep(appointment);
      $scope.closeModal();
    };

    ctrl.cancelRemove = function () {
      $scope.removeClicked = false;
    };

    //#endregion

    //#region appointment validation & save, and planned services save

    ctrl.createSimpleAppointmentObject = function () {
      return {
        start: $scope.appointment.Data.start,
        end: $scope.appointment.Data.end,
        StartTime: $scope.appointment.Data.StartTime,
        EndTime: $scope.appointment.Data.EndTime,
        ProviderAppointments: $scope.providerAppointments,
      };
    };

    ctrl.copySimpleAppointmentProperty = function (appointment, propertyName) {
      return appointment[propertyName];
    };

    ctrl.lookupProviderAppointment = function (array, value) {
      return listHelper.findIndexByFieldValue(
        array,
        'ProviderAppointmentId',
        value
      );
    };

    ctrl.mergeProviderAppointmentChanges = function () {
      _.forEach($scope.providerAppointments, function (providerAppointment) {
        var index = ctrl.lookupProviderAppointment(
          $scope.appointment.Data.ProviderAppointments,
          providerAppointment.ProviderAppointmentId
        );

        if (index >= 0) {
          $scope.appointment.Data.ProviderAppointments[index] = _.cloneDeep(
            providerAppointment
          );
        }
      });
    };

    ctrl.recalculateProviderAppointments = function () {
      if (
        $scope.appointmentDate &&
        $scope.appointmentTime &&
        $scope.appointmentTime.start &&
        $scope.appointmentTime.end
      ) {
        ctrl.providerAppointmentOverride = true;
        var simpleAppt = ctrl.createSimpleAppointmentObject();

        scheduleServices.ProviderTime(simpleAppt).Calculate();
        $scope.providerAppointments = ctrl.copySimpleAppointmentProperty(
          simpleAppt,
          'ProviderAppointments'
        );

        $timeout(function () {
          ctrl.providerAppointmentOverride = false;
        }, 100);
      }
    };

    ctrl.setAppointmentDateTime = function (dateObject, timeObject) {
      // Convert time to date and set appointment.Data.StartTime/EndTime
      var date = dateObject ? new Date(dateObject) : null;

      var startWithDate, endWithDate;
      if (timeObject) {
        startWithDate = timeObject.start ? new Date(timeObject.start) : null;
        endWithDate = timeObject.end ? new Date(timeObject.end) : null;
      } else {
        startWithDate =
          $scope.appointment &&
            $scope.appointment.Data &&
            $scope.appointment.Data.start
            ? new Date($scope.appointment.Data.start)
            : null;
        endWithDate =
          $scope.appointment &&
            $scope.appointment.Data &&
            $scope.appointment.Data.end
            ? new Date($scope.appointment.Data.end)
            : null;

        if (startWithDate && endWithDate) {
          $scope.appointmentTime = {
            start: startWithDate,
            end: endWithDate,
            Duration: $scope.appointment.Data.ProposedDuration,
          };
        }
      }

      if (startWithDate) {
        startWithDate.setFullYear(date.getFullYear());
        startWithDate.setMonth(date.getMonth(), date.getDate());
      }

      if (endWithDate) {
        endWithDate.setFullYear(date.getFullYear());
        endWithDate.setMonth(date.getMonth(), date.getDate());
      }

      $scope.appointment.Data.start = startWithDate;
      $scope.appointment.Data.end = endWithDate;

      $scope.appointment.Data.StartTime = startWithDate;
      $scope.appointment.Data.EndTime = endWithDate;
    };

    ctrl.applyProviderSchedules = function (callback) {
      $timeout(function () {
        var hasChanges = $scope.hasChanges;
        if (!_.isNil($scope.appointment.Data.ProviderAppointments)) {
          $scope.appointment.Data.ProviderAppointments = $.grep(
            $scope.appointment.Data.ProviderAppointments,
            function (e) {
              return (
                e.StartTime != null &&
                e.EndTime != null &&
                e.UserId != null &&
                e.UserId != '' &&
                e.Duration > 0 &&
                $scope.editing &&
                !angular.isUndefined(e.ProviderAppointmentId)
              );
            }
          );
        }

        $scope.providerSchedules = $.grep(
          $scope.providerSchedules,
          function (e) {
            return (
              e.Start != null &&
              e.End != null &&
              e.ProviderId != null &&
              e.ProviderId != ''
            );
          }
        );

        if ($scope.providerSchedules && $scope.providerSchedules.length > 0) {
          _.forEach(
            $scope.appointment.Data.ProviderAppointments,
            function (item) {
              item.ObjectState =
                item.ObjectState == saveStates.None ||
                  item.ObjectState == saveStates.Update
                  ? saveStates.Delete
                  : item.ObjectState;
            }
          );

          _.forEach($scope.providerSchedules, function (providerAppointment) {
            var startTime1 = new Date(providerAppointment.Start);
            var endTime1 = new Date(providerAppointment.End);

            var duplicateList = $scope.appointment.Data.ProviderAppointments.filter(
              function (i) {
                var startTime2 = new Date(i.StartTime);
                var endTime2 = new Date(i.EndTime);

                return (
                  startTime1.toISOString() == startTime2.toISOString() &&
                  endTime1.toISOString() == endTime2.toISOString() &&
                  i.ObjectState != saveStates.Add
                );
              }
            );
            if (
              !providerAppointment.ProviderAppointmentId &&
              (duplicateList.length == 0 ||
                (duplicateList.length > 0 && $scope.editing))
            ) {
              ctrl.addProvider(
                _.cloneDeep(providerAppointment.Start),
                _.cloneDeep(providerAppointment.End),
                providerAppointment.ProviderId
              );
            } else if (
              providerAppointment.ProviderAppointmentId &&
              duplicateList.length > 0 &&
              duplicateList[0].UserId != providerAppointment.ProviderId
            ) {
              duplicateList[0].UserId = providerAppointment.ProviderId;
              duplicateList[0].ObjectState = duplicateList[0]
                .ProviderAppointmentId
                ? saveStates.Update
                : saveStates.None;
            } else if (
              duplicateList.length > 0 &&
              providerAppointment.ProviderAppointmentId ==
              duplicateList[0].ProviderAppointmentId
            ) {
              duplicateList[0].ObjectState = saveStates.Update;
            } else if (providerAppointment.ProviderAppointmentId) {
              var provAppt = listHelper.findItemByFieldValue(
                $scope.appointment.Data.ProviderAppointments,
                'ProviderAppointmentId',
                providerAppointment.ProviderAppointmentId
              );
              provAppt.StartTime = providerAppointment.Start.toISOString();
              provAppt.EndTime = providerAppointment.End.toISOString();
              provAppt.ObjectState = saveStates.Update;
            }
          });

          ctrl.initializeAppointmentTimes();
        } else if (
          !$scope.saveClicked &&
          $scope.appointment.Data.ProviderAppointments.length == 0
        ) {
          $scope.appointment.Data.ProviderAppointments = [];
          var selectedProvider = $scope.providers
            ? listHelper.findItemByFieldValue(
              $scope.providers,
              'Selected',
              true
            )
            : null;
          var provId = selectedProvider ? selectedProvider.UserId : null;
          if (!provId) {
            provId =
              $scope.providers && $scope.providers.length > 0
                ? $scope.providers[0].UserId
                : null;
          }
          if (provId) {
            ctrl.addProvider(null, null, provId);
          }
        }
        $timeout(function () {
          $scope.hasChanges = hasChanges;
        });
        if (callback) {
          callback();
        }
      });
    };

    $scope.selectedProvidersAndSelectedTimeSlotMatched = true;
    $scope.save = function (onSaveCallback) {
      $scope.selectedProvidersAndSelectedTimeSlotMatched = true;
      $scope.saveClicked = true;

      ctrl.applyProviderSchedules(function () {
        if (
          $scope.appointment.Data.ExaminingDentist === 'any' ||
          $scope.appointment.Data.ExaminingDentist === 'noexam'
        ) {
          ctrl.cancelExaminingDentistWatch();
          $scope.appointment.Data.ExaminingDentist = null;
          ctrl.cancelExaminingDentistWatch = $scope.$watch(
            'appointment.Data.ExaminingDentist',
            $scope.changedExaminingDentist
          );
        }

        var dateObject, timeObject;
        dateObject = $scope.blockTime.date;
        timeObject = $scope.blockTime;

        if (timeObject) {
          timeObject.Valid =
            timeObject.start != null &&
            moment(timeObject.start).isValid() &&
            timeObject.end != null &&
            moment(timeObject.end).isValid();
        }

        ctrl.setAppointmentDateTime(dateObject, timeObject);

        var providerSchedules = [];
        var providerId = $scope.appointment.Data.UserId
          ? $scope.appointment.Data.UserId
          : $scope.appointment.Data.ProviderId;
        if (providerId) {
          providerSchedules.push({
            ProviderId: providerId,
            End: $scope.appointment.Data.EndTime,
            Start: $scope.appointment.Data.StartTime,
          });
        }

        $scope.appointment.Valid = appointmentViewValidationNewService.validateAppointment(
          $scope.appointment.Data
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
          $scope.appointment.Valid = false;
          $scope.saveClicked = false;
          if (
            $scope.appointment.Data.IsPinned &&
            !ctrl.originalAppointmentData.IsPinned
          ) {
            $scope.appointment.Data.IsPinned = false;
          }
          return;
        } else {
          $scope.appointment.Valid = true;
          $scope.saveAppointment();
        }
      });
    };

    ctrl.populateProvidersForPlannedServices = function (appointment) {
      if (
        appointment != null &&
        appointment.PlannedServices != null &&
        appointment.PlannedServices.length > 0
      ) {
        var plannedServices = appointment.PlannedServices;
        var serviceCode;
        var appointmentType = $scope.selectedAppointmentType;

        for (var i = 0, length = plannedServices.length; i < length; i++) {
          // We will only calculate the provider id if the planned service is 1) new and 2) not already assigned a value
          if (
            plannedServices[i].ObjectState == saveStates.Add &&
            !(plannedServices[i].ProviderUserId > '')
          ) {
            serviceCode = listHelper.findItemByFieldValue(
              $scope.serviceCodes,
              'ServiceCodeId',
              plannedServices[i].ServiceCodeId
            );

            plannedServices[
              i
            ].ProviderUserId = ctrl.getDefaultProviderIdForServiceCode(
              serviceCode,
              appointment,
              appointmentType
            );
          }
        }
      }
    };

    $scope.saveAppointment = function (onSaveCallback) {
      $scope.appointment.Data.PersonId = null;
      $scope.appointment.Data.UserId = $scope.appointment.Data.ProviderId
        ? $scope.appointment.Data.ProviderId
        : null;

      $scope.appointment.Saving = true;

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
        $scope.appointment.Valid = false;
        $scope.saveClicked = false;
        if (
          $scope.appointment.Data.IsPinned &&
          !ctrl.originalAppointmentData.IsPinned
        ) {
          $scope.appointment.Data.IsPinned = false;
        }
        return;
      }
      var data = $scope.appointment.Data;
      var appointmentDto = {
        AppointmentId: _.isNil(data.AppointmentId)
          ? undefined
          : data.AppointmentId,
        Classification: 1,
        StartTime: data.StartTime
          ? timeZoneFactory.ConvertDateToSaveString(
            data.StartTime,
            data.Location.Timezone
          )
          : null,
        EndTime: data.EndTime
          ? timeZoneFactory.ConvertDateToSaveString(
            data.EndTime,
            data.Location.Timezone
          )
          : null,
        ExaminingDentist: null,
        IsExamNeeded: false,
        LocationId: data.LocationId,
        PersonId: null,
        PlannedServices: [],
        ProposedDuration: data.ProposedDuration,
        ProviderAppointments: [],
        Status: 0,
        TreatmentRoomId: data.TreatmentRoomId,
        UserId: data.UserId,
        ActualStartTime: null,
        ActualEndTime: null,
        DataTag: data.DataTag,
        DateModified: data.DateModified,
        Description: data.Description,
        Note: data.Note,
      };

      scheduleBlockModalService
        .saveAppointment(
          appointmentDto,
          ctrl.AfterAppointmentSaved,
          ctrl.AppointmentSaveOnError
        )
        .then(function (response) {
          //Setting the Saving flag to disable or enable buttons if server response fails or succeeds
          $scope.appointment.Saving = scheduleBlockModalService.getSavingFlag();
        });
    };

    ctrl.preventiveCheckConfirm = function () {
      // check for late status and set back to original status
      var appointmentStatus = listHelper.findItemByFieldValue(
        ctrl.appointmentStatuses.List,
        'Value',
        $scope.internalAppointment.Status
      );
      var item = listHelper.findItemByFieldValue(
        ctrl.appointmentStatuses.List,
        'Description',
        'Late'
      );

      if (appointmentStatus && appointmentStatus.Value == item.Value) {
        $scope.internalAppointment.Status =
          $scope.appointment.Data.OriginalStatus;
      }

      $scope.internalAppointment.Save();
    };

    ctrl.preventiveCheckCancel = function () {
      $scope.appointment.Data.StartTime = new Date(
        $scope.appointment.Data.StartTime
      );
      $scope.appointment.Data.EndTime = new Date(
        $scope.appointment.Data.EndTime
      );
      $scope.saveClicked = false;
    };

    ctrl.noteChangedTimer = null;

    $scope.noteChanged = function () {
      $timeout.cancel(ctrl.noteChangedTimer);

      ctrl.noteChangedTimer = $timeout(function () {
        ctrl.checkIfAppointmentHasChanges();
      }, 500);
    };

    ctrl.cleanupCollection = function (saved, original, display, findBy) {
      var result = _.cloneDeep(original);

      // removes provider appointments that were 'Added'
      for (var i = 0; i < result.length; i++) {
        if (angular.isUndefined(result[i][findBy])) {
          result.splice(i, 1);
          i--;
        }
      }

      _.forEach(saved, function (item) {
        if (result.ObjectState != saveStates.Failed) {
          if (item.ObjectState == saveStates.Successful) {
            // if exists in $scope.phones, then we have an update or delete
            var index = listHelper.findIndexByFieldValue(
              result,
              findBy,
              item[findBy]
            );
            if (index != -1) {
              var filteredIndex = listHelper.findIndexByFieldValue(
                display,
                findBy,
                item[findBy]
              );
              if (filteredIndex != -1) {
                // update
                item.ObjectState = saveStates.None;
                result.splice(index, 1, item);
              } else {
                // delete
                result.splice(index, 1);
              }
            } else {
              // add
              item.ObjectState = saveStates.None;
              result.push(item);
            }
          } else if (item.ObjectState == saveStates.Failed) {
            result = _.cloneDeep(original);
            result.ObjectState = saveStates.Failed;
          }
        }
      });

      return result;
    };

    ctrl.AfterAppointmentSaved = function (res) {
      $scope.returnedAppointment = res;

      // manage provider appointments array
      if (
        ctrl.backupProviderAppointments &&
        ctrl.backupProviderAppointments.length > 0
      ) {
        $scope.returnedAppointment.ProviderAppointments = ctrl.cleanupCollection(
          $scope.returnedAppointment.ProviderAppointments,
          ctrl.backupProviderAppointments,
          $scope.providerAppointments,
          'ProviderAppointmentId'
        );
      }

      // manage planned services array
      if (ctrl.backupPlannedServices && ctrl.backupPlannedServices.length > 0) {
        $scope.returnedAppointment.PlannedServices = ctrl.cleanupCollection(
          $scope.returnedAppointment.PlannedServices,
          ctrl.backupPlannedServices,
          $scope.plannedServices,
          'ServiceTransactionId'
        );
        $scope.returnedAppointment.PlannedServices = ctrl.cleanupPlannedServiceCollection(
          $scope.returnedAppointment.PlannedServices,
          ctrl.backupPlannedServices,
          'ServiceTransactionId'
        );
      }

      // fail gracefully
      if (
        $scope.returnedAppointment.ProviderAppointments.ObjectState ==
        saveStates.Failed
      ) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to save the {0}. Please try again.',
            ['Provider Appointments']
          ),
          'Error'
        );
      } else if (
        $scope.returnedAppointment.PlannedServices.ObjectState ==
        saveStates.Failed
      ) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to save the {0}. Please try again.',
            ['Planned Services']
          ),
          'Error'
        );
      } else {
        if (ctrl.afterAppointmentStatusAutoSave != null) {
          ctrl.afterAppointmentStatusAutoSave($scope.returnedAppointment);
        }

        $scope.closeModal();
      }

      ctrl.afterAppointmentStatusAutoSave = null;
      $scope.saveClicked = false;

      // i guess save succeeded; redirect back to the page we came from
      ctrl.RedirectAfterSave();
      $scope.fromUnscheduled = true;
    };

    ctrl.AppointmentSaveOnError = function AppointmentSaveOnError(
      shouldBeNothing
    ) {
      $scope.saveClicked = false;
    };

    ctrl.RedirectAfterSave = function () {
      try {
        let patientPath = '/Patient/';

        if (
          $location.path().contains('/Patient') ||
          $location.path().contains('/Dashboard')
        )
          return;
        switch ($scope.appointment.Data.Classification) {
          case 1:
            break;
          case 2:
            $scope.PreviousLocationRoute = null; // reset our re-direction variable
            var rp = $routeParams;
            if (rp.patient && rp.targetTab) {
              $scope.PreviousLocationRoute =
                _.escape(patientPath) +
                _.escape(rp.patient) +
                '/' +
                _.escape(rp.targetTab);
              $location.path($scope.PreviousLocationRoute);
              return;
            } else if (rp.patient) {
              $scope.PreviousLocationRoute =
                _.escape(patientPath) + _.escape(rp.patient) + '/Overview';
              $location.path($scope.PreviousLocationRoute);
              return;
            }
            break;
          default:
            if (!$location.path().contains('/Schedule'))
              $location.path('/Schedule');
            break;
        }
      } catch (e) { }
    };

    ctrl.cleanupPlannedServiceCollection = function (
      changeList,
      completeList,
      idField
    ) {
      var updatedList = _.cloneDeep(changeList);
      var originalList = _.cloneDeep(completeList);
      var resultingList = [];
      var originalItem = null;

      // Add the unchanged values to the result list
      _.forEach(originalList, function (originalItem) {
        if (originalItem.ObjectState == saveStates.None) {
          originalItem.ObjectState = saveStates.None;
          resultingList.push(originalItem);
        }
      });

      var serviceCode = null;
      _.forEach(updatedList, function (updatedItem) {
        originalItem = listHelper.findItemByFieldValue(
          originalList,
          idField,
          updatedItem[idField]
        );

        // Item was added or updated.
        // If it were unchanged, it would not be in the updated list.
        // If it were delete, it should not be added to the result list.
        if (
          originalItem == null ||
          originalItem.ObjectState == saveStates.Update
        ) {
          updatedItem.ObjectState = saveStates.None;

          serviceCode = listHelper.findItemByFieldValue(
            $scope.appointment.Data.ServiceCodes,
            'ServiceCodeId',
            updatedItem.ServiceCodeId
          );

          if (serviceCode != null) {
            updatedItem.ServiceCodeCode = serviceCode.Code;
            updatedItem.ServiceCodeDescription = serviceCode.Description;
          }

          resultingList.push(updatedItem);
        }
      });

      return resultingList;
    };

    ctrl.BlockDeleteOnSuccess = function () {
      $scope.returnedAppointment = _.cloneDeep($scope.appointment.Data);
      $scope.returnedAppointment.ObjectState = saveStates.Delete;
      $scope.closeModal();
    };

    ctrl.BlockDeleteOnError = function () {
      $scope.deleteClicked = false;
    };

    //#endregion

    //#region initialize appointment and appointment date/time

    //#region start and end time functions

    /** using this function to avoid confusion on initialization for appointmentTime */
    ctrl.reinitializeAppointmentTimes = function () {
      ctrl.initializeAppointmentTimes();
    };

    ctrl.initializeAppointmentDate = function () {
      $scope.dateIsValid = true;
      if ($scope.appointment.Data.StartTime != null) {
        var startTime = angular.isDate($scope.appointment.Data.StartTime)
          ? $scope.appointment.Data.StartTime
          : new Date($scope.appointment.Data.StartTime);
        $scope.appointmentDate = new Date(
          startTime.getFullYear(),
          startTime.getMonth(),
          startTime.getDate(),
          0,
          0,
          0,
          0
        );
      } else {
        $scope.appointmentDate = null;
      }
      $scope.blockDate = _.cloneDeep($scope.appointmentDate);
    };

    ctrl.initializeAppointmentTimes = function () {
      var startTime, endTime;
      $scope.appointmentTime = {
        date:
          $scope.appointmentDate != null
            ? new Date(
              $scope.appointmentDate.getFullYear(),
              $scope.appointmentDate.getMonth(),
              $scope.appointmentDate.getDate(),
              0,
              0,
              0,
              0
            )
            : ctrl.today,
        start: null,
        end: null,
        Valid: true,
      };

      if (
        !$scope.appointment.Data.StartTime ||
        !$scope.appointment.Data.EndTime
      ) {
        ctrl.originalAppointmentTime = _.cloneDeep($scope.appointmentTime);
        ctrl.originalBlockTime = _.cloneDeep($scope.blockTime);
        if (
          $scope.appointment.Data.Classification == 2 &&
          $scope.appointment.Data.ProposedDuration
        )
          $scope.appointmentTime.Duration =
            $scope.appointment.Data.ProposedDuration;
        return;
      }
      $scope.appointment.Data.StartTime.setSeconds(0);
      $scope.appointment.Data.StartTime.setMilliseconds(0);

      startTime = moment($scope.appointment.Data.StartTime);
      $scope.appointmentTime.start = startTime.toISOString();

      $scope.appointment.Data.EndTime.setSeconds(0);
      $scope.appointment.Data.EndTime.setMilliseconds(0);

      endTime = moment($scope.appointment.Data.EndTime);
      $scope.appointmentTime.end = endTime.toISOString();

      $scope.appointmentTime.Duration = appointmentUtilities.getDuration(
        $scope.appointmentTime.start,
        $scope.appointmentTime.end
      );
      $scope.blockTime = _.cloneDeep($scope.appointmentTime);

      var provStartTime, provEndTime;
      var provApptLength = $scope.appointment.Data.ProviderAppointments
        ? $scope.appointment.Data.ProviderAppointments.length
        : 0;
      for (var i = 0; i < provApptLength; i++) {
        provStartTime = new Date(
          $scope.appointment.Data.ProviderAppointments[i].StartTime
        );

        $scope.appointment.Data.ProviderAppointments[i].StartTime = _.cloneDeep(
          provStartTime.toISOString()
        );

        provEndTime = new Date(
          $scope.appointment.Data.ProviderAppointments[i].EndTime
        );

        $scope.appointment.Data.ProviderAppointments[
          i
        ].Duration = appointmentUtilities.getDuration(
          provStartTime,
          provEndTime
        );

        $scope.appointment.Data.ProviderAppointments[i].EndTime = _.cloneDeep(
          provEndTime.toISOString()
        );

        $scope.appointment.Data.ProviderAppointments[i].Valid = true;

        //$scope.appointment.Data.ProviderAppointments[i].ObjectState = $scope.appointment.Data.ProviderAppointments[i].ObjectState != saveStates.Add ? saveStates.None : saveStates.Add;
      }

      ctrl.originalAppointmentTime = _.cloneDeep($scope.appointmentTime);
      ctrl.originalBlockTime = _.cloneDeep($scope.blockTime);
    };

    //#endregion

    // planned services can be pre-selected when appt is created via treatment plan crud, adding them to $scope.plannedServices here
    ctrl.checkForPreselectedServices = function () {
      _.forEach(
        treatmentPlansFactory.AppointmentServices,
        function (plannedService) {
          var serviceCode = _.find(ctrl.serviceCodes, {
            ServiceCodeId: plannedService.ServiceCodeId,
          });
          if (!_.isNil(serviceCode)) {
            $scope.serviceCodes.push(serviceCode);
            $scope.appointment.Data.ServiceCodes.push(serviceCode);
            plannedService.AffectedAreaId = serviceCode.AffectedAreaId;
            plannedService.Code = serviceCode.Code;
            plannedService.DisplayAs = serviceCode.DisplayAs;
            plannedService.ObjectState = saveStates.Update;
            $scope.plannedServices.push(plannedService);
            $scope.appointment.Data.PlannedServices.push(plannedService);
            $scope.appointment.Data.ServiceCodes.push(plannedService);
          } else {
            toastrFactory.error(
              localize.getLocalizedString(
                'There was an error while attempting to retrieve the service code.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        }
      );
    };

    ctrl.initializeAppointmentType = function () {
      if (
        !$scope.appointment.Data.AppointmentId &&
        $scope.appointment.Data.AppointmentTypeId
      ) {
        // bug 279857 Duration is not being changed to match Appointment Type Default Duration value and Appointment is not showing on Schedule after Saving Appointment
        //$scope.appointmentTypeChanges($scope.appointment.Data.AppointmentTypeId, null);
        $scope.selectedAppointmentType = ctrl.lookupAppointmentType(
          $scope.appointment.Data.AppointmentTypeId
        );
        if (!$scope.appointment.Data.WasDragged) {
          ctrl.adjustAppointmentTimeByAppointmentType(
            $scope.selectedAppointmentType
          );
        }
        $scope.appointmentTime.Duration = appointmentUtilities.getDuration(
          $scope.appointmentTime.start,
          $scope.appointmentTime.end
        );
      }
    };

    ctrl.initAppointment = function () {
      var appointment = $scope.appointment;

      appointment.AfterSaveSuccess = ctrl.AfterAppointmentSaved;

      appointment.AfterSaveError = ctrl.AppointmentSaveOnError;

      appointment.AfterDeleteSuccess = ctrl.BlockDeleteOnSuccess;

      appointment.AfterDeleteError = ctrl.BlockDeleteOnError;

      appointment.Data.Classification = angular.isUndefined(
        appointment.Data.Classification
      )
        ? 0
        : appointment.Data.Classification;

      // if appointment doesn't have a collection, default it to add default provider appointment to array
      if (
        !appointment.Data.ProviderAppointments &&
        appointment.Data.Classification != 1
      ) {
        appointment.Data.ProviderAppointments = [
          {
            UserId: modalResolve.existingAppointment.ProviderId
              ? modalResolve.existingAppointment.ProviderId
              : null,
            ObjectState: saveStates.Add,
            StartTime: _.cloneDeep($scope.appointmentTime.start),
            EndTime: _.cloneDeep($scope.appointmentTime.end),
            Duration: appointmentUtilities.getDuration(
              $scope.appointmentTime.start,
              $scope.appointmentTime.end
            ),
            StartDuration: 0,
            EndTimeMaxDuration: $scope.appointmentDuration,
            WithinHours: false,
          },
        ];
      }
      if (
        appointment.Data.ProviderAppointments &&
        appointment.Data.ProviderAppointments.length > 0 &&
        appointment.Data.Classification != 1 &&
        $scope.appointmentTime.start
      ) {
        var defaultProviderAppointment =
          appointment.Data.ProviderAppointments[0];
        var endTime = new Date(defaultProviderAppointment.StartTime);
        endTime.setMinutes(endTime.getMinutes() + $scope.timeIncrement);
        var apptEnd = new Date($scope.appointmentTime.end);
        if (endTime > apptEnd) endTime = apptEnd;
        defaultProviderAppointment.EndTime = endTime.toISOString();
        defaultProviderAppointment.Duration = appointmentUtilities.getDuration(
          defaultProviderAppointment.StartTime,
          defaultProviderAppointment.EndTime
        );
      }

      if (!appointment.Data.PlannedServices) {
        appointment.Data.PlannedServices = [];
      }

      if (!appointment.Data.ServiceCodes) {
        appointment.Data.ServiceCodes = [];
      }

      $scope.providerAppointments = _.cloneDeep(
        appointment.Data.ProviderAppointments
      );
      // Bug 337083 if this is an unschedule appointment, no provider appointments should exist
      if ($scope.appointment.Data.Classification === 2) {
        $scope.providerAppointments = [];
      }
      appointment.Data.PlannedServices = $filter('filter')(
        appointment.Data.PlannedServices,
        function (service) {
          return service.RelatedRecordId === null;
        }
      );
      $scope.plannedServices = _.cloneDeep(appointment.Data.PlannedServices);

      // Attach Service Code active status to plannedServices
      if ($scope.plannedServices && $scope.plannedServices.length > 0) {
        _.forEach($scope.plannedServices, function (service) {
          var serviceCode = _.filter($scope.serviceCodes, function (code) {
            return code.ServiceCodeId == service.ServiceCodeId;
          })[0];
          if (serviceCode) {
            service.IsActive = serviceCode.IsActive;
            service.InactivationDate = serviceCode.InactivationDate;
          }
        });
      }

      if ($scope.plannedServices.length > 0) {
        $scope.needToApplyPropTag = true;
        $scope.applyProposedTag();
      } else {
        $scope.needToApplyPropTag = false;
      }

      ctrl.checkForPreselectedServices();

      var user = listHelper.findItemByFieldValue(
        $scope.examiningDentists,
        'UserId',
        appointment.Data.ExaminingDentist
      );
      $scope.examiningDentist = {
        UserId: user ? user.UserId : null,
        WithinHours: false,
      };

      var providerId =
        $scope.providerAppointments != null &&
          $scope.providerAppointments.length > 0
          ? $scope.providerAppointments[0].UserId
          : appointment.Data.UserId;

      /** if appointment switches to block this will help determine what value needs to be cleared out */
      var hasTreatmentRoom =
        !angular.isUndefined(appointment.Data.TreatmentRoomId) &&
        appointment.Data.TreatmentRoomId != null;
      var hasProvider =
        !angular.isUndefined(appointment.Data.ProviderId) &&
        appointment.Data.ProviderId != null;
      ctrl.scheduleView = hasTreatmentRoom
        ? 'room'
        : hasProvider
          ? 'provider'
          : null;

      // initialize appointmentType changes on new appointment
      ctrl.initializeAppointmentType();
    };

    ctrl.initInternalAppointment = function (onSaveCallback) {
      var appointment = $scope.internalAppointment;

      appointment.AfterSaveSuccess = angular.isFunction(onSaveCallback)
        ? onSaveCallback
        : ctrl.AfterAppointmentSaved;

      appointment.AfterSaveError = ctrl.AppointmentSaveOnError;

      appointment.AfterDeleteSuccess = ctrl.BlockDeleteOnSuccess;

      appointment.AfterDeleteError = ctrl.BlockDeleteOnError;

      appointment.Data.Classification = angular.isUndefined(
        appointment.Data.Classification
      )
        ? 0
        : appointment.Data.Classification;
    };

    //#endregion

    //#region switch to block
    $scope.switchToBlock = function () {
      $scope.backupAppointment = _.cloneDeep($scope.appointment);
      $scope.backupPatient = _.cloneDeep($scope.patient);
      $scope.backupProviderAppointments = _.cloneDeep(
        $scope.providerAppointments
      );
      ctrl.backupProviderSchedules = _.cloneDeep($scope.providerSchedules);
      $scope.backupPlannedServices = _.cloneDeep($scope.plannedServices);
      $scope.backupServices = _.cloneDeep($scope.services);

      $scope.appointment.Name = localize.getLocalizedString('Block');
      $scope.appointment.Data.Classification = 1;
      $scope.patient = null;
      $scope.appointment.Data.PersonId = null;
      $scope.appointment.Data.AppointmentType = null;
      $scope.appointment.Data.AppointmentTypeId = null;
      $scope.appointment.Data.ProposedDuration = null;
      $scope.appointment.Data.UserId = $scope.appointment.Data.UserId
        ? $scope.appointment.Data.UserId
        : $scope.appointment.Data.ProviderId;
      $scope.appointment.Data.UserId =
        !$scope.appointment.Data.UserId &&
          $scope.providerAppointments &&
          $scope.providerAppointments.length > 0
          ? $scope.providerAppointments[0].UserId
          : $scope.appointment.Data.UserId;
      $scope.appointment.Data.ProviderId = $scope.appointment.Data.ProviderId
        ? $scope.appointment.Data.ProviderId
        : $scope.appointment.Data.UserId;
      $scope.blockData.UserId = $scope.appointment.Data.UserId;
      $scope.blockData.TreatmentRoomId =
        $scope.appointment.Data.TreatmentRoomId;
      $scope.appointment.Data.ProviderAppointments = [];
      $scope.providerAppointments = [];
      $scope.providerSchedules = [];
      $scope.plannedServices = [];
      $scope.services = [];
      if ($scope.editing) {
        $scope.blockTime.start = $scope.blockTime.start;
        $scope.blockTime.end = $scope.blockTime.end;
        $scope.blockData.end = null;
      } else {
        if (
          _.isNil($scope.appointment.Data.StarTime) &&
          !_.isNil($scope.appointment.Data.$$BlockStartTime)
        ) {
          $scope.appointment.Data.StartTime =
            $scope.appointment.Data.$$BlockStartTime;
          $scope.appointment.Data.EndTime =
            $scope.appointment.Data.$$BlockEndTime;
        }
        if ($scope.appointment.Data.StartTime != null) {
          $scope.blockTime.date = angular.isDate(
            $scope.appointment.Data.StartTime
          )
            ? $scope.appointment.Data.StartTime
            : new Date($scope.appointment.Data.StartTime);
          $scope.blockTime.start = angular.isDate(
            $scope.appointment.Data.StartTime
          )
            ? $scope.appointment.Data.StartTime.toISOString()
            : $scope.appointment.Data.StartTime;
          $scope.blockTime.end = angular.isDate($scope.appointment.Data.EndTime)
            ? $scope.appointment.Data.EndTime.toISOString()
            : $scope.appointment.Data.EndTime;
          $scope.blockData.end = null;
          $scope.blockTime.Duration = appointmentUtilities.getDuration(
            $scope.blockTime.start,
            $scope.blockTime.end
          );
        } else {
          $scope.blockTime.date = new Date();
          $scope.blockTime.start = _.cloneDeep($scope.blockTime.date);
          $scope.blockTime.start.setHours(12, 0, 0, 0);
          $scope.blockTime.start = $scope.blockTime.start.toISOString();
          $scope.blockTime.end = _.cloneDeep($scope.blockTime.date);
          $scope.blockTime.end.setHours(12, $scope.timeIncrement, 0, 0);
          $scope.blockTime.end = $scope.blockTime.end.toISOString();
          $scope.blockTime.Duration = $scope.timeIncrement;
        }
      }
      if (!ctrl.Initializing) {
        $('.block-modal .modal-dialog').addClass('block');
      }
      if (
        $scope.appointment.Data.Providers &&
        $scope.appointment.Data.Providers.length > 0
      ) {
        $scope.appointment.Data.ProviderId =
          $scope.appointment.Data.Providers[0];
      }

      $timeout(function () {
        angular.element('#inpBlockDescription').focus();
        $scope.isInitializing = false;
        ctrl.reInitializeHasChanges();
      }, 200);
    };

    //#endregion

    //#region switch to appointment

    ctrl.switchToAppointment = function (appointment) {
      var day = appointment.Data.StartTime.getDay();

      $scope.appointment = appointment;
      $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);
      $scope.appointment.Data.Classification = 0;
      $scope.appointment.Data.StartTime.setHours(12, 0, 0, 0);

      $scope.appointment.Data.EndTime = _.cloneDeep(
        $scope.appointment.Data.StartTime
      );
      $scope.appointment.Data.EndTime.setMinutes(
        $scope.appointment.Data.ProposedDuration
      );

      if ($scope.providerAppointments.length > 0) {
        $scope.providerAppointments[0].StartTime = _.cloneDeep(
          $scope.appointment.Data.StartTime
        );
        $scope.providerAppointments[0].EndTime = _.cloneDeep(
          $scope.appointment.Data.EndTime
        );
      }

      $scope.appointment.Data.ProposedDuration = null;
      $scope.appointment.Data.IsPinned = false;

      $scope.appointmentEndTimeLimit = ctrl.getAppointmentEndTimeLimit();

      if (_.isNil($scope.appointmentTime)) {
        $scope.appointmentTime = {};
      }
      $scope.appointmentTime.start = _.cloneDeep(
        $scope.appointment.Data.StartTime
      ).toISOString();
      $scope.appointmentTime.end = _.cloneDeep(
        $scope.appointment.Data.EndTime
      ).toISOString();

      $timeout(function () {
        if ($scope.appointment.Data.UserId) {
          var provider = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            $scope.appointment.Data.UserId
          );
          if (provider) {
            provider.Selected = true;
            $scope.initialProviderSelection = [provider];
            $scope.multipleProviders.selectedProviders = [provider];
          }
        }
        ctrl.reInitializeHasChanges($scope.isInitializing);
        $scope.isInitializing = false;
      }, 200);
    };

    //#endregion

    //#region provider appointments handling

    $scope.updateProvider = function (nv, ov, id) {
      ctrl.providerAppointmentsWatch();

      var index = listHelper.findIndexByFieldValue(
        $scope.appointment.Data.ProviderAppointments,
        'ProviderAppointmentId',
        nv.ProviderAppointmentId
      );

      /** if ProviderTime service doesn't update the times, then this should update it */
      if (!ctrl.providerAppointmentOverride) {
        if (nv.StartTime != ov.StartTime) {
          var duration = appointmentUtilities.getDuration(
            ov.StartTime,
            ov.EndTime
          );
          var newEndTime = new Date(nv.StartTime);
          newEndTime.setMinutes(newEndTime.getMinutes() + duration);
          nv.EndTime = newEndTime.toISOString();
        }

        nv.Duration = appointmentUtilities.getDuration(
          nv.StartTime,
          nv.EndTime
        );
      }

      if (
        nv.ObjectState &&
        nv.ObjectState != saveStates.Add &&
        nv.ObjectState != saveStates.Delete &&
        nv.ObjectState != saveStates.Successful
      ) {
        if (
          nv.StartTime != ov.StartTime ||
          nv.EndTime != ov.EndTime ||
          nv.UserId != ov.UserId
        ) {
          nv.ObjectState = saveStates.Update;
          $scope.appointment.Data.ProviderAppointments[index] = _.cloneDeep(nv);

          $scope.frmAppointment.$dirty = true;
        }
      } else if (nv.ObjectState == saveStates.Add) {
        $scope.appointment.Data.ProviderAppointments[id] = _.cloneDeep(nv);
      } else if (nv.ObjectState == null) {
        nv.ObjectState = saveStates.None;
      }

      ctrl.providerAppointmentsWatch = $scope.$watch(
        'providerAppointments',
        ctrl.providerAppointmentsChanged,
        true
      );
    };

    ctrl.providerAppointmentsChanged = function (nv, ov) {
      // indicates provider dropdown has been loaded
      $scope.providersLoaded = true;
      var ProviderAppointmentDto = function (object) {
        return {
          DataTag: object.DataTag,
          Duration: object.Duration,
          EndTime: object.EndTime,
          ObjectState: object.ObjectState,
          ProviderAppointmentId: object.ProviderAppointmentId,
          StartTime: object.StartTime,
          UserId: object.UserId,
        };
      };

      // we only need to update if the arrays are the same length, otherwise it's a delete
      if (nv && ov && nv.length == ov.length) {
        for (var i = 0; i < nv.length; i++) {
          if (
            !angular.equals(
              ProviderAppointmentDto(nv[i]),
              ProviderAppointmentDto(ov[i])
            ) &&
            !ctrl.Initializing
          ) {
            $scope.updateProvider(nv[i], ov[i], i);
            ctrl.validateProviderAppointmentTime(nv[i]);
            ctrl.checkIfAppointmentHasChanges();
          }
        }
      }
    };

    ctrl.addProvider = function (startTime, endTime, userId) {
      var provAppt = {
        UserId: userId, //null,
        ObjectState: saveStates.Add,
        StartTime: _.cloneDeep(startTime), //_.cloneDeep($scope.appointmentTime.start),
        EndTime: _.cloneDeep(endTime), //_.cloneDeep($scope.appointmentTime.end),
      };

      provAppt.Duration = appointmentUtilities.getDuration(startTime, endTime);

      $scope.appointment.Data.ProviderAppointments.push(provAppt);

      if (!$scope.providerAppointments) {
        $scope.providerAppointments = [];
      }

      $scope.providerAppointments.push(provAppt);
    };

    $scope.removeProvider = function (index) {
      var saveState =
        $scope.appointment.Data.ProviderAppointments[index].ObjectState;

      if (saveState && saveState != saveStates.Add) {
        $scope.appointment.Data.ProviderAppointments[index].ObjectState =
          saveState == saveStates.None || saveState == saveStates.Update
            ? saveStates.Delete
            : saveState;
      } else {
        $scope.appointment.Data.ProviderAppointments.splice(index, 1);
      }

      $scope.providerAppointments.splice(index, 1);
      $scope.frmAppointment.$dirty = true;
    };

    $scope.deleteProvider = function (index, providerId) {
      $scope.multipleProviders.selectedProviders = $.grep(
        $scope.multipleProviders.selectedProviders,
        function (e) {
          return e.UserId != providerId;
        }
      );

      _.forEach($scope.providers, function (p) {
        if (p.UserId == providerId) {
          p.Selected = false;
        }
      });

      $scope.providerSchedules = $.grep($scope.providerSchedules, function (e) {
        return e.ProviderId != providerId;
      });

      $scope.appointment.Data.ProviderAppointments = $.grep(
        $scope.appointment.Data.ProviderAppointments,
        function (e) {
          return e.ProviderId != providerId;
        }
      );

      ctrl.checkIfAppointmentHasChanges();
    };

    ctrl.changeFirstProvidersTime = function () {
      if (
        !_.isEmpty($scope.providerAppointments) &&
        $scope.providerAppointments[0].EndTime !=
        ctrl.oldAppointmentTimeByAppointmentType
      ) {
        return;
      } else {
        $timeout(function () {
          if (!_.isEmpty($scope.providerAppointments)) {
            $scope.providerAppointments[0].EndTime = _.cloneDeep(
              $scope.appointmentTime.end
            );
          }
        }, 0);
      }
    };

    //#endregion

    $scope.newAppt = { patient: null };

    //#endregion

    // #region Provider/Room Assignments
    // NOTE can this be moved to factory?

    ctrl.getRoomAssignmentsForProvider = function (
      locationId,
      providerId,
      startTime,
      endTime
    ) {
      ctrl.getRoomAssignments(
        locationId,
        providerId,
        null,
        startTime,
        endTime,
        ctrl.getRoomAssignmentsForProviderSuccess
      );
    };

    ctrl.getRoomAssignmentsForProviderNoRoomChange = function (
      locationId,
      providerId,
      startTime,
      endTime
    ) {
      ctrl.getRoomAssignments(
        locationId,
        providerId,
        null,
        startTime,
        endTime,
        ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess
      );
    };

    ctrl.getRoomAssignmentsForRoom = function (
      locationId,
      roomId,
      startTime,
      endTime
    ) {
      ctrl.getRoomAssignments(
        locationId,
        null,
        roomId,
        startTime,
        endTime,
        ctrl.getRoomAssignmentForRoomSuccess
      );
    };

    ctrl.getRoomAssignments = function (
      locationId,
      providerId,
      roomId,
      startTime,
      endTime,
      onSuccess
    ) {
      if (startTime && endTime) {
        providerRoomOccurrenceFactory
          .get(
            providerId,
            locationId,
            roomId,
            moment(startTime).format('YYYY-MM-DD')
          )
          .then(function (res) {
            var occurrences = res.Value;
            ctrl.getRoomAssignmentsSuccess(
              occurrences,
              onSuccess,
              startTime,
              endTime
            );
          });
      }
    };

    ctrl.getRoomAssignmentsSuccess = function (
      occurrences,
      onSuccess,
      startTime,
      endTime
    ) {
      var list = [];
      if ($scope.selectedLocation) {
        _.forEach(occurrences, function (occ) {
          if (
            startTime >=
            timeZoneFactory.ConvertDateTZ(
              occ.StartTime,
              $scope.selectedLocation.Timezone
            ) &&
            endTime <=
            timeZoneFactory.ConvertDateTZ(
              occ.EndTime,
              $scope.selectedLocation.Timezone
            )
          ) {
            if (occ.LunchStartTime && occ.LunchEndTime) {
              if (
                endTime <=
                timeZoneFactory.ConvertDateTZ(
                  occ.LunchStartTime,
                  $scope.selectedLocation.Timezone
                ) ||
                startTime >=
                timeZoneFactory.ConvertDateTZ(
                  occ.LunchEndTime,
                  $scope.selectedLocation.Timezone
                )
              ) {
                list.push(occ);
              }
            } else {
              list.push(occ);
            }
          }
        });
      }
      var result = { Value: list };
      onSuccess(result);
    };

    ctrl.getRoomAssignmentsForExistingAppointment = function () {
      var isBlock = $scope.appointment.Data.Classification == 1;
      var locationId = ctrl.location != null ? ctrl.location.LocationId : null;

      var providerId = isBlock
        ? $scope.appointment.Data.UserId
        : $scope.multipleProviders != null &&
          $scope.multipleProviders.selectedProviders != null &&
          $scope.multipleProviders.selectedProviders.length > 0
          ? $scope.multipleProviders.selectedProviders[0].UserId
          : null;

      // Kendo will clear TreatmentRoomId after a sort, so we set it back to the original value if this occurs before our timeout.
      if (ctrl.sortingRooms) {
        $scope.appointment.Data.TreatmentRoomId =
          $scope.selectedTreatmentRoomId;
      }

      var roomId =
        $scope.appointment.Data.TreatmentRoomId > ''
          ? $scope.appointment.Data.TreatmentRoomId
          : null;

      var startTime = $scope.appointment.Data.StartTime;

      var endTime = $scope.appointment.Data.EndTime;

      if (providerId > '' && roomId > '') {
        ctrl.getRoomAssignmentsForProviderNoRoomChange(
          locationId,
          providerId,
          startTime,
          endTime
        );
      } else if (providerId > '') {
        ctrl.getRoomAssignmentsForProvider(
          locationId,
          providerId,
          startTime,
          endTime
        );
      } else if (roomId > '') {
        ctrl.getRoomAssignmentsForRoom(locationId, roomId, startTime, endTime);
      }
    };

    ctrl.getRoomAssignmentsWhenDateTimeChanged = function () {
      if ($scope.appointment.Data.Classification != 1) {
        var providerId = ctrl.getProviderIdFromAppointment();

        if (providerId > '') {
          var date = $scope.appointmentDate
            ? new Date($scope.appointmentDate)
            : null;

          var startWithDate = $scope.appointmentTime.start
            ? new Date($scope.appointmentTime.start)
            : null;

          if (startWithDate && date) {
            startWithDate.setFullYear(date.getFullYear());
            startWithDate.setMonth(date.getMonth(), date.getDate());
          }

          var endWithDate = $scope.appointmentTime.end
            ? new Date($scope.appointmentTime.end)
            : null;

          if (endWithDate && date) {
            endWithDate.setFullYear(date.getFullYear());
            endWithDate.setMonth(date.getMonth(), date.getDate());
          }

          ctrl.getRoomAssignmentsForProviderNoRoomChange(
            ctrl.location.LocationId,
            providerId,
            startWithDate,
            endWithDate
          );
        }
      }
    };

    ctrl.getRoomAssignmentsForProviderSuccess = function (result) {
      if ($routeParams.view != 'room') {
        var earliestDate = null;
        var treatmentRoomId = null;

        _.forEach(result.Value, function (assignment) {
          if (earliestDate == null || earliestDate > assignment.StartTime) {
            earliestDate = assignment.StartTime;
            treatmentRoomId = assignment.RoomId;
          }
        });

        $timeout(function () {
          if (
            $scope.appointment.Data.Classification != 1 &&
            treatmentRoomId != null
          ) {
            $scope.appointment.Data.Room = listHelper.findItemByFieldValue(
              $scope.rooms,
              'RoomId',
              treatmentRoomId
            );
            $scope.appointment.Data.TreatmentRoomId = treatmentRoomId;
          } else if (
            $scope.appointment.Data.Classification === 1 &&
            $scope.selectedTreatmentRoomId != null
          ) {
            $scope.appointment.Data.TreatmentRoomId =
              $scope.selectedTreatmentRoomId;
          }
          $scope.$apply();
        });
      }

      ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess(result);
    };

    // this property holds the selected treatment plan id while list is sorted due to kendo issue from below
    $scope.selectedTreatmentRoomId = null;
    ctrl.sortingRooms = false;
    // may not be used any more ... check whenever
    ctrl.sortRooms = function () {
      if (
        $scope.appointment &&
        $scope.appointment.Data &&
        $scope.appointment.Data.TreatmentRoomId
      ) {
        $scope.selectedTreatmentRoomId =
          $scope.appointment.Data.TreatmentRoomId;
      }
      ctrl.sortingRooms = true;
      $scope.rooms = _.orderBy($scope.rooms, 'Name');
    };

    ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess = function (result) {
      ctrl.resetRoomAssignments();

      _.forEach(result.Value, function (assignment) {
        ctrl.markRoomAsAssigned(assignment.RoomId);
      });

      ctrl.setRoomAssignedFlag();
    };

    ctrl.getRoomAssignmentForRoomSuccess = function (result) {
      var earliestDate = null;
      var userId = null;

      _.forEach(result.Value, function (assignment) {
        if (earliestDate == null || earliestDate > assignment.StartTime) {
          earliestDate = assignment.StartTime;
          userId = assignment.UserId;
        }
      });

      if (!$scope.editing && userId) {
        $scope.appointment.Data.UserId = userId;
        if (
          $scope.appointment.Data.ProviderAppointments &&
          $scope.appointment.Data.ProviderAppointments.length != 0
        ) {
          $scope.appointment.Data.ProviderAppointments[0].UserId = userId;
          $scope.providerAppointments[0].UserId = userId;
        }
        $scope.appointment.Data.Provider = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          userId
        );
      }

      ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess(result);

      ctrl.getRoomAssignmentsForProviderNoRoomChange(
        ctrl.location.LocationId,
        userId,
        $scope.appointment.Data.StartTime,
        $scope.appointment.Data.EndTime
      );
    };

    ctrl.resetRoomAssignments = function () {
      _.forEach($scope.rooms, function (room) {
        room.Assigned = false;
      });
    };

    ctrl.markRoomAsAssigned = function (roomId) {
      var room = listHelper.findItemByFieldValue(
        $scope.rooms,
        'RoomId',
        roomId
      );

      if (room != null) {
        room.Assigned = true;
      }
    };

    // TODO this should be refactored to prevent multiple digests for value which doesn't change often
    $scope.roomIsAssigned = function (room) {
      //debugger;
      // We look up the room in the list because kendo makes a copy of the list, which may not be updated.
      return (
        listHelper.findItemByFieldValue($scope.rooms, 'RoomId', room.RoomId)
          .Assigned == true
      );
    };

    // #endregion

    ctrl.resetLastUsedProviderCheck = function () {
      $timeout.cancel(ctrl.lastUsedProviderTimeout);
      ctrl.lastUsedProviderTimeout = $timeout(function () {
        ctrl.lastProviderChecked = null;
      }, 3000);
    };

    // $scope.appointmentTime changed event
    ctrl.appointmentTimeChanged = function (newTime, oldTime) {
      // only need to proceed on one of these 3 conditions
      if (
        (newTime && _.isNil(oldTime)) ||
        (newTime && newTime.start != oldTime.start) ||
        (newTime && newTime.end != oldTime.end)
      ) {
        $scope.hasChanges = false;
        //ctrl.cancelAppointmentTimeWatch();
        ctrl.providerAppointmentsWatch();

        if (
          !_.isNil(oldTime) &&
          !_.isEqual(newTime.start, oldTime.start) &&
          oldTime.Duration >= 0
        ) {
          var newEnd = moment(newTime.start);

          newEnd.add(oldTime.Duration, 'm');

          newTime.end = newEnd.toISOString();
          newTime.Duration = oldTime.Duration;
        } else if (
          (_.isNil(oldTime) ||
            (newTime.end != oldTime.end && newTime.end != null)) &&
          newTime.end != 'Invalid date'
        ) {
          newTime.Duration = newTime.start
            ? appointmentUtilities.getDuration(newTime.start, newTime.end)
            : newTime.Duration;
          // only set duration if Classification is 2 (Unscheduled)
          // NOTE, this will be changed in the future but for now domain validation will cause this to fail on other classifications
          if ($scope.appointment.Data.Classification === 2) {
            $scope.appointment.Data.ProposedDuration = parseInt(
              newTime.Duration
            );
          }
        } else if (
          $scope.appointment.Data.Classification == 2 &&
          newTime.start == null &&
          oldTime.start == null &&
          newTime.Duration != oldTime.Duration
        ) {
          $scope.appointment.Data.ProposedDuration = parseInt(newTime.Duration);
        }
        // force update of provider schedules
        ctrl.setAppointmentDateTime(
          $scope.appointmentDate,
          $scope.appointmentTime
        );

        ctrl.getRoomAssignmentsWhenDateTimeChanged();

        ctrl.providerAppointmentsWatch = $scope.$watch(
          'providerAppointments',
          ctrl.providerAppointmentsChanged,
          true
        );
        ctrl.checkIfAppointmentHasChanges();
      }
    };

    ctrl.getProviderIdFromAppointment = function () {
      return $scope.providerSchedules != null &&
        $scope.providerSchedules.length > 0
        ? $scope.providerSchedules[0].ProviderId
        : null;
    };

    ctrl.blockTimeChanged = function (newTime, oldTime) {
      if (!newTime || !oldTime) return;
      // only need to proceed on one of these 3 conditions
      if (
        (newTime &&
          newTime.start != oldTime.start &&
          $scope.appointment.Data.Classification == 1) ||
        (newTime &&
          newTime.end != oldTime.end &&
          $scope.appointment.Data.Classification == 1)
      ) {
        //if (newTime && newTime != oldTime && $scope.appointment.Data.Classification == 1) {
        ctrl.cancelBlockTimeWatch();
        var startNewISOString =
          typeof newTime.start === 'string'
            ? newTime.start
            : newTime.start.toISOString();
        var endNewISOString =
          typeof newTime.end === 'string'
            ? newTime.end
            : newTime.end.toISOString();
        var startOldISOString = null;
        var endOldISOString = null;
        if (oldTime && oldTime.start) {
          startOldISOString =
            typeof oldTime.start === 'string'
              ? oldTime.start
              : oldTime.start.toISOString();
          endOldISOString =
            typeof oldTime.end === 'string'
              ? oldTime.end
              : oldTime.end.toISOString();
        }

        var newEnd;

        if (startNewISOString != startOldISOString && oldTime.Duration >= 0) {
          newEnd = moment(newTime.start);

          newEnd.add(oldTime.Duration, 'm');

          newTime.end = newEnd.toISOString();
          newTime.Duration = oldTime.Duration;
        } else if (endNewISOString != endOldISOString) {
          newTime.Duration = appointmentUtilities.getDuration(
            newTime.start,
            newTime.end
          );
        }

        ctrl.validateBlockTime(newTime);
        if (newTime.Valid && newTime.date) {
          ctrl.setAppointmentDateTime(newTime.date, newTime);
        }
        ctrl.cancelBlockTimeWatch = $scope.$watch(
          'blockTime',
          ctrl.blockTimeChanged,
          true
        );
        ctrl.getRoomAssignmentsForExistingAppointment();
        $scope.timezoneInfo = timeZoneFactory.GetTimeZoneInfo(
          $scope.selectedLocation.Timezone,
          $scope.appointment.Data.StartTime
        );
        // get conflicts when block time changes
        $scope.getConflicts();
      }
    };

    ctrl.validateProviderAppointmentTime = function (providerAppointment) {
      if (providerAppointment.StartTime > '') {
        var startMoment = moment(providerAppointment.StartTime);

        providerAppointment.startValid =
          startMoment.isValid() &&
          providerAppointment.StartTime >=
          $scope.appointment.Data.StartTime.toISOString() &&
          providerAppointment.StartTime < providerAppointment.EndTime;
      } else {
        providerAppointment.startValid = false;
      }

      if (providerAppointment.EndTime > '') {
        var endMoment = moment(providerAppointment.EndTime);

        providerAppointment.endValid =
          endMoment.isValid() &&
          providerAppointment.EndTime <=
          $scope.appointment.Data.EndTime.toISOString() &&
          providerAppointment.StartTime < providerAppointment.EndTime;
      } else {
        providerAppointment.endValid = false;
      }

      providerAppointment.Valid =
        providerAppointment.startValid && providerAppointment.endValid;
    };

    ctrl.validateBlockTime = function (blockTime) {
      if (blockTime) {
        var startMoment = moment(blockTime.start);
        var endMoment = moment(blockTime.end);
        blockTime.Valid =
          startMoment.isValid() &&
          endMoment.isValid() &&
          startMoment.toDate() < endMoment.toDate();
      }
    };

    ctrl.getAppointmentStatusIcon = function (statusId) {
      var appointmentStatus = listHelper.findItemByFieldValue(
        ctrl.appointmentStatuses.List,
        'Value',
        statusId
      );
      return appointmentStatus ? appointmentStatus.Icon : '';
    };

    ctrl.onProviderSchedulesChanged = function (nv, ov) {
      if (nv !== ov) {
        ctrl.checkIfAppointmentHasChanges();
      }
    };

    $scope.treatmentRoomDefined = function (nv) {
      if ((nv && angular.isUndefined(nv)) || nv == '') {
        ctrl.getRoomAssignmentsForExistingAppointment();
      } else {
        $scope.treatmentRoomAssigned = true;
      }
    };

    $scope.checkForPatient = function (nv) {
      if (!nv || angular.isUndefined(nv) || nv == '') {
        $scope.patientSelected = false;
        // reset patient so that appointmentStatus is disabled
        $scope.appointment.Data.Patient = null;
        $scope.disableStatusSelector = true;
      } else {
        $scope.patientSelected = true;
        $scope.disableStatusSelector = false;
      }
    };

    $scope.initialize = function () {
      ctrl.today = new Date();
      ctrl.today.setHours(0);
      ctrl.today.setMinutes(0);
      ctrl.today.setSeconds(0);
      ctrl.today.setMilliseconds(0);

      $scope.isInitializing = true;
      $scope.outsideRoomAssignmentTime = false;
      $scope.backupAppointment = null;
      $scope.backupPatient = null;
      $scope.backupProviderAppointments = null;
      $scope.backupPlannedServices = null;
      $scope.backupServices = null;
      $scope.providerSchedules = $scope.providerSchedules
        ? $scope.providerSchedules
        : [];
      $scope.blockDate = new Date();
      $scope.blockTime = $scope.blockTime
        ? $scope.blockTime
        : _.cloneDeep($scope.appointmentTime);
      var beginTime = new Date($scope.blockTime.start);
      beginTime.setHours(0, 0, 0, 0);
      var endTime = _.cloneDeep(beginTime);
      endTime.setHours(23, 50, 0, 0);

      $scope.blockData = {
        UserId: '',
        TreatmentRoomId: '',
        begin: beginTime.toISOString(),
        end: endTime.toISOString(),
      };
      if ($scope.appointment.Data) {
        $scope.blockData.UserId = $scope.appointment.Data.UserId;
        $scope.blockData.TreatmentRoomId =
          $scope.appointment.Data.TreatmentRoomId;
        $scope.appointment.Data.ProviderId = $scope.appointment.Data.UserId;
      }

      if ($scope.appointment.Data.$$preventiveServiceAppt) {
        //$scope.getPreventiveCareInfo();
      } else {
        $scope.showTabset = false;
        $scope.activeApptTab = 2;
      }
      $scope.previousLocation = $scope.dropDownLocation;
      $rootScope.$broadcast('soar:refresh-most-recent');
    };

    $scope.appointment = boundObjectFactory.Create(
      scheduleServices.Dtos.Appointment
    );

    if ($scope.appointment) {
      $scope.appointment.MarkAsDeleted = function (reason) {
        scheduleServices.SoftDelete.Appointment({
          AppointmentId: $scope.appointment.Data.AppointmentId,
          IsDeleted: true,
          DeletedReason: reason != null ? reason : '',
        });
      };
    } else {
      $scope.appointment = {};
      $scope.appointment.Data = {};
      $scope.appointment.Data.AppointmentTypeId = null;
    }

    $scope.startAppointment = function () {
      $scope.appointment.Data.Status =
        ctrl.appointmentStatuses.Enum.InTreatment;
      if (angular.isDefined($scope.appointment.Data.originalStart)) {
        timeZoneFactory.ResetAppointmentDates($scope.appointment.Data);
      }
      $scope.saveClicked = true;
      scheduleServices.UpdateAndStart.Appointment(
        $scope.appointment.Data,
        $scope.afterBeginSuccess,
        $scope.afterBeginFailed
      );
    };

    $scope.$watch('patient', $scope.checkForPatient);
    $scope.$watch(
      'appointment.Data.TreatmentRoomId',
      $scope.treatmentRoomDefined
    );
    $scope.$watch(
      'appointment.Data.AppointmentTypeId',
      $scope.appointmentTypeChanged
    );
    $scope.$watch(
      'appointment.Data.ProposedDuration',
      $scope.appointmentDurationChanged
    );
    $scope.$watch(
      'appointment.Data.Description',
      $scope.appointmentDataChanged
    );
    $scope.$watch('appointment.Data.Note', $scope.appointmentDataChanged);
    ctrl.cancelExaminingDentistWatch = $scope.$watch(
      'appointment.Data.ExaminingDentist',
      $scope.changedExaminingDentist
    );
    $scope.$watch('appointmentDate', $scope.appointmentDateChanged);

    ctrl.cancelAppointmentTimeWatch = $scope.$watch(
      'appointmentTime',
      ctrl.appointmentTimeChanged,
      true
    );

    // watches provider appointments for any changes\
    ctrl.providerAppointmentsWatch = $scope.$watch(
      'providerAppointments',
      ctrl.providerAppointmentsChanged,
      true
    );
    ctrl.providerSchedulesWatch = $scope.$watchCollection(
      'providerSchedules',
      ctrl.onProviderSchedulesChanged
    );
    ctrl.cancelBlockTimeWatch = $scope.$watch(
      'blockTime',
      ctrl.blockTimeChanged,
      true
    );

    $scope.$watch(
      'blockStartTimeDuration',
      $scope.blockStartTimeDurationChanged
    );

    $scope.appointment.Data = modalResolve.existingAppointment
      ? _.cloneDeep(modalResolve.existingAppointment)
      : $scope.appointment.Data;

    if (
      $scope.appointment.Data.UserId != '' &&
      $scope.appointment.Data.Classification == 2 &&
      $scope.editing
    ) {
      $scope.appointment.Data.ProviderId = $scope.appointment.Data.UserId;
    } else if (
      $scope.appointment.Data.Patient &&
      $scope.appointment.Data.Patient.PreferredDentist &&
      $scope.appointment.Data.Classification == 2 &&
      !$scope.editing
    ) {
      $scope.appointment.Data.UserId =
        $scope.appointment.Data.Patient.PreferredDentist;
      $scope.appointment.Data.ProviderId =
        $scope.appointment.Data.Patient.PreferredDentist;
    }

    if (!$scope.appointment.Data.ProviderAppointments) {
      $scope.appointment.Data.ProviderAppointments = [];
    } else {
      _.forEach(
        $scope.appointment.Data.ProviderAppointments,
        function (providerAppointment) {
          if (
            providerAppointment.StartTime &&
            typeof providerAppointment.StartTime == 'string' &&
            !providerAppointment.StartTime.toString()
              .toUpperCase()
              .endsWith('Z')
          ) {
            providerAppointment.StartTime += 'Z';
          }
          if (
            providerAppointment.EndTime &&
            typeof providerAppointment.EndTime == 'string' &&
            !providerAppointment.EndTime.toString().toUpperCase().endsWith('Z')
          ) {
            providerAppointment.EndTime += 'Z';
          }
        }
      );
    }

    if ($scope.editing) {
      timeZoneFactory.ConvertAppointmentDatesTZ($scope.appointment.Data);
    }

    $scope.isPatientReadOnly =
      ($location.path().contains('/Patient') &&
        $scope.appointment.Data.Patient) ||
      ($location.path().contains('/Schedule') && $routeParams.patient);

    if (
      (!$scope.appointment.Data.Patient &&
        (!$scope.appointment.Data.PersonId ||
          $scope.appointment.Data.PersonId == '' ||
          $scope.appointment.Data.PersonId == ctrl.emptyGuid)) ||
      (!$scope.appointment.Data.Patient &&
        $scope.appointment.Data &&
        $scope.appointment.Data.PersonId !== ctrl.emptyGuid)
    ) {
      if (
        !$scope.appointment.Data.Patient &&
        $scope.appointment.Data &&
        $scope.appointment.Data.PersonId !== ctrl.emptyGuid
      ) {
        var storedPatient = patientLogic.GetStoredPatient(true);
        $scope.newAppt.patient =
          storedPatient &&
            storedPatient.PatientId == $scope.appointment.Data.PersonId
            ? storedPatient
            : $scope.patient;
      }
      $scope.$watch('newAppt.patient', $scope.onPatientChange, true);
      $scope.patient = $scope.newAppt.patient;
    }
    $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);

    ctrl.resetRoomAssignments();

    if (modalResolve.existingAppointment) {
      $scope.patient = modalResolve.patient ? modalResolve.patient.Value : null;

      $scope.alerts = modalResolve.existingAppointment.Alerts
        ? modalResolve.existingAppointment.Alerts
        : [];
      $scope.contactInfo = modalResolve.existingAppointment.ContactInfo
        ? modalResolve.existingAppointment.ContactInfo
        : null;
      $scope.serviceCodes = modalResolve.existingAppointment.ServiceCodes
        ? modalResolve.existingAppointment.ServiceCodes
        : [];
    }

    $scope.locationName =
      ctrl.location != null ? ctrl.location.NameAbbreviation : '';

    ctrl.checkPreferred = function () {
      _.forEach($scope.providers, function (provider) {
        provider.highlighted = $scope.isPrefferredProvider(provider);
      });
    };

    $scope.onSelectedServiceProviderChange = function (service) {
      if (!_.isNil(service)) {
        if (
          service.ObjectState === saveStates.None &&
          !_.isEmpty(service.originalProvider) &&
          !_.isEmpty(service.ProviderUserId) &&
          service.ProviderUserId !== service.originalProvider
        ) {
          service.ObjectState = saveStates.Update;
        } else if (_.isNil(service.originalProvider)) {
          service.originalProvider = service.ProviderUserId;
        }
      }
    };

    // Passed in list is derived from filtered list on schedule,
    // if location is changed this may not match the new location
    // so we need to refresh the list and only show providers for this location
    ctrl.loadScheduleProviders = function (providersByLocation, locationId) {
      $scope.providers = [];
      var locationProviders = [];
      if (!_.isNil(location)) {
        //filter this list by the selectedLocation LocationId / ShowOnSchedule
        _.forEach(providersByLocation, function (newProvider) {
          if (
            newProvider.ShowOnSchedule === true &&
            parseInt(newProvider.LocationId) === parseInt(locationId)
          ) {
            newProvider.Name = newProvider.FullName;
            locationProviders.push(newProvider);
          }
        });
      }
      ctrl.setProviders(locationProviders);
    };
    ctrl.setProviders = function (newProviders) {
      ctrl.fullProviderList = _.cloneDeep(newProviders);
      $scope.providers = _.cloneDeep(newProviders);
    };

    $scope.symbolList = staticData.AlertIcons();

    $scope.appointmentSaveState = $scope.editing
      ? saveStates.Update
      : saveStates.Add;

    ctrl.getAppointmentEndTimeLimit = function () {
      var midnight = new Date($scope.appointmentDate);
      midnight.setHours(23, 59, 59, 59);

      return midnight;
    };

    $scope.appointmentEndTimeLimit = ctrl.getAppointmentEndTimeLimit();

    /** These lines ensure that the cancel modal only appears when changes have been made. */
    $scope.appointment.Data.AppointmentTypeId = $scope.appointment.Data
      .AppointmentTypeId
      ? $scope.appointment.Data.AppointmentTypeId
      : '';
    $scope.appointment.Data.PersonId = $scope.appointment.Data.PersonId
      ? $scope.appointment.Data.PersonId
      : '';

    $scope.selectedAppointmentType = ctrl.lookupAppointmentType(
      $scope.appointment.Data.AppointmentTypeId
    );

    ctrl.providerAppointmentOverride = false;

    $scope.appointmentDate = $scope.appointmentDate
      ? $scope.appointmentDate
      : null;
    $scope.blockDate = $scope.blockDate ? $scope.blockDate : null;

    ctrl.originalAppointmentData = _.cloneDeep($scope.appointment.Data);
    ctrl.originalAppointmentDate = _.cloneDeep($scope.appointmentDate);
    ctrl.originalBlockDate = _.cloneDeep($scope.blockDate);

    ctrl.originalAppointmentData.AppointmentTypeId = ctrl
      .originalAppointmentData.AppointmentTypeId
      ? ctrl.originalAppointmentData.AppointmentTypeId
      : '';
    ctrl.originalAppointmentData.PersonId = ctrl.originalAppointmentData
      .PersonId
      ? ctrl.originalAppointmentData.PersonId
      : '';

    $scope.plannedServicesChanged = false;

    // modify valueTemplate to show inactive users in grey italics
    $scope.valueTemplate = kendo.template(
      '<div id="valueTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ' +
      "ng-style=\"{'color': dataItem.IsActive === true ? 'black' : 'lightgrey', 'font-style': dataItem.IsActive===true ? 'normal' : 'italic' }\">#: Name #</span>" +
      '</div>'
    );

    $scope.roomTemplate = kendo.template(
      '<div id="roomTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': roomIsAssigned(dataItem) ? \'bold\' : \'normal\' }">#: Name #</span>' +
      '</div>'
    );

    $scope.locationTemplate = kendo.template(
      '<div id="locationTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': dataItem.LocationId == dataItem.currentLocation ? \'bold\' : \'normal\' }">#: displayText #</span>' +
      '</div>'
    );

    $scope.locationBlockTemplate = kendo.template(
      '<div id="locationBlockTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': dataItem.isBold ? \'bold\' : \'normal\' }">#: displayText #</span>' +
      '</div>'
    );

    $scope.providerTemplate = kendo.template(
      '<div id="providerTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': isPrefferredProvider(dataItem) ? \'bold\' : \'normal\' }">#: Name #</span>' +
      '</div>'
    );

    $scope.hygienistTemplate = kendo.template(
      '<div id="hygienistTemplate" type="text/x-kendo-template">' +
      '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': isPrefferredHygienist(dataItem) ? \'bold\' : \'normal\' }">#: Name #</span>' +
      '</div>'
    );

    if ($scope.appointment.Data.Classification == 1) {
      angular.element('#inpBlockDescription').focus();
    }

    $scope.$watch(
      'appointmentTime',
      function (nv, ov) {
        if (nv != ov) {
          $scope.frmAppointment.$dirty = true;
        }
      },
      true
    );

    $scope.$watch(
      'blockTime',
      function (nv, ov) {
        if (nv != ov) {
          $scope.frmAppointment.$dirty = true;
        }
      },
      true
    );

    $scope.$watch(
      'appointment.Data.Status',
      function (nv, ov) {
        if (nv != ctrl.originalAppointmentData.Status) {
          $scope.frmAppointment.$dirty = true;
        }
      },
      true
    );

    $scope.$watch(
      'appointment.Data.IsSooner',
      function (nv, ov) {
        ctrl.checkIfAppointmentHasChanges();
      },
      true
    );

    $scope.hasPreventiveCareViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perps-view'
    );

    ctrl.getPreventiveServiceInfo = function (personId) {
      var deferred = $q.defer();
      if ($scope.hasPreventiveCareViewAccess) {
        patientPreventiveCareFactory
          .PreventiveCareServices(personId, true)
          .then(function (res) {
            $scope.preventiveCareServices = res;
            deferred.resolve();
          });
      }
      return deferred.promise;
    };

    if (
      $scope.appointment.Data.PersonId != '' &&
      $scope.appointment.Data.PersonId != ctrl.emptyGuid
    ) {
      ctrl.servicesDuePromise = ctrl.getPreventiveServiceInfo(
        $scope.appointment.Data.PersonId
      );
    }

    $scope.$watch('appointment.Data.PersonId', function (nv, ov) {
      if (nv && nv != ov && nv != '') {
        ctrl.servicesDuePromise = ctrl.getPreventiveServiceInfo(nv);
      }
    });

    if ($scope.editing) {
      // run check immediately
      appointmentService.FlagAppointmentsAsLateIfNeeded([
        $scope.appointment.Data,
      ]);

      // start timer
      ctrl.checkForLateAppointmentsCounter = $interval(function () {
        appointmentService.FlagAppointmentsAsLateIfNeeded([
          $scope.appointment.Data,
        ]);
      }, 10000);
    }

    // validate surface
    $scope.validateSurface = function (serviceTransaction, flag) {
      serviceTransaction.isSurfaceEditing = true;
    };

    $scope.blurSurface = function (serviceTransaction) {
      serviceTransaction.isSurfaceEditing = false;
    };

    $scope.capitalizeRoots = function (serviceTransaction) {
      serviceTransaction.Roots = serviceTransaction.Roots.toUpperCase();
    };

    // check to see if patient has a benefit plan
    $scope.checkForPatientBenefitPlan = function () {
      $scope.patientBenefitPlanExists = false;
      if ($scope.patient && $scope.patient.PatientId) {
        //$scope.patientBenefitPlanExists = financialService.CheckForPatientBenefitPlan($scope.encounter.PatientId);
        financialService
          .CheckForPatientBenefitPlan($scope.patient.PatientId)
          .then(function (response) {
            // This should be receiving a true/false value from financial service instead. Will refactor later.
            $scope.patientBenefitPlanExists =
              response && response.Value && response.Value.length > 0
                ? true
                : false;
          });
      }
    };
    $scope.checkForPatientBenefitPlan();

    // setting the examining dentist to patient's preferred dentist if appt type is hygiene
    $scope.setExaminingDentist = function (appointmentTypeId) {
      $scope.selectedAppointmentType = ctrl.lookupAppointmentType(
        appointmentTypeId
      );
      var isHygieneAppointment =
        $scope.selectedAppointmentType &&
        $scope.selectedAppointmentType.PerformedByProviderTypeId == 2;
      if (isHygieneAppointment) {
        if (
          $scope.appointment.Data.IsExamNeeded ||
          $scope.appointment.Data.IsExamNeeded === undefined
        ) {
          if (!$scope.appointment.Data.ExaminingDentist) {
            $scope.appointment.Data.ExaminingDentist = 'any';
          }
        } else {
          $scope.appointment.Data.ExaminingDentist = 'noexam';
        }
      } else {
        $scope.appointment.Data.ExaminingDentist = null;
        $scope.appointment.Data.IsExamNeeded = false;
      }
    };

    ctrl.getNextTrumpServiceDueDate = function (personId) {
      patientPreventiveCareFactory
        .NextTrumpServiceDueDate(personId)
        .then(function (res) {
          $scope.preventiveDate.dueDate = res.Value;
        });
    };

    //#region inactivated patient

    ctrl.personId = null;
    $scope.$watch('patient', function (nv, ov) {
      if (nv) {
        $scope.patientIsInactive = nv.IsActive;
        ctrl.inactivePatientMessage();
        ctrl.setButtonState();
        $scope.checkForPatientBenefitPlan();
        if (!nv.IsActive) {
          $scope.$broadcast('clearSearch');
        }
        // only reload preventive care when patient id changes
        if (!_.isEqual(nv.PatientId, ctrl.personId)) {
          ctrl.personId = nv.PatientId;
          ctrl.getNextTrumpServiceDueDate(ctrl.personId);
        }
      }
    });

    //#endregion

    //Unscheduled appts list for specific patient

    $scope.getProviderString = function (userId) {
      var provider = listHelper.findItemByFieldValue(
        $scope.providers,
        'UserId',
        userId
      );
      var name =
        provider && provider.Name != null
          ? provider.Name
          : localize.getLocalizedString('Any Provider');
      return name;
    };

    ctrl.updateSelectedProvidersTime = function () {
      $scope.slots = [];

      var currentDate = _.cloneDeep(
        new Date($scope.appointment.Data.StartTime)
      );
      var endDate = _.cloneDeep(new Date($scope.appointment.Data.EndTime));

      $scope.validStartAndEndTime = !(currentDate >= endDate);

      var duration = $scope.timeIncrementObject.TimeIncrement;
      var interval = $scope.timeIncrementObject.TimeIncrement;
      var currentDateEnd = _.cloneDeep(currentDate);

      while (currentDate < endDate) {
        var daysEnd = _.cloneDeep(currentDate);
        currentDate.setTime(currentDate.getTime());
        currentDateEnd = appointmentUtilities.addTime(currentDate, duration);
        if (currentDateEnd > endDate) currentDateEnd = endDate;
        daysEnd.setTime(daysEnd.getTime());
        $scope.slots.push({
          Start: currentDate,
          End: currentDateEnd,
          Day: currentDate.getDay(),
          Name:
            currentDate.getHours().toString() +
            '-' +
            currentDate.getMinutes().toString(),
        });

        currentDate = appointmentUtilities.addTime(currentDate, interval);
        if (currentDate > endDate) currentDate = endDate;

        //this is to exclude the last time slot when there are excess minutes on the last start date caused by the interval
        if (appointmentUtilities.addTime(currentDate, interval) > endDate) {
          break;
        }

        currentDateEnd = appointmentUtilities.addTime(currentDateEnd, interval);

        currentDateEnd = _.cloneDeep(currentDate);
      }

      $scope.multipleProviders = $scope.multipleProviders
        ? $scope.multipleProviders
        : { selectedProviders: [] };
    };

    $scope.getPinnedAppointments = function () {
      var returnList = $.grep(
        $scope.unscheduledPatientAppointments,
        function (e) {
          return e.IsPinned == true;
        }
      );
      return returnList;
    };

    ctrl.appointmentDateTimeChanged = function (nv, ov) {
      if (nv && JSON.stringify(nv) != JSON.stringify(ov)) {
        ctrl.updateSelectedProvidersTime(nv, ov);
      }
    };
    ctrl.editingFirstLoad = $scope.editing;
    ctrl.selectedProvidersChanged = function (nv, ov) {
      if (nv && JSON.stringify(ov) != JSON.stringify(nv)) {
        _.forEach(ov, function (prov) {
          var x = listHelper.findIndexByFieldValue(nv, 'UserId', prov.UserId);
          if (x < 0) {
            $scope.deleteProvider(-1, prov.UserId);
          }
        });

        ctrl.setButtonState();
        if (
          $scope.unavailableProviders &&
          $scope.unavailableProviders.length > 0
        ) {
          var hasUnavailable = false;
          _.forEach($scope.unavailableProviders, function (prov) {
            var foundProvider = listHelper.findItemByFieldValue(
              ov,
              'UserId',
              prov.UserId
            );
            hasUnavailable = hasUnavailable || foundProvider != null;
          });
          if (!hasUnavailable) {
            $scope.unavailableProviders = [];
          }
        }
        if (!ctrl.editingFirstLoad) {
          $scope.hasChanges = true;
        } else {
          ctrl.editingFirstLoad = false;
        }
      }
      if (
        $scope.appointments &&
        $scope.appointments.Data &&
        $scope.appointments.Data.Classification != 1
      ) {
        ctrl.getRoomAssignmentsForExistingAppointment();
      }
    };

    ctrl.timeIncrementChanged = function (nv, ov) {
      if (!nv || !ov) return;
      if (nv.TimeIncrement != ov.TimeIncrement) {
        ctrl.updateSelectedProvidersTime();
      }
    };

    $scope.validateSelectedTime = function (
      prov,
      slot,
      $event,
      checkProviderSched
    ) {
      checkProviderSched =
        checkProviderSched == undefined || checkProviderSched == null
          ? true
          : checkProviderSched;
      if (checkProviderSched) {
        ctrl.checkIfAppointmentHasChanges();
        ctrl.getRoomAssignmentsForExistingAppointment();
      }
    };

    $scope.isSelected = function (prov, slot) {
      var name = prov.UserId + '_' + slot.Name;
      var index = listHelper.findIndexByFieldValue(
        $scope.providerSchedules,
        'Name',
        prov.UserId + '_' + slot.Name
      );
      return index > -1;
    };

    ctrl.reInitializeHasChanges = function (isInitializing) {
      $timeout(function () {
        var apptType = ctrl.lookupAppointmentType(
          $scope.appointment.Data.AppointmentTypeId
        );
        if ((!isInitializing && $scope.editing) || !$scope.editing) {
          ctrl.assignPreferredProviderByAppointmentType(apptType);
        }
        if (
          !$scope.editing &&
          $scope.hasChanges &&
          (typeof $scope.appointment.Data.PersonId == 'undefined' ||
            $scope.appointment.Data.PersonId == null ||
            $scope.appointment.Data.PersonId == '')
        ) {
          $scope.hasChanges = false;
          ctrl.originalAppointmentData = _.cloneDeep($scope.appointment.Data);
          $scope.$apply();
        }
      });
    };

    ctrl.lastUsedLocationRoomsTimeout;
    ctrl.resetLastUsedLocationRoomCheck = function () {
      $timeout.cancel(ctrl.lastUsedLocationRoomsTimeout);
      ctrl.lastUsedLocationRoomsTimeout = $timeout(function () {
        ctrl.lastLocationRooms = null;
      }, 3000);
    };
    $scope.unavailableProviders = null;
    ctrl.filterProvidersByLocation = function (locationId, isInitializing) {
      isInitializing = angular.isUndefined(isInitializing)
        ? false
        : isInitializing;
      if (isInitializing || $scope.appointment.Data.TreatmentRoomId) {
        if (
          !$scope.appointment.Data.TreatmentRoomId ||
          ($scope.appointment.Data.Room &&
            $scope.appointment.Data.Room.LocationId == locationId)
        ) {
          $scope.appointment.Data.TreatmentRoomId = $scope.appointment.Data.Room
            ? $scope.appointment.Data.Room.RoomId
            : null;
        }
      } else {
        $scope.appointment.Data.TreatmentRoomId = null;
        $scope.appointment.Data.Room = null;
      }

      $scope.treatmentRoomAssigned = true;
      if (typeof $scope.appointment.Data.LocationId === 'string') {
        $scope.appointment.Data.LocationId = parseInt(
          $scope.appointment.Data.LocationId
        );
      }
      $scope.selectedLocation = ctrl.lookupLocation(
        $scope.appointment.Data.LocationId
      );
      if (
        angular.isUndefined($scope.selectedLocation) ||
        $scope.selectedLocation == null
      ) {
        $scope.selectedLocation = modalResolve.existingAppointment.Location;
      }
      $scope.timezoneInfo = timeZoneFactory.GetTimeZoneInfo(
        $scope.selectedLocation.Timezone,
        $scope.appointment.Data.StartTime
      );
      $scope.appointment.Data.Location = _.cloneDeep($scope.selectedLocation);
      // if we set the location when initializing we need to update the original data
      if (isInitializing === true) {
        ctrl.originalAppointmentData = _.cloneDeep($scope.appointment.Data);
      }

      $scope.providers = _.cloneDeep($scope.providers);
      $scope.unavailableProviders = [];
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      if ($scope.providers.length > 0) {
        var prov = [];
        $scope.providerSchedules = $scope.providerSchedules
          ? $scope.providerSchedules
          : [];

        for (
          var i = $scope.providerSchedules.length - 1;
          i >= 0 && $scope.providerSchedules.length > 0;
          i--
        ) {
          var providerFound = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            $scope.providerSchedules[i].ProviderId
          );
          if (!providerFound) {
            if (
              !listHelper.findItemByFieldValue(
                $scope.unavailableProviders,
                'UserId',
                $scope.providerSchedules[i].ProviderId
              ) &&
              (!patient ||
                $scope.providerSchedules[i].ProviderId !=
                patient.PreferredDentist)
            ) {
              //&& $scope.providerSchedules[i].ProviderId != patient.PreferredHygienist
              $scope.unavailableProviders.push({
                UserId: $scope.providerSchedules[i].ProviderId,
              });
            }
            $scope.providerSchedules.splice(i, 1);
          }
        }

        if (
          $scope.appointment.Data.UserId &&
          angular.isDefined($scope.appointment.Data.UserId) &&
          $scope.appointment.Data.UserId != ''
        ) {
          var foundProv = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            $scope.appointment.Data.UserId
          );
          if (!foundProv) {
            $scope.appointment.Data.UserId = null;
          }
        }

        _.forEach($scope.providers, function (provider) {
          var provAppointment = listHelper.findItemByFieldValue(
            $scope.appointment.Data.ProviderAppointments,
            'UserId',
            provider.UserId
          );
          var hasProvider =
            (_.isNil($scope.appointment.Data.ProviderAppointments) ||
              $scope.appointment.Data.ProviderAppointments.length === 0) &&
            $scope.appointment.Data.UserId == provider.UserId;
          var wasSelected =
            $scope.multipleProviders &&
            $scope.multipleProviders.selectedProviders &&
            listHelper.findItemByFieldValue(
              $scope.multipleProviders.selectedProviders,
              'UserId',
              provider.UserId
            );
          if (
            (provAppointment != null &&
              provAppointment.StartTime &&
              angular.isDefined(provAppointment.StartTime) &&
              typeof provAppointment != 'undefined') ||
            hasProvider ||
            wasSelected
          ) {
            prov.push(provider);
            provider.Selected = true;
          } else {
            provider.Selected = false;
          }
        });

        $scope.multipleProviders = {
          selectedProviders: prov.length == 0 ? [] : prov,
        };
        $scope.initialProviderSelection = prov.length == 0 ? [] : prov;

        for (
          var i = $scope.appointment.Data.ProviderAppointments.length - 1;
          i >= 0 && $scope.appointment.Data.ProviderAppointments.length > 0;
          i--
        ) {
          var providerAppointment =
            $scope.appointment.Data.ProviderAppointments[i];
          if (
            !providerAppointment.StartTime &&
            typeof providerAppointment.StartTime == 'undefined'
          ) {
            continue;
          }
          var providerFound = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            providerAppointment.UserId
          );
          if (!providerFound) {
            if (providerAppointment.ObjectState == saveStates.Add) {
              $scope.appointment.Data.ProviderAppointments.splice(i, 1);
            } else {
              providerAppointment.ObjectState = saveStates.Delete;
            }
            continue;
          }

          var startTime = new Date(providerAppointment.StartTime);

          if (
            $scope.appointment.Data.ProviderAppointments.length == 1 &&
            startTime < $scope.appointment.Data.StartTime
          ) {
            providerAppointment.StartTime = $scope.slots[0].Start.toISOString();
            providerAppointment.EndTime = $scope.slots[0].End.toISOString();
            startTime = new Date(providerAppointment.StartTime);
          }

          var slotName =
            startTime.getHours().toString() +
            '-' +
            startTime.getMinutes().toString();
        }
      } else {
        _.forEach($scope.providerSchedules, function (provSched) {
          if (
            !listHelper.findItemByFieldValue(
              $scope.unavailableProviders,
              'UserId',
              provSched.ProviderId
            ) &&
            (!patient || provSched.ProviderId != patient.PreferredDentist)
          ) {
            // && provSched.ProviderId != patient.PreferredHygienist
            $scope.unavailableProviders.push({ UserId: provSched.ProviderId });
          }
        });
        $scope.providerSchedules = [];
        $scope.multipleProviders = { selectedProviders: [] };
        $scope.initialProviderSelection = [];
      }
      if ($scope.unavailableProviders.length > 0) {
        _.forEach($scope.unavailableProviders, function (prov) {
          for (var cnt = 0; cnt < ctrl.fullProviderList.length; cnt++) {
            var foundProvider = ctrl.fullProviderList[cnt];
            if (foundProvider.UserDto.UserId == prov.UserId) {
              prov.FirstName = foundProvider.UserDto.FirstName;
              prov.LastName = foundProvider.UserDto.LastName;
              break;
            }
          }
        });
      }

      ctrl.getLocationRooms($scope.selectedLocation.LocationId);
      $scope.examiningDentistLoading = true;
      $scope.examiningDentists = [
        {
          Name: localize.getLocalizedString('Any Dentist'),
          UserId: 'any',
        },
        {
          Name: localize.getLocalizedString('No Exam Needed'),
          UserId: 'noexam',
        },
      ];
      _.forEach($scope.providers, function (provider) {
        if (provider.ProviderTypeId == 1) {
          $scope.examiningDentists.push(provider);
        }
      });
      $scope.examiningDentistLoading = false;
      $timeout(function () {
        if (
          !$scope.editing &&
          $scope.appointment.Data.Classification == 0 &&
          $scope.multipleProviders.selectedProviders.length == 1
        ) {
          var prov = $scope.multipleProviders.selectedProviders[0];
          var ctr = 0;
          var hasChanges = $scope.hasChanges;
          _.forEach($scope.slots, function (slot) {
            ctr++;
            $scope.validateSelectedTime(
              prov,
              slot,
              { target: '#' + prov.UserId + '_' + slot.Name },
              ctr >= $scope.slots.length
            );
          });
          $scope.hasChanges = hasChanges;
        }
      }, false);
      if (!isInitializing) {
        ctrl.checkIfAppointmentHasChanges();
      } else {
        $scope.hasChanges = false;
      }
      $scope.filteredProviders = true;
    };

    //#endregion

    //#region locations get

    // remove the duplicate clears after we figure out now to utilize these better.
    ctrl.resLocs = [];
    ctrl.inactiveLocs = [];

    // This method does a couple of things that seem like a lot of waste. First it requires I get a timezone abbreviation that should already be set in the location.
    // Then it creates two lists for the sorting of the locations. Which could be better done using a custom sort algorithm that would be reusable,
    // where as this is a one off sort requiring two lists. I am sure we have this same code in a number of places because of this but this is a business rule so it should be done in one place.
    ctrl.appendDeactivationDate = function (locs) {
      ctrl.resLocs = [];
      ctrl.inactiveLocs = [];

      _.each(locs, function (obj) {
        if (obj.DeactivationTimeUtc) {
          obj.displayText =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')' +
            '  -  ' +
            $filter('date')(obj.DeactivationTimeUtc, 'MM/dd/yyyy');
          ctrl.inactiveLocs.push(obj);
        } else {
          obj.displayText =
            obj.NameLine1 +
            ' (' +
            timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
            ')';
          ctrl.resLocs.push(obj);
        }
      });
      ctrl.resLocs = _.orderBy(ctrl.resLocs, 'NameLine1');
      ctrl.inactiveLocs = _.orderBy(
        ctrl.inactiveLocs,
        'DeactivationTimeUtc',
        'desc'
      );

      _.each(ctrl.inactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      return ctrl.resLocs;
    };

    // This should be called the crazy location method....
    ctrl.processLocationData = function (res) {
      //console.log('Calling ProcessLocationsData');
      ctrl.loadingLocations = false;
      // pull up method refactoring.
      // start code taken from old AppendDeactivationDate Method

      newLocationsService.locations = ctrl.appendDeactivationDate(res);

      // looping through locations again to set the appropriate timezone ....
      _.forEach(newLocationsService.locations, function (location) {
        location.currentLocation = $scope.userLocation().id;
        if (location.Timezone)
          location.tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
            location.Timezone,
            $scope.appointment.Data.StartTime
          );
      });
      $scope.selectedLocation = ctrl.lookupLocation(
        modalResolve.existingAppointment.LocationId
      );
      if (
        !$scope.filteredProviders &&
        $scope.providers &&
        $scope.providers.length > 0
      ) {
        var locationId = modalResolve.existingAppointment.LocationId;
        ctrl.filterProvidersByLocation(locationId, true);
      }
      ctrl.filterLocations();
    };

    ctrl.locationServicesGetOnError = function () {
      ctrl.loadingLocations = false;

      $scope.doneLoading = ctrl.isDoneLoading();

      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['locations']
        ),
        localize.getLocalizedString('Error')
      );
    };

    ctrl.lookupLocation = function (locationId) {
      return newLocationsService.findByLocationId(parseInt(locationId, 10));
    };

    $scope.locationChangedSuccess = function () {
      var ofcLocation = newLocationsService.findByLocationId(
        parseInt($scope.dropDownLocation.LocationId, 10)
      );

      $scope.appointment.Data.Location = _.cloneDeep(ofcLocation);
      $scope.appointment.Data.LocationId = _.cloneDeep(
        $scope.dropDownLocation.LocationId
      );
      ctrl.filterProvidersByLocation($scope.appointment.Data.LocationId);
      $scope.checkIfPatientsPrefLocation();
      $scope.checkIfPreferredProviderAvailable();

      if ($scope.patient) {
        ctrl.validatePatientSelectedLocation();
      }
    };

    ctrl.validatePatientSelectedLocation = function () {
      var patientData = patientValidationFactory.GetPatientData();
      patientValidationFactory
        .PatientSearchValidation($scope.patient)
        .then(function (res) {
          var patientInfo = res;

          var hasAccessToLocation = patientValidationFactory.CheckPatientLocation(
            patientData,
            $scope.appointment.Data.Location
          );

          if (!hasAccessToLocation) {
            //manually get and assign primary location name and primary phone name to bypass the logged in user authorization for PatientSearchValidation
            var patientLocation = listHelper.findItemByFieldValue(
              patientData.PatientLocations,
              'IsPrimary',
              true
            );
            if (patientLocation) {
              var patientPreferredLocation = listHelper.findItemByFieldValue(
                $scope.filteredLocations,
                'LocationId',
                patientLocation.LocationId
              );
              patientInfo.authorization.PatientPrimaryLocationName =
                patientPreferredLocation.NameLine1;
              patientInfo.authorization.PatientPrimaryLocationPhone =
                patientPreferredLocation.PrimaryPhone;
              patientValidationFactory.LaunchPatientLocationErrorModal(
                patientInfo,
                $scope.appointment.Data.Location
              );
              $scope.appointment.Data.Location = $scope.previousLocation;
              $scope.appointment.Data.LocationId =
                $scope.previousLocation.LocationId;
              $scope.dropDownLocation = $scope.previousLocation;
            }
          }

          $scope.previousLocation = $scope.appointment.Data.Location;
          $scope.invalidPreferredLocation = !hasAccessToLocation;
        });
    };
    $scope.locationChangedCanceled = function () {
      $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);
    };

    $scope.userLocation = function () {
      return JSON.parse(sessionStorage.getItem('userLocation'));
    };

    $scope.providerChanged = function () {
      ctrl.checkIfAppointmentHasChanges();
    };

    $scope.checkIfPatientsPrefLocation = function () {
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      if (
        patient &&
        patient.PreferredLocation &&
        patient.PreferredLocation != '' &&
        $scope.appointment.Data.LocationId &&
        $scope.appointment.Data.LocationId != ''
      ) {
        $scope.isNotPatientPrefLocation =
          patient.PreferredLocation != $scope.appointment.Data.LocationId;
      } else {
        $scope.isNotPatientPrefLocation = false;
      }
    };
    var providerCounter = 0;
    $scope.isPrefferredProvider = function (dataItem) {
      providerCounter++;

      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      var isPrefferredProvider = false;
      var performedByProviderTypeId = $scope.selectedAppointmentType
        ? $scope.selectedAppointmentType.PerformedByProviderTypeId
        : 0;
      switch (performedByProviderTypeId) {
        case 2:
          if (
            patient &&
            patient.PreferredHygienist &&
            patient.PreferredHygienist != ''
          ) {
            isPrefferredProvider =
              patient.PreferredHygienist == dataItem.UserId;
          }
          break;
        case 1:
          if (
            patient &&
            patient.PreferredDentist &&
            patient.PreferredDentist != ''
          ) {
            isPrefferredProvider = patient.PreferredDentist == dataItem.UserId;
          }
          break;
        default:
          if (patient) {
            isPrefferredProvider =
              patient.PreferredDentist == dataItem.UserId ||
              patient.PreferredHygienist == dataItem.UserId;
          }
          break;
      }
      return isPrefferredProvider;
    };

    $scope.isPrefferredHygienist = function (dataItem) {
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      var isPrefferredHygienist = false;
      if (
        patient &&
        patient.PreferredDentist &&
        patient.PreferredDentist != ''
      ) {
        isPrefferredHygienist = patient.PreferredDentist == dataItem.UserId;
      }
      return isPrefferredHygienist;
    };

    $scope.checkIfPreferredProviderAvailable = function () {
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      if (
        patient &&
        patient.PreferredDentist &&
        patient.PreferredDentist != ''
      ) {
        var isAvailable = false;
        ctrl.checkPreferredProviders();
        _.forEach($scope.providers, function (provider) {
          if (!isAvailable) {
            isAvailable = provider.UserId == patient.PreferredDentist;
          }
        });
        $scope.prefProviderNotAvailable = !isAvailable;
      } else {
        $scope.prefProviderNotAvailable = false;
      }
    };

    $scope.afterBeginSuccess = function (result) {
      $timeout(function () {
        $rootScope.$broadcast('appointment:begin-appointment', result.Value); // broadcast used in appointment modal
        $rootScope.$broadcast('appointment:start-appointment', result.Value); // broadcast used in timeline to tell when to re-set items
        $scope.hasChanges = false;
        $uibModalInstance.dismiss();

        let patientPath = '/Patient/';

        $scope.PreviousLocationRoute =
          _.escape(patientPath) + _.escape(result.Value.PersonId) + '/Clinical';
        $location.search({});
        tabLauncher.launchNewTab($scope.PreviousLocationRoute);
      }, 100);
    };

    $scope.afterBeginFailed = function (data) {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to begin appointment. Please try again.'
        ),
        'Error'
      );
      $scope.saveClicked = false;
    };

    $scope.$on('appointment:begin-appointment', function (e) {
      $uibModalInstance.close();
    });

    $scope.canStartAppt = function () {
      var dateTimeNow = new Date();
      var canStartAppt = !(
        $scope.saveClicked ||
        $scope.removeClicked ||
        $scope.readOnly
      );
      if (canStartAppt && $scope.appointment.Data.originalStart) {
        var appointmentStart = new Date($scope.appointment.Data.originalStart);
        canStartAppt = dateTimeNow >= appointmentStart;
      }

      if (
        canStartAppt &&
        !$scope.appointment.Data.ActualStartTime &&
        $scope.appointment.Data.Status == 4
      ) {
        canStartAppt = false;
      }

      return canStartAppt;
    };

    //#region locations
    // another method used to order things by Deactivation Date ... I thought this was done in a different method before
    // confused that it appears we are doing it again.
    ctrl.groupLocations = function (locs) {
      ctrl.resLocs = [];
      ctrl.pendingInactiveLocs = [];
      ctrl.inactiveLocs = [];

      var dateNow = moment().format('MM/DD/YYYY');
      _.each(locs, function (obj) {
        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');

          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.SortOrder = 3;
            ctrl.inactiveLocs.push(obj);
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.SortOrder = 2;
            ctrl.pendingInactiveLocs.push(obj);
          }
        } else {
          obj.LocationStatus = 'Active';
          obj.SortOrder = 1;
          ctrl.resLocs.push(obj);
        }
      });
      ctrl.inactiveLocs = _.orderBy(
        ctrl.inactiveLocs,
        'DeactivationTimeUtc',
        'desc'
      );
      ctrl.pendingInactiveLocs = _.orderBy(
        ctrl.pendingInactiveLocs,
        'DeactivationTimeUtc'
      );

      _.each(ctrl.pendingInactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      _.each(ctrl.inactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
      return ctrl.resLocs;
    };

    ctrl.filterLocations = function () {
      //debugger;
      if (newLocationsService.locations && $scope.practiceLocations) {
        $scope.filteredLocations = [];
        var filteredLocs = [];
        var locs = [];
        _.forEach($scope.practiceLocations, function (practiceLocation) {
          var item = newLocationsService.findByLocationId(
            parseInt(practiceLocation.id, 10)
          );
          // this is some crazy code that executes on the view some 40 or so times .. we are not doing that any more.
          // this code is a stop gap for what is otherwise a bad performance decision.
          // This whole method should be rethought that will have to wait for another day.
          var item2 = listHelper.findItemByFieldValue(
            $rootScope.scheduleSelectedLocations,
            'LocationId',
            practiceLocation.id
          );
          if (item) {
            if (item2) {
              item.isBold = true;
            } else {
              item.isBold = false;
            }
            filteredLocs.push(item);
          }
        });

        _.forEach(newLocationsService.locations, function (location) {
          locs.push(location);
        });

        newLocationsService.locations = [];

        $scope.filteredLocations = ctrl.groupLocations(filteredLocs);
        newLocationsService.locations = ctrl.groupLocations(locs);

        $scope.filteredLocationsDDL = {
          data: $scope.filteredLocations,
          group: { field: 'SortOrder' },
          sort: [
            { field: 'NameLine1', dir: 'asc' },
            { field: 'DeactivationTimeUtc', dir: 'asc' },
          ],
        };

        $scope.locationsDDL = {
          data: newLocationsService.locations,
          group: { field: 'SortOrder' },
          sort: [
            { field: 'NameLine1', dir: 'asc' },
            { field: 'DeactivationTimeUtc', dir: 'asc' },
          ],
        };

        //ctrl.getUserAccessToAppointmentLocation();
      }
    };

    ctrl.getPracticeLocations = function () {
      //debugger;
      var practiceLocations = _.orderBy(newLocationsService.locations, 'name');
      _.forEach(practiceLocations, function (loc) {
        loc.id = loc.LocationId;
      });
      $scope.practiceLocations = practiceLocations;
      //ctrl.filterLocations();
    };
    //#endregion

    // if you are editing an existing appointment this method runs.
    ctrl.getLastModifiedMessage = function () {
      $scope.lastModifiedMessage = '';
      var userLocation = $scope.userLocation();
      var tz = timeZoneFactory.GetFullTZ(userLocation.timezone);
      var time = timeZoneFactory
        .ConvertDateToBasicMomentTZ(
          $scope.appointment.Data.DateModified,
          tz.MomentTZ
        )
        .toDate();
      //var abbr = timeZoneFactory.GetTimeZoneAbbr(userLocation.timezone, $scope.appointment.Data.DateModified);
      //var time = timeZoneFactory.ConvertDateTZ($scope.appointment.Data.DateModified, userLocation.timezone);
      var filteredDateTime = $filter('date')(time, 'M/d/yyyy h:mm a');

      if (
        $scope.appointment.Data.UserModified &&
        $scope.appointment.Data.UserModified != ctrl.emptyGuid
      ) {
        var users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var user = _.find(users, {
          UserId: $scope.appointment.Data.UserModified,
        });
        if (!_.isNil(user)) {
          var lastModifiedUser = user.FirstName + ' ' + user.LastName;
          $scope.lastModifiedMessage =
            lastModifiedUser + ' on ' + filteredDateTime + ' (' + tz.Abbr + ')';
        }
      }
    };
    if (
      $scope.appointmentSaveState &&
      $scope.appointmentSaveState == saveStates.Update
    ) {
      ctrl.getLastModifiedMessage();
    }

    //#region rollback

    $scope.onRollback = function (services) {
      $scope.saveAppointment();
    };

    //#endregion

    // Get patient overview for authentication to the proposed service controls
    $scope.getPatientInfo = function () {
      var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
      if (!_.isNil(patient) && !_.isNil(patient.PatientId)) {
        personFactory.Overview(patient.PatientId).then(function (res) {
          if (res.Value) {
            patientValidationFactory.SetPatientData(res.Value);
            $scope.pat = res.Value;
            // update the patient field because appointment-status uses this to determine
            // if the patient has a running appointment
            $scope.appointment.Data.Patient = $scope.pat;
          }
        });
      }
    };

    //#region all watchers / emits / on

    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('retreaveCurrentCode', function () {
        $rootScope.$broadcast('currentCode', $scope.currentCode);
      })
    );

    $scope.$watchCollection('plannedServices', function () {
      if (!$scope.plannedServices) return;
      $scope.plannedServiceIds = $scope.plannedServices.map(function (ps) {
        return ps.ServiceTransactionId;
      });
    });

    $scope.$watch(
      'appointment.Data.StartTime',
      ctrl.appointmentDateTimeChanged
    );
    $scope.$watch('appointment.Data.EndTime', ctrl.appointmentDateTimeChanged);
    $scope.$watch(
      'multipleProviders.selectedProviders',
      ctrl.selectedProvidersChanged
    );
    $scope.$watch('timeIncrementObject', ctrl.timeIncrementChanged);

    // modify to load only ShowOnSchedule providers from the providerShowOnScheduleFactory
    $scope.$watch('dropDownLocation.LocationId', function (nv, ov) {
      if (nv != ov) {
        // We need to reload the providers before the locationChangedSuccess method
        // based on location and ShowOnSchedule
        if (!_.isNil(nv)) {
          var locationId = nv;
          $scope.providers = [];
          providerShowOnScheduleFactory
            .getProviderLocations(true)
            .then(function (res) {
              ctrl.loadScheduleProviders(res, locationId);
              $scope.locationChangedSuccess();
            });
        } else {
          $scope.locationChangedSuccess();
        }
      }
    });

    $scope.$on('kendoWidgetCreated', function (event, widget) {
      ctrl.kendoWidgets.push(widget);
      if (widget.ns === '.kendoDropDownList') {
        widget.list.width(350);
        widget.wrapper.on('keydown', function (e) {
          e.stopImmediatePropagation();
          $scope.$apply();
        });
      }
    });

    //#endregion

    $scope.$watch('$viewContentLoaded', function () {
      var appointment = $scope.appointment;
      if (
        appointment &&
        appointment.Data &&
        appointment.Data.Classification == 1 &&
        !ctrl.Initializing
      ) {
        setTimeout(function () {
          $('.appointment-modal .modal-dialog').addClass('block');
        }, 500);
      }
      $timeout(function () {
        if ($scope.appointment.Data.Classification < 1) {
          ctrl.recalculateProviderAppointments();
        }
      });
    });

    ctrl.setDisableStatusSelector = function () {
      $scope.disableStatusSelector = $scope.readOnly || $scope.hasChanges;
    };

    $scope.$watch('readOnly', function (nv, ov) {
      if (nv !== ov) {
        ctrl.setDisableStatusSelector();
      }
    });

    $scope.$watch('hasChanges', function (nv, ov) {
      if (nv != ov) {
        ctrl.setDisableStatusSelector();
      }
    });


    // need to destroy widgets for modal. only gets destroyed if web page unloads.
    $scope.$on('$destroy', function () {
      // stop late status timer
      $interval.cancel(ctrl.checkForLateAppointmentsCounter);
      referenceDataService.unregisterForLocationSpecificDataChanged(
        ctrl.referenceDataServiceLocationChangedReference
      );

      _.forEach(ctrl.kendoWidgets, function (widget) {
        try {
          widget.destroy();
        } catch (e) {
          /** widget is already destroyed */
        }
      });
    });

    //#endregion
    ctrl.initDependancies();
  }
  ScheduleBlockModalController.prototype = Object.create(
    BaseSchedulerCtrl.prototype
  );
})();
