//(function () {

var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller('AppointmentViewController', AppointmentViewController);
AppointmentViewController.$inject = [
  '$scope',
  '$window',
  '$timeout',
  '$uibModal',
  '$filter',
  '$q',
  '$resource',
  'ListHelper',
  'toastrFactory',
  'patSecurityService',
  'localize',
  'BoundObjectFactory',
  'ScheduleTextService',
  'PatientServices',
  'ScheduleServices',
  'ScheduleAppointmentConflictCheck',
  'ModalFactory',
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
  'PatientOdontogramFactory',
  'locationService',
  'PersonFactory',
  'PatientValidationFactory',
  'RolesFactory',
  'PatientAppointmentsByClassificationFactory',
  'ScheduleAppointmentModalFactory',
  'ProviderRoomOccurrenceFactory',
  'AppointmentUtilities',
  'RoleNames',
  'GlobalSearchFactory',
  'AppointmentConflictFactory',
  'PatientServicesFactory',
  'referenceDataService',
  'ScheduleAppointmentModalService',
  'ProviderShowOnScheduleFactory',
  'AppointmentStorageService',
  'ScheduleDisplayPlannedServicesService',
  'ScheduleProvidersService',
  'NewRoomsService',
  'NewLocationsService',
  'AppointmentStatusService',
  'AppointmentModalLinksService',
  'NewAppointmentTypesService',
  'AppointmentTimeService',
  'NewScheduleAppointmentUtilitiesService',
  'AppointmentModalProvidersService',
  'userSettingsDataService',
  'LocationsDisplayService',
  'SchedulingApiService',
  'AppointmentViewLoadingService',
  'AppointmentViewDataLoadingService',
  'AppointmentViewVisibleService',
  'PatientBenefitPlansFactory',
  'LocationServices',
  'UnscheduledAppointmentsService',
  'tabLauncher',
  'AppointmentViewValidationNewService',
  'AppointmentServiceTransactionsService',
  'ServiceEstimateCalculationService',
  'FeatureFlagService',
  'FuseFlag',
];

function AppointmentViewController(
  $scope,
  $window,
  $timeout,
  $uibModal,
  $filter,
  $q,
  $resource,
  listHelper,
  toastrFactory,
  patSecurityService,
  localize,
  boundObjectFactory,
  scheduleTextService,
  patientServices,
  scheduleServices,
  scheduleAppointmentConflictCheck,
  modalFactory,
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
  patientOdontogramFactory,
  locationService,
  personFactory,
  patientValidationFactory,
  rolesFactory,
  patientAppointmentsByClassificationFactory,
  scheduleAppointmentModalFactory2,
  providerRoomOccurrenceFactory,
  appointmentUtilities,
  roleNames,
  globalSearchFactory,
  appointmentConflictFactory,
  patientServicesFactory,
  referenceDataService,
  scheduleAppointmentModalService,
  providerShowOnScheduleFactory,
  appointmentStorageService,
  scheduleDisplayPlannedServicesService,
  scheduleProvidersService,
  roomsService,
  locationsService,
  appointmentStatusService,
  appointmentModalLinksService,
  appointmentTypesService,
  appointmentTimeService,
  newScheduleAppointmentUtilitiesService,
  appointmentModalProvidersService,
  userSettingsDataService,
  locationsDisplayService,
  schedulingApiService,
  appointmentViewLoadingService,
  appointmentViewDataLoadingService,
  appointmentViewVisibleService,
  patientBenefitPlansFactory,
  locationServices,
  unscheduledAppointmentsService,
  tabLauncher,
  appointmentViewValidationNewService,
  appointmentServiceTransactionsService,
  serviceEstimateCalculationService,
  featureFlagService,
  fuseFlag,
) {
  BaseSchedulerCtrl.call(this, $scope, 'AppointmentViewController');
  var ctrl = this;
  ///////////////////////////////////////////////////////////////////////////////////////////
  // loading the page text.
  $scope.appointmentModalText = scheduleTextService.getAppointmentModalText();

  //TODO:Remove when all new dropdowns are added to page
  $scope.enableNewAppointmentDrawerDisplay = userSettingsDataService.isNewAppointmentDrawerEnabled();

  //This is for the new status control for the event emitter on disable
  setDisableStatusDropdown(false);

  //Set InsuranceOrder on load of a new appointment to zero
  appointmentServiceTransactionsService.setInsuranceOrderOnServiceTransaction(
    0
  );

  $scope.examiningDentistPlaceHolder =
    $scope.appointmentModalText.examiningDentistPlaceHolder;
  $scope.defaultPlaceHolder = $scope.appointmentModalText.defaultPlaceHolder;

  //TODO: Figure out if this variable is needed and what to do with it.
  $scope.localProviders = [];
  $scope.patient = null;

  // setting this to ensure that some of the controls do not attempt to load without the page data being loaded.
  $scope.isInitializing = true;
  // variable is used currently to ensure rooms are loaded for a location at startup as the object is not in the right state at first.
  ctrl.pageJustLoaded = true;
  // variable is used to hide the time area until the times are loaded.
  $scope.isTimeDataLoaded = false;
  // used to help load data better for the eligibility control
  $scope.loadingEligibilityData = false;
  // used to ensure conflicts api call happens earlier when opening the view
  $scope.loadingConflictsDataForTheFirstTime = true;

  // status control is stupid ... we were calculating today hundreds of times..
  // today does not change on the modal .. only the appointment time does.
  ctrl.currentDate = new Date(moment().utc()).getDate();

  ///This implements Feature Flag
  ctrl.checkFeatureFlags = function () {
    featureFlagService.getOnce$(fuseFlag.DisableStatusIconOnAppointmentCard).subscribe((value) => {
      $scope.DisableStatusIconFeatureFlag = value;
    });
  };

  //TODO: Move Helper function to a service
  ctrl.getActualDate = function (utcString) {
    var date = new Date();

    if (_.isEmpty(utcString)) {
      return date;
    }

    var parts = utcString ? utcString.split('-') : [];

    if (parts.length === 3) {
      date.setYear(parseInt(parts[0]));
      date.setMonth(parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    return date;
  };

  //TODO: move to provider helper file at some point.
  // Need to spend time understanding the behavior that is trying to be expressed and the other values need to be changed to input parameters
  $scope.isPrefferredProvider = isPrefferredProvider;
  function isPrefferredProvider(dataItem) {
    //Logging//console.log('isPreferredProvider');
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
          isPrefferredProvider = patient.PreferredHygienist == dataItem.UserId;
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
  }

  //TODO: move to helper file for location timezone handling
  // create header item for location and timezone
  ctrl.addLocationTimezoneAbbr = function (location) {
    var locationAndTimezoneAbbr = location ? location.NameAbbreviation : '';
    var tz = location ? location.timezoneInfo.abbr : '';
    locationAndTimezoneAbbr += ' (' + tz + ')';
    return locationAndTimezoneAbbr;
  };

  //TODO: Remove just redirect to the schedule with URL Parameters that open the block modal
  //working around modal closing when status changes.
  ctrl.blockModalClose = false;

  //TODO: Remove just redirect to the schedule with URL Parameters that open the Reschedule Modal
  //working around modal closing when status changes.
  ctrl.unscheduledModalClose = false;

  ///////////////////////////////////////////////////////
  // Load the page base data.
  // Locations, Rooms from locations, Providers, Appointment Status,

  //TODD: Need to understand what this is actually trying to do.
  // Do we need to consider setting this up as part of a global item to save time?
  var pth = $location.path();
  $scope.tomorrow = new Date();
  $scope.tomorrow.setHours(0, 0, 0, 0);
  $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);

  if ($scope.timeIncrement || appointmentViewLoadingService.timeIncrement) {
    if (appointmentViewLoadingService.timeIncrement) {
      $scope.timeIncrement = appointmentViewLoadingService.timeIncrement;
    }
    $scope.timeIncrementObject = {
      TimeIncrement: _.cloneDeep($scope.timeIncrement),
    };
  } else {
    // not sure this is the right thing to do ... we will find out.
    $scope.timeIncrement = null;
    $scope.timeIncrementObject = null;
  }

  var step = $scope.timeIncrement ? $scope.timeIncrement : 5;

  ctrl.minutes = [];
  $scope.minutesString = [];
  ctrl.minutesIncrementString = [];

  for (var i = step; i < 996; i += step) {
    ctrl.minutes.push(i);
    $scope.minutesString.push({ duration: i.toString() });
    if (i <= 30) {
      ctrl.minutesIncrementString.push({ duration: i.toString() });
    }
  }

  ctrl.serviceCodes = referenceDataService.get(
    referenceDataService.entityNames.serviceCodes
  );
  appointmentTypesService.appointmentTypes = referenceDataService.get(
    referenceDataService.entityNames.appointmentTypes
  );
  $scope.appointmentTypes = appointmentTypesService.appointmentTypes;

  // load data and get it translated if it has not been translated yet.
  var status = appointmentStatusService.getStatuses();
  appointmentStatusService.appointmentStatuses = scheduleTextService.getAppointmentStatusesTranslated(
    status
  );
  $scope.statuses = appointmentStatusService.appointmentStatusEnum;

  ctrl.referenceDataServiceLocationChangedReference = referenceDataService.registerForLocationSpecificDataChanged(
    onReferenceDataServiceLocationChanged
  );

  //TODO: This code populates the locations and rooms services. consider moving out to a service
  // locations need to be loaded into the locationsService before calling this.
  $scope.fillLocationTimezoneInfo = fillLocationTimezoneInfo;
  function fillLocationTimezoneInfo(dateItem) {
    dateItem = angular.isUndefined(dateItem) ? new Date() : dateItem;

    // optimize out the double loop maybe ... when time is available.
    locationsService.locations = locationsDisplayService.setLocationDisplayText(
      locationsService.locations,
      dateItem
    );

    var tempRooms = locationsService.getRoomsFromLocations();

    // eventually you will want to merge the ordering by name with the loop
    // that occurs to create the tempRooms list. Do at a later time.
    var allRooms = _.orderBy(tempRooms, ['Name'], 'asc');
    roomsService.rooms = allRooms;
    $scope.rooms = roomsService.rooms;
  }

  //TODO: this is one of a number of methods that does stuff with provider data move to service after further refactorings
  // The hard part is that we need to replace the lodash usage in this and find a replacement for escape method
  // Either that or we need to be fine with using lodash ... which we have not determined is a good long term decision.
  $scope.setappointmentProviders = setappointmentProviders;
  function setappointmentProviders() {
    var localProviders = [];
    var providers = [];

    // filter this list by the selectedLocation(s) LocationIds
    var selectedLocationsIds = _.map(locationsService.locations, 'LocationId');
    providers = _.filter(ctrl.providersByLocation, providerLocation =>
      _.includes(selectedLocationsIds, providerLocation.LocationId)
    );
    _.forEach(providers, function (newProvider) {
      if (newProvider.ShowOnSchedule === true) {
        var thisLocation = _.find(locationsService.locations, [
          'LocationId',
          newProvider.LocationId,
        ]);
        var locationAndTimeZoneAbbr = ctrl.addLocationTimezoneAbbr(
          thisLocation
        );

        // if they are not in the list, add them
        newProvider.Name = _.unescape(newProvider.FullName);
        newProvider.FirstName = _.unescape(newProvider.FirstName);
        newProvider.LastName = _.unescape(newProvider.LastName);
        newProvider.ProviderTypeViewId = null;
        newProvider.locationAbbr = locationAndTimeZoneAbbr;
        newProvider.highlighted = false; // used for the modal
        // add this provider to list
        var scheduleProvider = angular.copy(newProvider);
        localProviders.push(scheduleProvider);
        providers.push(newProvider.UserId);
      }
    });

    // moving storage of providers to a service.
    scheduleProvidersService.providers = localProviders;
  }

  ///////////////////////////////////////////////////
  // Old Status Control Variables

  $scope.statusValueTemplate =
    '<div type="text/x-kendo-template">' +
    '<span>' +
    '<span class="appointment-status-icon fa" ng-class="dataItem.icon" ></span > ' +
    '<span id="btn{{ dataItem.descriptionNoSpaces }}" class="appointment-status-description">' +
    '{{ dataItem.descriptionTranslation }}' +
    '</span>' +
    '</span>' +
    '</div>';

  $scope.statusDisplayTemplate =
    '<div type="text/x-kendo-template" ng-show="dataItem.disabled !== true">' +
    '<span>' +
    '<span class="appointment-status-icon fa" ng-class="dataItem.icon" ></span > ' +
    '<span id="btn{{ dataItem.descriptionNoSpaces }}" class="appointment-status-description">' +
    '{{ dataItem.descriptionTranslation }}' +
    '</span>' +
    '<div ng-if="dataItem.sectionEnd" class="appointment-status-line"></div>' +
    '</span>' +
    '</div>' +
    // alternative one with different styles
    '<div type="text/x-kendo-template" ng-show="dataItem.disabled === true" class="text-muted k-state-disabled" ng-disabled="true">' +
    '<span>' +
    '<span class="appointment-status-icon fa" ng-class="dataItem.icon" ></span > ' +
    '<span id="btn{{ dataItem.descriptionNoSpaces }}" class="appointment-status-description">' +
    '{{ dataItem.descriptionTranslation }}' +
    '</span>' +
    '<div ng-if="dataItem.sectionEnd" class="appointment-status-line"></div>' +
    '</span>' +
    '</span>' +
    '</div>';

  $scope.onSelect = function (e) {
    // this keeps the code from setting the value on disabled options.
    if (e.dataItem.disabled) {
      //prevent selection by canceling the event
      e.preventDefault();
    }
  };

  $scope.isAppointmentDate = function (appointmentDate) {
    //Logging//console.log('OldStatusControlCode.isAppointmentDate');
    if (appointmentDate) {
      var today = new Date();
      return moment(appointmentDate)
        .startOf('day')
        .utc()
        .isSame(moment(today).startOf('day').utc());
    }
    return false;
  };

  ctrl.showChangeLocationPromptModal = function () {
    $scope.locationWarningModal = $uibModal.open({
      templateUrl:
        'App/Common/components/appointment-status/modal/location-warning-modal.html',
      scope: $scope,
      controller: function () {
        $scope.negative = function () {
          $scope.locationWarningModal.close();
          ctrl.cancelAction();
        };
        $scope.locationDisplayName = $scope.appointment.Data.Location.NameLine1;
      },
      size: 'sm',
      windowClass: 'center-modal',
    });
  };

  ctrl.lastStatus = null;

  ctrl.elementId = '';
  $scope.sentForCheckout = false;

  ctrl.encounterModalData = {};
  /// ending old status control variables

  // move item to be preloaded in the startup process of the modal and put into a service.
  staticData.TeethDefinitions().then(function (res) {
    patientOdontogramFactory.TeethDefinitions = res.Value;
  });

  // move item to be preloaded in the startup process of the modal and put into a service.
  staticData.CdtCodeGroups().then(function (res) {
    patientOdontogramFactory.CdtCodeGroups = res.Value;
  });

  $scope.saveStates = saveStates;

  // not sure this is right but it will be something we test.
  $scope.openList = false;
  // this is for the modal ... so we will always show add to clipboard
  $scope.showAddToClipboard = true;

  // ending status control start items
  /////////////////////////////////////////////////////////////////////

  $scope.plannedServicesChanged = false;

  // end loading page items
  //////////////////////////////

  /////////////////////////////////////////////////
  /// random scope and ctrl variables
  //#region ctrl and scope vars initialized

  // lists vars
  $scope.unscheduledPatientAppointments = [];
  ctrl.baseServiceCodes = [];
  $scope.plannedServices = [];
  ctrl.servicesToEdit = [];
  ctrl.servicesToAdd = [];
  ctrl.providerValidation = [];
  ctrl.providerValidationMissingHours = [];

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
  $scope.patientBenefitPlanExists = false;
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
    FillLocations: false,
    FillShowOnSchedule: true,
  };

  ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';

  //#endregion
  ////////////////////////////////////////////////////////////////

  ctrl.setDisableStatusSelector = setDisableStatusSelector;
  function setDisableStatusSelector() {
    //Logging//console.log('setDisableStatusSelector');
    $scope.disableStatusSelector = $scope.readOnly || !$scope.patientSelected;
  }

  //#region support showOnSchedule

  // determine if user has a current exception for this location
  ctrl.findMatchingException = findMatchingException;
  function findMatchingException(provider, locationId) {
    //Logging//console.log('findMatchingException');
    var exception = _.filter(provider.ShowOnScheduleExceptions, function (exc) {
      return exc.LocationId === locationId;
    });
    return exception.length > 0 ? exception[0] : null;
  }

  // set UserDto
  ctrl.setProviderOnSchedule = setProviderOnSchedule;
  function setProviderOnSchedule(provider) {
    //Logging//console.log('setProviderOnSchedule');
    // NOTE if we have filter by multiple locations we will need to use the filter value rather than the current location
    var currentLocation = locationService.getCurrentLocation();
    // providers that have provider types other than 1 (dentist) or 2(hygeniest) default to $$ShowOnSchedule = false
    provider.UserDto.$$ShowOnSchedule = false;
    if (
      provider.UserDto.ProviderTypeId === 1 ||
      provider.UserDto.ProviderTypeId === 2
    ) {
      provider.UserDto.$$ShowOnSchedule = true;
    }

    // if have exceptions find matching and override default setting
    if (provider.ShowOnScheduleExceptions) {
      var exception = ctrl.findMatchingException(provider, currentLocation.id);
      if (exception) {
        provider.UserDto.$$ShowOnSchedule = exception.ShowOnSchedule;
      }
    }
  }

  // get rooms by location only when the location changes
  // Refactor and move code to LocationService
  ctrl.getLocationRooms = getLocationRooms;
  function getLocationRooms(locationId) {
    //Logging//console.log('getLocationRooms');

    var rooms = roomsService.findAllByLocationId(locationId);
    // empty object indicates the current rooms are for another location and we need to filter records again
    // conditionally we also need to check if the page just loaded as this would mean we need to refilter the list.
    if (_.isEmpty(rooms) || ctrl.pageJustLoaded === true) {
      ctrl.pageJustLoaded = false;
      var ofcLocation = locationsService.findByLocationId(locationId);
      roomsService.rooms = ofcLocation.Rooms;

      //ensure appointmentId and PersonId have values before running method.
      if (
        $scope.appointment.Data.AppointmentId &&
        $scope.appointment.Data.PersonId &&
        $scope.appointment.Data.PersonId !== ''
      ) {
        ctrl.getRoomAssignmentsForExistingAppointment();
      }

      if (
        $scope.appointment &&
        $scope.appointment.Data &&
        $scope.appointment.Data.TreatmentRoomId
      ) {
        $scope.selectedTreatmentRoomId =
          $scope.appointment.Data.TreatmentRoomId;
      }
      ctrl.sortingRooms = true;

      // if rooms were already loaded in the order we want them in we would never have to do this.
      roomsService.rooms = _.orderBy(roomsService.rooms, 'Name');
      ctrl.sortingRooms = false;

      $scope.rooms = roomsService.rooms;
    }
  }

  //#region flyout functions
  //new flyout function variables, use from now forward, remove above
  $scope.watches = [];

  $scope.preventiveDate = { dueDate: '' };
  $scope.dataLoadingProposed = { loading: false };
  $scope.dataLoadingTreatment = { loading: false };
  $scope.dataLoadingPreventive = { loading: false };
  $scope.dataLoadingNewService = { loading: false };
  $scope.popOverTracker = { closeAllCharge: false, closeAllEstIns: false };

  $scope.showProposedFlyout = showProposedFlyout;
  function showProposedFlyout() {
    //Logging//console.log('showProposedFlyout');
    $rootScope.$broadcast('closeFlyouts');
    $rootScope.$broadcast('openProposedSelectorFlyout');
  }
  $scope.showTxPlansFlyout = showTxPlansFlyout;
  function showTxPlansFlyout() {
    //Logging//console.log('showTxPlansFlyout');
    $rootScope.$broadcast('closeFlyouts');
    $rootScope.$broadcast('openTreatmentPlanFlyout');
    $scope.plannedServiceIds = $scope.plannedServices.map(function (ps) {
      return ps.ServiceTransactionId;
    });
    $scope.servicesOnAppointment = _.map($scope.plannedServices, function (st) {
      return {
        ServiceTransactionId: st.ServiceTransactionId,
        InsuranceOrder: st.InsuranceOrder,
      };
    });
  }
  $scope.showPreventiveFlyout = showPreventiveFlyout;
  function showPreventiveFlyout() {
    //Logging//console.log('showPreventiveFlyout');
    $rootScope.$broadcast('closeFlyouts');
    $rootScope.$broadcast('openPreventiveCareFlyout');
  }
  $scope.showServiceFlyout = showServiceFlyout;
  function showServiceFlyout() {
    //Logging//console.log('showServicesFlyout');
    $rootScope.$broadcast('closeFlyouts');
    $rootScope.$broadcast('openNewServicesFlyout');
  }
  $scope.isChrome = window.PattersonWindow.isChrome;

  //#endregion

  //#region helper methods
  // set button state for buttons based on active state of patient
  ctrl.setButtonState = setButtonState;
  function setButtonState() {
    //Logging//console.log('setButtonState');
    if ($scope.patient) {
      if ($scope.patient.IsActive === false) {
        $scope.datePickerTooltip =
          $scope.appointmentModalText.cannotScheduleForInactive;
        $scope.serviceButtonTooltip =
          $scope.appointmentModalText.cannotProposeServiceForInactive;
        $scope.txPlanButtonTooltip =
          $scope.appointmentModalText.cannotProposeServiceForInactive;
        $scope.preventiveButtonTooltip =
          $scope.appointmentModalText.cannotPreventativeCareForInactive;
        // clearing date
        if ($scope.appointmentDate !== null) {
          $scope.backupApptDate = $scope.appointmentDate;
        }
        if ($scope.appointmentTime.start !== null) {
          $scope.backupTime = $scope.appointmentTime;
        }
        $scope.appointmentDate = null;
        $scope.disableWhenPatientInactiveOrReadOnly = true;
        $scope.disableWhenPatientInactive = true;
      } else if (
        !listHelper.findItemByFieldValue(
          appointmentModalProvidersService.modalProviders,
          'Selected',
          true
        ) &&
        $scope.appointment.Data.Classification == 0
      ) {
        $scope.serviceButtonTooltip =
          $scope.appointmentModalText.pleaseSelectProvider;
        $scope.txPlanButtonTooltip =
          $scope.appointmentModalText.pleaseSelectProvider;
        $scope.preventiveButtonTooltip =
          $scope.appointmentModalText.pleaseSelectProvider;
      } else {
        $scope.datePickerTooltip = '';
        $scope.serviceButtonTooltip = '';
        $scope.txPlanButtonTooltip = '';
        $scope.preventiveButtonTooltip = '';
        if ($scope.appointmentDate === null) {
          // I do not want to set the value as undefined because in some cases at startup that causes the watches to kick in which then changes things or unscheduled appointments.
          // I understand if you think this is a hack ... you are right. I did this to avoid having to break a large part of the modal and refactor
          // the code in a way that would cause more concerns to the team. We will have to come back in and fix the change tracking to address this
          // and other problems in a more sustainable way.
          if ($scope.backupApptDate === undefined) {
            $scope.appointmentDate = null;
          } else {
            $scope.appointmentDate = $scope.backupApptDate;
          }

          // only reset the appointment time if the backup time has been initialized
          // this happens only when a patient was inactive then re activated
          if (!_.isNil($scope.backupTime)) {
            $scope.appointmentTime = $scope.backupTime;
          }
        }
        $scope.disableWhenPatientInactiveOrReadOnly = $scope.readOnly;
        $scope.disableWhenPatientInactive = false;
      }
    }
  }

  // emitted by each one of the tab content directives to tell the tabset to close as well
  $scope.$on('soar:appt-tab-action-canceled', function () {
    //Logging//console.log('soar:appt-tab-action-canceled on');
    $scope.showTabset = false;
  });

  ctrl.inactivePatientMessage = inactivePatientMessage;
  function inactivePatientMessage() {
    //Logging//console.log('inactivePatientMessage');
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
  }

  ctrl.setPatientActive = setPatientActive;
  function setPatientActive() {
    //Logging//console.log('setPatientActive');
    personFactory
      .SetPersonActiveStatus($scope.patient.PatientId, true, false)
      .then(function (res) {
        if (res) {
          $scope.patient.IsActive = true;
          $scope.appointment.Data.Patient.IsActive = true;
          globalSearchFactory.SaveMostRecentPerson($scope.patient.PatientId);
          $rootScope.$broadcast('patient-personal-info-changed');
        }
      });
  }

  ctrl.cancelActivation = cancelActivation;
  function cancelActivation() {
    //Logging//console.log('cancelActivation');
    $rootScope.$broadcast('soar:refresh-most-recent');
    $scope.patient = null;
  }

  //#endregion

  //#region helper functions for provider

  $scope.closeProviderDropdown = closeProviderDropdown;
  function closeProviderDropdown() {
    //Logging//console.log('closeProviderDropdown');
    if ($scope.multiSelect.open) {
      $scope.multiSelect.open = false;
    }
  }

  //#endregion

  //#region helper functions

  $scope.toggleIcon = toggleIcon;
  function toggleIcon() {
    //Logging//console.log('toggleIcon');
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
      angular.element('#unschedPatientApptsCountIcon').addClass('fa-angle-up');
      angular.element('#unscheduledList').addClass('collapse');

      $scope.open = false;
    }
  }

  $scope.addStatusNote = addStatusNote;
  function addStatusNote() {
    //Logging//console.log('addStatusNote');
    $scope.addNote = true;
  }

  // add isProposed to all plannedServices
  $scope.applyProposedTag = applyProposedTag;
  function applyProposedTag() {
    //Logging//console.log('applyProposedTag');
    if ($scope.needToApplyPropTag) {
      _.forEach($scope.plannedServices, function (serv) {
        serv.$$isProposed = true;
      });
      $scope.needToApplyPropTag = false;
    }
  }

  //#endregion

  function onReferenceDataServiceLocationChanged() {
    //Logging//console.log('onReferenceDataServiceLocationChanged');
    ctrl.serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );
    appointmentTypesService.appointmentTypes = referenceDataService.get(
      referenceDataService.entityNames.appointmentTypes
    );
    $scope.appointmentTypes = appointmentTypesService.appointmentTypes;
  }

  //#region calculate discount and tax

  // isInitializing is true on load of page to reset the original ctrl.originalAppointmentData.PlannedServices and prevent hasChanges from being set to true on load
  ctrl.calculatePlannedServiceAmounts = calculatePlannedServiceAmounts;
  function calculatePlannedServiceAmounts(
    isInitializing,
    insuranceHasBeenEdited
  ) {
    //Logging//console.log('calculatePlannedServiceAmounts');
    //Logging//console.log('seems like this method should only be called when edit or ... when not drag.');
    if (!_.isEmpty($scope.plannedServices)) {
      // get tax, discount, then calc insurance estimates
      return ctrl
        .calculateTaxAndDiscountOnServices(isInitializing)
        .then(function () {
          $scope.calculateEstimatedAmount(
            isInitializing,
            insuranceHasBeenEdited
          );
        });
    }
  }

  // calculates tax, discount, and amount for a list of existing serviceTransactions attached to this appointment
  ctrl.calculateTaxAndDiscountOnServices = calculateTaxAndDiscountOnServices;
  function calculateTaxAndDiscountOnServices(isInitializing) {
    //Logging//console.log('calculateTaxAndDiscountOnServices');
    if ($scope.patient && $scope.patient.PersonAccount) {
      return patientServicesFactory
        .GetTaxAndDiscount($scope.plannedServices)
        .then(function (res) {
          var serviceTransactions = res.Value;
          ctrl.processTaxAndDiscount(serviceTransactions, isInitializing);
        });
    } else {
      var personId = { personId: $scope.appointment.Data.PersonId };
      return patientServicesFactory
        .GetTaxAndDiscountByPersonId($scope.plannedServices, personId)
        .then(function (res) {
          var serviceTransactions = res.Value;
          ctrl.processTaxAndDiscount(serviceTransactions, isInitializing);
        });
    }
  }

  // find matching record in plannedServices and transfer calculates tax, discount, and amount since
  // the returned dataset will not contain any dynamic properties
  ctrl.processTaxAndDiscount = processTaxAndDiscount;
  function processTaxAndDiscount(serviceTransactions, isInitializing) {
    //Logging//console.log('processTaxAndDiscount');
    _.forEach($scope.plannedServices, function (plannedService) {
      var match = _.find(serviceTransactions, function (serviceTransaction) {
        return (
          serviceTransaction.ServiceCodeId === plannedService.ServiceCodeId &&
          serviceTransaction.Fee === plannedService.Fee
        );
      });
      if (!_.isNil(match)) {
        // set Amount, Discount, and Tax on original list
        if (match.Amount !== plannedService.Amount) {
          plannedService.Amount = match.Amount;
          plannedService.ObjectState =
            plannedService.ObjectState === saveStates.Add
              ? saveStates.Add
              : saveStates.Update;
        }
        if (match.Discount !== plannedService.Discount) {
          plannedService.Discount = match.Discount;
          plannedService.ObjectState =
            plannedService.ObjectState === saveStates.Add
              ? saveStates.Add
              : saveStates.Update;
        }
        if (match.Tax !== plannedService.Tax) {
          plannedService.Tax = match.Tax;
          plannedService.ObjectState =
            plannedService.ObjectState === saveStates.Add
              ? saveStates.Add
              : saveStates.Update;
        }
      }
    });
    // if this is on the initial load update original so hasChanges is false
    if (isInitializing === true) {
      ctrl.originalAppointmentData.PlannedServices = JSON.parse(
        JSON.stringify($scope.plannedServices)
      );
      $scope.appointment.Data.PlannedServices = JSON.parse(
        JSON.stringify($scope.plannedServices)
      );
    }
  }

  //#endregion

  //#region kendo method extensions

  ctrl.assignPreferredProviderByAppointmentType = assignPreferredProviderByAppointmentType;
  function assignPreferredProviderByAppointmentType(
    appointmentType,
    recursiveCall
  ) {
    var provider;
    //Logging//console.log('assignPreferredProviderByAppointmentType');
    var appt = $scope.appointment.Data;
    var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    var selectedProviders = $scope.multipleProviders
      ? $scope.multipleProviders.selectedProviders
      : [];

    if (!patient) return;

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
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (prov) {
          prov.Selected = false;
        }
      );
      var prov = null;
      if (appointmentType && appointmentType.PerformedByProviderTypeId == 2) {
        prov = appointmentModalProvidersService.findByUserId(
          patient.PreferredHygienist
        );
      } else {
        appt.ExaminingDentist = null;
        prov = appointmentModalProvidersService.findByUserId(
          patient.PreferredDentist
        );
      }
      if (prov) {
        prov.Selected = true;
        $scope.multipleProviders = { selectedProviders: [prov] };
      }

      if (
        $scope.multipleProviders &&
        $scope.multipleProviders.selectedProviders &&
        $scope.multipleProviders.selectedProviders.length > 0
      ) {
        $scope.$broadcast('refreshSelectedCount');
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
        appt.UserId = ctrl.getAppointmentProviderId(appt, appointmentType);
        appt.ProviderId = appt.UserId;

        // determine if PreferredDentist is ShowOnSchedule before setting ExaminingDentist
        appt.ExaminingDentist = ctrl.getAppointmentExaminingDentistUserId(appt);
      } else {
        // if we're here, it's an appointment that has been flipped to an unscheduled appointment
        appt.ExaminingDentist = null;
        appt.UserId = ctrl.getAppointmentProviderId(appt, appointmentType);
        appt.ProviderId = appt.UserId;
      }
    }

    if (
      appointmentType &&
      appointmentType.PerformedByProviderTypeId == 2 &&
      (appt.ExaminingDentist == null ||
        angular.isUndefined(appt.ExaminingDentist) ||
        appt.ExaminingDentist.length != ctrl.emptyGuid.length)
    ) {
      // determine if PreferredDentist is ShowOnSchedule before setting ExaminingDentist
      appt.ExaminingDentist = ctrl.getAppointmentExaminingDentistUserId(appt);
    }
  }

  ctrl.getAppointmentProviderId = getAppointmentProviderId;
  function getAppointmentProviderId(appt, appointmentType) {
    // if the appointment already had a provider set, keep that provider. if the appointment does not have
    //   a provider set, use the patient's preferred dentist

    if (
      appt.ProviderAppointments !== null &&
      appt.ProviderAppointments !== undefined &&
      appt.ProviderAppointments.length > 0 &&
      appt.ProviderAppointments[0].UserId !== null &&
      appt.ProviderAppointments[0].UserId !== undefined
    ) {
      return appt.ProviderAppointments[0].UserId;
    }

    let patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;

    if (appointmentType === null || appointmentType === undefined) {
      // 2 means it's a hygienist appointment type.
      // unscheduled appointment wont' have an appointment type set out of the gate
      // this should _only_ show the preferred dentist.
      // a hygeinist should _only_ be set as the provider on hygeinist appointment types
      return patient.PreferredDentist;
    } else if (appointmentType.PerformedByProviderTypeId === 2) {
      // 2 means it's a hygienist appointment type.
      return patient.PreferredHygienist; // always return this, even if null.
    } else {
      // otherwise, see if they have a hygienist set. if they do, return that. otherwise, return the dentist.
      return patient.PreferredDentist;
    }

    //return patient.PreferredDentist; // this is a guid - the userid.
  }

  ctrl.getAppointmentExaminingDentistUserId = getAppointmentExaminingDentistUserId;
  function getAppointmentExaminingDentistUserId(appt) {
    // if the appointment already had an examining dentist set, keep that examining dentist. if the appointment does not have
    //   an examining dentist set, use the patient's preferred dentist
    if (
      appt.ExaminingDentist !== null &&
      appt.ExaminingDentist !== undefined &&
      appt.ExaminingDentist !== '' &&
      appt.ExaminingDentist !== 'noexam' &&
      appt.ExaminingDentist !== 'any'
    ) {
      return appt.ExaminingDentist; // this is a guid - the userid.
    }

    let patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    let provider = _.find($scope.localProviders, function (provider) {
      return provider.UserId === patient.PreferredDentist;
    });

    if (provider && provider.ShowOnSchedule === true) {
      return provider.UserId;
    }

    if (patient.PreferredDentist === null) {
      return ''; // empty string will select the ' - Select Examining Dentist - ' option, which is what we want to happen in this case.
    }

    return patient.PreferredDentist; // this is a guid - the userid.
  }

  ctrl.adjustAppointmentTimeByAppointmentType = adjustAppointmentTimeByAppointmentType;
  function adjustAppointmentTimeByAppointmentType(appointmentType) {
    //Logging//console.log('adjustAppointmentTimeByAppointmentType');
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
        false; //override was dragged validation
      $scope.appointmentTime.end = appointmentWasDragged
        ? $scope.appointmentTime.end
        : endTime.toISOString();

      ctrl.setAppointmentDateTime(
        $scope.appointmentDate,
        $scope.appointmentTime
      );

      $timeout($scope.forceRefresh, 100);
    } else if ($scope.appointmentTime) {
      $scope.appointmentTime.end = null;
      $scope.appointmentTime.Duration = appointmentType
        ? appointmentType.DefaultDuration
        : $scope.appointmentTime.Duration;
    } else {
      $scope.appointmentTime = { Duration: appointmentType.DefaultDuration };
    }
  }

  $scope.forceRefresh = forceRefresh;
  function forceRefresh() {
    //Logging//console.log('forceRefresh ... scope.$apply');
    $scope.$apply();
  }

  $scope.appointmentTypeChanged = appointmentTypeChanged;
  function appointmentTypeChanged(nv, ov) {
    //Logging//console.log('appointmentTypeChanged');
    if (nv != ov) {
      if (nv) {
        let priorSelectedAppointmentType = $scope.selectedAppointmentType;
        $scope.selectedAppointmentType = appointmentTypesService.findByAppointmentTypeId(
          $scope.appointment.Data.AppointmentTypeId
        );

        if (!$scope.appointment.Data.WasDragged) {
          ctrl.adjustAppointmentTimeByAppointmentType(
            $scope.selectedAppointmentType
          );
        }

        // reset the Examining Dentist value if the type selected does not require one.
        if (
          priorSelectedAppointmentType !== $scope.selectedAppointmentType &&
          $scope.selectedAppointmentType.PerformedByProviderTypeId != 2
        ) {
          $scope.appointment.Data.ExaminingDentist = null;
        }

        ctrl.assignPreferredProviderByAppointmentType(
          $scope.selectedAppointmentType
        );
      } else if (
        (nv == '' || nv == null) &&
        !$scope.appointment.Data.WasDragged
      ) {
        ctrl.adjustAppointmentTimeByAppointmentType(null);
      }
      $scope.appointment.Data.AppointmentType = appointmentTypesService.findByAppointmentTypeId(
        $scope.appointment.Data.AppointmentTypeId
      );
      ctrl.checkPreferredProviders();
      ctrl.checkIfAppointmentHasChanges();
    }
  }

  $scope.appointmentDurationChanged = appointmentDurationChanged;
  function appointmentDurationChanged(nv, ov) {
    //Logging//console.log('appointmentDurationChanged');
    if (nv !== ov) {
      ctrl.checkIfAppointmentHasChanges();
    }
  }

  $scope.serviceDataChanged = serviceDataChanged;
  function serviceDataChanged() {
    //Logging//console.log('serviceDataChanged');
    ctrl.checkIfAppointmentHasChanges();
  }

  $scope.appointmentDataChanged = appointmentDataChanged;
  function appointmentDataChanged(nv, ov) {
    //Logging//console.log('appointmentDataChanged');
    if (nv !== ov) {
      ctrl.checkIfAppointmentHasChanges();
    }
  }

  $scope.appointmentDateChanged = appointmentDateChanged;
  function appointmentDateChanged(nv, ov) {
    //Logging//console.log('appointmentDateChanged');
    if (nv !== ov) {
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
          /** update time pickers */
          $scope.appointmentDate = newDate;
          // we need to add the new date in with the existing time for start and end.
          // our existing design is a little odd so this is the solution
          // without refactoring our control architecture.
          var startHours = $scope.appointment.Data.StartTime.getHours();
          var startMinutes = $scope.appointment.Data.StartTime.getMinutes();
          $scope.appointment.Data.StartTime = new Date(newDate.getTime());
          $scope.appointment.Data.StartTime.setHours(startHours);
          $scope.appointment.Data.StartTime.setMinutes(startMinutes);

          var endHours = $scope.appointment.Data.EndTime.getHours();
          var endMinutes = $scope.appointment.Data.EndTime.getMinutes();
          $scope.appointment.Data.EndTime = new Date(newDate.getTime());
          $scope.appointment.Data.EndTime.setHours(endHours);
          $scope.appointment.Data.EndTime.setMinutes(endMinutes);

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
          $scope.selectedLocation = locationsService.findByLocationId(
            $scope.appointment.Data.LocationId
          );
        }
        if (
          angular.isUndefined($scope.selectedLocation) ||
          $scope.selectedLocation === null
        ) {
          $scope.selectedLocation = $scope.appointment.Data.Location;
        }
      } else if (nv == null) {
        /** this prevents scheduled appointments from going unscheduled
         *  ProposedDuration is a required field for unscheduled appointments
         */

        ctrl.switchToUnscheduledAppointment($scope.appointment);
      }

      ctrl.checkIfAppointmentHasChanges();
    }
  }

  //#region conflicts handling

  $scope.loadConflicts = loadConflicts;
  function loadConflicts() {
    //Logging//console.log('loadConflicts');
    $scope.loadingConflicts = true;
    $scope.blockExistsMsg = null;

    var appointment = _.cloneDeep($scope.appointment.Data);
    if (appointment.StartTime && appointment.EndTime) {
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
    } else {
      $scope.loadingConflicts = false;
    }
  }

  $scope.blockExistsMsg = null;
  $scope.examiningOutsideWorkingHours = false;
  $scope.loadingConflicts = false;
  $scope.examiningDentistBlockMsg = null;
  $scope.getConflicts = getConflicts;
  function getConflicts() {
    //Logging//console.log('getConflicts');

    // this variable is used to ensure the conflicts check can happen earlier on start up
    if ($scope.loadingConflictsDataForTheFirstTime === false) {
      $scope.loadConflicts();
    } else {
      $scope.loadingConflictsDataForTheFirstTime = false;
    }
  }

  ctrl.processConflictForSave = processConflictForSave;
  function processConflictForSave(conflict) {
    //Logging//console.log('processConflictForSave');
    // format conflict if exists
    $scope.appointmentTime.Valid = !conflict.IsBlock;

    // set $scope.appointment.Valid based on block
    if (conflict.IsBlock === true) {
      $scope.appointment.Valid = false;
    }
    // handle blocks for provider
    if (conflict.IsBlock) {
      if (!conflict.Block.IsAnotherLocation) {
        $scope.blockExistsMsg = localize.getLocalizedString(
          'An existing block or appointment is already scheduled from {0} to {1}. Please select another time.',
          [conflict.Block.$$From, conflict.Block.$$To]
        );
      } else {
        // For the time being we need to unblock our users from this issue because we do not have time to resolve the full problem.
        // This is a solution so we can move forward and address the problem next year with more time to look at the issue.
        //conflict.IsBlock = false;
        //$scope.blockExistsMsg = localize.getLocalizedString('The provider {0} is already scheduled from {1} to {2} at the {3} location. Please select another time.', [conflict.Block.$$ProviderName, conflict.Block.$$From, conflict.Block.$$To, conflict.Block.LocationName]);
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
  }

  //#endregion

  $scope.changedTreatmentRoom = changedTreatmentRoom;
  function changedTreatmentRoom(e) {
    //Logging//console.log('changedTreatmentRoom');
    var index = e.sender.selectedIndex;

    if (index > 0) {
      $scope.appointment.Data.Room = roomsService.rooms[index - 1];
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
  }

  $scope.serviceChangedProvider = serviceChangedProvider;
  function serviceChangedProvider(e) {
    //Logging//console.log('serviceChangedProvider');
    e.ObjectState = 'Update';
    ctrl.checkIfAppointmentHasChanges();
  }

  $scope.changedProvider = changedProvider;
  function changedProvider(e) {
    //Logging//console.log('changedProvider');
    var index = e.sender.selectedIndex;

    if (index > 0) {
      $scope.appointment.Data.Provider =
        appointmentModalProvidersService.modalProviders[index - 1];
      ctrl.getRoomAssignmentsForProvider(
        ctrl.location.LocationId,
        appointmentModalProvidersService.modalProviders[index - 1].UserId,
        $scope.appointment.Data.StartTime,
        $scope.appointment.Data.EndTime
      );
    } else {
      $scope.appointment.Data.Provider = null;
      e.sender.options.$angular[0].provider.UserId = null;
      ctrl.resetRoomAssignments();
    }
    ctrl.checkIfAppointmentHasChanges();
  }

  ctrl.checkPreferredProviders = checkPreferredProviders;
  function checkPreferredProviders() {
    //Logging//console.log('checkPreferredProviders');
    // slight change ... if $scope.patient is not set we are going to default the value of highlighted = false.
    // this ensures less processing. we could also change this to be set by default for providers on new appointment.
    var value = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    if (value) {
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (provider) {
          provider.highlighted = $scope.isPrefferredProvider(provider);
        }
      );
    }
  }

  // if it is a hygiene appt and the preferred dentist is not selected as the examining dentist, show a message
  ctrl.checkForPreferredNotSelected = checkForPreferredNotSelected;
  function checkForPreferredNotSelected() {
    //Logging//console.log('checkForPreferredNotSelected');
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
  }

  ctrl.hasChanges = hasChanges;
  function hasChanges(changedObject, originalObject, excludedProperties) {
    //Logging//console.log('hasChanges');
    var hasChanged = false;
    if (_.isEmpty(excludedProperties)) {
      return _.isEqual(changedObject, originalObject);
    } else {
      var propertiesList = [];
      function mapObjectKeys(objectToMap, parent) {
        //Logging//console.log('mapObjectKeys');
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
            propertiesList.push(propName);
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
  }

  ctrl.diff = diff;
  function diff(changedObject, originalObject) {
    //Logging//console.log('diff');
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
  }

  ctrl.sortDate = sortDate;
  function sortDate(firstDate, secondDate) {
    //Logging//console.log('sortDate');
    let fDate = moment.isMoment(firstDate) ? firstDate : moment(firstDate);
    let sDate = moment.isMoment(secondDate) ? secondDate : moment(secondDate);

    if (fDate.isSame(sDate)) {
      return 0;
    }

    return fDate.isBefore(sDate) ? -1 : 1;
  }

  ctrl.minDate = minDate;
  function minDate(dateList) {
    //Logging//console.log('minDate');
    if (_.isArray(dateList) && !_.isEmpty(dateList)) {
      return _.first(dateList.sort(ctrl.sortDate));
    }

    return null;
  }

  ctrl.minDateBy = minDateBy;
  function minDateBy(dateList, iteratee) {
    //Logging//console.log('minDateBy');
    return ctrl.minDate(_.map(dateList, iteratee));
  }

  ctrl.maxDate = maxDate;
  function maxDate(dateList) {
    //Logging//console.log('maxDate');
    if (_.isArray(dateList) && !_.isEmpty(dateList)) {
      return _.last(dateList.sort(ctrl.sortDate));
    }

    return null;
  }

  ctrl.maxDateBy = maxDateBy;
  function maxDateBy(dateList, iteratee) {
    //Logging//console.log('maxDateBy');
    return ctrl.maxDate(_.map(dateList, iteratee));
  }

  ctrl.checkIfAppointmentHasChanges = checkIfAppointmentHasChanges;
  function checkIfAppointmentHasChanges() {
    //Logging//console.log('checkIfAppointmentHasChanges');
    /// check if service actions should be enabled.
    // operations used to be on the view and was causing a lot of problems.
    $scope.blockServiceActions =
      $scope.readOnly ||
      $scope.disableIfStatusComplete ||
      $scope.canAddServices();

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
          originalAppointmentExclusions.push('ProviderAppointments.StartTime');
          originalAppointmentExclusions.push('ProviderAppointments.EndTime');
        }
      }

      // fix a weird difference in values when the two are setup for the first time
      if (
        ctrl.originalAppointmentData.Patient === undefined &&
        $scope.appointment.Data.Patient === null
      ) {
        ctrl.originalAppointmentData.Patient = null;
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
        $scope.appointment.Data.ProviderAppointments[0].ObjectState !== 'Add' &&
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

      if (!hasChanges) {
        let plannedServicesExclusions = [
          'InsuranceEstimate',
          'IsEligibleForDiscount',
          'applyDiscount',
          'TaxableServiceTypeId',
          'isDiscounted',
          'IsActive',
          'InactivationDate',
          '$$isProposed',
          '$$hashKey',
          'InsuranceEstimates.InsuranceEstimate',
          'InsuranceEstimates.IsEligibleForDiscount',
          'InsuranceEstimates.applyDiscount',
          'InsuranceEstimates.TaxableServiceTypeId',
          'InsuranceEstimates.isDiscounted',
          'InsuranceEstimates.ObjectState',
          'originalProvider',
          'InsuranceEstimates',
        ];

        hasChanges = ctrl.hasChanges(
          $scope.plannedServices,
          ctrl.originalAppointmentData.PlannedServices,
          plannedServicesExclusions
        );
      }

      //Logging//console.log('hasChanges: ' + hasChanges + ' and old value = ' + $scope.hasChanges);
      $scope.hasChanges = hasChanges;
    }
  }

  ctrl.setRoomAssignedFlag = setRoomAssignedFlag;
  function setRoomAssignedFlag() {
    //Logging//console.log('setRoomAssignedFlag');
    if ($scope.appointment.Data.TreatmentRoomId > '') {
      let room = roomsService.findByRoomId(
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
  }

  $scope.changedExaminingDentist = changedExaminingDentist;
  function changedExaminingDentist(nv, ov) {
    if (nv != ov || nv === 'any') {
      //Logging//console.log('changedExaminingDentist');
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
  }

  $scope.statusChanged = statusChanged;
  function statusChanged(
    appointment,
    autoSave,
    closeModal,
    afterSave,
    updatedAppointments,
    setManualUpdateFlag
  ) {
    //Logging//console.log('statusChanged');
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

      if (!_.isUndefined(appt.Status) && !_.isNull(appt.Status)) {
        $scope.readOnly =
          appt.Status.toString() ===
          appointmentStatusService.appointmentStatusEnum.Completed.toString();
      }

      // if we want to save for all status changes, the following condition will need to change
      // the else if condition is only satisfied currently for checkout
      if (autoSave == true && setManualUpdateFlag) {
        $scope.saveClicked = true;
        var appointmentUpdate = {
          appointmentId: appointment.AppointmentId,
          DataTag: appointment.DataTag,
          NewAppointmentStatusId: appt.Status,
          StartAppointment: false,
        };

        if (setManualUpdateFlag === true) {
          appointmentUpdate.manuallyUpdateStatus = true;
        }

        // set original dates so we can re-assign in a bit.

        var dates = {
          StartDate: $scope.appointment.Data.StartTime,
          EndDate: $scope.appointment.Data.EndTime,
        };
        appointmentStorageService.appointmentDates = dates;

        scheduleServices.AppointmentStatusUpdate.Update(
          appointmentUpdate,
          ctrl.autoSaveAppointmentStatusSuccessful,
          ctrl.autoSaveAppointmentStatusFailed
        );
      } else if (closeModal == true && autoSave == true) {
        $scope.saveAppointment();
      }
    }

    if (closeModal === true && ctrl.blockModalClose === false) {
      $scope.closePage();
    }
  }

  ctrl.autoSaveAppointmentStatusFailed = autoSaveAppointmentStatusFailed;
  function autoSaveAppointmentStatusFailed() {
    //Logging//console.log('autoSaveAppointmentStatusFailed');
    toastrFactory.error(
      localize.getLocalizedString('Failed to update status of {0}.', [
        'Appointment',
      ])
    );
    $scope.saveClicked = false;
  }

  ctrl.autoSaveAppointmentStatusSuccessful = autoSaveAppointmentStatusSuccessful;
  function autoSaveAppointmentStatusSuccessful(result) {
    //Logging//console.log('autoSaveAppointmentStatusSuccessful');
    if (!_.isNil(result) && !_.isNil(result.Value)) {
      toastrFactory.success(
        localize.getLocalizedString('{0} status updated successfully.', [
          'Appointment',
        ]),
        'Success'
      );

      $scope.saveClicked = false;
      $scope.appointment.Data.Status = result.Value.Status;
      $scope.appointment.Data.DataTag = result.Value.DataTag;

      var dates = appointmentStorageService.appointmentDates;
      $scope.appointment.Data.StartDate = dates.StartDate;
      $scope.appointment.Data.EndDate = dates.EndDate;

      $rootScope.$broadcast(
        'appointment:update-appointment',
        $scope.appointment.Data
      );
      $rootScope.$broadcast(
        'soar:appt-status-updated-via-pat-appt-ctrl',
        $scope.appointment.Data
      );
    } else {
      ctrl.autoSaveAppointmentStatusFailed();
    }
  }

  //#endregion

  //#region close / cancel modal methods

  $scope.closePage = closePage;
  function closePage() {
    $interval.cancel(ctrl.checkForLateAppointmentsCounter);

    appointmentViewVisibleService.changeAppointmentViewVisible(false, false);
  }

  $scope.switchToBlock = switchToBlock;
  function switchToBlock() {
    $scope.appointment.Data.IsSwitchToBlock = true;
    appointmentViewLoadingService.currentAppointmentSaveResult =
      $scope.appointment.Data;

    $scope.closePage();
  }

  ctrl.cleanupAppointmentDataForCancelModal = cleanupAppointmentDataForCancelModal;
  function cleanupAppointmentDataForCancelModal(appointment) {
    //Logging//console.log('cleanupAppointmentDataForCancelModal');
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
    if (appointment.TreatmentRoomId == null) delete appointment.TreatmentRoomId;
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
      $scope.appointment.Data.Status ==
      appointmentStatusService.appointmentStatusEnum.Late &&
      $scope.appointment.Data.OriginalStatus !=
      appointmentStatusService.appointmentStatusEnum.Late
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
  }

  //#endregion

  //#region schedule unscheduled

  ctrl.switchToUnscheduledAppointment = switchToUnscheduledAppointment;
  function switchToUnscheduledAppointment(appointment) {
    //Logging//console.log('switchToUnscheduledAppointment');
    $scope.appointment = appointment;
    $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);
    $scope.appointment.Data.Classification = 2;
    $scope.appointment.Data.StartTime = null;
    $scope.appointment.Data.EndTime = null;
    if (
      $scope.appointment.Data.ProviderAppointments &&
      $scope.appointment.Data.ProviderAppointments.length > 0
    ) {
      $scope.appointment.Data.ProviderAppointments[0].StartTime = null;
      $scope.appointment.Data.ProviderAppointments[0].EndTime = null;
    }

    // set the proposedDuration if a proposedDuration has been set, don't overwrite it (365545)
    if ($scope.appointmentTime.Duration) {
      $scope.appointment.Data.ProposedDuration =
        $scope.appointmentTime.Duration;
    } else {
      $scope.appointment.Data.ProposedDuration = appointment.Data
        .AppointmentType
        ? appointment.Data.AppointmentType.DefaultDuration
        : 30;
      $scope.appointmentTime.Duration =
        $scope.appointment.Data.ProposedDuration;
    }

    if (
      $scope.multipleProviders &&
      appointmentModalProvidersService.modalProviders
    ) {
      $scope.multipleProviders.selectedProviders = [];
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (item) {
          if (item.Selected) item.Selected = false;
        }
      );
    }

    $scope.appointmentDate = null;
    ctrl.reinitializeAppointmentTimes();
    ctrl.updateSelectedProvidersTime();

    $timeout(function () {
      ctrl.reInitializeHasChanges($scope.isInitializing);
      $scope.isInitializing = false;
      $scope.$broadcast('reinitializeList');
    }, 200);
  }

  //#endregion

  //#region add to clipboard

  $scope.addToClipboard = addToClipboard;
  function addToClipboard() {
    //Logging//console.log('addToClipboard');
    $scope.appointment.Data.IsPinned = true;
    // 328436 Add to Clipboard should set Status to Unconfirmed
    var unconfirmedStatus = appointmentStatusService.getUnconfirmedStatus();
    $scope.appointment.Data.Status = unconfirmedStatus.id;

    // if this is a scheduled appointment
    if ($scope.appointment.Data.Classification == 0) {
      // make unscheduled
      ctrl.switchToUnscheduledAppointment($scope.appointment);
    }

    $scope.selectedProvidersAndSelectedTimeSlotMatched = true;
    $scope.saveClicked = true;

    // new save code just for clipped Appointments
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
    var providerTimeValid = true;
    dateObject = $scope.appointmentDate;
    timeObject = $scope.appointmentTime;

    _.forEach($scope.providerAppointments, function (providerAppointment) {
      providerTimeValid = providerTimeValid && providerAppointment.Valid;
    });

    if (timeObject) {
      timeObject.Valid =
        timeObject.start != null &&
        moment(timeObject.start).isValid() &&
        timeObject.end != null &&
        moment(timeObject.end).isValid();
    }

    if (
      (timeObject && timeObject.Valid && dateObject && providerTimeValid) ||
      $scope.appointment.Data.Classification == 2
    ) {
      var params = {};
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
        $scope.appointment.Data.IsPinned = false;
        return;
      } else {
        $scope.appointment.Valid = true;
      }

      if ($scope.appointment.Valid) {
        var aftersave = ctrl.AfterAppointmentSavedSuccess;
        if ($scope.appointment.Data.Classification === 2) {
          if (
            $scope.appointment.Data.ProviderId === undefined ||
            $scope.appointment.Data.ProviderId === null
          ) {
            if (
              $scope.providerSchedules &&
              $scope.providerSchedules.length > 0 &&
              $scope.appointment.Data.ProviderAppointments &&
              $scope.appointment.Data.ProviderAppointments.length > 0
            ) {
              $scope.appointment.Data.UserId =
                $scope.appointment.Data.ProviderAppointments[0].UserId;
            } else {
              $scope.appointment.Data.UserId = null;
            }
          } else {
            $scope.appointment.Data.UserId = $scope.appointment.Data.ProviderId;
          }
        }
        $scope.appointment.Data.ProviderAppointments = null;
        $scope.providerAppointments = [];

        // Bug 389165 - Duration was not being persisted on save
        if (
          !_.isNil($scope.appointmentTime) &&
          !_.isNil($scope.appointmentTime.Duration)
        ) {
          $scope.appointment.Data.ProposedDuration = parseInt(
            $scope.appointmentTime.Duration
          );
        }

        // finally save the unscheduled appointment.
        $scope.saveAppointment(aftersave);
      } else {
        $scope.appointment.Valid = false;
      }
    } else {
      $scope.appointment.Valid = false;
    }

    if ($scope.appointment.Valid === false) {
      $scope.saveClicked = false;
      if (
        $scope.appointment.Data.IsPinned &&
        !ctrl.originalAppointmentData.IsPinned
      ) {
        $scope.appointment.Data.Classification =
          ctrl.orginalAppointmentData.Classification;
        $scope.appointment.Data.IsPinned = false;
        $scope.appointment.Data.ProposedDuration = null;
      }
    }
  }

  //#endregion

  //#region cancel / close / confirmation modals

  // close dialog on cancel
  $scope.showCancelModal = showCancelModal;
  function showCancelModal() {
    //Logging//console.log('showCancelModal');
    $scope.hasChanges = false;

    ctrl.checkIfAppointmentHasChanges();

    if ($scope.hasChanges) {
      modalFactory.CancelModal().then($scope.closePage);
    } else {
      $scope.closePage();
    }
  }

  //#endregion

  //#region confirm modals

  ctrl.confirmDelete = confirmDelete;
  function confirmDelete(reason) {
    //Logging//console.log('confirmDelete');
    if ($scope.appointment.Data.Classification != 1) {
      $scope.appointment.MarkAsDeleted(reason);
    } else {
      $scope.appointment.Delete();
    }
  }

  ctrl.cancelDelete = cancelDelete;
  function cancelDelete() {
    //Logging//console.log('cancelDelete');
    $scope.deleteClicked = false;
  }

  ctrl.confirmRemove = confirmRemove;
  function confirmRemove(appointment) {
    //Logging//console.log('confirmRemove');
    $scope.returnedAppointment = _.cloneDeep(appointment);

    appointmentViewLoadingService.currentAppointmentSaveResult =
      $scope.returnedAppointment;

    $scope.closePage();
  }

  ctrl.cancelRemove = cancelRemove;
  function cancelRemove() {
    //Logging//console.log('cancelRemove');
    $scope.removeClicked = false;
  }

  //#endregion

  //TODO save the service from prop-serv and just return service
  //#region add services from directives
  //This gets hit when New, Proposed, Preventive, or Tx Plan services get added to the appointment
  $scope.addServices = addServices;
  function addServices(data, useModal) {
    //Logging//console.log('addServices');
    ctrl.confirmServices(data, useModal);
  }

  ctrl.confirmServices = confirmServices;
  function confirmServices(returnedData, useModal) {
    //Logging//console.log('confirmServices');
    if (returnedData.PlannedServices.length > 0) {
      $scope.frmAppointment.$dirty = true;
    }
    var tempList = [];
    for (var i = 0; i < returnedData.PlannedServices.length; i++) {
      if (
        !returnedData.PlannedServices[i].ServiceTransactionId ||
        !ctrl.plannedServicesContains(returnedData.PlannedServices[i])
      ) {
        var service = angular.copy(returnedData.PlannedServices[i]);
        service.AppointmentId = $scope.appointment.Data.AppointmentId;
        service.LocationId = $scope.appointment.Data.LocationId;
        service.ProviderId = service.ProviderUserId;
        if (useModal) {
          tempList.push(service);
        } else {
          ctrl.addToQueue(service);
        }
      }
    }
    if (useModal) {
      $scope.modalAddService(tempList);
    } else {
      ctrl.addQueue();
    }
  }

  ctrl.addToPlannedServices = addToPlannedServices;
  function addToPlannedServices(service) {
    //Logging//console.log('addToPlannedServices');
    if (angular.isArray(service)) {
      _.forEach(service, function (serv) {
        serv.SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
          serv.Surface
        );
        serv.RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
          serv.Roots
        );
        $scope.plannedServices.push(serv);
        $scope.serviceCodes.push(serv);
        $scope.appointment.Data.PlannedServices.push(serv);
        $scope.appointment.Data.ServiceCodes.push(serv);
      });
    } else {
      service.SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
        service.Surface
      );
      service.RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
        service.Roots
      );
      $scope.plannedServices.push(service);
      $scope.serviceCodes.push(service);
      $scope.appointment.Data.PlannedServices.push(service);
      $scope.appointment.Data.ServiceCodes.push(service);
    }

    _.forEach($scope.plannedServices, function (service) {
      if (service.AccountMemberId === null) delete service.AccountMemberId;
    });

    // get tax, discount, then calc insurance estimates
    ctrl.calculatePlannedServiceAmounts(false);

    ctrl.checkIfAppointmentHasChanges();
  }

  //~~~~~~~~~~~~~~~Start tooth modal here~~~~~~~~~~~~~~~~~~~~~~~~~

  // favorite clicked
  $scope.modalAddService = modalAddService;
  function modalAddService(serviceCode) {
    //Logging//console.log('modalAddService');
    ctrl.servicesToAdd = [];
    if (angular.isArray(serviceCode)) {
      ctrl.servicesToAdd = serviceCode;
      $scope.currentCode = ctrl.servicesToAdd[0];
    } else {
      ctrl.servicesToAdd = [serviceCode];
      $scope.currentCode = serviceCode;
    }
    if (ctrl.servicesToAdd.length == 1) {
      $scope.SwiftCodesProgress = '';
      patientOdontogramFactory.setselectedChartButton(
        $scope.currentCode.ServiceCodeId
      );
      $scope.openToothCtrls(
        'Service',
        $scope.currentCode.Code,
        false,
        true,
        false
      );
    }
    if (ctrl.servicesToAdd.length > 1) {
      var firstCode = false;
      var lastCode = false;
      var index = 0;
      _.forEach(ctrl.servicesToAdd, function (serv) {
        serv.index = index;
        index++;
      });
      $scope.SwiftCodesProgress = localize.getLocalizedString(
        ' - ({0} of {1})',
        [1, ctrl.servicesToAdd.length]
      );
      firstCode = true;
      //open tooth controls
      patientOdontogramFactory.setselectedChartButton(
        $scope.currentCode.ServiceCodeId
      );
      var title = $scope.currentCode.Code + $scope.SwiftCodesProgress;
      $scope.openToothCtrls('Service', title, true, firstCode, lastCode);
    }
  }

  $scope.editServiceModal = editServiceModal;
  function editServiceModal(index, serviceCode) {
    //Logging//console.log('editServiceModal');
    ctrl.servicesToEdit = [];
    if (angular.isArray(serviceCode)) {
      ctrl.servicesToEdit = serviceCode;
      $scope.currentCode = ctrl.servicesToEdit[0];
    } else {
      ctrl.servicesToEdit = [serviceCode];
      $scope.currentCode = serviceCode;
    }
    //we should always hit this as this is the edit modal
    if (ctrl.servicesToEdit.length == 1) {
      $scope.SwiftCodesProgress = '';
      patientOdontogramFactory.setselectedChartButton(
        $scope.currentCode.ServiceCodeId
      );
      $scope.openToothCtrls(
        'Service',
        $scope.currentCode.Code,
        false,
        true,
        true,
        true
      );
    }
  }

  $scope.closeWindow = closeWindow;
  function closeWindow() {
    //Logging//console.log('closeWindow');
    $scope.toothCtrls.close();
    ctrl.addQueue();
  }

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('nextServiceCode', function () {
      //Logging//console.log('$rootScopeRegistration.push rootScope.on nextServiceCode');
      var index;
      if ($scope.currentCode.index) {
        index = $scope.currentCode.index;
      } else {
        index = listHelper.findIndexByFieldValue(
          ctrl.servicesToAdd,
          'ServiceCodeId',
          $scope.currentCode.ServiceCodeId
        );
      }
      if (index > -1 && index != ctrl.servicesToAdd.length - 1) {
        var firstCode = false;
        var lastindex = false;
        var nextIndex = index + 1;
        $scope.SwiftCodesProgress = localize.getLocalizedString(
          ' - ({0} of {1})',
          [nextIndex + 1, ctrl.servicesToAdd.length]
        );
        if (nextIndex >= ctrl.servicesToAdd.length - 1) lastindex = true;
        $scope.currentCode = ctrl.servicesToAdd[index + 1];
        patientOdontogramFactory.setselectedChartButton(
          $scope.currentCode.ServiceCodeId
        );
        var title = $scope.currentCode.Code + $scope.SwiftCodesProgress;
        // open tooth controls
        $scope.openToothCtrls('Service', title, true, firstCode, lastindex);
      } else {
        $scope.closeWindow();
      }
    })
  );

  $scope.openToothCtrls = openToothCtrls;
  function openToothCtrls(
    mode,
    title,
    isSwiftCode,
    firstCode,
    lastCode,
    editMode
  ) {
    //Logging//console.log('openToothCtrls');
    var editing = editMode ? true : false;
    var temptitle = '';
    if (editing) {
      temptitle = 'Edit ';
    } else {
      temptitle = 'Add ';
      // we want to passInfo to set the location but we want provider-selector to pick the default provider 442712 D1 5/13/2020
      $scope.currentCode.ProviderUserId = null;
    }
    $scope.toothCtrls.content(
      '<proposed-service-create-update mode="' +
      _.escape(mode) +
      '" passinfo="' +
      true +
      '" isswiftcode="' +
      _.escape(isSwiftCode) +
      '" isfirstcode="' +
      _.escape(firstCode) +
      '" islastcode="' +
      _.escape(lastCode) +
      '" isedit="' +
      _.escape(editing) +
      '" is-from-appointment-modal="' +
      true +
      '"></proposed-service-create-update>'
    );
    $scope.toothCtrls.setOptions({
      resizable: false,
      position: {
        top: '25%',
        left: '21.65%',
      },
      minWidth: 300,
      scrollable: false,
      iframe: false,
      actions: ['Close'],
      title: temptitle + mode + ' - ' + title,
      modal: true,
    });
    $scope.toothCtrls.open();
  }

  // Set the tooth controls properties
  $scope.initializeToothControls = initializeToothControls;
  function initializeToothControls(serviceTransaction) {
    //Logging//console.log('initializeToothControls');
    if (
      serviceTransaction.SwiftPickServiceCodes &&
      serviceTransaction.SwiftPickServiceCodes.length > 0
    ) {
      $scope.swiftPickSelected = serviceTransaction;
      var firstCode = false;
      var lastCode = false;
      if (serviceTransaction.SwiftPickServiceCodes.length != 0) {
        $scope.SwiftCodesProgress = localize.getLocalizedString(
          ' - ({0} of {1})',
          [1, serviceTransaction.SwiftPickServiceCodes.length]
        );
        firstCode = true;
        if (serviceTransaction.SwiftPickServiceCodes.length == 1)
          lastCode = true;
        patientOdontogramFactory.setselectedChartButton(
          serviceTransaction.SwiftPickServiceCodes[0].ServiceCodeId
        );
        patientOdontogramFactory.setSelectedSwiftPickCode(
          serviceTransaction.SwiftPickServiceCodes[0].SwiftPickServiceCodeId
        );
        var title =
          serviceTransaction.SwiftPickServiceCodes[0].Code +
          $scope.SwiftCodesProgress;
        $scope.openToothCtrls('Service', title, true, firstCode, lastCode);
      }
    } else {
      patientOdontogramFactory.setselectedChartButton(
        serviceTransaction.ServiceCodeId
      );

      patientServicesFactory.setActiveServiceTransactionId(
        serviceTransaction.ServiceTransactionId
      );
      // Open kendo window to add service
      var windowTitle = serviceTransaction.CdtCodeName
        ? serviceTransaction.CdtCodeName
        : serviceTransaction.Code;
      $scope.openToothCtrls('Service', windowTitle, false, true, false);
    }
  }

  //This gets hit when New, Proposed, Preventive, or Tx Plan services get added to the appointment
  ctrl.addToQueue = addToQueue;
  function addToQueue(service) {
    //Logging//console.log('addToQueue');
    if (service) {
      if (_.isArray(service)) {
        _.forEach(service, function (serv) {
          //This will add the InsuranceOrder Property with the correct insurunce order number
          //We use this to order the $scope.plannedServices on the appointment to keep track of the order in which the
          //services were added
          serv.InsuranceOrder = appointmentServiceTransactionsService.setNextInsuranceOrderForPlannedService(
            $scope.plannedServices
          );

          if ($scope.patient.PersonAccount) {
            serv.AccountMemberId =
              $scope.patient.PersonAccount.PersonAccountMember.AccountMemberId;
          }
          ctrl.populateAccountMemberId(serv);
          ctrl.queueToAdd.push(serv);
        });
      } else {
        //This will add the InsuranceOrder Property with the correct insurunce order number
        //We use this to order the $scope.plannedServices on the appointment to keep track of the order in which the
        //services were added
        service.InsuranceOrder = appointmentServiceTransactionsService.setNextInsuranceOrderForPlannedService(
          $scope.plannedServices
        );
        ctrl.populateAccountMemberId(service);
        ctrl.queueToAdd.push(service);
      }
    }
  }

  ctrl.populateAccountMemberId = populateAccountMemberId;
  function populateAccountMemberId(service) {
    if (
      $scope.patient.PersonAccount &&
      $scope.patient.PersonAccount.PersonAccountMember
    ) {
      service.AccountMemberId =
        $scope.patient.PersonAccount.PersonAccountMember.AccountMemberId;
    }
  }

  ctrl.addQueue = addQueue;
  function addQueue() {
    //Logging//console.log('addQueue');
    var tempList = [];
    if (ctrl.queueToAdd.length > 0) {
      tempList = _.cloneDeep(ctrl.queueToAdd);
      ctrl.queueToAdd = [];
      ctrl.addToPlannedServices(tempList);
    }
  }

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('updatedServicesToAdd', function (event, services) {
      //Logging//console.log('$rootScopeRegistrations.push rootScope on updatedServicesToAdd');
      ctrl.addToQueue(services);
    })
  );

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('edittedService', function (event, service) {
      //Logging//console.log('$rootScopeRegistration.push rootScope on edittedService');
      ctrl.editServiceUpdate(service);
    })
  );

  ctrl.editServiceUpdate = editServiceUpdate;
  function editServiceUpdate(service) {
    //Logging//console.log('editServiceUpdate');
    $scope.currentCode.Fee = service.Fee;
    $scope.currentCode.ProviderUserId = service.ProviderUserId;
    $scope.currentCode.Tooth = service.Tooth;
    $scope.currentCode.Surface = service.Surface;
    $scope.currentCode.Roots = service.Roots;
    $scope.currentCode.SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
      service.Surface
    );
    $scope.currentCode.RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
      service.Roots
    );
    $scope.currentCode.DateEntered = service.DateEntered;
    $scope.currentCode.ObjectState = service.ObjectState;
  }

  //~~~~~~~~~~~~~~~End Tooth Modal Here~~~~~~~~~~~~~~~~~~~~~~~~~~~

  ctrl.plannedServicesContains = plannedServicesContains;
  function plannedServicesContains(serviceToCheck) {
    //Logging//console.log('plannedServicesContains');
    var contains = false;
    var foundObject = listHelper.findItemByFieldValue(
      $scope.plannedServices,
      'ServiceTransactionId',
      serviceToCheck.ServiceTransactionId
    );
    if (foundObject) {
      contains = true;
    }
    return contains;
  }

  ctrl.getDefaultProviderIdForServiceCode = getDefaultProviderIdForServiceCode;
  function getDefaultProviderIdForServiceCode(
    serviceCode,
    appointment,
    appointmentType
  ) {
    //Logging//console.log('getDefaultProviderIdForServiceCode');
    var providerOnAppointment =
      appointment != null &&
        appointment.ProviderAppointments != null &&
        appointment.ProviderAppointments.length > 0
        ? appointment.ProviderAppointments[0].UserId
        : null;
    providerOnAppointment =
      !providerOnAppointment &&
        appointmentModalProvidersService.modalProviders &&
        appointmentModalProvidersService.modalProviders.length > 0
        ? appointmentModalProvidersService.modalProviders[0].UserId
        : providerOnAppointment;
    var examiningDentist =
      appointment != null ? appointment.ExaminingDentist : null;
    var serviceCodePerformedByHygienist =
      serviceCode != null && serviceCode.UsuallyPerformedByProviderTypeId == 2;
    var serviceCodePerformedByDentist =
      serviceCode != null && serviceCode.UsuallyPerformedByProviderTypeId == 1;
    var isHygieneAppointment =
      appointmentType != null && appointmentType.PerformedByProviderTypeId == 2;
    var isRegularAppointment =
      appointmentType != null && appointmentType.PerformedByProviderTypeId == 1;
    var hasAppointmentType = appointmentType != null;

    if (serviceCode != null && appointment != null) {
      if (hasAppointmentType) {
        if (isHygieneAppointment) {
          if (serviceCodePerformedByHygienist) {
            return providerOnAppointment;
          } else if (serviceCodePerformedByDentist) {
            return examiningDentist;
          } else {
            // This was null, but changed to default to the provider on the appointment because the rule changes that a proposed service should always have a provider id.
            return providerOnAppointment;
          }
        } else if (isRegularAppointment) {
          if (serviceCodePerformedByHygienist) {
            // This was null, but changed to default to the provider on the appointment because the rule changes that a proposed service should always have a provider id.
            return providerOnAppointment;
          } else if (serviceCodePerformedByDentist) {
            return providerOnAppointment;
          } else {
            return providerOnAppointment;
          }
        } else {
          return providerOnAppointment;
        }
      } else {
        return providerOnAppointment;
      }
    } else if (serviceCode != null && appointment == null && $scope.patient) {
      //For encounter services
      if (serviceCodePerformedByDentist && $scope.patient.PreferredDentist) {
        //If service is usually performed by dentist and the preferred dentist for a patient exists, set the provider user id for the service to preferred dentist
        return $scope.patient.PreferredDentist;
      } else if (
        serviceCodePerformedByHygienist &&
        $scope.patient.PreferredHygienist
      ) {
        //If service is usually performed by hygienist and the preferred hygienist for a patient exists, set the provider user id for the service to preferred dentist
        return $scope.patient.PreferredHygienist;
      } else {
        // This was null, but changed to default to the provider on the appointment because the rule changes that a proposed service should always have a provider id.
        return providerOnAppointment;
      }
    } else {
      // This was null, but changed to default to the provider on the appointment because the rule changes that a proposed service should always have a provider id.
      return providerOnAppointment;
    }
  }

  //#endregion

  //#region appointment validation & save, and planned services save

  ctrl.lookupProviderAppointment = lookupProviderAppointment;
  function lookupProviderAppointment(array, value) {
    //Logging//console.log('lookupProviderAppointment');
    return listHelper.findIndexByFieldValue(
      array,
      'ProviderAppointmentId',
      value
    );
  }

  ctrl.setAppointmentDateTime = setAppointmentDateTime;
  function setAppointmentDateTime(dateObject, timeObject) {
    //Logging//console.log('setAppointmentDateTime');
    // Convert time to date and set appointment.Data.StartTime/EndTime
    var date = dateObject ? new Date(dateObject) : null;

    var startWithDate, endWithDate;
    if (timeObject) {
      startWithDate = timeObject.start ? new Date(timeObject.start) : null;
      if (timeObject.end && timeObject.end !== 'Invalid date') {
        endWithDate = new Date(timeObject.end);
      } else {
        endWithDate = null;
      }
    } else {
      startWithDate =
        $scope.appointment &&
          $scope.appointment.Data &&
          $scope.appointment.Data.start
          ? new Date($scope.appointment.Data.start)
          : null;
      if (startWithDate && !_.isDate(startWithDate)) {
        // Bug 389165 - was seeing endWithDate = "Invalid Date" so added this check to protect against that
        startWithDate = null;
      }
      endWithDate =
        $scope.appointment &&
          $scope.appointment.Data &&
          $scope.appointment.Data.end
          ? new Date($scope.appointment.Data.end)
          : null;
      if (endWithDate && !_.isDate(endWithDate)) {
        // Bug 389165 - was seeing endWithDate = "Invalid Date" so added this check to protect against that
        endWithDate = null;
      }

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
  }

  ctrl.updateProviderAppointments = function () {
    let providerAppts = [];
    // assume all provider appointments are to be deleted by default
    $scope.appointment.Data.ProviderAppointments.forEach(function (provAppt) {
      // strip out any existing new provider appts, if valid will be added below
      if (provAppt.ObjectState !== saveStates.Add) {
        if (!(provAppt.StartTime instanceof Date)) {
          provAppt.StartTime = new Date(provAppt.StartTime);
        }
        if (!(provAppt.EndTime instanceof Date)) {
          provAppt.EndTime = new Date(provAppt.EndTime);
        }
        provAppt.ObjectState = saveStates.Delete;
        providerAppts.push(provAppt);
      }
    });
    providerAppts.map(function (pa) {
      if (pa.ObjectState !== saveStates.Add) {
        pa.ObjectState = saveStates.Delete;
        return pa;
      }
    });
    if ($scope.appointment.Data.Classification === 2) {
      // unscheduled appointment
      if (providerAppts.length > 0) {
        // this is a hacky trick - if saving the appt as unscheduled, save the UserId from the first record in the provider appts
        // to the main appointment object.  This will show that user as the provider and will automatically repopulate
        // the provider appointments with this user next time we open the modal.
        $scope.appointment.Data.UserId = providerAppts[0].UserId;
      }
    } else {
      // scheduled appointment
      $scope.providerSchedules.forEach(function (ps) {
        let found = false;
        providerAppts.forEach(function (pa) {
          // scanning existing provider appointments for a match of this checkbox
          if (
            ps.Start.getTime() === pa.StartTime.getTime() &&
            ps.End.getTime() === pa.EndTime.getTime() &&
            ps.ProviderId === pa.UserId
          ) {
            pa.ObjectState = saveStates.Update; // on second thought, don't delete this one
            found = true;
          }
          //Added this to overwrite the Object State. When a pinned appointment is created from Schedule New Appointment button and
          //when a pinned appointment goes from unscheduled to scheduled,
          //the providerAppts does not have a ProviderAppointmentId yet so it needs an ObjectState of add to add
          //to the ProviderAppointment table for the first time.
          if (found && !pa.hasOwnProperty('ProviderAppointmentId')) {
            pa.ObjectState = saveStates.Add;
          }
        });

        if (!found) {
          providerAppts.push({
            StartTime: ps.Start,
            EndTime: ps.End,
            UserId: ps.ProviderId,
            ObjectState: saveStates.Add,
          });
        }
      });
    }
    $scope.appointment.Data.ProviderAppointments = providerAppts;
  };

  $scope.selectedProvidersAndSelectedTimeSlotMatched = true;

  $scope.save = save;
  function save() {
    //Logging//console.log('save');
    $scope.selectedProvidersAndSelectedTimeSlotMatched = true;
    $scope.saveClicked = true;

    ctrl.updateProviderAppointments();

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

    switch ($scope.appointment.Data.Classification) {
      case 1:
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
        $scope.saveAppointment();
        break;
      case 2:
        /** set UserId by setting ProviderId... */
        $scope.appointment.Data.ProviderAppointments = [];
        $scope.providerAppointments = [];
        // Bug 389165 - Duration was not being persisted on save
        if (
          !_.isNil($scope.appointmentTime) &&
          !_.isNil($scope.appointmentTime.Duration)
        ) {
          $scope.appointment.Data.ProposedDuration = parseInt(
            $scope.appointmentTime.Duration
          );
        }
        $scope.saveAppointment();
        break;
      default:
        /** regular appointment */
        $scope.appointment.Data.Classification = 0;
        $scope.appointment.Data.IsPinned = false;
        $scope.appointment.Data.ProposedDuration = null;
        $scope.saveAppointment();
        break;
    }

    $scope.saveClicked = false;
    if (
      $scope.appointment.Data.IsPinned &&
      !ctrl.originalAppointmentData.IsPinned
    ) {
      $scope.appointment.Data.Classification =
        ctrl.orginalAppointmentData.Classification;
      $scope.appointment.Data.IsPinned = false;
      $scope.appointment.Data.ProposedDuration = null;
    }
  }

  ctrl.populateProvidersForPlannedServices = populateProvidersForPlannedServices;
  function populateProvidersForPlannedServices(appointment) {
    //Logging//console.log('populateProvidersForPlannedServices');
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
  }

  $scope.saveAppointment = saveAppointment;
  function saveAppointment(
    saveSuccessCallback = ctrl.AfterAppointmentSavedSuccess,
    showToast = true
  ) {
    //Logging//console.log('saveAppointment');
    $scope.appointment.Data.PersonId = $scope.patient
      ? $scope.patient.PatientId
      : null;
    $scope.appointment.Data.PersonId =
      $scope.newAppt.patient && !$scope.patient
        ? $scope.newAppt.patient.PatientId
        : $scope.appointment.Data.PersonId;

    $scope.appointment.Saving = true; //disable Save and Add to Clipboard if Saving

    ctrl.populateProvidersForPlannedServices($scope.appointment.Data);

    ctrl.backupProviderAppointments = _.cloneDeep(
      $scope.appointment.Data.ProviderAppointments
    );
    var providerId =
      $scope.appointment.Data.ProviderAppointments &&
        $scope.appointment.Data.ProviderAppointments.length > 0
        ? $scope.appointment.Data.ProviderAppointments[0].ProviderId
        : null;

    if ($scope.appointment.Data.Classification != 1) {
      var deletedServices = $scope.appointment.Data.PlannedServices.filter(
        function (i) {
          return i.ObjectState == saveStates.Update && i.AppointmentId === null;
        }
      );

      _.forEach($scope.appointment.Data.PlannedServices, function (service, i) {
        service.Description = null;
        if (
          service.ObjectState == saveStates.Update &&
          service.hasOwnProperty('InsuranceEstimates') &&
          service.InsuranceEstimates.length > 0 &&
          service.InsuranceEstimates[0].ObjectState != saveStates.Add &&
          service.InsuranceEstimates[0].EstimatedInsuranceId != ctrl.emptyGuid
        ) {
          var scopeService = $scope.plannedServices.filter(
            x => x.ServiceTransactionId === service.ServiceTransactionId
          );
          if (
            scopeService.length > 0 &&
            scopeService[0].InsuranceEstimates.length > 0
          ) {
            let updatedEstimates = [];
            for (
              let i = 0;
              i < scopeService[0].InsuranceEstimates.length;
              i++
            ) {
              updatedEstimates.push(scopeService[0].InsuranceEstimates[i]);
            }
            service.InsuranceEstimates = updatedEstimates;
          }
        } else if (
          service.hasOwnProperty('InsuranceEstimates') &&
          service.InsuranceEstimates.length > 0 &&
          service.InsuranceEstimates[0].ObjectState != saveStates.Add &&
          service.InsuranceEstimates[0].EstimatedInsuranceId == ctrl.emptyGuid
        ) {
          service.InsuranceEstimates[0].ObjectState = saveStates.None;
        }

        service.PersonId = $scope.appointment.Data.PersonId;
        service.ProviderId = providerId ? providerId : service.ProviderId;
        if (
          service.ObjectState == saveStates.Update &&
          service.AppointmentId === null
        ) {
          //BUG 486071 - Move service back to proposed status if service removed
          service.ServiceTransactionStatusId = 1;
        } else {
          service.ServiceTransactionStatusId = 7;
        }
      });
    }

    if ($scope.editing) {
      $scope.appointment.Data.Status = parseInt($scope.appointment.Data.Status);
      // check for late status and set back to original status
      var appointmentStatus = appointmentStatusService.findStatusByEnumValue(
        $scope.appointment.Data.Status
      );
      var item = appointmentStatusService.getLateStatus();

      if (appointmentStatus && appointmentStatus.id == item.id) {
        $scope.appointment.Data.Status = $scope.appointment.Data.OriginalStatus;
      }
    }

    //ctrl.backupPlannedServices = _.cloneDeep($scope.appointment.Data.PlannedServices); remove per note D1@9_18_19

    if (
      $scope.appointment.Data.Classification != 2 &&
      $scope.appointment.Data.StartTime
    ) {
      _.forEach(
        $scope.appointment.Data.ProviderAppointments,
        function (provAppt) {
          provAppt.StartTime = timeZoneFactory.ConvertDateToSaveString(
            provAppt.StartTime,
            $scope.appointment.Data.Location.Timezone
          );
          provAppt.EndTime = timeZoneFactory.ConvertDateToSaveString(
            provAppt.EndTime,
            $scope.appointment.Data.Location.Timezone
          );
        }
      );
    }

    appointmentViewValidationNewService.validateAppointment(
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
      $scope.appointment.Saving = false; //enable Save and Add to Clipboard if Saving
      return;
    } else {
      $scope.appointment.Valid = true;
    }

    var data = $scope.appointment.Data;
    $scope.backupAppointmentData = _.cloneDeep(data);
    var appointmentDto = {
      AppointmentId: data.AppointmentId ? data.AppointmentId : null,
      ProposedDuration: data.ProposedDuration,
      Patient: $scope.patient,
      PersonId: data.PersonId,
      TreatmentRoomId: data.TreatmentRoomId,
      UserId: data.UserId,
      Classification: data.Classification,
      Description: data.Description,
      Note: data.Note,
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
      ActualStartTime: data.ActualStartTime ? data.ActualStartTime : null,
      ActualEndTime: data.ActualEndTime ? data.ActualEndTime : null,
      ProviderAppointments: data.ProviderAppointments, //$scope.providerAppointments, // SHOULD CHANGE HTML TO US Data.ProviderAppointments INSTEAD....REFACTOR NEEDED
      PlannedServices: data.PlannedServices,
      ExaminingDentist:
        data.ExaminingDentist === 'any' || data.ExaminingDentist === 'noexam'
          ? null
          : data.ExaminingDentist,
      IsExamNeeded: data.IsExamNeeded,
      Status: data.Status,
      StatusNote: data.StatusNote,
      DataTag: data.DataTag,
      IsSooner: data.IsSooner,
      IsPinned: data.IsPinned,
      LocationId:
        data.LocationId && typeof data.LocationId != 'undefined'
          ? data.LocationId
          : data.Location.LocationId,
    };

    if (data.AppointmentTypeId)
      appointmentDto.AppointmentTypeId = data.AppointmentTypeId;

    // NOTE:: on save callback is NEVER used in this modal. I removed it.
    scheduleAppointmentModalService
      .saveAppointment(
        appointmentDto,
        $scope.appointment.Data.OriginalStatus,
        saveSuccessCallback,
        ctrl.AppointmentSaveOnError,
        showToast
      )
      .then(function (response) {
        //Setting the Saving flag to disable or enable buttons if server response fails or succeeds
        $scope.appointment.Saving = scheduleAppointmentModalService.getSavingFlag();
      });
  }

  ctrl.noteChangedTimer = null;

  $scope.noteChanged = noteChanged;
  function noteChanged() {
    $scope.disableSaveNotesButton = false; //Enables the notes save button when notes are entered
    //Logging//console.log('notChanged');
    ctrl.checkIfAppointmentHasChanges();
  }

  //This is called when the id="btnSaveNotesOnly" button is clicked
  //Its purpose is only to allow user to update notes when an appointment has a completed or ready for checkout status
  $scope.updateNote = updateNote;
  function updateNote(saveSuccessCallback = ctrl.AfterAppointmentSavedSuccess) {
    $scope.appointment.Saving = true;
    var data = $scope.appointment.Data;
    $scope.backupAppointmentData = _.cloneDeep(data);
    var appointmentDto = {
      AppointmentId: data.AppointmentId,
      DataTag: data.DataTag,
      Note: data.Note,
    };

    scheduleAppointmentModalService
      .updateNote(
        appointmentDto,
        saveSuccessCallback,
        ctrl.AppointmentSaveOnError
      )
      .then(function (response) {
        //Setting the Saving flag to disable or enable buttons if server response fails or succeeds
        $scope.appointment.Saving = scheduleAppointmentModalService.getSavingFlag();
      });
  }

  ctrl.cleanupCollection = cleanupCollection;
  function cleanupCollection(saved, original, display, findBy) {
    //Logging//console.log('cleanupCollection');
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
  }

  // NOTE: Need to update boundObject so it knows to return the returned value form the api. make it temporary, and only for this instance.
  ctrl.AfterAppointmentSavedSuccess = AfterAppointmentSavedSuccess;
  function AfterAppointmentSavedSuccess(returnedAppointment) {
    //Logging//console.log('AfterAppointmentSavedSuccess');
    $scope.returnedAppointment = returnedAppointment;
    appointmentViewLoadingService.currentAppointmentSaveResult = returnedAppointment;
    // fail gracefully
    if (
      $scope.returnedAppointment.ProviderAppointments &&
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
      $scope.returnedAppointment.PlannedServices &&
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
      //Im not sure why we are potentially throwing error terror toasters after save? But in anycase, the objectState needs to be returned to none if successful
      //so that the scheduler doesnt think that someone has made changes to its appointment.
      $scope.returnedAppointment.ObjectState = saveStates.None;
      if (ctrl.afterAppointmentStatusAutoSave != null) {
        ctrl.afterAppointmentStatusAutoSave($scope.returnedAppointment);
      }
      appointmentViewLoadingService.currentAppointmentSaveResult =
        $scope.returnedAppointment;

      $scope.closePage();
    }

    ctrl.afterAppointmentStatusAutoSave = null;
    $scope.saveClicked = false;

    // i guess save succeeded; redirect back to the page we came from
    //ctrl.RedirectAfterSave();
    //$scope.fromUnscheduled = true;
  }

  ctrl.AfterAppointmentSavedSaveAgainToClearUserId = AfterAppointmentSavedSaveAgainToClearUserId;
  function AfterAppointmentSavedSaveAgainToClearUserId(returnedAppointment) {
    //Logging//console.log('AfterAppointmentSavedSaveAgainToClearUserId');
    $scope.returnedAppointment = returnedAppointment;
    // fail gracefully
    if (
      $scope.returnedAppointment.ProviderAppointments &&
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
      $scope.returnedAppointment.PlannedServices &&
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
      // OK that worked, now let's try it again
      $scope.appointment.Data = returnedAppointment;
      // commenting this out fixed an issue with saving unscheduled appointment.
      // I am not sure why this was ever in place.
      // Frankly the execution of the save function after going through it a number of times to fix this is very troubling.
      // Yet another issue that we have not nailed down. It will have to wait.
      //$scope.appointment.Data.UserId = null;
      $scope.saveAppointment(ctrl.AfterAppointmentSavedSuccess, false);
    }
  }

  //ToDo: Remove as this is no longer called
  ctrl.RedirectAfterSave = RedirectAfterSave;
  function RedirectAfterSave() {
    //Logging//console.log('RediectAfterSave');

    let patientPath = '/Patient/';
    try {
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
              patientPath + rp.patient + '/' + rp.targetTab;
            $location.path($scope.PreviousLocationRoute);
            return;
          } else if (rp.patient) {
            $scope.PreviousLocationRoute =
              patientPath + rp.patient + '/Overview';
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
  }

  ctrl.cleanupPlannedServiceCollection = cleanupPlannedServiceCollection;
  function cleanupPlannedServiceCollection(changeList, completeList, idField) {
    //Logging//console.log('cleanupPLannedServiceCollection');
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
  }

  ctrl.AppointmentSaveOnError = AppointmentSaveOnError;
  function AppointmentSaveOnError(shouldBeNothing) {
    //Logging//console.log('AppointmentSaveOnError');
    $scope.saveClicked = false;
    $scope.appointment.Data = _.cloneDeep($scope.backupAppointmentData);
  }

  ctrl.BlockDeleteOnSuccess = BlockDeleteOnSuccess;
  function BlockDeleteOnSuccess() {
    //Logging//console.log('BlockDeleteOnSuccess');
    $scope.returnedAppointment = _.cloneDeep($scope.appointment.Data);
    $scope.returnedAppointment.ObjectState = saveStates.Delete;

    appointmentViewLoadingService.currentAppointmentSaveResult =
      $scope.returnedAppointment;

    $scope.closePage();
  }

  ctrl.BlockDeleteOnError = BlockDeleteOnError;
  function BlockDeleteOnError() {
    //Logging//console.log('BlockDeleteOnError');
    $scope.deleteClicked = false;
  }

  //#endregion

  //#region initialize appointment and appointment date/time

  //#region start and end time functions

  /** using this function to avoid confusion on initialization for appointmentTime */
  ctrl.reinitializeAppointmentTimes = reinitializeAppointmentTimes;
  function reinitializeAppointmentTimes() {
    //Logging//console.log('reinitializeAppointmentTimes');
    ctrl.initializeAppointmentTimes();
  }

  ctrl.initializeAppointmentTimes = initializeAppointmentTimes;
  function initializeAppointmentTimes() {
    //Logging//console.log('initializeAppointmentTimes');
    // setup time
    // Code Came from Old InitAppointmentLocationAndTimeZone method then modified
    //Appointment Location Timezone processing
    ////////////////////////////////////////////////////////////////////////////////
    //! Used on the view ... do not remove and if you change update the view as well
    $scope.timezoneInfo =
      $scope.appointment.Data &&
        angular.isDefined($scope.appointment.Data.Location)
        ? timeZoneFactory.GetTimeZoneInfo(
          $scope.appointment.Data.Location.Timezone,
          $scope.appointment.Data.StartTime
        )
        : null;

    // Code came from old InitializeAppointmentDate method
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

    // start of old version of the method
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
      if (
        $scope.appointment.Data.Classification == 2 &&
        $scope.appointment.Data.ProposedDuration
      )
        $scope.appointmentTime.Duration =
          $scope.appointment.Data.ProposedDuration;
      return;
    }
    let start = _.cloneDeep($scope.appointment.Data.StartTime);
    start.setSeconds(0);
    start.setMilliseconds(0);

    startTime = moment(start);
    $scope.appointmentTime.start = startTime.toISOString();

    let end = _.cloneDeep($scope.appointment.Data.EndTime);
    end.setSeconds(0);
    end.setMilliseconds(0);

    endTime = moment(end);
    $scope.appointmentTime.end = endTime.toISOString();

    $scope.appointmentTime.Duration = appointmentUtilities.getDuration(
      $scope.appointmentTime.start,
      $scope.appointmentTime.end
    );

    var provStartTime, provEndTime;
    var provApptLength = $scope.appointment.Data.ProviderAppointments
      ? $scope.appointment.Data.ProviderAppointments.length
      : 0;
    for (var i = 0; i < provApptLength; i++) {
      provStartTime = new Date(
        $scope.appointment.Data.ProviderAppointments[i].StartTime
      );

      provEndTime = new Date(
        $scope.appointment.Data.ProviderAppointments[i].EndTime
      );

      $scope.appointment.Data.ProviderAppointments[
        i
      ].Duration = appointmentUtilities.getDuration(provStartTime, provEndTime);

      $scope.appointment.Data.ProviderAppointments[i].Valid = true;
    }

    ctrl.originalAppointmentTime = _.cloneDeep($scope.appointmentTime);
  }

  //#endregion

  ctrl.initializeAppointmentType = initializeAppointmentType;
  function initializeAppointmentType() {
    //Logging//console.log('initializeAppointmentType');
    //Logging//console.log('the above method -- seems to only be used when the appt modal opens in edit mode otherwise nothing processes. Move to edit appt modal operations');
    if (
      !$scope.appointment.Data.AppointmentId &&
      $scope.appointment.Data.AppointmentTypeId
    ) {
      $scope.selectedAppointmentType = appointmentTypesService.findByAppointmentTypeId(
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
  }

  //#endregion

  //#region switch to appointment

  ctrl.switchToAppointment = switchToAppointment;
  function switchToAppointment(appointment) {
    //Logging//console.log('switchToAppointment');
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
        var provider = appointmentModalProvidersService.findByUserId(
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
  }

  //#endregion

  //#region provider appointments handling

  $scope.updateProvider = updateProvider;
  function updateProvider(nv, ov, id) {
    //Logging//console.log('updateProvider');

    //var index = listHelper.findIndexByFieldValue($scope.appointment.Data.ProviderAppointments, 'ProviderAppointmentId', nv.ProviderAppointmentId);

    /** if ProviderTime service doesn't update the times, then this should update it */
    if (!ctrl.providerAppointmentOverride) {
      //if (nv.StartTime != ov.StartTime) {
      //    var duration = appointmentUtilities.getDuration(ov.StartTime, ov.EndTime);
      //    var newEndTime = new Date(nv.StartTime);
      //    newEndTime.setMinutes(newEndTime.getMinutes() + duration);
      //    nv.EndTime = newEndTime;
      //}

      nv.Duration = appointmentUtilities.getDuration(nv.StartTime, nv.EndTime);
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
        $scope.appointment.Data.ProviderAppointments[id] = _.cloneDeep(nv);

        $scope.frmAppointment.$dirty = true;
      }
    } else if (nv.ObjectState == saveStates.Add) {
      $scope.appointment.Data.ProviderAppointments[id] = _.cloneDeep(nv);
    } else if (nv.ObjectState == null) {
      nv.ObjectState = saveStates.None;
    }
  }

  ctrl.providerAppointmentsChanged = providerAppointmentsChanged;
  function providerAppointmentsChanged(nv, ov) {
    // indicates provider dropdown has been loaded
    $scope.providersLoaded = true;

    if (nv && ov && nv !== ov) {
      //Logging//console.log('providerAppointmentsChanged');
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
      if (nv.length === ov.length) {
        for (var i = 0; i < nv.length; i++) {
          if (
            !angular.equals(
              ProviderAppointmentDto(nv[i]),
              ProviderAppointmentDto(ov[i])
            )
          ) {
            $scope.updateProvider(nv[i], ov[i], i);
            ctrl.validateProviderAppointmentTime(nv[i]);
          }
        }
        ctrl.checkIfAppointmentHasChanges();
      }
    }
  }

  ctrl.addProvider = addProvider;
  function addProvider(startTime, endTime, userId) {
    //Logging//console.log('addProvider');
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
  }

  $scope.removeProvider = removeProvider;
  function removeProvider(index) {
    //Logging//console.log('removeProvider');
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
  }

  $scope.deleteProvider = deleteProvider;
  function deleteProvider(index, providerId) {
    //Logging//console.log('deleteProvider');
    $scope.multipleProviders.selectedProviders = $.grep(
      $scope.multipleProviders.selectedProviders,
      function (e) {
        return e.UserId != providerId;
      }
    );

    _.forEach(appointmentModalProvidersService.modalProviders, function (p) {
      if (p.UserId == providerId) {
        p.Selected = false;
      }
    });
    $scope.providerSchedules = $.grep($scope.providerSchedules, function (e) {
      return e.ProviderId != providerId;
    });

    $scope.$broadcast('refreshSelectedCount');

    ctrl.checkIfAppointmentHasChanges();
  }

  ctrl.changeFirstProvidersTime = changeFirstProvidersTime;
  function changeFirstProvidersTime() {
    //Logging//console.log('changeFirstProvidersTime');
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
  }
  //#endregion

  // #region planned services handling

  // watches planned services for any changes

  $scope.onPatientChange = onPatientChange;
  function onPatientChange(nv, ov) {
    if (nv !== ov) {
      //Logging//console.log('onPatientChange');
      if (nv && (!ov || nv.PatientId != ov.PatientId) && !nv.IsPatient) {
        $scope.showNotAPatientModal();
      }
      $scope.appointment.Data.PersonId = nv ? nv.PatientId : '';
      $scope.appointment.PersonId = $scope.appointment.Data.PersonId;
      $scope.appointment.Data.UserId = '';
      $scope.hasPatient = nv != undefined || nv != null;
      $scope.selectedPatient = nv;
      if ($scope.patient !== $scope.newAppt.patient)
        $scope.patient = $scope.newAppt.patient;
      //checking for the patient inActive and popup a message
      if (nv && nv.IsActive === false && $scope.patient !== null) {
        ctrl.inactivePatientMessage();
      }
      if ((nv && ov && nv.PatientId != ov.PatientId) || (nv && !ov)) {
        // getting full patient now that extra stuff has been removed from patient/search

        schedulingApiService
          .getPatientDataForAppointmentModal(nv.PatientId)
          .then(function (result) {
            let transformResult = ctrl.setFromApptModalPatientApi(result);

            $scope.patient = transformResult;
            $scope.appointment.Data.Patient = _.cloneDeep(transformResult);

            if ($scope.editing === false) {
              ctrl.getUnscheduledAppointments();
            }
            if (
              $scope.appointment.Data.ProviderId === null ||
              $scope.appointment.Data.ProviderId === undefined ||
              $scope.appointment.Data.ProviderId === '' ||
              $scope.multipleProviders.length == 0
            ) {
              var apptType = appointmentTypesService.findByAppointmentTypeId(
                $scope.appointment.Data.AppointmentTypeId
              );
              ctrl.assignPreferredProviderByAppointmentType(apptType);
            }
            ctrl.filterLocations();
            ctrl.checkIfAppointmentHasChanges();
          }, ctrl.getPatientDataForAppointmentModalFailed);
      } else {
        $scope.patient = null;
        $scope.appointment.Data.Patient = null;
      }
      ctrl.checkIfAppointmentHasChanges();
      ctrl.setDisableStatusSelector();
      $scope.checkIfPatientsPrefLocation();
      $scope.checkIfPreferredHygienist();
      $scope.checkIfPreferredProviderAvailable();
    }
  }

  $scope.showNotAPatientModal = showNotAPatientModal;
  function showNotAPatientModal() {
    //Logging//console.log('showNotAPatientModal');
    // confirmation dialog - no feedback needed
    var modalInstance = modalFactory.Modal({
      template:
        '<div class="modal-header"><h4 id="lblNotAPatientHeader">{{ "Not a Patient" | i18n }}</h4></div>' +
        '<div class="modal-body"><label id="lblNotAPatientMessage">{{ "This person is not a patient. Proceeding will change this person\'s status to patient. Do you wish to proceed?" | i18n }}</label></div>' +
        '<div class="modal-footer"><div class="pull-right">' +
        '<button id="btnChangePatientYes" ng-click="changePatient();" class="btn btn-primary form-btn-save-new">{{ "Yes" | i18n }}</button>' +
        '<button id="btnChangePatientNo" ng-click="cancelPatientChange();" class="btn form-btn-cancel-new">{{ "No" | i18n }}</button>' +
        '</div></div>',
      controller: [
        '$scope',
        '$uibModalInstance',
        function (modalScope, $uibModalInstance) {
          modalScope.changePatient = function () {
            $uibModalInstance.close();
          };

          modalScope.cancelPatientChange = function () {
            $uibModalInstance.dismiss();
            $scope.newAppt.patient = null;
            $scope.$broadcast('clearSearch');
          };
        },
      ],
      size: 'lg',
      windowClass: 'center-modal',
      backdrop: 'static',
      amfa: 'soar-per-perdem-add',
    });

    modalInstance.result.then(
      $scope.confirmPatientChange,
      $scope.cancelPatientChange
    );
  }

  $scope.newAppt = { patient: null };

  $scope.updatePlannedServices = updatePlannedServices;
  function updatePlannedServices(nv, ov, id) {
    //Logging//console.log('updatePlannedServices');

    var index = listHelper.findIndexByFieldValue(
      $scope.appointment.Data.PlannedServices,
      'ServiceTransactionId',
      nv.ServiceTransactionId
    );

    // exit the function if we are not able to find the index because not all ServiceTransactions have been saved
    // this method can otherwise cause duplicate assertions of services.
    if (index === -1) {
      return;
    }

    nv = _.cloneDeep(nv);
    ov = _.cloneDeep(ov);
    //Must have an AppointmentId
    if (
      !_.isNil(ov) &&
      !_.isNil(nv.AppointmentId) &&
      nv.ObjectState &&
      nv.ObjectState != saveStates.Add &&
      nv.ObjectState != saveStates.Delete &&
      nv.ObjectState != saveStates.Successful
    ) {
      // previously the line below was !_.isEmpty(nv.ProviderUserId) && !_.isEmpty(ov.ProviderUserId) && ...
      // which meant that if provider id was ever empty it could never be filled in.  This made no sense to me
      // and it was causing bug 406017 so I removed the requirement that old value had to be defined.  D1
      if (
        !_.isEmpty(nv.ProviderUserId) &&
        nv.AppointmentId &&
        (nv.ProviderUserId != ov.ProviderUserId ||
          nv.Fee != ov.Fee ||
          nv.Surface != ov.Surface ||
          nv.Roots != ov.Roots ||
          nv.Tooth != ov.Tooth ||
          nv.DateEntered != ov.DateEntered ||
          nv.ProviderId != ov.ProviderId)
      ) {
        nv.ObjectState =
          nv.ObjectState === saveStates.Add
            ? saveStates.Add
            : saveStates.Update;
        nv.Tooth = nv.Tooth ? nv.Tooth.toUpperCase() : nv.Tooth;
        nv.Surface = nv.Surface ? nv.Surface.toUpperCase() : nv.Surface;
        nv.SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
          nv.Surface
        );
        nv.Roots = nv.Roots ? nv.Roots.toUpperCase() : nv.Roots;
        nv.RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
          nv.Roots
        );
        $scope.appointment.Data.PlannedServices[index] = _.cloneDeep(nv);
      }
      //ObjectState = Add when it is a newly created service. If proposed, ObjectState should be = Update
      //AppointmentId will be null on a changed location or a new unsaved appointment
    } else if (nv.ObjectState == saveStates.Add || _.isNil(nv.AppointmentId)) {
      nv.Tooth = nv.Tooth ? nv.Tooth.toUpperCase() : nv.Tooth;
      nv.Surface = nv.Surface ? nv.Surface.toUpperCase() : nv.Surface;
      nv.SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
        nv.Surface
      );
      nv.Roots = nv.Roots ? nv.Roots.toUpperCase() : nv.Roots;
      nv.RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
        nv.Roots
      );

      //If ProviderId is null or undefined, then isProviderOnServiceValid is not valid. A provider must be selected
      if (
        ($scope.appointment.Data.$$didLocationChange === true &&
          nv.ProviderId === undefined) ||
        nv.ProviderId === null
      ) {
        nv.$$isProviderOnServiceValid = false;
      }
      //If ProviderId is populated and location changed, isProviderOnServiceValid is valid
      else if (
        ($scope.appointment.Data.$$didLocationChange === true &&
          nv.ProviderId != undefined) ||
        nv.ProviderId != null
      ) {
        nv.$$isProviderOnServiceValid = true;
      } else if (nv.ProviderId === undefined || nv.ProviderId === null) {
        nv.$$isProviderOnServiceValid = false;
        nv.ProviderId = null;
      }
      //This gets hit if it is a newly added appointment with a newly added service and location has not been changed
      else {
        nv.ProviderId = nv.ProviderUserId;
        nv.$$isProviderOnServiceValid = true;
      }
      $scope.plannedServices[id] = _.cloneDeep(nv);
      $scope.appointment.Data.PlannedServices[index] = _.cloneDeep(
        $scope.plannedServices[id]
      );
    } else if ($scope.appointment.Data.$$didLocationChange == true) {
      nv.LocationId = $scope.dropDownLocation.LocationId;
      nv.ObjectState = this.saveStates.Update;
      $scope.appointment.Data.PlannedServices[index] = _.cloneDeep(nv);
    }
    ctrl.checkIfAppointmentHasChanges();
  }

  $scope.cancelModal = cancelModal;
  function cancelModal() {
    // do nothing, no action is needed.
  }

  $scope.confirmRemovePlannedService = confirmRemovePlannedService;
  function confirmRemovePlannedService(service, index) {
    //Logging//console.log('confirmRemovePlannedService');
    ctrl.plannedServiceToRemove = service;
    ctrl.plannedServiceToRemoveIndex = index;

    var serviceCode = service.DisplayAs ? service.DisplayAs : service.Code;
    var title = 'Remove Service?';
    var message = localize.getLocalizedString(
      'Are you sure you want to {0} the {1} {2} from this {3}?',
      ['remove', 'service', serviceCode, 'appointment']
    );

    // If appointment is being updated show message about the service being saved to proposed services
    var appointmentIndex = _.findIndex(
      $scope.appointment.Data.PlannedServices,
      { ServiceTransactionId: service.ServiceTransactionId }
    );
    if (appointmentIndex > -1) {
      var saveState =
        $scope.appointment.Data.PlannedServices[appointmentIndex].ObjectState;

      if (saveState === saveStates.Update) {
        message += '\n\n';
        message += localize.getLocalizedString(
          'This {0} will remain on the {1} {2} as {3}.',
          ['service', "patient's", 'clinical ledger', 'proposed']
        );
      }
    }

    modalFactory
      .ConfirmModal(title, message, 'Yes', 'No')
      .then(ctrl.removePlannedService, $scope.cancelModal);
  }

  ctrl.removePlannedService = removePlannedService;
  function removePlannedService() {
    //Logging//console.log('removePlannedService');
    // This is the index for the copy of the planned services. This list may be shorter than those in the appointment planned service list.
    var service = ctrl.plannedServiceToRemove;
    service.$$disableAddService = true;

    // We have to correlate the item in this list with the item in the $scope.plannedServices list.
    var appointmentIndex = _.findIndex(
      $scope.appointment.Data.PlannedServices,
      { ServiceTransactionId: service.ServiceTransactionId }
    );
    var plannedIndex = _.findIndex($scope.plannedServices, {
      ServiceTransactionId: service.ServiceTransactionId,
    });
    if (
      appointmentIndex > -1 &&
      $scope.appointment.Data.PlannedServices[appointmentIndex]
        .AppointmentId !== undefined &&
      $scope.appointment.Data.PlannedServices[appointmentIndex]
        .AppointmentId !== null
    ) {
      var saveState =
        $scope.appointment.Data.PlannedServices[appointmentIndex].ObjectState;
      // PBI 360392
      // removing a service should leave proposed service and set AppointmentId to null
      // removing a service should set InsuranceOrder to null
      $scope.appointment.Data.PlannedServices[
        appointmentIndex
      ].AppointmentId = null;
      $scope.appointment.Data.PlannedServices[
        appointmentIndex
      ].InsuranceOrder = null;

      if (!saveState || saveState != saveStates.Add) {
        // if ObjectState = None or Delete or Update or is undefined set it to update and set AppointmentId to null
        if (
          _.isNil(saveState) ||
          saveState === saveStates.None ||
          saveState === saveStates.Delete ||
          saveState === saveStates.Update
        ) {
          $scope.appointment.Data.PlannedServices[
            appointmentIndex
          ].ObjectState = saveStates.Update;
        }
      } else {
        // otherwise just remove the service, it has not yet been persisted
        $scope.appointment.Data.PlannedServices.splice(appointmentIndex, 1);
        $scope.appointment.Data.ServiceCodes.splice(appointmentIndex, 1);
      }
    } else {
      // otherwise just remove the service, it has not yet been persisted
      plannedIndex = ctrl.plannedServiceToRemoveIndex;
      $scope.appointment.Data.PlannedServices.splice(plannedIndex, 1);
      $scope.appointment.Data.ServiceCodes.splice(plannedIndex, 1);
    }

    $scope.plannedServices.splice(plannedIndex, 1);
    $scope.serviceCodes.splice(plannedIndex, 1);

    $scope.frmAppointment.$dirty = true;
    // get insurance estimates only, discounts and amounts won't change on removing a service
    $scope.calculateEstimatedAmount();
    ctrl.checkIfAppointmentHasChanges();
    $scope.hasChanges = true;
  }

  // reapply previous changes and add insurance order validation
  // This is what is called when performing any Service Transaction Line Item Calculations for Insurance
  // This gets called on adding, updating, or deleting service transactions on the appointment
  // NOTE outside of the scope of this bug, but calling this method 'should' make calculateTaxAfterDiscount and calculateDiscount obsolete,
  // however you would still have to call the success methods for each to set values? This could be a performance boost tho since those are called
  // for each service
  $scope.calculateEstimatedAmount = calculateEstimatedAmount;
  function calculateEstimatedAmount(isInitializing) {
    // validate / set InsuranceOrder
    $scope.plannedServices = serviceEstimateCalculationService.validateInsuranceOrder(
      $scope.plannedServices
    );
    // get discount, tax, and insurance estimate
    patientServices.ServiceTransactions.calculateDiscountAndTaxAndInsuranceEstimate(
      $scope.plannedServices
    ).$promise.then(
      function (res) {
        $scope.plannedServices = serviceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(
          $scope.plannedServices,
          res.Value,
          false
        );
        // restoring this logic for deletes
        // This logic is being performed because if a service gets deleted from the appointment, we do not want to remove that
        // record from the $scope.appointment.Data.PlannedServices because it has to be there for the Save for the backend to remove from database.
        // We are cloning the $scope.plannedServices only for the items that have matching InsuranceOrder so that $scope.appointment.Data.PlannedServices and its InsuranceEstimates object can be updated.
        $scope.plannedServices.forEach(service => {
          service.PersonId = $scope.appointment.Data.PersonId;
          for (
            var i = 0;
            i < $scope.appointment.Data.PlannedServices.length;
            i++
          ) {
            if (
              service.InsuranceOrder ===
              $scope.appointment.Data.PlannedServices[i].InsuranceOrder
            ) {
              $scope.appointment.Data.PlannedServices[i] = _.cloneDeep(service);
            }
          }
        });
        if (isInitializing === true) {
          // re-initialize ctrl.originalAppointmentData.PlannedServices and $scope.appointment.Data.PlannedServices to reset
          // hasChanges after setting InsuranceOrder so InsuranceOrder is ignored on cancel
          ctrl.originalAppointmentData.PlannedServices = _.cloneDeep(
            $scope.plannedServices
          );
          $scope.appointment.Data.PlannedServices = _.cloneDeep(
            $scope.plannedServices
          );
        }
        $rootScope.$broadcast('recalculationCompleted');
      },
      function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to calculate discount,tax,and insurance estimate'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    );
  }

  ctrl.calculateTaxAfterDiscount = calculateTaxAfterDiscount;
  function calculateTaxAfterDiscount(serviceTransaction) {
    //Logging//console.log('calculateTaxAfterDiscount');
    if (
      serviceTransaction.Fee == null ||
      serviceTransaction.Fee == undefined ||
      serviceTransaction.Fee == 0
    ) {
      serviceTransaction.Fee = 0;
      serviceTransaction.Tax = 0;
      serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        serviceTransaction
      );
    } else {
      var serviceCode = _.find(ctrl.serviceCodes, {
        ServiceCodeId: serviceTransaction.ServiceCodeId,
      });

      if (serviceCode != null) {
        serviceTransaction.TaxableServiceTypeId =
          serviceCode.$$locationTaxableServiceTypeId;
      } else {
        return ctrl.calculateTaxOnError(null, serviceTransaction).$promise;
      }
      if ($scope.patient.PersonAccount) {
        return patientServices.TaxAfterDiscount.get(
          {
            isDiscounted: serviceTransaction.applyDiscount,
          },
          serviceTransaction,
          function (result) {
            ctrl.calculateTaxOnSuccess(result, serviceTransaction);
          },
          function (result) {
            ctrl.calculateTaxOnError(result, serviceTransaction);
          }
        ).$promise;
      } else {
        var personId = $scope.appointment.Data.PersonId;
        return patientServices.TaxAfterDiscount.getByPersonId(
          {
            personId: personId,
            isDiscounted: serviceTransaction.applyDiscount,
          },
          serviceTransaction,
          function (result) {
            ctrl.calculateTaxOnSuccess(result, serviceTransaction);
          },
          function (result) {
            ctrl.calculateTaxOnError(result, serviceTransaction);
          }
        ).$promise;
      }
    }
  }

  ctrl.calculateTaxOnSuccess = calculateTaxOnSuccess;
  function calculateTaxOnSuccess(result, serviceTransaction) {
    //Logging//console.log('calculateTaxOnSuccess');
    if (serviceTransaction != null) {
      serviceTransaction.Tax = result.Value;
      serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        serviceTransaction
      );
    }
  }

  ctrl.calculateTaxOnError = calculateTaxOnError;
  function calculateTaxOnError(result, serviceTransaction) {
    //Logging//console.log('calculateTaxOnError');
    serviceTransaction.Tax = 0;
    serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
      serviceTransaction
    );
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate tax'),
      localize.getLocalizedString('Server Error')
    );
  }

  ctrl.calculateDiscount = calculateDiscount;
  function calculateDiscount(serviceTransaction) {
    //Logging//console.log('calculateDiscount');
    if (
      serviceTransaction.Fee == null ||
      serviceTransaction.Fee == undefined ||
      serviceTransaction.Fee == 0
    ) {
      serviceTransaction.Fee = 0;
      serviceTransaction.Discount = 0;
      serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        serviceTransaction
      );
    } else {
      var serviceCode = _.find(ctrl.serviceCodes, {
        ServiceCodeId: serviceTransaction.ServiceCodeId,
      });

      if (serviceCode != null) {
        serviceTransaction.IsEligibleForDiscount =
          serviceCode.IsEligibleForDiscount;
        if (serviceTransaction.IsEligibleForDiscount) {
          serviceTransaction.applyDiscount = true;
        } else {
          serviceTransaction.applyDiscount = false;
        }
        serviceTransaction.DiscountableServiceTypeId =
          serviceCode.DiscountableServiceTypeId;
      } else {
        serviceTransaction.applyDiscount = false;
      }
      if ($scope.patient.PersonAccount) {
        return patientServices.Discount.get(
          { isDiscounted: serviceTransaction.applyDiscount },
          serviceTransaction,
          function (result) {
            ctrl.calculateDiscountOnSuccess(result, serviceTransaction);
          },
          function (result) {
            ctrl.calculateDiscountOnError(result, serviceTransaction);
          }
        ).$promise;
      } else {
        var personId = $scope.appointment.Data.PersonId;
        return patientServices.Discount.getByPersonId(
          {
            personId: personId,
            isDiscounted: serviceTransaction.applyDiscount,
          },
          serviceTransaction,
          function (result) {
            ctrl.calculateDiscountOnSuccess(result, serviceTransaction);
          },
          function (result) {
            ctrl.calculateDiscountOnError(result, serviceTransaction);
          }
        ).$promise;
      }
    }
  }

  ctrl.calculateDiscountOnSuccess = calculateDiscountOnSuccess;
  function calculateDiscountOnSuccess(result, serviceTransaction) {
    //Logging//console.log('calculateDiscountOnSuccess');
    if (serviceTransaction.applyDiscount) {
      serviceTransaction.Discount = result.Value;
    } else {
      serviceTransaction.Discount = 0;
    }
    serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
      serviceTransaction
    );
  }

  ctrl.calculateDiscountOnError = calculateDiscountOnError;
  function calculateDiscountOnError(result, serviceTransaction) {
    //Logging//console.log('calculateDiscountOnError');
    serviceTransaction.Discount = 0;
    serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
      serviceTransaction
    );
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate discount'),
      localize.getLocalizedString('Server Error')
    );
  }
  //#endregion

  //#region patient medical alerts and flags

  // List of symbols that can be used for master alerts
  ctrl.getIconClass = getIconClass;
  function getIconClass(id, isMedicalHistoryAlert) {
    //Logging//console.log('getIconClass');
    if (isMedicalHistoryAlert) {
      if (id == 1) {
        return 'fi fi-allergies';
      } else if (id == 3) {
        return 'fi fi-premed';
      } else {
        return 'fa fa-heart';
      }
    } else {
      var iconClass = 'fa fa-asterisk';
      if (id) {
        iconClass = scheduleAppointmentModalService.alertSymbolList.getClassById(
          id
        );
        if (iconClass.substring(0, 3) === 'fi-') {
          return 'fi ' + iconClass;
        }
      } else if (id === null) {
        return '';
      }
      return iconClass;
    }
  }

  ctrl.setPatientAlertsFromPatient = setPatientAlertsFromPatient;
  function setPatientAlertsFromPatient(patient) {
    //Logging//console.log('setPatientAlertsFromPatient');
    // create a local object to accumulate changes, don't set scope variable until we're done
    var allAlerts = [];
    // medical alerts
    _.forEach(patient.PatientMedicalHistoryAlertDtos, function (alert) {
      if (alert.GenerateAlert) {
        var newAlert = {
          Description: alert.MedicalHistoryAlertDescription,
          PatientId: alert.PatientId,
          SymbolId: alert.MedicalHistoryAlertTypeId,
          IsMedicalHistoryAlert: true,
        };
        newAlert.IconClass = ctrl.getIconClass(
          alert.MedicalHistoryAlertTypeId,
          true
        );
        allAlerts.push(newAlert);
      };
    });
    // flags
    _.forEach(patient.PatientAlerts, function (flag) {
      flag.IconClass = ctrl.getIconClass(flag.SymbolId, false);
      allAlerts.push(flag);
    });

    $scope.sortedAlerts = ctrl.sortAlerts(allAlerts);
  }

  ctrl.sortAlerts = sortAlerts;
  function sortAlerts(alerts) {
    //Logging//console.log('sortAlerts');
    var sortedAlerts = [];

    // Show alert if patient requires premedication.
    _.forEach(
      _.sortBy(_.filter(alerts, ['SymbolId', 3]), ['Description']),
      function (alert) {
        sortedAlerts.push(alert);
      }
    );

    // Show all medical alerts.
    _.forEach(
      _.sortBy(_.filter(alerts, ['SymbolId', 2]), ['Description']),
      function (alert) {
        sortedAlerts.push(alert);
      }
    );

    // Show all allergy alerts.
    _.forEach(
      _.sortBy(_.filter(alerts, ['SymbolId', 1]), ['Description']),
      function (alert) {
        sortedAlerts.push(alert);
      }
    );

    // Separate Master Flags from Custom Flags.
    var masterAlerts = _.filter(alerts, function (alert) {
      return alert.SymbolId > 3 || alert.SymbolId === null;
    });

    _.forEach(_.sortBy(masterAlerts, ['Description']), function (alert) {
      sortedAlerts.push(alert);
    });

    // Custom Alerts - every thing left after other alerts are filtered
    var customAlerts = alerts.filter((a) => {
      return !sortedAlerts.some((b) => a.SymbolId === b.SymbolId && a.Description == b.Description)
    });

    _.forEach(_.sortBy(customAlerts, ['Description']), function (alert) {
      sortedAlerts.push(alert);
    });

    return sortedAlerts;
  }
  //#endregion

  // #region Provider/Room Assignments
  // NOTE can this be moved to factory?

  ctrl.getRoomAssignmentsForProvider = getRoomAssignmentsForProvider;
  function getRoomAssignmentsForProvider(
    locationId,
    providerId,
    startTime,
    endTime
  ) {
    //Logging//console.log('getRoomAssignmentsForProvider');
    return ctrl.getRoomAssignments(
      locationId,
      providerId,
      null,
      startTime,
      endTime,
      ctrl.getRoomAssignmentsForProviderSuccess
    );
  }

  ctrl.getRoomAssignmentsForProviderNoRoomChange = getRoomAssignmentsForProviderNoRoomChange;
  function getRoomAssignmentsForProviderNoRoomChange(
    locationId,
    providerId,
    startTime,
    endTime
  ) {
    //Logging//console.log('getRoomAssignmentsForProviderNoRoomChange');
    return ctrl.getRoomAssignments(
      locationId,
      providerId,
      null,
      startTime,
      endTime,
      ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess
    );
  }

  ctrl.getRoomAssignmentsForRoom = getRoomAssignmentsForRoom;
  function getRoomAssignmentsForRoom(locationId, roomId, startTime, endTime) {
    //Logging//console.log('getRoomAssignmentsForRoom');
    return ctrl.getRoomAssignments(
      locationId,
      null,
      roomId,
      startTime,
      endTime,
      ctrl.getRoomAssignmentForRoomSuccess
    );
  }

  ctrl.getRoomAssignments = getRoomAssignments;
  function getRoomAssignments(
    locationId,
    providerId,
    roomId,
    startTime,
    endTime,
    onSuccess
  ) {
    //Logging//console.log('getRoomAssignments');
    if (startTime && endTime) {
      var providerRoomOccurrences =
        scheduleServices.ScheduleProviderRoomOccurrences;
      var newStartDate = moment(startTime).format('YYYY-MM-DD');

      // instead of filtering on some API call we are using the data already loaded and
      // filtering with the various criteria on the client to save in processing.
      var listOfProviderRoomOccurrences = _.filter(
        providerRoomOccurrences,
        function (item) {
          if (providerId && roomId) {
            return (
              locationId === item.LocationId &&
              providerId === item.UserId &&
              roomId === item.RoomId
            );
          } else if (providerId) {
            return locationId === item.LocationId && providerId === item.UserId;
          } else if (roomId) {
            return locationId === item.LocationId && roomId === item.RoomId;
          }
        }
      );
      var occurrencesLimitedByDate = _.filter(
        listOfProviderRoomOccurrences,
        function (item) {
          return moment(item.StartTime).format('YYYY-MM-DD') === newStartDate;
        }
      );

      ctrl.getRoomAssignmentsSuccess(
        occurrencesLimitedByDate,
        onSuccess,
        startTime,
        endTime
      );
      return;
    }
  }

  ctrl.getRoomAssignmentsSuccess = getRoomAssignmentsSuccess;
  function getRoomAssignmentsSuccess(
    occurrences,
    onSuccess,
    startTime,
    endTime
  ) {
    //Logging//console.log('getRoomAssignmentsSuccess');
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
  }

  ctrl.getRoomAssignmentsForExistingAppointment = getRoomAssignmentsForExistingAppointment;
  function getRoomAssignmentsForExistingAppointment() {
    //Logging//console.log('getRoomAssignmentsForExistingAppointment');
    var isBlock = false;
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
      $scope.appointment.Data.TreatmentRoomId = $scope.selectedTreatmentRoomId;
    }

    var roomId =
      $scope.appointment.Data.TreatmentRoomId > ''
        ? $scope.appointment.Data.TreatmentRoomId
        : null;

    var startTime = $scope.appointment.Data.StartTime;

    var endTime = $scope.appointment.Data.EndTime;

    if (providerId > '' && roomId > '') {
      return ctrl.getRoomAssignmentsForProviderNoRoomChange(
        locationId,
        providerId,
        startTime,
        endTime
      );
    } else if (providerId > '') {
      return ctrl.getRoomAssignmentsForProvider(
        locationId,
        providerId,
        startTime,
        endTime
      );
    } else if (roomId > '') {
      return ctrl.getRoomAssignmentsForRoom(
        locationId,
        roomId,
        startTime,
        endTime
      );
    }
  }

  ctrl.getRoomAssignmentsWhenDateTimeChanged = getRoomAssignmentsWhenDateTimeChanged;
  function getRoomAssignmentsWhenDateTimeChanged() {
    //Logging//console.log('getRoomAssignmentsWhenDateTimeChanged');
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
  }

  ctrl.getRoomAssignmentsForProviderSuccess = getRoomAssignmentsForProviderSuccess;
  function getRoomAssignmentsForProviderSuccess(result) {
    //Logging//console.log('getRoomAssignmentsForProviderSuccess');
    if ($routeParams.group !== 'room') {
      var earliestDate = null;
      var treatmentRoomId = null;

      _.forEach(result.Value, function (assignment) {
        if (earliestDate == null || earliestDate > assignment.StartTime) {
          earliestDate = assignment.StartTime;
          treatmentRoomId = assignment.RoomId;
        }
      });
      if (
        $scope.appointment.Data.Classification != 1 &&
        treatmentRoomId != null
      ) {
        $scope.appointment.Data.Room = roomsService.findByRoomId(
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
    }

    ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess(result);
  }

  // this property holds the selected treatment plan id while list is sorted due to kendo issue from below
  $scope.selectedTreatmentRoomId = null;
  ctrl.sortingRooms = false;

  ctrl.sortRooms = sortRooms;
  function sortRooms() {
    //Logging//console.log('sortRooms');
    if (
      $scope.appointment &&
      $scope.appointment.Data &&
      $scope.appointment.Data.TreatmentRoomId
    ) {
      $scope.selectedTreatmentRoomId = $scope.appointment.Data.TreatmentRoomId;
    }
    ctrl.sortingRooms = true;
    roomsService.rooms = _.orderBy(roomsService.rooms, 'Name');

    $scope.rooms = roomsService.rooms;
    //Kendo clears the assigned room after the sorting occurs, so we are going to let that happen using this timeout.
    //Then, we'll reapply it.

    if (
      $scope.appointment.Data.Classification != 1 &&
      $scope.appointment &&
      $scope.appointment.Data
    ) {
      $scope.appointment.Data.TreatmentRoomId = $scope.selectedTreatmentRoomId;
      ctrl.sortingRooms = false;
    }
  }

  ctrl.getRoomAssignmentsForProviderNoRoomChangeSuccess = getRoomAssignmentsForProviderNoRoomChangeSuccess;
  function getRoomAssignmentsForProviderNoRoomChangeSuccess(result) {
    //looprooms
    //Logging//console.log('getRoomAssignmentsForProviderNoRoomChangeSuccess');

    //Logging//console.log('old resetRoomAssignments method');
    // Pull up method refactoring .. used to ensure it is easier to understand all the room looping
    // only loop if the list has values marked as true
    if (listHelper.findItemByFieldValue(roomsService.rooms, 'Assigned', true)) {
      _.forEach(roomsService.rooms, function (room) {
        room.Assigned = false;
      });
    }

    //Logging//console.log('old markRoomAsAssigned method');
    _.forEach(result.Value, function (assignment) {
      // Pull up method refactoring .. used to ensure it is easier to understand all the room looping
      var room = roomsService.findByRoomId(assignment.RoomId);

      if (room != null) {
        room.Assigned = true;
      }
    });
    //Logging//console.log('old setRoomAssignedFlag method ');
    // Pull up method refactoring .. used to ensure it is easier to understand all the room looping
    if ($scope.appointment.Data.TreatmentRoomId > '') {
      var room = roomsService.findByRoomId(
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
  }

  ctrl.getRoomAssignmentForRoomSuccess = getRoomAssignmentForRoomSuccess;
  function getRoomAssignmentForRoomSuccess(result) {
    //Logging//console.log('getRoomAssignmentFromRoomSuccess');
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
      $scope.appointment.Data.Provider = appointmentModalProvidersService.findByUserId(
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
  }

  ctrl.resetRoomAssignments = resetRoomAssignments;
  function resetRoomAssignments() {
    //Logging//console.log('resetRoomAssignments');
    _.forEach(roomsService.rooms, function (room) {
      room.Assigned = false;
    });
  }

  // #endregion

  ctrl.resetLastUsedProviderCheck = resetLastUsedProviderCheck;
  function resetLastUsedProviderCheck() {
    //Logging//console.log('resetLastUsedProviderCheck');
    $timeout.cancel(ctrl.lastUsedProviderTimeout);
    ctrl.lastUsedProviderTimeout = $timeout(function () {
      ctrl.lastProviderChecked = null;
    }, 3000);
  }

  // $scope.appointmentTime changed event
  ctrl.appointmentTimeChanged = appointmentTimeChanged;
  function appointmentTimeChanged(newTime, oldTime) {
    //Logging//console.log('appointmentTimeChanged');
    // only need to proceed on one of these 3 conditions
    if (
      (newTime && _.isNil(oldTime)) ||
      (newTime && newTime.start != oldTime.start) ||
      (newTime && newTime.end != oldTime.end)
    ) {
      $scope.hasChanges = false;

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
          $scope.appointment.Data.ProposedDuration = parseInt(newTime.Duration);
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

      ctrl.checkIfAppointmentHasChanges();
    } else {
      // If all that was changed was the duration, just enable the save button
      if (newTime && newTime.Duration != oldTime.Duration) {
        ctrl.checkIfAppointmentHasChanges();
      }
    }
  }

  ctrl.getProviderIdFromAppointment = getProviderIdFromAppointment;
  function getProviderIdFromAppointment() {
    //Logging//console.log('getProviderIfFromAppointment');
    return $scope.providerSchedules != null &&
      $scope.providerSchedules.length > 0
      ? $scope.providerSchedules[0].ProviderId
      : null;
  }

  ctrl.validateProviderAppointmentTime = validateProviderAppointmentTime;
  function validateProviderAppointmentTime(providerAppointment) {
    //Logging//console.log('validateProviderAppointmentTime');
    if (providerAppointment.StartTime > '') {
      var startMoment = moment(providerAppointment.StartTime);

      providerAppointment.startValid =
        startMoment.isValid() &&
        providerAppointment.StartTime.toISOString() >=
        $scope.appointment.Data.StartTime.toISOString() &&
        providerAppointment.StartTime < providerAppointment.EndTime;
    } else {
      providerAppointment.startValid = false;
    }

    if (providerAppointment.EndTime > '') {
      var endMoment = moment(providerAppointment.EndTime);

      providerAppointment.endValid =
        endMoment.isValid() &&
        providerAppointment.EndTime.toISOString() <=
        $scope.appointment.Data.EndTime.toISOString() &&
        providerAppointment.StartTime < providerAppointment.EndTime;
    } else {
      providerAppointment.endValid = false;
    }

    providerAppointment.Valid =
      providerAppointment.startValid && providerAppointment.endValid;
  }

  ctrl.UnscheduledForPatientOnSuccess = UnscheduledForPatientOnSuccess;
  function UnscheduledForPatientOnSuccess(result) {
    //Logging//console.log('UnscheduledForPatientOnSuccess');

    $scope.unscheduledPatientAppointments = [];

    unscheduledAppointmentsService.allUnscheduledAppointments = [];
    unscheduledAppointmentsService.initializeUnscheduledAppointmentsForSchedule(
      result,
      ctrl.serviceCodes,
      'Any Provider',
      false
    );

    // the following method actually get unscheduled array
    let unscheduledList = unscheduledAppointmentsService.getUnscheduledAppointments();
    $scope.unscheduledPatientAppointments = unscheduledList.sort(function (
      a,
      b
    ) {
      var c = new Date(a.DateModified);
      var d = new Date(b.DateModified);
      return d - c;
    });
  }

  ctrl.getAppointmentsFailure = getAppointmentsFailure;
  function getAppointmentsFailure(a, b, c, d) {
    //Logging//console.log('getAppointmentsFailure');
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again',
        ['Appointments']
      ),
      localize.getLocalizedString('Server Error')
    );
  }

  ctrl.getUnscheduledAppointments = getUnscheduledAppointments;
  function getUnscheduledAppointments(accountId) {
    //Logging//console.log('getUnscheduledAppointments');
    $scope.unscheduledAppointments = [];
    $scope.unscheduledPatientAppointments = [];
    $scope.fromUnscheduled = true;

    if ($scope.patient && $scope.patient.PatientId) {
      schedulingApiService
        .getUnscheduledAppointmentsByPatient($scope.patient.PatientId)
        .then(ctrl.UnscheduledForPatientOnSuccess);
    }
  }

  ctrl.onProviderSchedulesChanged = onProviderSchedulesChanged;
  function onProviderSchedulesChanged(nv, ov) {
    //Logging//console.log('onProviderSchedulesChanged');
    // The problem with this watch is that it is based on sub controls maintained value
    // Having watches setup like this causes synchronization issues between controls.
    // Think about this from the perspective of who owns the data. If I have my wallet.
    // How can my children also have my wallet. I only have one wallet.
    if (nv !== ov) {
      // we only care about this action of the counts are different.
      if (
        nv.length > 0 &&
        $scope.appointment.Data.ProviderAppointments &&
        nv.length !== $scope.appointment.Data.ProviderAppointments.length
      ) {
        // so if they do not equal each other there as a good chance that the values are different.

        ctrl.checkIfAppointmentHasChanges();
      }
    }
  }

  $scope.checkForPatient = checkForPatient;
  function checkForPatient(nv) {
    //Logging//console.log('checkForPatient');
    if (!nv || angular.isUndefined(nv) || nv == '') {
      $scope.patientSelected = false;
      // reset patient so that appointmentStatus is disabled
      $scope.appointment.Data.Patient = null;
    } else {
      $scope.patientSelected = true;
      //This is for the new status control for the event emitter on disable
      setDisableStatusDropdown(false);
    }
  }

  //This is is an event being bound to event emitter on disableStatusDropdown for the new status control
  $scope.setDisableStatusDropdown = setDisableStatusDropdown;
  function setDisableStatusDropdown(nv) {
    $scope.disableStatusDropdown = nv;
  }

  $scope.setUpItemsThatUsedToBeLoadedInTheInitAppointmentMethod = setUpItemsThatUsedToBeLoadedInTheInitAppointmentMethod;
  function setUpItemsThatUsedToBeLoadedInTheInitAppointmentMethod() {
    ctrl.initializeAppointmentTimes();

    var appointment = $scope.appointment;

    appointment.AfterSaveSuccess = ctrl.AfterAppointmentSavedSuccess;

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
          UserId: $scope.appointment.Data.ProviderId
            ? $scope.appointment.Data.ProviderId
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

    if (!appointment.Data.PlannedServices) {
      appointment.Data.PlannedServices = [];
    }

    if (!appointment.Data.ServiceCodes) {
      appointment.Data.ServiceCodes = [];
    }

    if ($scope.appointment.Data.Classification === 2) {
      // Bug 337083 if this is an unschedule appointment, no provider appointments should exist
      $scope.providerAppointments = [];
    } else {
      $scope.providerAppointments = _.cloneDeep(
        appointment.Data.ProviderAppointments
      );
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

          // adding values back into Planned Service because they are not present
          // on that object or are not in the right format right on appointment edit.
          service.Code = serviceCode.Code;
          service.DisplayAs = serviceCode.DisplayAs;
          service.Description = serviceCode.Description;
          service.AffectedAreaId = serviceCode.AffectedAreaId;
          service.service = serviceCode;
        }
      });
    }

    if ($scope.plannedServices.length > 0) {
      $scope.needToApplyPropTag = true;
      $scope.applyProposedTag();
    } else {
      $scope.needToApplyPropTag = false;
    }

    // method removed because it was only for treatment plan area.
    //ctrl.checkForPreselectedServices();

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

    // This call needs to occur here, so that all the proper appointment times are updated before the slots are initialized.
    ctrl.updateSelectedProvidersTime();
  }

  ctrl.setFromApptModalPatientApi = setFromApptModalPatientApi;
  function setFromApptModalPatientApi(patient) {
    //Logging//console.log('setFromApptModalPatientApi');
    ctrl.setPatientAlertsFromPatient(patient);

    $scope.preventiveDate.dueDate = _.cloneDeep(patient.DateServiceDue);
    $scope.hasRunningAppointment = patient.HasRunningAppointment;
    $scope.patientBenefitPlanExists = patient.PatientBenefitPlanExists;

    patient = appointmentViewLoadingService.formatPatientAccountProperties(
      patient
    );

    return patient;
  }

  ctrl.checkPreferred = checkPreferred;
  function checkPreferred() {
    //Logging//console.log('checkPreferred');
    _.forEach(
      appointmentModalProvidersService.modalProviders,
      function (provider) {
        provider.highlighted = $scope.isPrefferredProvider(provider);
      }
    );
  }

  $scope.onSelectedServiceProviderChange = onSelectedServiceProviderChange;
  function onSelectedServiceProviderChange(service) {
    if (
      service !== null &&
      service !== undefined &&
      service.originalProvider !== service.ProviderUserId
    ) {
      //Logging//console.log('onSelectedServiceProviderChange');
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
  }

  // Passed in list is derived from filtered list on schedule, if location is changed this may not match
  // the new location so we need to get the list and set ScheduledProviders based on this
  ctrl.loadScheduleProviders = function (providersByLocation, location) {
    $scope.localProviders = [];
    var localProviders = [];
    $scope.multipleProviders = { selectedProviders: [] };
    if (!_.isNil(location)) {
      var locationAndTimeZoneAbbr = ctrl.addLocationTimezoneAbbr(location);
      // filter this list by the selectedLocation LocationId / ShowOnSchedule
      _.forEach(providersByLocation, function (newProvider) {
        if (
          newProvider.ShowOnSchedule === true &&
          newProvider.LocationId === location.LocationId
        ) {
          // add locationAbbr to format for ScheduleProviders
          newProvider.Name = newProvider.FullName;
          newProvider.ProviderTypeViewId = null;
          newProvider.locationAbbr = locationAndTimeZoneAbbr;
          // add this provider to list
          localProviders.push(newProvider);
        }
      });
    }
    ctrl.setProviders(localProviders);
    // broadcast to multi-select that list has changed
    $scope.$broadcast('reinitializeList', $scope.localProviders);
  };

  ctrl.setProviders = setProviders;
  function setProviders(newProviders) {
    //Logging//console.log('setProviders');

    ctrl.fullProviderList = _.cloneDeep(newProviders);

    // hide inactive providers
    // need to check if we're editing an existing or creating a new appt.
    // if we're editing an existing, and the provider is inactive, continue to show them, but hide all other inactive providers
    // if we're creating new, do not show any inactive provider
    ctrl.fullProviderList = ctrl.fullProviderList.filter(provider => {
      // we'll _always_ have something in .Data., but Data.AppointmentId will _only_
      //   get set when we're editing an existing appointment
      if ($scope.appointment.Data.AppointmentId) {
        if (provider.IsActive) {
          return true;
        }

        // check and see if the provider is on the appointment
        let providerAppointments = $scope.appointment.Data.ProviderAppointments.filter(
          providerAppointment => {
            return providerAppointment.UserId === provider.UserId;
          }
        );

        if (providerAppointments && providerAppointments.length > 0) {
          // active providers will have returned already. at this point, we know the provider is on the appointment, but they're inactive
          // since we're editing an appointment, return true so they remain on the dropdown list
          return true;
        }

        // at this point, the provider is inactive, and they're not on the appointment. don't include them in the list of providers
        return false;
      }

      // if it's a new appointment, we only want to have active providers in the dropdown.
      return provider.IsActive === true && provider.ShowOnSchedule === true;
    });

    appointmentModalProvidersService.modalProviders = ctrl.fullProviderList;

    // slight change ... if $scope.patient is not set we are going to default the value of highlighted = false.
    // this ensures less processing. we could also change this to be set by default for providers on new appointment.
    // do not iterate over the providers ... we set the value to false before hand in the schedule page
    var value = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    if (value) {
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (provider) {
          provider.highlighted = $scope.isPrefferredProvider(provider);
        }
      );
    }

    // map back to view bound object for display and
    // sort by IsActive, then LastName so that active users are at the top of the list
    $scope.localProviders = _.orderBy(
      appointmentModalProvidersService.modalProviders,
      ['IsActive', 'LastName', 'FirstName'],
      ['desc', 'asc', 'asc']
    );
  }

  /** Initializing Appointment */

  ctrl.getAppointmentEndTimeLimit = getAppointmentEndTimeLimit;
  function getAppointmentEndTimeLimit() {
    //Logging//console.log('getAppointmentEndTimeLimit');
    var midnight = new Date($scope.appointmentDate);
    midnight.setHours(23, 59, 59, 59);

    return midnight;
  }

  $scope.apptTypeDropdownTemplate =
    '<div id="template" type="text/x-kendo-template" ng-show="dataItem">' +
    '<div class="appointment-type-circle" ng-style="{\'background-color\': dataItem.AppointmentTypeColor, \'color\': dataItem.FontColor}"></div>' +
    '<span class="k-state-default">#: Name #</span>' +
    '</div>';

  $scope.apptTypeValueTemplate =
    '<div id="valueTemplate" type="text/x-kendo-template">' +
    '<div id="lblSelectedAppointmentTypePreview" class="value-template-input appointment-type-circle" ng-style="{\'background-color\': dataItem.AppointmentTypeColor, \'color\': dataItem.FontColor}"></div>' +
    '<span id="lblSelectedAppointmentTypeName" class="value-template-input k-state-default">#: Name #</span>' +
    '</div>';

  $scope.valueTemplate =
    '<div id="valueTemplate" type="text/x-kendo-template">' +
    '<span id="lblSelectedName" class="value-template-input k-state-default">#: Name #</span>' +
    '</div>';

  $scope.roomTemplate =
    '<div id="roomTemplate" type="text/x-kendo-template">' +
    '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': dataItem.Assigned ? \'bold\' : \'normal\' }">#: Name #</span>' +
    '</div>';

  $scope.locationTemplate =
    '<div id="locationTemplate" type="text/x-kendo-template">' +
    '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': dataItem.LocationId == dataItem.currentLocation ? \'bold\' : \'normal\' }">#: displayText #</span>' +
    '</div>';

  $scope.providerTemplate =
    '<div id="providerTemplate" type="text/x-kendo-template">' +
    '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': isPrefferredProvider(dataItem) ? \'bold\' : \'normal\' }">#: Name #</span>' +
    '</div>';

  $scope.hygienistTemplate =
    '<div id="hygienistTemplate" type="text/x-kendo-template">' +
    '<span id="lblSelectedName" class="value-template-input k-state-default" ng-style="{\'font-weight\': dataItem.isPreferred ? \'bold\' : \'normal\' }">#: Name #</span>' +
    '</div>';

  // validate surface
  $scope.validateSurface = validateSurface;
  function validateSurface(serviceTransaction, flag) {
    //Logging//console.log('validateSurface');
    serviceTransaction.isSurfaceEditing = true;
  }

  $scope.blurSurface = blurSurface;
  function blurSurface(serviceTransaction) {
    //Logging//console.log('blurSurface');
    serviceTransaction.isSurfaceEditing = false;
  }

  $scope.capitalizeRoots = capitalizeRoots;
  function capitalizeRoots(serviceTransaction) {
    //Logging//console.log('capitalizeRoots');
    serviceTransaction.Roots = serviceTransaction.Roots.toUpperCase();
  }

  // setting the examining dentist to patient's preferred dentist if appt type is hygiene
  $scope.setExaminingDentist = setExaminingDentist;
  function setExaminingDentist(appointmentTypeId) {
    //Logging//console.log('setExaminingDentist');
    $scope.selectedAppointmentType = appointmentTypesService.findByAppointmentTypeId(
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
  }

  //Unscheduled appts list for specific patient

  $scope.getProviderString = getProviderString;
  function getProviderString(userId) {
    //Logging//console.log('getProviderString');
    var provider = appointmentModalProvidersService.findByUserId(userId);
    var name =
      provider && provider.Name != null
        ? provider.Name
        : $scope.appointmentModalText.anyProvider;
    return name;
  }

  $scope.showDeleteUnscheduledAppointmentModal = showDeleteUnscheduledAppointmentModal;
  function showDeleteUnscheduledAppointmentModal(appointment) {
    //Logging//console.log('showDeleteUnscheduledAppointmentModal');
    $scope.unscheduledAppointmentToDelete = boundObjectFactory.Create(
      scheduleServices.Dtos.Appointment
    );
    $scope.unscheduledAppointmentToDelete.Data = _.cloneDeep(appointment);
    $scope.unscheduledAppointmentToDelete.AfterDeleteSuccess =
      ctrl.AfterAppointmentDeleted;
    modalFactory
      .AppointmentDeleteModal(
        $scope.unscheduledAppointmentToDelete.Data.Classification,
        true,
        'Are you sure you want to remove this unscheduled appointment?'
      )
      .then(
        ctrl.confirmUnscheduledAppointmentDelete,
        ctrl.cancelUnscheduledAppointmentDelete
      );
  }

  ctrl.confirmUnscheduledAppointmentDelete = confirmUnscheduledAppointmentDelete;
  function confirmUnscheduledAppointmentDelete() {
    //Logging//console.log('confirmUnscheduledAppointmentDelete');
    if ($scope.unscheduledAppointmentToDelete != null) {
      $scope.unscheduledAppointmentToDelete.Delete();
    }
    setTimeout(function () {
      ctrl.getUnscheduledAppointments();
    }, 2000);
  }

  ctrl.cancelUnscheduledAppointmentDelete = cancelUnscheduledAppointmentDelete;
  function cancelUnscheduledAppointmentDelete() {
    //Logging//console.log('cancelUnscheduledAppointmentDelete');
    $scope.unscheduledAppointmentToDelete = null;
  }

  $scope.selectUnscheduledAppointment = selectUnscheduledAppointment;
  function selectUnscheduledAppointment(appointment) {
    //Logging//console.log('selectUnscheduledAppointment');
    $scope.selectedAppointment = appointment;
  }

  $scope.openAppointmentModal = openAppointmentModal;
  function openAppointmentModal(appointment) {
    // get the data you need to then update the appointment record
    appointment.StartTime = $scope.appointment.Data.StartTime;

    //this first if check executes when opening an unscheduled appt from the appt view
    if (appointment.EndTime === null && appointment.ProposedDuration !== null) {
      let endTime = new Date(
        appointment.StartTime.getTime() + appointment.ProposedDuration * 60000
      );
      appointment.EndTime = endTime;
    } else {
      appointment.EndTime = $scope.appointment.Data.EndTime;
    }

    appointmentViewDataLoadingService.getViewData(appointment, true).then(
      function (res) {
        appointmentViewVisibleService.changeAppointmentViewVisible(false, true);
      },
      function (error) {
        console.log(error);
        // consider if there are problems how to get the user back in a state where they can continue.

        toastrFactory.error(
          'Ran into a problem loading the unscheduled appointment',
          'Error'
        );
      }
    );
  }

  $scope.refreshPatientUnscheduledAppts = refreshPatientUnscheduledAppts;
  function refreshPatientUnscheduledAppts() {
    //Logging//console.log('refreshPatientUnscheduledAppts');
    ctrl.getUnscheduledAppointments();
  }

  ctrl.updateSelectedProvidersTime = updateSelectedProvidersTime;
  function updateSelectedProvidersTime() {
    //Logging//console.log('updateSelectedProvidersTime');
    $scope.slots = [];

    var currentDate = _.cloneDeep($scope.appointment.Data.StartTime);
    var endDate = _.cloneDeep($scope.appointment.Data.EndTime);

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
  }

  $scope.getPinnedAppointments = getPinnedAppointments;
  function getPinnedAppointments() {
    //Logging//console.log('getPinnedAppointments');
    var returnList = $.grep(
      $scope.unscheduledPatientAppointments,
      function (e) {
        return e.IsPinned == true;
      }
    );
    return returnList;
  }

  ctrl.appointmentDateTimeChanged = appointmentDateTimeChanged;
  function appointmentDateTimeChanged(nv, ov) {
    //Logging//console.log('appointmentDateTimeChanged');
    if (nv && JSON.stringify(nv) != JSON.stringify(ov)) {
      ctrl.updateSelectedProvidersTime(nv, ov);
    }
  }

  ctrl.selectedProvidersChanged = selectedProvidersChanged;
  function selectedProvidersChanged(nv, ov) {
    if (nv && ov && nv.length !== ov.length) {
      //Logging//console.log('selectedProviderChanged');
      // if the lengths don't match, the user has checked or unchecked a provider
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
    }
  }

  ctrl.timeIncrementChanged = timeIncrementChanged;
  function timeIncrementChanged(nv, ov) {
    //Logging//console.log('timeIncrementChanged');
    if (nv.TimeIncrement != ov.TimeIncrement) {
      ctrl.updateSelectedProvidersTime();
    }
  }

  $scope.validateSelectedTime = validateSelectedTime;
  function validateSelectedTime(prov, slot, $event, checkProviderSched) {
    //Logging//console.log('validateSelectedTime');
    checkProviderSched =
      checkProviderSched == undefined || checkProviderSched == null
        ? true
        : checkProviderSched;
    if (checkProviderSched) {
      ctrl.checkIfAppointmentHasChanges();
      ctrl.getRoomAssignmentsForExistingAppointment();
    }
  }

  $scope.isSelected = isSelected;
  function isSelected(prov, slot) {
    //Logging//console.log('isSelected');
    var name = prov.UserId + '_' + slot.Name;
    var index = listHelper.findIndexByFieldValue(
      $scope.providerSchedules,
      'Name',
      prov.UserId + '_' + slot.Name
    );
    return index > -1;
  }

  // This method name is misleading.  If it is true, it will block services.
  $scope.canAddServices = canAddServices;
  function canAddServices() {
    //Logging//console.log('canAddServices');
    ctrl.setButtonState();
    var isPatientNull = !$scope.patient && !$scope.newAppt.patient;
    return isPatientNull || $scope.disableWhenPatientInactive;
  }

  ctrl.reInitializeHasChanges = reInitializeHasChanges;
  function reInitializeHasChanges(isInitializing) {
    //Logging//console.log('reInitializeHasChanges');
    $timeout(function () {
      var apptType = appointmentTypesService.findByAppointmentTypeId(
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
  }

  ctrl.lastUsedLocationRoomsTimeout;
  ctrl.resetLastUsedLocationRoomCheck = resetLastUsedLocationRoomCheck;
  function resetLastUsedLocationRoomCheck() {
    //Logging//console.log('resetLastUsedLocationRoomCheck');
    $timeout.cancel(ctrl.lastUsedLocationRoomsTimeout);
    ctrl.lastUsedLocationRoomsTimeout = $timeout(function () {
      ctrl.lastLocationRooms = null;
    }, 3000);
  }

  $scope.unavailableProviders = null;

  // this method is ridiculous ... who puts all this stuff in one place.
  // I am hoping this was one of my earlier refactoring where we are now ready for another change.
  ctrl.filterProvidersByLocation = filterProvidersByLocation;
  function filterProvidersByLocation(locationId, isInitializing) {
    //Logging//console.log('filterProvidersByLocation');
    //////Logging//console.log('what is the point of doing all of this logic??');
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

    $scope.selectedLocation = locationsService.findByLocationId(
      $scope.appointment.Data.LocationId
    );
    if (
      $scope.selectedLocation === null ||
      $scope.selectedLocation === undefined
    ) {
      $scope.selectedLocation = $scope.appointment.Data.Location;
    }
    $scope.timezoneInfo = timeZoneFactory.GetTimeZoneInfo(
      $scope.selectedLocation.Timezone,
      $scope.appointment.Data.StartTime
    );

    $scope.appointment.Data.Location = _.cloneDeep($scope.selectedLocation);

    //These properties have to be on appointment.Data.PlannedServices for Validation of Providers on Services
    if (
      $scope.appointment.Data.PlannedServices != null &&
      $scope.appointment.Data.PlannedServices.length > 0
    ) {
      ctrl.setProviderIdAndValidPropertyOnPlannedService();
    }

    $scope.unavailableProviders = [];
    var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    if (appointmentModalProvidersService.modalProviders.length > 0) {
      var prov = [];
      $scope.providerSchedules = $scope.providerSchedules
        ? $scope.providerSchedules
        : [];

      for (
        var i = $scope.providerSchedules.length - 1;
        i >= 0 && $scope.providerSchedules.length > 0;
        i--
      ) {
        let providerFound = listHelper.findItemByFieldValue(
          $scope.localProviders,
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
        var foundProv = appointmentModalProvidersService.findByUserId(
          $scope.appointment.Data.UserId
        );
        if (!foundProv) {
          $scope.appointment.Data.UserId = null;
        }
      }
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (provider) {
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
        }
      );

      $scope.multipleProviders = {
        selectedProviders: prov.length == 0 ? [] : prov,
      };
      $scope.initialProviderSelection = prov.length == 0 ? [] : prov;
      if (
        $scope.appointment.Data.AppointmentId !== null &&
        $scope.appointment.Data.AppointmentId !== undefined
      ) {
        $scope.$broadcast('refreshSelectedCount');
      }

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
        let providerFound = appointmentModalProvidersService.findByUserId(
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

        //var slotName = startTime.getHours().toString() + '-' + startTime.getMinutes().toString();
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
          if (foundProvider.UserId == prov.UserId) {
            prov.FirstName = foundProvider.FirstName;
            prov.LastName = foundProvider.LastName;
            break;
          }
        }
      });
    }

    let roomPromise = ctrl.getLocationRooms($scope.selectedLocation.LocationId);
    $scope.examiningDentistLoading = true;

    // set isPrefferred for each items ... so that the view does not have to keep recalculating
    $scope.examiningDentists = [
      {
        Name: localize.getLocalizedString('Any Dentist'),
        UserId: 'any',
        isPreferred: false,
      },
      {
        Name: localize.getLocalizedString('No Exam Needed'),
        UserId: 'noexam',
        isPreferred: false,
      },
    ];

    _.forEach(
      appointmentModalProvidersService.modalProviders,
      function (provider) {
        if (provider.ProviderTypeId == 1) {
          // set if the provider is preferred or not.
          $scope.examiningDentists.push(provider);
        }
      }
    );
    $scope.checkIfPreferredHygienist();
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
    return roomPromise;
  }

  //These properties need set to validate the provider on the service transaction
  ctrl.setProviderIdAndValidPropertyOnPlannedService = setProviderIdAndValidPropertyOnPlannedService;
  function setProviderIdAndValidPropertyOnPlannedService() {
    _.forEach(
      $scope.appointment.Data.PlannedServices,
      function (plannedServices) {
        if (
          typeof plannedServices.$$isProviderOnServiceValid === 'undefined' &&
          typeof plannedServices.ProviderId === 'undefined'
        ) {
          plannedServices.ProviderId = plannedServices.ProviderUserId;
          plannedServices.$$isProviderOnServiceValid = true;
          $scope.appointment.Data.$$didLocationChange = false;
        }
      }
    );
  }

  //#endregion

  //#region locations get

  ctrl.processLocationData = processLocationData;
  function processLocationData() {
    //Logging//console.log('processLocationData');
    ctrl.loadingLocations = false;

    let userLocationId = $scope.userLocation().id;
    // this looks funny but this is setting what location is bold in the list.
    // look at the template to see how this is done.
    _.forEach(locationsService.locations, function (location) {
      // set the selectedLocation (doing it this way removes a list search)
      if ($scope.appointment.Data.LocationId === userLocationId) {
        $scope.selectedLocation = location;
      }
      location.currentLocation = userLocationId;
    });
    if (
      !$scope.filteredProviders &&
      appointmentModalProvidersService.modalProviders &&
      appointmentModalProvidersService.modalProviders.length > 0
    ) {
      var locationId = $scope.appointment.Data.LocationId;

      ctrl.filterProvidersByLocation(locationId, true);
    }

    // this groups the different items.
    ctrl.filterLocations();
  }

  // change appointment location
  ctrl.changeAppointmentLocation = changeAppointmentLocation;
  function changeAppointmentLocation(location) {
    //Logging//console.log('changeAppointmentLocation');
    if (location.LocationId !== $scope.appointment.Data.LocationId) {
      $scope.appointment.Data.Location = _.cloneDeep(location);

      $scope.appointment.Data.LocationId = _.cloneDeep(location.LocationId);

      // location changed ... check if the existing room is in the active locations list
      // if not reset the value
      let room = null;
      for (let i = 0; i < location.Rooms.length; ++i) {
        if (
          location.Rooms[i].RoomId === $scope.appointment.Data.TreatmentRoomId
        ) {
          room = location.Rooms[i].RoomId;
        }
      }
      if (room === null) {
        $scope.appointment.Data.TreatmentRoomId = null;
      }

      for (let i = 0; i < $scope.plannedServices.length; ++i) {
        $scope.plannedServices[i].LocationId = location.LocationId;
        $scope.appointment.Data.PlannedServices[i].LocationId =
          location.LocationId;
      }
      // reload providers based on new location
      providerShowOnScheduleFactory
        .getProviderLocations(true)
        .then(function (res) {
          ctrl.loadScheduleProviders(res, location);
          ctrl.filterProvidersByLocation($scope.appointment.Data.LocationId);
          $scope.checkIfPatientsPrefLocation();
          $scope.checkIfPreferredHygienist();
          $scope.checkIfPreferredProviderAvailable();
        });
    }
  }

  // if there are proposed services from another location on appointment we need to confirm before removing
  $scope.confirmLocationChange = confirmLocationChange;
  function confirmLocationChange(location) {
    //Logging//console.log('confirmLocationChange');
    if (location.LocationId !== $scope.appointment.Data.LocationId) {
      ctrl.changeAppointmentLocation(location);
    }
  }

  ctrl.locationChangedCanceled = locationChangedCanceled;
  function locationChangedCanceled() {
    //Logging//console.log('locationChangedCanceled');
    $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);
  }

  // variable to store the userLocationData so we stop grabbing it from session storage a number of times.
  $scope.userLocationData = null;
  $scope.userLocation = userLocation;
  function userLocation() {
    //Logging//console.log('userLocation');
    // this should just be something we get from some in memory userSettings values grabbing from session storage all over is not a great idea.
    if ($scope.userLocationData === null) {
      //Logging//console.log('UserLocation just grabbed data from session storage');
      let userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      $scope.userLocationData = userLocation;
    }

    return $scope.userLocationData;
  }

  $scope.locationIsLoggedIn = locationIsLoggedIn;
  function locationIsLoggedIn(location) {
    //Logging//console.log('locationIsLoggedIn');
    return location.LocationId == $scope.userLocation().id;
  }

  $scope.providerChanged = providerChanged;
  function providerChanged() {
    //Logging//console.log('providerChanged');
    ctrl.checkIfAppointmentHasChanges();
  }

  $scope.checkIfPatientsPrefLocation = checkIfPatientsPrefLocation;
  function checkIfPatientsPrefLocation() {
    //Logging//console.log('checkIfPatientPrefLocation');
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
  }

  ctrl.groupLocations = groupLocations;
  function groupLocations(locs) {
    let currentLocations = _.cloneDeep(locs);
    // once we start using just the groupLocations value in the new dropdown this method can be simplified and converted to just return the groupLocations.
    //Logging//console.log('groupLocations');
    ctrl.resLocs = [];
    ctrl.activeLocations = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];

    var dateNow = moment().format('MM/DD/YYYY');
    _.each(currentLocations, function (obj) {
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
        ctrl.activeLocations.push(obj);
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

    $scope.groupedLocations = [];

    if (ctrl.activeLocations !== null && ctrl.activeLocations.length > 0) {
      let locationGroup = {
        GroupName: 'Active',
        Data: ctrl.activeLocations,
      };
      $scope.groupedLocations.push(locationGroup);
    }

    if (
      ctrl.pendingInactiveLocs !== null &&
      ctrl.pendingInactiveLocs.length > 0
    ) {
      let locationGroup = {
        GroupName: 'Pending Inactive',
        Data: ctrl.pendingInactiveLocs,
      };
      $scope.groupedLocations.push(locationGroup);

      _.each(ctrl.pendingInactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
    }

    if (ctrl.inactiveLocs !== null && ctrl.inactiveLocs.length > 0) {
      let locationGroup = {
        GroupName: 'Inactive',
        Data: ctrl.inactiveLocs,
      };
      $scope.groupedLocations.push(locationGroup);

      _.each(ctrl.inactiveLocs, function (obj) {
        ctrl.resLocs.push(obj);
      });
    }

    return ctrl.resLocs;
  }

  // Have to come back and see if we can make this easier to understand and redesign, we are now pulling parts of this method into TS.
  ctrl.filterLocations = filterLocations;
  function filterLocations() {
    //Logging//console.log('filterLocations');
    if (locationsService.locations) {
      $scope.filteredLocations = [];
      let tempLocations = _.cloneDeep(locationsService.locations);
      let locs = newScheduleAppointmentUtilitiesService.filterLocationsForAppointmentModal(
        $scope.patient,
        tempLocations
      );

      let locValue = ctrl.groupLocations(locs);

      $scope.filteredLocations = locValue;

      let methodlocations = ctrl.groupLocations(locs);
      let newSelectedLocation = newScheduleAppointmentUtilitiesService.processFilterSettingsAfterOrdering(
        $scope.appointment.Data.Patient,
        $scope.appointment.Data.LocationId,
        $scope.filteredLocations
      );

      if (newSelectedLocation) {
        $scope.dropDownLocation = newSelectedLocation;
      }

      $scope.filteredLocationsDDL = {
        data: $scope.filteredLocations,
        group: { field: 'SortOrder' },
        sort: [
          { field: 'NameLine1', dir: 'asc' },
          { field: 'DeactivationTimeUtc', dir: 'asc' },
        ],
      };

      $scope.locationsDDL = {
        data: methodlocations,
        group: { field: 'SortOrder' },
        sort: [
          { field: 'NameLine1', dir: 'asc' },
          { field: 'DeactivationTimeUtc', dir: 'asc' },
        ],
      };
    }
  }

  $scope.checkIfPreferredHygienist = checkIfPreferredHygienist;
  function checkIfPreferredHygienist() {
    //Logging//console.log('checkIfPreferredHygienist');
    var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    if (patient && patient.PreferredDentist && patient.PreferredDentist != '') {
      // loop through the examining dentists
      _.forEach($scope.examiningDentists, function (dentist) {
        dentist.isPreferred = patient.PreferredDentist == dentist.UserId;
      });
    }
  }

  $scope.checkIfPreferredProviderAvailable = checkIfPreferredProviderAvailable;
  function checkIfPreferredProviderAvailable() {
    //Logging//console.log('checkIfPreferredProviderAvailable');
    var patient = $scope.patient ? $scope.patient : $scope.newAppt.patient;
    if (patient && patient.PreferredDentist && patient.PreferredDentist != '') {
      var isAvailable = false;
      ctrl.checkPreferredProviders();
      _.forEach(
        appointmentModalProvidersService.modalProviders,
        function (provider) {
          if (!isAvailable) {
            isAvailable = provider.UserId == patient.PreferredDentist;
          }
        }
      );
      $scope.prefProviderNotAvailable = !isAvailable;
    } else {
      $scope.prefProviderNotAvailable = false;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // Old Status Control Code

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
  function cancelAction() {
    //Logging//console.log('OldStatusControlCode.cancelAction');
    $scope.appointment.Data.Status = ctrl.lastStatusId;
  }

  ctrl.canCheckout = canCheckout;
  function canCheckout(appt, oldStatusId) {
    //Logging//console.log('OldStatusControlCode.canCheckout');
    appt.Status = oldStatusId;
    $scope.appointment.Data = angular.copy(appt);
    $scope.patient = angular.copy(appt.Patient);

    //if (ctrl.appointmentHasChanges(appt)) {
    //    $scope.route = $location.search();
    //    ctrl.showAppointmentSaveModal(appt, $scope.patient);
    //}
    //else {

    // I have no idea why this is done or needed ... look at this later
    ctrl.setClean($scope);

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

    //ensure any changes to appointment are saved before checking out
    $scope.save();
    if ($scope.appointment.Saving === false) {
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
          ctrl.sendForCheckout(res.Value.EncounterId, appt);
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

    //}
  }

  //ctrl.appointmentCompletedAlready = appointmentCompletedAlready;
  //function appointmentCompletedAlready() {
  //    // do nothing
  //}

  //ctrl.showAppointmentCheckedOutMessage = showAppointmentCheckedOutMessage;
  //function showAppointmentCheckedOutMessage(appt) {
  //    //Logging//console.log('OldStatusControlCode.showAppointmentCheckedOutMessage');
  //    // moved to text service.
  //    var title = localize.getLocalizedString('Appointment Checked Out');
  //    var message = localize.getLocalizedString('This appointment has already been completed and checked out.');
  //    var button1Text = localize.getLocalizedString('OK');
  //    return modalFactory.ConfirmModal(title, message, button1Text).then(ctrl.appointmentCompletedAlready);
  //};

  ctrl.sendForCheckout = sendForCheckout;
  function sendForCheckout(encounterId, appt) {
    //Logging//console.log('OldStatusControlCode.sendForCheckout');

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
      if (encounterId !== null && encounterId !== undefined) {
        path =
          patientPath +
          appt.Patient.PatientId +
          '/Account/' +
          appt.Patient.PersonAccount.AccountId +
          '/Encounter/' +
          encounterId +
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
        $scope.closePage();
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

  ctrl.setClean = setClean;
  function setClean(scope) {
    //Logging//console.log('OldStatusControlCode.setClean');
    if (scope.$parent && typeof scope.$parent.hasChanges === 'undefined') {
      ctrl.setClean(scope.$parent);
    } else if (
      scope.$parent &&
      typeof scope.$parent.hasChanges !== 'undefined'
    ) {
      scope.$parent.hasChanges = false;
      ctrl.setClean(scope.$parent);
    }
  }

  ctrl.ShowStatusModal = ShowStatusModal;
  function ShowStatusModal() {
    //Logging//console.log('OldStatusControlCode.ShowStatusModal');
    modalFactory
      .AppointmentStatusModal({
        id: 'Reschedule',
        title: 'Reschedule this Appointment',
        appointment: $scope.appointment.Data,
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
      .then(ctrl.appointmentRescheduled, ctrl.cancelAction);
  }

  ctrl.ShowCheckoutModal = ShowCheckoutModal;
  function ShowCheckoutModal(oldStatusId) {
    //Logging//console.log('OldStatusControlCode.ShowCheckoutModal');

    // I do not understand why this is a required check ...
    if (
      $scope.appointment.Data.Patient.ResponsiblePersonId === null ||
      $scope.appointment.Data.Patient.ResponsiblePersonId === undefined
    ) {
      $scope.appointment.Data.Patient = $scope.apptPatient;
      if (
        $scope.apptPatient.ResponsiblePersonId === null &&
        $scope.apptPatient.ResponsiblePersonType !== 2
      ) {
        $scope.appointment.Data.Patient.ResponsiblePersonId =
          $scope.apptPatient.PatientId;
      }
    }

    if ($scope.appointment.Data.Patient.ResponsiblePersonId === null) {
      modalFactory
        .ResponsiblePartyModal({
          id: 'ResponsibleParty',
          title: 'Please assign a responsible person to continue',
          appointment: angular.copy($scope.appointment.Data),
          patient: angular.copy($scope.appointment.Data.Patient),
          hasStatusNote: false,
          showDeleteCheckbox: true,
          ShowAppointmentInfo: true,
          ShowReason: true,
        })
        .then(function (appts) {
          ctrl.canCheckout(appts, oldStatusId);
        });
    } else {
      ctrl.canCheckout($scope.appointment.Data, oldStatusId);
    }
  }

  ctrl.appointmentHasChanges = appointmentHasChanges;
  function appointmentHasChanges(appointment) {
    //Logging//console.log('OldStatusControlCode.appointmentHasChanges');
    if (appointment !== null) {
      var appointmentHasChanged = appointment.ObjectState === saveStates.Update;
      //planned services will always have an ObjectState of 'Update' due to updateServiceTransactionsIfProviderDoesNotExistAtLocation() in appointment-view-provider-dropdown-controller
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
  }

  ctrl.objectHasChanges = objectHasChanges;
  function objectHasChanges(object) {
    //Logging//console.log('OldStatusControlCode.objectHasChanges');
    return (
      object != null &&
      object.ObjectState != null &&
      object.ObjectState != saveStates.None
    );
  }

  ctrl.showAppointmentSaveModal = showAppointmentSaveModal;
  function showAppointmentSaveModal(appt, patient) {
    //Logging//console.log('OldStatusControlCode.showAppointmentSaveModal');
    // To prevent multiple confirmation modals from popping, we check if we already have one.
    if (ctrl.savingForCheckout) {
      return;
    }
    ctrl.savingForCheckout = true;

    // The scope isn't persisted through this logic, so we save the necessary information on the controller.
    ctrl.savedAppt = appt;
    ctrl.savedPatient = patient;
    // move some of this to the text service
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
  }

  ctrl.confirmAppointmentSave_v2 = confirmAppointmentSave_v2;
  function confirmAppointmentSave_v2() {
    //Logging//console.log('OldStatusControlCode.confirmAppointmentSave_2');
    ctrl.confirmAction(
      $scope.appointment.Data,
      true,
      true,
      ctrl.appointmentSaved_v2(ctrl.savedAppt),
      null
    );
    //ctrl.appointmentSaved_v2($scope.appointment);
  }

  ctrl.appointmentSaved_v2 = appointmentSaved_v2;
  function appointmentSaved_v2(updatedAppointment) {
    //Logging//console.log('OldStatusControlCode.appointmentSaved_v2');
    // This fix prevents the event screen from popping up on certain scenario
    // Scenario: an open appointment modal has changes on the services (added / removed) and the appointment is checked out (via the status dropdown).
    //  Upon clicking "Save and continue" on the prompt, the event screen pops up and the user is taken to the encounter page
    $rootScope.$broadcast('schedule-suppress-refresh');

    let patientPath = '/Patient/';
    // - end fix -
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
  }

  ctrl.encounterSaved = encounterSaved;
  function encounterSaved() {
    //Logging//console.log('OldStatusControlCode.encounterSaved');
    ctrl.confirmAction(null, false, true);
    $rootScope.$broadcast('checkoutCompleted');
  }

  ctrl.appointmentDeleted = appointmentDeleted;
  function appointmentDeleted(appointment) {
    //Logging//console.log('OldStatusControlCode.appointmentDeleted');
    ctrl.confirmAction(appointment, false, true);
  }

  ctrl.appointmentRescheduled = appointmentRescheduled;
  function appointmentRescheduled(appointment) {
    //Logging//console.log('OldStatusControlCode.appointmentRescheduled');
    ctrl.confirmAction(appointment, false, true);
  }

  $scope.appointmentStatusChangedNew = appointmentStatusChangedNew;
  function appointmentStatusChangedNew(nv) {
    //console.log("New Value: " + nv);
    if (
      nv.Data.Status === $scope.appointment.Data.Status &&
      $scope.appointment.Data.Status ===
      appointmentStatusService.appointmentStatusEnum.StartAppointment
    ) {
      updateAppointmentStatusForStart();
    }

    if (
      nv.Data.Status === $scope.appointment.Data.Status &&
      $scope.appointment.Data.Status ===
      appointmentStatusService.appointmentStatusEnum.CheckOut
    ) {
      let loggedInLocation = locationService.getCurrentLocation();
      if ($scope.appointment.Data.Location.LocationId !== loggedInLocation.id) {
        ctrl.blockModalClose = true;
        ctrl.showChangeLocationPromptModal();
      } else {
        ctrl.ShowCheckoutModal(nv);
      }
    }

    if (
      nv.Data.Status === $scope.appointment.Data.Status &&
      $scope.appointment.Data.Status ===
      appointmentStatusService.appointmentStatusEnum.Unschedule
    ) {
      ctrl.unscheduledModalClose = true;
      ctrl.ShowStatusModal();
    }

    if (
      (nv.Data.Status === $scope.appointment.Data.Status &&
        $scope.appointment.Data.Status !==
        appointmentStatusService.appointmentStatusEnum.Completed) ||
      (nv.Data.Status === $scope.appointment.Data.Status &&
        $scope.appointment.Data.Status !==
        appointmentStatusService.appointmentStatusEnum.ReadyForCheckout)
    ) {
      $scope.readOnly = false;
      $scope.hideButtonsOnCompletedOrReadyForCheckout = false; //This will show the id="btnSave" and id="btnAddToClipboard" and hide the id="btnSaveNotesOnly"
      $scope.$digest(); //Need this to fire change detection to update the UI to disable the components
    }

    autoSaveIfDropdownMarkedManuallyCompleted();
  }

  function autoSaveIfDropdownMarkedManuallyCompleted() {
    if (
      $scope.appointment.Data.PlannedServices.length > 0 &&
      ($scope.appointment.Data.PlannedServices[0].EncounterId === null ||
        $scope.appointment.Data.PlannedServices[0].EncounterId === undefined) &&
      $scope.appointment.Data.Status ===
      appointmentStatusService.appointmentStatusEnum.Completed
    ) {
      //Auto Save the appointment
      $scope.saveAppointment();
    } else if (
      $scope.appointment.Data.PlannedServices.length === 0 &&
      $scope.appointment.Data.Status ===
      appointmentStatusService.appointmentStatusEnum.Completed
    ) {
      $scope.saveAppointment();
    }
  }

  ctrl.updateAppointmentStatusForStart = updateAppointmentStatusForStart;
  function updateAppointmentStatusForStart() {
    //Logging//console.log('OldStatusControlCode.updateAppointmentStatusForStart');
    $scope.appointment.Data.Status =
      appointmentStatusService.appointmentStatusEnum.InTreatment;
    var appointmentUpdate = {
      appointmentId: $scope.appointment.Data.AppointmentId,
      DataTag: $scope.appointment.Data.DataTag,
      NewAppointmentStatusId: $scope.appointment.Data.Status,
      StartAppointment: true,
    };

    scheduleServices.AppointmentStatusUpdate.Update(
      appointmentUpdate,
      result => $scope.afterBeginSuccess(result, true),
      $scope.afterBeginFailed
    );
  }

  $scope.afterBeginSuccess = afterBeginSuccess;
  function afterBeginSuccess(result, overrideLocation) {
    //Logging//console.log('afterBeginSuccess');
    $timeout(function () {
      $rootScope.$broadcast('appointment:start-appointment', result.Value); // broadcast used in timeline to tell when to re-set items
      $scope.hasChanges = false;

      var queryString = `activeSubTab=0${overrideLocation === true
        ? `&setLocation=${result.Value.LocationId}`
        : ''
        }`;
      let patientPath = '#/Patient/';
      $scope.PreviousLocationRoute = `${patientPath}${result.Value.PersonId}/Clinical/?${queryString}`;
      //$location.search({});
      tabLauncher.launchNewTab($scope.PreviousLocationRoute);

      appointmentViewLoadingService.currentAppointmentSaveResult = result.Value;
      appointmentViewVisibleService.changeAppointmentViewVisible(false, false);
    }, 100);
  }

  $scope.afterBeginFailed = afterBeginFailed;
  function afterBeginFailed(data) {
    //Logging//console.log('afterBeginFailed');
    $scope.appointment.Data.Status = $scope.appointment.Data.OriginalStatus;
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to begin appointment. Please try again.'
      ),
      'Error'
    );

    $scope.saveClicked = false;
    $scope.disableStatusSelector = false;
  }

  //end old status control code
  /////////////////////////////////////////////////////////////////////////////////////////////////

  ctrl.personId = null;

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //#region methods that calculate fees, discount, tax,

  var inputPromises = [];
  $scope.recalculateReturnUpdatedInputFees = recalculateReturnUpdatedInputFees;
  function recalculateReturnUpdatedInputFees(inputData, returnFunction) {
    //Logging//console.log('recalculateReturnUpdatedInputFee');
    $timeout.cancel(ctrl.recalulateinputDataFeesTimeout);
    ctrl.recalulateinputDataFeesTimeout = $timeout(function () {
      $scope.inputDataFee = inputData;
      inputPromises.push(ctrl.calculateDiscountInputValues());
      inputPromises.push(ctrl.calculateTaxInputValues());
      $q.all(inputPromises).then(function () {
        $scope.inputDataFee.Amount =
          $scope.inputDataFee.Fee -
          $scope.inputDataFee.Discount +
          $scope.inputDataFee.Tax;
        returnFunction();
      });
    }, 500);
  }

  ctrl.calculateDiscountInputValues = calculateDiscountInputValues;
  function calculateDiscountInputValues() {
    //Logging//console.log('calculateDiscountInputValues');
    $scope.inputDiscountLoading = true;

    $scope.inputDiscountCalculationInProgress = true;
    var serviceCode = _.find(ctrl.serviceCodes, {
      ServiceCodeId: $scope.inputDataFee.ServiceCodeId,
    });

    if (serviceCode != null) {
      $scope.inputDataFee.DiscountableServiceTypeId =
        serviceCode.DiscountableServiceTypeId;
      $scope.inputDataFee.applyDiscount = serviceCode.IsEligibleForDiscount;
    }

    // $scope.patient is NOT guaranteed to be set
    if ($scope.patient.PersonAccount) {
      return patientServices.Discount.get(
        { isDiscounted: $scope.inputDataFee.applyDiscount },
        $scope.inputDataFee,
        ctrl.calculateDiscountInputValuesSuccess,
        ctrl.calculateDiscountInputValuesFailure
      ).$promise;
    } else {
      var personId = $scope.appointment.Data.PersonId;
      return patientServices.Discount.getByPersonId(
        { personId: personId, isDiscounted: $scope.inputDataFee.applyDiscount },
        $scope.inputDataFee,
        ctrl.calculateDiscountInputValuesSuccess,
        ctrl.calculateDiscountInputValuesFailure
      ).$promise;
    }
  }

  ctrl.calculateTaxInputValues = calculateTaxInputValues;
  function calculateTaxInputValues() {
    //Logging//console.log('calculateTaxInputValues');
    $scope.inputTaxLoading = true;

    $scope.inputTaxCalculationInProgress = true;
    var serviceCode = _.find(ctrl.serviceCodes, {
      ServiceCodeId: $scope.inputDataFee.ServiceCodeId,
    });

    if (serviceCode != null) {
      $scope.inputDataFee.$$locationTaxableServiceTypeId =
        serviceCode.$$locationTaxableServiceTypeId;
    } else {
      return ctrl.calculateTaxInputValuesFailure.$promise;
    }

    ctrl.serviceTransaction = _.cloneDeep($scope.inputDataFee);

    ctrl.serviceHashKey = $scope.inputDataFee.$$hashKey;
    $scope.taxLoadingId = $scope.inputDataFee.$$hashKey;
    if ($scope.patient.PersonAccount) {
      return patientServices.TaxAfterDiscount.get(
        {
          isDiscounted: $scope.inputDataFee.applyDiscount,
        },
        $scope.inputDataFee,
        ctrl.calculateTaxInputValuesSuccess,
        ctrl.calculateTaxInputValuesFailure
      ).$promise;
    } else {
      var personId = $scope.appointment.Data.PersonId;
      return patientServices.TaxAfterDiscount.getByPersonId(
        {
          personId: personId,
          isDiscounted: $scope.inputDataFee.applyDiscount,
        },
        $scope.inputDataFee,
        ctrl.calculateTaxInputValuesSuccess,
        ctrl.calculateTaxInputValuesFailure
      ).$promise;
    }
  }

  ctrl.calculateTaxInputValuesSuccess = calculateTaxInputValuesSuccess;
  function calculateTaxInputValuesSuccess(response) {
    //Logging//console.log('calculateTaxInputValuesSuccess');
    if ($scope.inputDataFee != null) {
      $scope.inputDataFee.Tax = response.Value;
    }
    $scope.inputTaxCalculationInProgress = false;
    $scope.inputTaxLoading = false;
    $scope.inputDiscountCalculationInProgress = false;
    $scope.inputDiscountLoading = false;
  }

  ctrl.calculateTaxInputValuesFailure = calculateTaxInputValuesFailure;
  function calculateTaxInputValuesFailure(response) {
    //Logging//console.log('calculateTaxInputValuesFailure');
    $scope.inputDataFee.Tax = 0;
    $scope.inputTaxCalculationInProgress = false;
    $scope.inputTaxLoading = false;
    $scope.inputDiscountCalculationInProgress = false;
    $scope.inputDiscountLoading = false;
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate tax'),
      localize.getLocalizedString('Server Error')
    );
  }

  ctrl.calculateDiscountInputValuesSuccess = calculateDiscountInputValuesSuccess;
  function calculateDiscountInputValuesSuccess(response) {
    //Logging//console.log('calculateDiscountInputValuesSuccess');
    if ($scope.inputDataFee != null) {
      if ($scope.inputDataFee.applyDiscount) {
        $scope.inputDataFee.Discount = response.Value;
      } else {
        $scope.inputDataFee.Discount = 0;
      }
    }
    $scope.inputDiscountCalculationInProgress = false;
    $scope.inputDiscountLoading = false;
  }

  ctrl.calculateDiscountInputValuesFailure = calculateDiscountInputValuesFailure;
  function calculateDiscountInputValuesFailure(response) {
    //Logging//console.log('calculateDiscountInputValuesFailure');
    $scope.inputDataFee.Discount = 0;
    $scope.inputDiscountCalculationInProgress = false;
    $scope.inputDiscountLoading = false;
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate discount'),
      localize.getLocalizedString('Server Error')
    );
  }

  ctrl.keepCountOfServiceTransactions = keepCountOfServiceTransactions;
  function keepCountOfServiceTransactions() {
    //Logging//console.log('keepCountOfServiceTransactions');
    var filterdSelectedServiceTransactions = $scope.plannedServices.filter(
      function (serviceTransaction) {
        if (serviceTransaction.ObjectState != saveStates.Delete) {
          return true;
        }
        return false;
      }
    );
    return filterdSelectedServiceTransactions.length;
  }

  //recalculateServiceTransactions is called when amount is changed from the patient-encounter-estins directive
  $scope.recalculateServiceTransactions = recalculateServiceTransactions;
  function recalculateServiceTransactions(serviceTransaction) {
    //Logging//console.log('recalculateServiceTransactions');
    // get tax, discount, then calc insurance estimates
    let insuranceHasBeenEdited = true;
    ctrl.calculatePlannedServiceAmounts(null, insuranceHasBeenEdited);

    serviceTransaction.ObjectState =
      serviceTransaction.ObjectState == saveStates.Add
        ? serviceTransaction.ObjectState
        : saveStates.Update;
  }

  ctrl.calculateDiscountNewOnSuccess = calculateDiscountNewOnSuccess;
  function calculateDiscountNewOnSuccess(successResponse) {
    //Logging//console.log('calcuilateDiscountNewOnSuccess');
    var serviceTrans = listHelper.findItemByFieldValue(
      $scope.plannedServices,
      '$$hashKey',
      ctrl.serviceHashKey
    );

    if (serviceTrans != null) {
      if (serviceTrans.applyDiscount) {
        serviceTrans.Discount = successResponse.Value;
      } else {
        serviceTrans.Discount = 0;
      }
      serviceTrans.Amount = appointmentUtilities.calcServiceAmount(
        serviceTrans
      );
    } else {
      if (ctrl.serviceTransaction.applyDiscount) {
        ctrl.serviceTransaction.Discount = successResponse.Value;
      } else {
        ctrl.serviceTransaction.Discount = 0;
      }

      ctrl.serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        ctrl.serviceTransaction
      );
      $scope.plannedServices.push(ctrl.serviceTransaction);
    }

    $scope.selectedServiceTransactionsCount = ctrl.keepCountOfServiceTransactions();
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
  }

  ctrl.calculateDiscountNewOnError = calculateDiscountNewOnError;
  function calculateDiscountNewOnError() {
    //Logging//console.log('calculateDiscountNewOnError');
    ctrl.serviceTransaction.Discount = 0;
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate discount'),
      localize.getLocalizedString('Server Error')
    );
  }

  ctrl.calculateDiscountNew = calculateDiscountNew;
  function calculateDiscountNew(serviceTransaction) {
    //Logging//console.log('calculateDiscountNew');
    if (
      serviceTransaction.Fee == null ||
      serviceTransaction.Fee == undefined ||
      serviceTransaction.Fee == 0
    ) {
      serviceTransaction.Fee = 0;
      serviceTransaction.Discount = 0;

      serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        serviceTransaction
      );
      $scope.selectedServiceTransactionsCount = ctrl.keepCountOfServiceTransactions();
      $scope.discountCalculationInProgress = false;
      $scope.discountLoading = false;
      $scope.discountLoadingId = null;
    } else {
      $scope.discountLoading = true;

      $scope.discountCalculationInProgress = true;
      var serviceCode = listHelper.findItemByFieldValue(
        $scope.serviceCodes,
        'ServiceCodeId',
        serviceTransaction.ServiceCodeId
      );

      if (serviceCode != null) {
        serviceTransaction.DiscountableServiceTypeId =
          serviceCode.DiscountableServiceTypeId;
      }
      ctrl.serviceTransaction = _.cloneDeep(serviceTransaction);

      ctrl.serviceHashKey = serviceTransaction.$$hashKey;
      $scope.discountLoadingId = serviceTransaction.$$hashKey;
      if ($scope.patient.PersonAccount) {
        return patientServices.Discount.get(
          { isDiscounted: serviceTransaction.applyDiscount },
          serviceTransaction,
          ctrl.calculateDiscountNewOnSuccess,
          ctrl.calculateDiscountNewOnError
        ).$promise;
      } else {
        var personId = $scope.appointment.Data.PersonId;
        return patientServices.Discount.getByPersonId(
          {
            personId: personId,
            isDiscounted: serviceTransaction.applyDiscount,
          },
          serviceTransaction,
          ctrl.calculateDiscountNewOnSuccess,
          ctrl.calculateDiscountNewOnError
        ).$promise;
      }
    }
  }

  ctrl.calculateTaxNewOnSuccess = calculateTaxNewOnSuccess;
  function calculateTaxNewOnSuccess(successResponse) {
    //Logging//console.log('calculateTaxNewOnSuccess');
    var serviceTrans = listHelper.findItemByFieldValue(
      $scope.plannedServices,
      '$$hashKey',
      ctrl.serviceHashKey
    );

    if (serviceTrans != null) {
      serviceTrans.Tax = successResponse.Value;
      serviceTrans.Amount = appointmentUtilities.calcServiceAmount(
        serviceTrans
      );
      serviceTrans.ObjectState =
        serviceTrans.ObjectState == saveStates.Add
          ? serviceTrans.ObjectState
          : saveStates.Update;
      serviceTrans.InsuranceEstimates[0].ObjectState = serviceTrans.ObjectState;
    } else {
      ctrl.serviceTransaction.Tax = successResponse.Value;
      ctrl.serviceTransaction.Amount = appointmentUtilities.calcServiceAmount(
        ctrl.serviceTransaction
      );
      $scope.plannedServices.push(ctrl.serviceTransaction);
    }

    $scope.selectedServiceTransactionsCount = ctrl.keepCountOfServiceTransactions();
    $scope.taxCalculationInProgress = false;
    $scope.taxLoading = false;
    $scope.taxLoadingId = null;
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
  }

  ctrl.calculateTaxNewOnError = calculateTaxNewOnError;
  function calculateTaxNewOnError() {
    //Logging//console.log('calculateTaxNewOnError');
    ctrl.serviceTransaction.Tax = 0;
    $scope.taxCalculationInProgress = false;
    $scope.taxLoading = false;
    $scope.taxLoadingId = null;
    $scope.discountCalculationInProgress = false;
    $scope.discountLoading = false;
    $scope.discountLoadingId = null;
    toastrFactory.error(
      localize.getLocalizedString('Failed to calculate tax'),
      localize.getLocalizedString('Server Error')
    );
  }

  //#endregion

  ctrl.getLastModifiedMessage = getLastModifiedMessage;
  function getLastModifiedMessage() {
    //Logging//console.log('getLastModifiedMessage');
    $scope.lastModifiedMessage = '';

    var userLocation = $scope.userLocation();
    var abbr = timeZoneFactory.GetTimeZoneAbbr(
      userLocation.timezone,
      $scope.appointment.Data.DateModified
    );
    var time = timeZoneFactory.ConvertDateTZ(
      $scope.appointment.Data.DateModified,
      userLocation.timezone
    );
    var filteredDateTime = $filter('date')(time, 'M/d/yyyy h:mm a');

    if (
      $scope.appointment.Data.UserModified &&
      $scope.appointment.Data.UserModified != ctrl.emptyGuid
    ) {
      $scope.lastModifiedMessage =
        $scope.appointment.Data.UserModifiedDisplayName +
        ' on ' +
        filteredDateTime +
        ' (' +
        abbr +
        ')';
    }
  }

  ctrl.setDisableStatusSelector();

  //sticks
  $scope.navigationUrl = function (type, patientId) {
    appointmentModalLinksService.navigateToLink(type, patientId);
  };

  //#region rollback

  $scope.onRollback = onRollback;
  function onRollback(services) {
    //Logging//console.log('onRollback');
    $scope.saveAppointment();
  }

  //#endregion

  // disables add services controls if this is a completed appointment
  ctrl.setDisableAddServices = setDisableAddServices;
  function setDisableAddServices(status) {
    //Logging//console.log('setDisableAddServices');
    $scope.disableIfStatusComplete = status === 3;
  }

  // disables all controls on appointment-view set with readOnly property to true for an appointment with
  // a pending or completed status.
  // Notes should be able to be added or modified for any appointment status
  ctrl.disableFormControlsOnPendingOrCompletedAppointment = disableFormControlsOnPendingOrCompletedAppointment;
  function disableFormControlsOnPendingOrCompletedAppointment(status) {
    $scope.disableSaveNotesButton = true; //This disables the id=btnSaveNotesOnly button in case the $scope.hideButtonsOnCompletedOrReadyForCheckout is removed
    $scope.hideButtonsOnCompletedOrReadyForCheckout = false; //This will show the id="btnSave" and id="btnAddToClipboard" and hide the id="btnSaveNotesOnly"

    //Logging//console.log('setDisableAddServices');
    if (status === 3 || status === 5) {
      $scope.readOnly = true;
      $scope.disableSaveNotesButton = true; //This enables the id=btnSaveNotesOnly button
      $scope.hideButtonsOnCompletedOrReadyForCheckout = true; //This will hide the id="btnSave" and id="btnAddToClipboard" and show the id="btnSaveNotesOnly"
    }
  }

  $scope.$on('kendoWidgetCreated', function (event, widget) {
    //Logging//console.log('kendoWidgetCreated on');
    // Add to collection so we can remove the widgets later
    ctrl.kendoWidgets.push(widget);
  });

  // need to destroy widgets for modal. only gets destroyed if web page unloads.
  $scope.$on('$destroy', function () {
    //Logging//console.log('$destroy Model');
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

  ctrl.loadWatches = loadWatches;
  function loadWatches() {
    $scope.$watch('patient', function (nv, ov) {
      //Logging//console.log('patient watch ');
      if (nv && ov && nv.PatientId != ov.PatientId) {
        $scope.patientIsInactive = nv.IsActive;
        ctrl.inactivePatientMessage();
        ctrl.setButtonState();
        if (!nv.IsActive) {
          $scope.$broadcast('clearSearch');
        }
      }
    });

    //#endregion

    //TODO:Remove and test new status dropdown
    $scope.$watch('appointment.Data.Status', ctrl.appointmentStatusChanged);

    $scope.$watch('patient', $scope.checkForPatient);

    $scope.$watch(
      'appointment.Data.AppointmentTypeId',
      $scope.appointmentTypeChanged
    );
    $scope.$watch(
      'appointment.Data.ProposedDuration',
      $scope.appointmentDurationChanged
    );
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

    $scope.$watch(
      'appointmentTime',
      function (nv, ov) {
        //Logging//console.log('appointmentTime watch');
        if (nv != ov) {
          $scope.frmAppointment.$dirty = true;
        }
      },
      true
    );

    $scope.$watch(
      'appointment.Data.IsSooner',
      function (nv, ov) {
        //Logging//console.log('appointment.Data.IsSooner watch');
        if (nv !== ov) {
          ctrl.checkIfAppointmentHasChanges();
        }
      },
      true
    );

    $scope.hasPreventiveCareViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-per-perps-view'
    );

    $scope.$watch('appointment.Data.ProviderId', function (nv, ov) {
      if (
        nv !== null &&
        nv != ov &&
        $scope.appointment.Data.Classification === 2
      ) {
        // we maintain the Provider with two different variables.
        // one is used for single provider unscheduled handling and the other is for
        // multiple provider handling but UserId is what is saved.
        // So if the providerId changes so does the UserId
        $scope.appointment.Data.UserId = $scope.appointment.Data.ProviderId;

        $scope.deleteProvider(-1, ov);

        ctrl.setButtonState();
      }
    });

    $scope.$watch('appointment.Data.PersonId', function (nv, ov) {
      if (nv && nv != ov && nv != '') {
        //Logging//console.log('appointment.Data.PersonId watch');
        ctrl.servicesDuePromise = scheduleAppointmentModalService
          .getPreventiveServiceInfo(nv)
          .then(function (res) {
            $scope.preventiveCareServices = res;
          });
      }
    });

    $scope.$on('close-tooth-window', function (e) {
      if (!_.isNil($scope.closeWindow)) {
        //Logging//console.log('close-tooth-window on');
        $scope.closeWindow();
      }
    });

    $scope.$watch('toothCtrlsOpen', function (nv) {
      if (nv === false) {
        //Logging//console.log('toothCtrlsOpen watch');
        $scope.closeWindow();
      }
    });
    $scope.$rootScopeRegistrations.push(
      $rootScope.$on('retreaveCurrentCode', function () {
        //Logging//console.log('retreaveCurrentCode on rootScopeRegistration');
        $rootScope.$broadcast('currentCode', $scope.currentCode);
      })
    );

    $scope.$watchCollection('plannedServices', function () {
      //Logging//console.log('plannedServics watchCollection');
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

    $scope.$watch('dropDownLocation.LocationId', function (nv, ov) {
      if (nv != ov) {
        if (nv === undefined) {
          // don't let anybody stomp on this value and make it undefined as it was before
          $scope.dropDownLocation.LocationId = ov;
        } else {
          //Logging//console.log('dropDownLocation.LocationId watch');
          var locationId = nv;
          // get location and validate before processing
          var id = parseInt(locationId);
          var ofcLocation = _.cloneDeep(locationsService.findByLocationId(id));
          // if we have a patient validate that the selected location is valid for them
          if ($scope.patient) {
            $scope.confirmLocationChange(ofcLocation);
          } else {
            // process location change if no patient selected
            ctrl.changeAppointmentLocation(ofcLocation);
          }
        }
        //This variable is needed for updating the ObjectState to Update and validating against it in appointment-view-validation-service.js
        $scope.appointment.Data.$$didLocationChange = true;
      }
    });

    $scope.$watch('readOnly', function (nv, ov) {
      if (nv !== ov) {
        //Logging//console.log('readonly watch');
        ctrl.setDisableStatusSelector();
      }
    });

    $scope.$watch('hasChanges', function (nv, ov) {
      if (nv != ov) {
        //Logging//console.log('hasChanges watch');
        ctrl.setDisableStatusSelector();
      }
    });

    $scope.$watch(
      'plannedServices',
      function (nv, ov) {
        //Logging//console.log('plannedServices watch');

        for (var i = 0; i < nv.length; i++) {
          // find matching service in ov (NOTE if service deleted, the nv and ov will not match length and
          // the ov[i] comparison to nv[i] gives less than desirable results)
          var match = _.find(ov, function (service) {
            return service.ServiceTransactionId === nv[i].ServiceTransactionId;
          });
          // only make this comparison if there is a matching object in ov
          if (!_.isEqual(nv[i], match)) {
            $scope.updatePlannedServices(nv[i], match, i);
          }
          // Something is changing the object state of services without a ServiceTransactionId
          // the below code is meant to prevent that from occurring. While we consider a better design
          if (
            (nv[i].ServiceTransactionId === null ||
              nv[i].ServiceTransactionId === undefined) &&
            nv[i].ObjectState === 'Update'
          ) {
            nv[i].ObjectState = 'Add';
          }
        }

        for (var i = 0; i < nv.length; i++) {
          if (nv[i].$$hashKey == undefined) {
            nv[i].$$hashKey = i;
          }
        }

        if (angular.toJson(ov) != angular.toJson(nv)) {
          var insuranceEstimated = 0;
          var estimatedAmount = 0.0;
          _.forEach($scope.plannedServices, function (serviceTransaction) {
            estimatedAmount += serviceTransaction.Amount;
            insuranceEstimated +=
              serviceTransaction.TotalEstInsurance +
              serviceTransaction.TotalAdjEstimate;
          });
          $scope.estimatedAmount = estimatedAmount;
          if (!insuranceEstimated) {
            insuranceEstimated = 0;
          }
          $scope.estimatedInsurance = insuranceEstimated;
        }
      },
      true
    );
  }

  ctrl.initialize = initialize;
  function initialize() {
    ctrl.checkFeatureFlags();

    // Changing the loading order of items in this method might cause problems. I had to mess with this for a while to get it to work correctly.
    // Some of this is copied from earlier versions of the appointment modal and there might be some variables not used.

    // initial setup of the modal will pass in active providers from the schedule as a start for the active providers.
    // this is done to save performance on the schedule for data that is already loaded prior to this point.
    let x = $scope.appointment.Data.LocationId;
    let startingProviders = [];
    for (let i = 0; i < ctrl.providersByLocation.length; i++) {
      if (x === ctrl.providersByLocation[i].LocationId) {
        startingProviders.push(ctrl.providersByLocation[i]);
      }
    }

    ctrl.disableFormControlsOnPendingOrCompletedAppointment(
      $scope.appointment.Data.Status
    );

    ctrl.setProviders(startingProviders);

    // need to load providers before this method because providers are manipulated in here.
    ctrl.processLocationData();

    // other items are setup ... that have to be setup after the above items.
    $scope.setUpItemsThatUsedToBeLoadedInTheInitAppointmentMethod();

    // so providers and time area need to be hidden
    // until the providers and the data is fully loaded otherwise you have problems later on.
    $scope.isTimeDataLoaded = true;

    $scope.appointmentEndTimeLimit = ctrl.getAppointmentEndTimeLimit();

    //Logging//console.log('initialize');
    ctrl.today = new Date();
    ctrl.today.setHours(0);
    ctrl.today.setMinutes(0);
    ctrl.today.setSeconds(0);
    ctrl.today.setMilliseconds(0);

    $scope.outsideRoomAssignmentTime = false;
    $scope.backupAppointment = null;
    $scope.backupPatient = null;
    $scope.backupProviderAppointments = null;
    //$scope.backupPlannedServices = null; remove per note D1@9_18_19
    $scope.backupServices = null;
    $scope.providerSchedules = $scope.providerSchedules
      ? $scope.providerSchedules
      : [];

    var beginTime = new Date();
    beginTime.setHours(0, 0, 0, 0);
    var endTime = _.cloneDeep(beginTime);
    endTime.setHours(23, 50, 0, 0);

    // get the data for the object before we setup the rest of the page.

    let loadingPromises = [];

    if ($scope.appointment.Data.Patient && $scope.editing === false) {
      ctrl.getUnscheduledAppointments();
    }

    // get tax, discount, then calc insurance estimates
    if (!_.isEmpty($scope.plannedServices)) {
      //Logging//console.log('seems like we should only call this method should only be called when edit or ... when not drag.')
      loadingPromises.push(ctrl.calculatePlannedServiceAmounts(true));
    }

    $scope.loadingDependancies = true;

    $scope.appointment.Data.originalStart = $scope.appointment.Data.StartDate;
    $scope.appointment.Data.originalEnd = $scope.appointment.Data.EndDate;

    // remove the need to process the data like this over time
    $q.all(loadingPromises).then(function () {
      $scope.loadingDependancies = false;

      ctrl.originalAppointmentData = _.cloneDeep($scope.appointment.Data);

      // Performance improvement
      // Crude way to delay actually starting the watches
      // I am not sure this is helpful any more.
      _.forEach($scope.watches, function (watch) {
        watch();
      });
      $scope.watches = [];
    });

    // load the users preventiveServiceInfo
    if (
      $scope.appointment.Data.PersonId != '' &&
      $scope.appointment.Data.PersonId != ctrl.emptyGuid
    ) {
      scheduleAppointmentModalService
        .getPreventiveServiceInfo($scope.appointment.Data.PersonId)
        .then(function (res) {
          $scope.preventiveCareServices = res;
        });
    }

    // attempt to load conflicts sooner
    $scope.loadConflicts();

    // process eligibility end points ahead of time if needed.
    ctrl.processEligibilityEndPointsEarlyIfPossible();

    if (!$scope.appointment.Data.$$preventiveServiceAppt) {
      $scope.showTabset = false;
      $scope.activeApptTab = 2;
    }
    $scope.previousLocation = $scope.dropDownLocation;

    if (
      $scope.appointmentSaveState &&
      $scope.appointmentSaveState == saveStates.Update
    ) {
      ctrl.getLastModifiedMessage();
    }

    //Logging//console.log('why would we want to reset the most recent patients list?? figure out why we are doing this.');
    $rootScope.$broadcast('soar:refresh-most-recent');

    $scope.isInitializing = false;

    ctrl.loadWatches();
  }

  ctrl.processEligibilityEndPointsEarlyIfPossible = processEligibilityEndPointsEarlyIfPossible;
  function processEligibilityEndPointsEarlyIfPossible() {
    // checking to see if we can optimize the eligibility control loading

    if ($scope.appointment.Data.Patient && $scope.appointment.Data.PersonId) {
      let loadingPromises = [];

      let ofcLocation = locationService.getCurrentLocation();

      loadingPromises.push(
        patientBenefitPlansFactory.PatientBenefitPlans(
          $scope.appointment.Data.PersonId,
          true
        )
      );
      loadingPromises.push(
        locationServices.getLocationRteEnrollmentStatus({
          locationId: ofcLocation.id,
        }).$promise
      );

      $q.all(loadingPromises).then(function (result) {
        $scope.patientBenefitPlans = result[0].Value;

        if (result[1]) {
          $scope.locationEligibility = result[1].Result;
        } else {
          $scope.locationEligibility = false;
        }
        $scope.loadingEligibilityData = false;
      });
      //benefit - plans="patientBenefitPlans" eligibility = "locationEligibility"
    } else {
      $scope.patientBenefitPlans = null;
      $scope.locationEligibility = null;
      $scope.loadingEligibilityData = false;
    }
  }

  ctrl.continueProcessingAppointment = continueProcessingAppointment;
  function continueProcessingAppointment(data) {
    // hook up the display data
    $scope.appointment = {
      Valid: true,
      Data: data,
    };

    /////////////////////
    // load page items

    if (data) {
      $scope.appointment.MarkAsDeleted = function (reason) {
        scheduleServices.SoftDelete.Appointment({
          AppointmentId: $scope.appointment.Data.AppointmentId,
          IsDeleted: true,
          DeletedReason: reason != null ? reason : '',
        });
      };
    }

    ctrl.location = $scope.appointment.Data.Location;
    //TODO: not sure if this is used any more
    $scope.locationName =
      ctrl.location != null ? ctrl.location.NameAbbreviation : '';

    //TODO: cannot set this value until the appointment is loaded in if in edit model
    // loading some $scope variable a couple of the view controllers need.
    $scope.locationChosen = $scope.appointment.Data;

    if ($scope.selectedStatus !== null && $scope.selectedStatus !== undefined) {
      ctrl.originalStatus = $scope.selectedStatus;
    } else {
      ctrl.originalStatus = ctrl.defaultStatus;
    }

    // update surface display area to ensure we are showing information in a consistent format.
    if (
      $scope.appointment.Data.PlannedServices !== null &&
      $scope.appointment.Data.PlannedServices !== undefined &&
      $scope.appointment.Data.PlannedServices.length > 0
    ) {
      for (let i = 0; i < $scope.appointment.Data.PlannedServices.length; i++) {
        $scope.appointment.Data.PlannedServices[
          i
        ].SurfaceSummaryInfo = scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
          $scope.appointment.Data.PlannedServices[i].Surface
        );
        $scope.appointment.Data.PlannedServices[
          i
        ].RootSummaryInfo = scheduleDisplayPlannedServicesService.getRootsInSummaryFormat(
          $scope.appointment.Data.PlannedServices[i].Roots
        );

        if (
          $scope.appointment.Data.PlannedServices[i].ProviderOnClaimsId == null
        )
          delete $scope.appointment.Data.PlannedServices[i].ProviderOnClaimsId;
      }
    }

    // setting patient this way has the very high likely hood of causing an issues with setting and re setting the patient.
    // need to evaluate why this is happening
    $scope.apptPatient = angular.copy($scope.appointment.Data.Patient);

    /** These lines ensure that the cancel modal only appears when changes have been made. */
    $scope.appointment.Data.AppointmentTypeId = $scope.appointment.Data
      .AppointmentTypeId
      ? $scope.appointment.Data.AppointmentTypeId
      : '';
    $scope.appointment.Data.PersonId = $scope.appointment.Data.PersonId
      ? $scope.appointment.Data.PersonId
      : '';
    $scope.selectedAppointmentType = appointmentTypesService.findByAppointmentTypeId(
      $scope.appointment.Data.AppointmentTypeId
    );

    ctrl.providerAppointmentOverride = false;

    ctrl.originalAppointmentData = _.cloneDeep($scope.appointment.Data);
    ctrl.originalAppointmentDate = _.cloneDeep($scope.appointmentDate);

    ctrl.originalAppointmentData.AppointmentTypeId = ctrl
      .originalAppointmentData.AppointmentTypeId
      ? ctrl.originalAppointmentData.AppointmentTypeId
      : '';
    ctrl.originalAppointmentData.PersonId = ctrl.originalAppointmentData
      .PersonId
      ? ctrl.originalAppointmentData.PersonId
      : '';

    /////////////////////////////////////////////
    // setting change tracking variables ... not sure why ....
    $scope.editing = !(
      angular.isUndefined($scope.appointment.Data.AppointmentId) ||
      $scope.appointment.Data.AppointmentId == null ||
      $scope.appointment.Data.AppointmentId == ctrl.emptyGuid
    );
    // New appointment button on Patient Overview sends ObjectState == Add

    // only reset if it is not set ... otherwise leave alone.
    // alternatively we need to figure out why we are not sending in a type.
    if (
      $scope.appointment.Data.ExaminingDentist === null ||
      $scope.appointment.Data.ExaminingDentist === undefined
    ) {
      $scope.setExaminingDentist($scope.appointment.Data.AppointmentTypeId);
    }

    if ($scope.editing) {
      timeZoneFactory.ConvertAppointmentDatesTZ($scope.appointment.Data);
    }

    $scope.isPatientReadOnly = appointmentViewLoadingService.currentPerson;

    // now that I am looking at the patient search and how selection of patients is done this code seems off.
    // The part that is confusing me is why we are only linking up the watch for new Patient when using edit mode.
    // This creates complications with testing were the code paths for an appointment that is opened will have different patient change behavior
    // then an appointment newly created because the watch is not registered in that instance. This is something to consider when we change this logic at some future time.

    if ($scope.appointment.Data.Patient && $scope.appointment.Data.PersonId) {
      $scope.newAppt.patient = $scope.appointment.Data.Patient;
    }

    $scope.$watch('newAppt.patient', $scope.onPatientChange, true);
    $scope.patient = $scope.newAppt.patient;

    $scope.dropDownLocation = _.cloneDeep($scope.appointment.Data.Location);

    if (
      $scope.appointment.Data !== null &&
      $scope.appointment.Data !== undefined
    ) {
      $scope.serviceCodes = $scope.appointment.Data.ServiceCodes
        ? $scope.appointment.Data.ServiceCodes
        : [];
      $scope.contactInfo = null;
      // this is more code that is only run if patient is set already.
      if (
        $scope.appointment.Data.Patient !== null &&
        $scope.appointment.Data.Patient !== undefined
      ) {
        let transformResult = ctrl.setFromApptModalPatientApi(
          $scope.appointment.Data.Patient
        );

        $scope.patient = transformResult;
        $scope.appointment.Data.Patient = _.cloneDeep(transformResult);
      }
    }
  }

  ctrl.populateAppointmentFromLoadingService = populateAppointmentFromLoadingService;
  function populateAppointmentFromLoadingService(appointment, state) {
    appointment.LocationId = parseInt(
      appointmentViewLoadingService.currentLocation
    );
    appointment.PersonId = appointmentViewLoadingService.currentPerson;
    appointment.TreatmentRoomId = appointmentViewLoadingService.currentRoom;
    appointment.UserId = appointmentViewLoadingService.currentProvider;
    appointment.AppointmentTypeId =
      appointmentViewLoadingService.currentAppointmentType;

    // set for unschedule appointment creation
    if (appointmentViewLoadingService.currentDuration) {
      appointment.ProposedDuration = parseInt(
        appointmentViewLoadingService.currentDuration
      );
    }
    if (appointmentViewLoadingService.currentClassification) {
      appointment.Classification = parseInt(
        appointmentViewLoadingService.currentClassification
      );
    }

    let dateString = appointmentViewLoadingService.currentFullDate;
    if (dateString) {
      let date = new Date();
      let dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        date.setYear(parseInt(dateParts[0]));
        let secondDateParts = dateParts[2].split('T');
        date.setMonth(parseInt(dateParts[1]) - 1, parseInt(secondDateParts[0]));
      }

      $scope.appointmentDate = date;

      let startTime = appointmentViewLoadingService.currentStart;
      if (startTime) {
        appointment.StartTime = startTime;
        // when start time is set we will have an end time.
        appointment.EndTime = appointmentViewLoadingService.currentEnd;

        appointment.ProviderAppointments = [];
        if (
          appointment.StartTime &&
          appointment.EndTime &&
          appointment.UserId
        ) {
          appointment.ProviderAppointments.push({
            UserId: appointment.UserId,
            StartTime: appointment.StartTime,
            EndTime: appointment.EndTime,
            ObjectState: state,
          });
        }
      }
    }

    return appointment;
  }

  ctrl.initView = initView;
  function initView() {
    //startMethod
    // this method is used to set all the previously retrieved data into the current view.
    // there are three options for startup
    // 1: you are opening an existing appointment.
    // 2: you are opening a new appointment but have a user specified
    // 3: you are starting a brand new appointment and have nothing specified except for what data was set in the screen that opened this view
    // the data is already in place at this point saved in a service for you to use
    // this was done because of field loading inconsistencies and accompanying angular js kendo control loading issues

    ctrl.setupLocationAndProvider(
      appointmentViewLoadingService.loadedLocations,
      appointmentViewLoadingService.loadedProvidersByLocation
    );

    let appointment = {};

    let appointmentId = appointmentViewLoadingService.currentAppointmentId;
    if (appointmentId !== null && appointmentId !== undefined) {
      $scope.editing = true;
      $scope.appointmentSaveState = saveStates.Update;

      // get data from loading service
      appointment = appointmentViewLoadingService.currentAppointment;

      appointment.ObjectState = saveStates.Update;
      if (
        appointment.Classification === 0 &&
        appointmentViewLoadingService.currentLocation !== null &&
        appointment.LocationId !== appointmentViewLoadingService.currentLocation
      ) {
        //check if provider or room view? check appt view loading service
        if (appointmentViewLoadingService.currentProvider === null) {
          for (let i = 0; i < appointment.ProviderAppointments.length; i++) {
            appointment.ProviderAppointments[i].ObjectState = saveStates.Delete;
          }
        } else if (appointmentViewLoadingService.currentProvider !== null) {
          for (let i = 0; i < appointment.ProviderAppointments.length; i++) {
            appointment.ProviderAppointments[i].ObjectState = saveStates.Update;
            appointment.ProviderAppointments[i].UserId =
              appointmentViewLoadingService.currentProvider;
          }
          appointment.TreatmentRoomId = null;
        }

        if (appointment.PlannedServices.length > 0) {
          for (let i = 0; i < appointment.PlannedServices.length; i++) {
            appointment.PlannedServices[i].ObjectState = saveStates.Update;
            appointment.PlannedServices[i].LocationId =
              appointmentViewLoadingService.currentLocation;
            let serviceProviderCanBeAtNewLocation = appointmentViewLoadingService.loadedProvidersByLocation.find(
              validProvider =>
                validProvider.UserId ===
                appointment.PlannedServices[i].ProviderUserId &&
                validProvider.LocationId ===
                appointmentViewLoadingService.currentLocation
            );
            if (serviceProviderCanBeAtNewLocation !== undefined) {
              appointment.PlannedServices[i].ProviderUserId =
                serviceProviderCanBeAtNewLocation.UserId;
            }
          }
        }

        $scope.hasChanges = true;
        // get all the values from the service and populate the appointment
        //appointment = populateAppointmentFromLoadingService(appointment, saveStates.Update);

        appointment.LocationId = parseInt(
          appointmentViewLoadingService.currentLocation
        );
        appointment.PersonId = appointmentViewLoadingService.currentPerson;
        appointment.TreatmentRoomId = appointmentViewLoadingService.currentRoom;
        appointment.UserId = appointmentViewLoadingService.currentProvider;
        appointment.AppointmentTypeId =
          appointmentViewLoadingService.currentAppointmentType;

        // set for unschedule appointment creation
        if (appointmentViewLoadingService.currentDuration) {
          appointment.ProposedDuration = parseInt(
            appointmentViewLoadingService.currentDuration
          );
        }
        if (appointmentViewLoadingService.currentClassification) {
          appointment.Classification = parseInt(
            appointmentViewLoadingService.currentClassification
          );
        }

        let dateString = appointmentViewLoadingService.currentFullDate;
        if (dateString) {
          let date = new Date();
          let dateParts = dateString.split('-');
          if (dateParts.length === 3) {
            date.setYear(parseInt(dateParts[0]));
            let secondDateParts = dateParts[2].split('T');
            date.setMonth(
              parseInt(dateParts[1]) - 1,
              parseInt(secondDateParts[0])
            );
          }

          $scope.appointmentDate = date;

          let startTime = appointmentViewLoadingService.currentStart;

          if (startTime) {
            appointment.StartTime = startTime;
            // when start time is set we will have an end time.
            appointment.EndTime = appointmentViewLoadingService.currentEnd;
          }
        }
      } else if (appointment.Classification === 2) {
        if (
          appointmentViewLoadingService.currentStart &&
          appointmentViewLoadingService.currentEnd
        ) {
          // if we get into this if statement the view has changes over what has been saved previously regardless of prior state.
          // we need to determine how best to handle this.
          $scope.hasChanges = true;

          // get all the values from the service and populate the appointment
          appointment = populateAppointmentFromLoadingService(
            appointment,
            saveStates.Update
          );

          appointment.IsPinned = false;
          appointment.ProposedDuration = null;
          appointment.Classification = 0;
        }
      }
    } else if (appointmentViewLoadingService.currentPerson) {
      //TODO this method is used more in other areas of fuse to open the appointment view ... will need more testing in future sprints.
      // we might not hit this right away.

      // normal initialization for new.
      $scope.editing = false;
      $scope.appointmentSaveState = saveStates.Add;

      appointment.ObjectState = saveStates.Add;

      //setup
      appointment.Patient = appointmentViewLoadingService.currentPatient;
      appointment.PersonId = appointmentViewLoadingService.currentPerson;
      appointment.Classification =
        appointmentViewLoadingService.currentClassification;

      if (appointment.Classification === 0) {
        // need to set the startDate and endDate
        appointment.StartTime = new Date();
        appointment.EndTime = new Date(
          appointment.StartTime.getTime() + 15 * 60000
        );
        appointment.ProposedDuration = 15;
        appointment.ProviderAppointments = [
          {
            UserId: appointment.Patient.PreferredDentist
              ? appointment.Patient.PreferredDentist
              : null,
            ObjectState: saveStates.Add,
            StartTime: _.cloneDeep(appointment.StartTime),
            EndTime: _.cloneDeep(appointment.EndTime),
            Duration: 15,
            StartDuration: 0,
            EndTimeMaxDuration: 15,
            WithinHours: false,
          },
        ];
      }

      if (
        appointmentViewLoadingService.currentPlannedServices !== null &&
        appointmentViewLoadingService.currentPlannedServices !== undefined &&
        appointmentViewLoadingService.currentPlannedServices.length > 0
      ) {
        appointment.PlannedServices =
          appointmentViewLoadingService.currentPlannedServices;

        // set the object state of the services that are being added to the new appointment
        for (let i = 0; i < appointment.PlannedServices.length; i++) {
          appointment.PlannedServices[i].ObjectState = saveStates.Update;
        }
      }

      appointment = populateAppointmentFromLoadingService(
        appointment,
        saveStates.Add
      );
    } else {
      $scope.editing = false;
      $scope.appointmentSaveState = saveStates.Add;

      appointment.ObjectState = saveStates.Add;

      appointment = populateAppointmentFromLoadingService(
        appointment,
        saveStates.Add
      );
    }
    appointment = appointmentViewLoadingService.processAppointmentForViewDisplay(
      appointment
    );

    ctrl.continueProcessingAppointment(appointment);
    ctrl.initialize();
  }

  ctrl.setupLocationAndProvider = setupLocationAndProvider;
  function setupLocationAndProvider(locationResult, providerResult) {
    // ensure we have the providers on schedule exceptions loaded for next time.
    // we populate this in the provider-show-on-schedule-factory while loading the providers list.
    // this removes the need to call another service for the data later on
    $scope.providerShowOnScheduleExceptions = providerShowOnScheduleFactory.getSavedShowOnProviderExceptions();

    locationsService.locations = locationResult;

    ctrl.providersByLocation = providerResult;

    var date = appointmentViewLoadingService.currentDate;
    var initialDate = ctrl.getActualDate(date);
    if (initialDate === null || initialDate === undefined) {
      initialDate.setHours(0, 0, 0, 0);
      $scope.fillLocationTimezoneInfo(initialDate);
    } else {
      initialDate.setHours(0, 0, 0, 0); // might want to set this to the hours passed into the page as well.
      $scope.fillLocationTimezoneInfo(initialDate);
    }

    $scope.setappointmentProviders();
  }
  ctrl.initView();
}
AppointmentViewController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
