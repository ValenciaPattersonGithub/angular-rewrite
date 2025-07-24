'use strict';

angular
  .module('Soar.Patient')
  .controller('PatientLandingController', [
    '$scope',
    '$routeParams',
    'localize',
    'toastrFactory',
    'GlobalSearchFactory',
    '$location',
    '$filter',
    'ListHelper',
    'PatientLandingFactory',
    'patSecurityService',
    '$uibModal',
    'PatientCountFactory',
    'PatientServices',
    'BoundObjectFactory',
    'ScheduleServices',
    'SaveStates',
    'ModalFactory',
    'ModalDataFactory',
    '$window',
    'AppointmentService',
    'StaticData',
    'PatientLandingGridFactory',
    'GridPrintFactory',
    '$timeout',
    'LocationServices',
    'PatientValidationFactory',
    'PersonFactory',
    'MailingLabelPrintFactory',
    'TemplatePrintFactory',
    'TimeZoneFactory',
    '$rootScope',
    '$resource',
    'PatientLandingModalFactory',
    'userSettingsDataService',
    'AppointmentViewVisibleService',
    'AppointmentViewLoadingService',
    'AppointmentViewDataLoadingService',
    'tabLauncher',
    'referenceDataService',
    'ScheduleModalFactory',
    'NewLocationsService',
    'LocationsDisplayService',
    'FeatureService',
    'CommonServices',
    PatientLandingController,
  ]);
function PatientLandingController(
  $scope,
  $routeParams,
  localize,
  toastrFactory,
  globalSearchFactory,
  $location,
  $filter,
  listHelper,
  patientLandingFactory,
  patSecurityService,
  $uibModal,
  patientCountFactory,
  patientServices,
  boundObjectFactory,
  scheduleServices,
  saveStates,
  modalFactory,
  modalDataFactory,
  $window,
  appointmentService,
  staticData,
  patientLandingGrid,
  gridPrintFactory,
  $timeout,
  locationServices,
  patientValidationFactory,
  personFactory,
  mailingLabelPrintFactory,
  templatePrintFactory,
  timeZoneFactory,
  $rootScope,
  $resource,
  patientLandingModalFactory,
  userSettingsDataService,
  appointmentViewVisibleService,
  appointmentViewLoadingService,
  appointmentViewDataLoadingService,
  tabLauncher,
  referenceDataService,
  scheduleModalFactory,
  newLocationsService,
  locationsDisplayService,
  featureService,
  commonServices
) {
  BaseCtrl.call(this, $scope, 'PatientLandingController');
  var ctrl = this;

  commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
    var practiceSettings = res.Value;
    $scope.TimeIncrement = practiceSettings.DefaultTimeIncrement;
  })

  $scope.isAppointmentViewVisible = false;
  $scope.isSecondaryAppointmentViewVisible = false;
  $scope.PatientWorkFlowEnabled = false;
  $scope.getPracticeSettings = function () {
    featureService.isEnabled('DevelopmentMode').then(res => {
      $scope.PatientWorkFlowEnabled = res;
    });
  };

  ctrl.onAppointmentViewVisibleChange = function (
    isVisible,
    isSecondaryVisible
  ) {
    let data = appointmentViewLoadingService.currentAppointmentSaveResult;

    $scope.isAppointmentViewVisible = isVisible;
    $scope.isSecondaryAppointmentViewVisible = isSecondaryVisible;
    if (
      (!isVisible || !isSecondaryVisible) &&
      data !== null &&
      data !== undefined
    ) {
      if (appointmentViewLoadingService.afterSaveEvent) {
        $rootScope.$broadcast(
          appointmentViewLoadingService.afterSaveEvent,
          data
        );
      }
    }
  };
  appointmentViewVisibleService.registerObserver(
    ctrl.onAppointmentViewVisibleChange
  );

  $scope.disablePrint = true;
  $scope.filteredUnreadCommunication = false;
  $scope.disableFilter = true;
  $scope.treatmentPlanIcon = 'Images/PatientManagementIcons/txplans_gray.svg';

  // Patient Count
  $scope.patientCount = patientCountFactory.getCount();

  // Grids
  $scope.allPatientsGridOptions = patientLandingGrid.allPatientsGridFactory;
  $scope.preventiveCareGridOptions =
    patientLandingGrid.preventiveCareGridFactory;
  $scope.treatmentPlansGridOptions =
    patientLandingGrid.treatmentPlansGridFactory;
  $scope.appointmentsGridOptions = patientLandingGrid.appointmentsGridFactory;
  $scope.otherToDoGridOptions = patientLandingGrid.otherToDoGridFactory;

  var preFetchAction = function (filterCriteria) {
    // get the location object - we need to pass our timezone name to get the tz database name of the selected location's timezone
    var selectedLocation = _.find($scope.locations, function (location) {
      return $scope.selectedLocationId == location.LocationId; // sometimes the $scope.selectedLocationId value is a string, sometimes it's an int.
    });

    var selectedLocationTimeZoneDetails = timeZoneFactory.GetTimeZoneInfo(
      selectedLocation.Timezone
    ); // what do we need to pass in?
    $scope.appointmentsGridOptions.selectedLocationTzDatabaseName =
      selectedLocationTimeZoneDetails.MomentTZ; // "America\Chicago", tz database name

    // $scope.appointmentsGridOptions.columnDefinition[4] // this is the appt date column. this object will always be in the [4] position in this array.
    var currentDateFromString =
      $scope.appointmentsGridOptions.columnDefinition[4].filterFrom;
    var currentDateToString =
      $scope.appointmentsGridOptions.columnDefinition[4].filterTo;

    if (!_.isEmpty(currentDateFromString) && !_.isEmpty(currentDateToString)) {
      var currentDateFrom = new Date(currentDateFromString);
      var updatedDateFrom =
        timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObject(
          currentDateFrom,
          $scope.appointmentsGridOptions.selectedLocationTzDatabaseName
        );

      var currentDateTo = new Date(currentDateToString);
      var updatedDateTo =
        timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObject(
          currentDateTo,
          $scope.appointmentsGridOptions.selectedLocationTzDatabaseName,
          true
        );

      filterCriteria.AppointmentDateFrom = updatedDateFrom;
      filterCriteria.AppointmentDateTo = updatedDateTo;
    } else {
      filterCriteria.AppointmentDateFrom = '';
      filterCriteria.AppointmentDateTo = '';
    }
  };
  $scope.appointmentsGridOptions.preFetchAction = preFetchAction;

  // Grid actions
  $scope.appointmentsGridOptions.successAction = function (data) {
    // Update the count
    $scope.patientCount.set('appointments', data.totalCount);
    // Additional Filters
    $scope.appointmentFilters = data.dto;
    if ($scope.activeFltrTab === '1') {
      $scope.disableFilter = false;
      $scope.activeGridData = $scope.appointmentFilters;
      if (
        $scope.appointmentFilters.FilterCriteria.AppointmentDateFrom !== null ||
        $scope.appointmentFilters.FilterCriteria.AppointmentDateTo !== null
      ) {
        $scope.appointmentsGridOptions.updateFilter('BusinessDays', null);
      }
      $scope.disablePrint = data.totalCount === 0 ? true : false;
    }
  };

  $scope.allPatientsGridOptions.successAction = function (data) {
    // Update the count
    $scope.patientCount.set('allPatients', data.totalCount);
    $scope.mailingTitle = 'All Patients';

    $scope.allPatientFilters = data.dto;
    if ($scope.activeFltrTab === '2') {
      $scope.activeGridData = $scope.allPatientFilters;
      $scope.disablePrint = data.totalCount === 0 ? true : false;
      $scope.disableFilter = false;
    }
  };

  $scope.otherToDoGridOptions.successAction = function (data) {
    // Update the count
    $scope.patientCount.set('otherToDo', data.totalCount);

    $scope.otherToDoFilters = data.dto;
    if ($scope.activeFltrTab === '5') {
      $scope.activeGridData = $scope.otherToDoFilters;
      $scope.disablePrint = data.totalCount === 0 ? true : false;
      $scope.disableFilter = false;
    }
  };

  $scope.treatmentPlansGridOptions.successAction = function (data) {
    // Update the count
    $scope.patientCount.set('treatmentPlans', data.totalCount);

    $scope.treatmentTabFilters = data.dto;
    if ($scope.activeFltrTab === '6') {
      $scope.activeGridData = $scope.treatmentTabFilters;
      $scope.disablePrint = data.totalCount === 0 ? true : false;
      $scope.disableFilter = false;
    }
  };

  $scope.preventiveCareGridOptions.successAction = function (data) {
    // Update the count
    $scope.patientCount.set('preventiveCare', data.totalCount);

    $scope.preventiveCareTabFilters = data.dto;
    if ($scope.activeFltrTab === '7') {
      $scope.activeGridData = $scope.preventiveCareTabFilters;
      $scope.disablePrint = data.totalCount === 0 ? true : false;
      $scope.disableFilter = false;
    }
  };

  $scope.scrollToTop = function () {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  };

  $scope.openModal = function (
    patientId,
    appointmentId,
    tabIdentifier,
    patientCommunication
  ) {
    $scope.selectedPatientId = patientId;
    $scope.selectedAppointmentId = appointmentId;
    $scope.selectedTabIdentifier = tabIdentifier;
    let patientPath = `#/Patient/${$scope.selectedPatientId}/Communication/`;
    if (tabIdentifier === 5) {
      patientPath += `?withDrawerOpened=true&tabIdentifier=${tabIdentifier}`;
    } else if (!patientCommunication) {
      patientPath += `?withDrawerOpened=true&tabIdentifier=${tabIdentifier}&communicationType=-1`;
    }
    tabLauncher.launchNewTab(patientPath);
    $rootScope.$broadcast('nav:drawerChange', 5);
  };

  var getCommunicationSuccess = function (result) {
    var date = $filter('date')(result.Value[0].CommunicationDate, 'MM/dd/yyyy');
    _.each(
      document.getElementsByName($scope.selectedPatientId),
      function (com) {
        com.innerText = date;
      }
    );
    $scope.modalInstance.close();
  };

  var getCommunicationFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to get communication.', [
        'New patient communication',
      ])
    );
    $scope.modalInstance.close();
  };

  $scope.$on('closeCommunicationModal', function (events, args) {
    if (args) {
      patientServices.Communication.get({ Id: args }).$promise.then(
        getCommunicationSuccess,
        getCommunicationFailure
      );
    } else {
      if ($scope.modalInstance) {
        $scope.modalInstance.close();
      }
    }
  });
  ctrl.currentMonth = new Date().getMonth() + 1;
  //open appointment modal
  ctrl.initializeStatusList = function () {
    $scope.statusList = staticData.AppointmentStatuses();
  };

  ctrl.appointmentRetrieveDataFailed = function (error) {
    ctrl.ShowErrorMessage(
      localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['appointments for the account']
      )
    );
  };

  ctrl.retrieveData = function (appointmentId, accountId, classification) {
    $scope.currentAppointmentId = appointmentId;
    $scope.accountId = accountId;
    if ($scope.currentAppointmentId != null) {
      // we need to alter the behavior for Block Appointments because we have not replaced the block modal startup
      if (classification !== undefined && parseInt(classification) === 1) {
        // this means that this is a block and we need to proceed differently
        appointmentViewDataLoadingService
          .getBlockDataFromOutSideOfTheSchedule($scope.currentAppointmentId)
          .then(
            function (res) {
              $scope.showAppointmentModal(res);
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
        let appointment = {
          AppointmentId: appointmentId,
        };

        appointmentViewDataLoadingService.getViewData(appointment, false).then(
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
    }
  };

  ctrl.appointmentSaved = function () {
    // not sure we have to do anything.
  };

  ctrl.getAppointmentModalDataFailed = function () {
    ctrl.ShowErrorMessage(
      localize.getLocalizedString('Failed to retrieve {0}. Please try again', [
        'the data necessary for editing an appointment',
      ])
    );
  };

  ctrl.getAppointmentModalDataSuccess = function (appointmentEditData) {
    ctrl.appointmentEditModalData = appointmentEditData;

    scheduleModalFactory
      .ScheduleBlockModal(ctrl.appointmentEditModalData, false)
      .then(ctrl.appointmentSaved);
  };

  $scope.showAppointmentModal = function (result) {
    let appointment = result.appointment.Appointment;
    appointment.Location = {
      LocationId: appointment.LocationId,
    };

    newLocationsService.locations = result.locations;
    newLocationsService.locations =
      locationsDisplayService.setLocationDisplayText(
        newLocationsService.locations,
        appointment.StartTime
      );
    // Need to make sure the ObjectState is None before going to edit the appointment.
    appointment.ObjectState = saveStates.None;

    var locationId =
      appointment.Location != null
        ? appointment.Location.LocationId
        : appointment.Patient.PreferredLocation;
    if (!locationId && !appointment.Location) {
      locationId = ctrl.getLoggedInLocation();
      appointment.Location = {
        LocationId: locationId,
      };
    }

    modalDataFactory
      .GetBlockEditData(appointment, locationId)
      .then(
        ctrl.getAppointmentModalDataSuccess,
        ctrl.getAppointmentModalDataFailed
      );
  };

  // create appointment
  ctrl.initializeScopeVariables = function () {
    $scope.patientId = '';

    var now = new Date();
    $scope.today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();
    $scope.appointment = boundObjectFactory.Create(
      scheduleServices.Dtos.Appointment
    );
  };

  ctrl.getAppointmentModalDataFailed = function () {
    ctrl.ShowErrorMessage(
      localize.getLocalizedString('Failed to retrieve {0}. Please try again', [
        'the data necessary for editing an appointment',
      ])
    );
  };

  $scope.createAppointment = function (patientId) {
    //debugger;
    ctrl.initializeScopeVariables();
    $scope.patientId = patientId;

    var tmpAppt = {
      AppointmentId: null,
      AppointmentTypeId: null,
      Classification: 2,
      EndTime: null,
      PersonId: patientId,
      PlannedServices: [],
      ProposedDuration: 15,
      ProviderAppointments: [],
      ServiceCodes: [],
      StartTime: null,
      TreatmentRoomId: null,
      UserId: null,
      WasDragged: false,
      Location: { LocationId: $scope.selectedLocationId },
      LocationId: $scope.selectedLocationId,
      ObjectState: saveStates.Add,
      Person: {},
    };

    appointmentViewDataLoadingService.getViewData(tmpAppt, false, null).then(
      function (res) {
        appointmentViewVisibleService.changeAppointmentViewVisible(true, false);
      },
      function (error) {
        console.log(error);
        toastrFactory.error(
          'Ran into a problem loading the appointment',
          'Error'
        );
      }
    );
  };

  //#region Declare Objects and variables to hold data

  ctrl.uniqueProviderNames = [];
  ctrl.uniqueApptTypes = [];
  ctrl.benefitPlans = [];
  $scope.patinetName = '';

  $scope.appliedFiltersCount = 0;
  $scope.slideOutText = 'Hide Filters';

  $scope.hasPatientViewAccess = false;
  $scope.hasPreventiveCareViewAccess = false;
  $scope.hasScheduledAppointmentViewAccess = false;
  $scope.hasUnScheduledAppointmentViewAccess = false;
  $scope.hasUnscheduledTreatmentViewAccess = false;

  // This object holds the data to bind with UI for all tabs
  $scope.BindedData = [];

  //This object holds the unscheduled treatment data
  ctrl.patientUnscheduledTreatments = [];

  $scope.preventiveCareLoading = true;
  $scope.appointmentsLoading = true;
  $scope.treatmentsLoading = true;
  $scope.followUpLoading = false;

  //#endregion

  //#region Authorization

  $scope.authAccess = function () {
    if (!patSecurityService.IsAuthorizedByAbbreviation('soar-nav-lnav-lnpat')) {
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
      $location.path('/');
    }
  };
  $scope.authAccess();

  ctrl.hasAccess = patientLandingFactory.access();

  $scope.hasPatientViewAccess = ctrl.hasAccess.PatientView;
  $scope.hasPreventiveCareViewAccess = ctrl.hasAccess.PreventiveCareView;
  $scope.hasScheduledAppointmentViewAccess =
    ctrl.hasAccess.ScheduledAppointmentView;
  $scope.hasUnscheduledTreatmentViewAccess =
    ctrl.hasAccess.UnScheduledTreatmentView;
  // TODO: add access to other to do security soar-per-pman-mtab

  $scope.activeGridData = [];
  //#endregion

  //#region Columns for Patient, Scheduled and Unscheduled grid

  // All patient columns structure
  ctrl.allPatientsColumns = patientLandingFactory.GetAllPatientsColumns();

  // Preventive Care columns
  ctrl.preventiveCareColumns = patientLandingFactory.GetPreventiveCareColumns();

  //#endregion

  //#region Locations

  ctrl.getLocations = function () {
    locationServices
      .getPermittedLocations({ ActionId: 2610 })
      .$promise.then(ctrl.getLocationSuccess, ctrl.getLocationFailure);
  };

  // getting locations
  ctrl.resLocs = [];
  ctrl.pendingInactiveLocs = [];
  ctrl.inactiveLocs = [];
  ctrl.groupLocations = function (locs) {
    ctrl.resLocs = [];
    ctrl.activeLocs = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];

    var dateNow = moment().format('MM/DD/YYYY');
    _.each(locs, function (obj) {
      if (obj.DeactivationTimeUtc) {
        var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
        obj.NameLine1 =
          obj.NameLine1 +
          ' (' +
          timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
          ')' +
          ' - ' +
          toCheck;

        if (
          moment(toCheck).isBefore(dateNow) ||
          moment(toCheck).isSame(dateNow)
        ) {
          obj.LocationStatus = 'Inactive';
          obj.GroupOrder = 3;
          ctrl.inactiveLocs.push(obj);
        } else {
          obj.LocationStatus = 'Pending Inactive';
          obj.GroupOrder = 2;
          ctrl.pendingInactiveLocs.push(obj);
        }
      } else {
        obj.NameLine1 =
          obj.NameLine1 +
          ' (' +
          timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
          ')';
        obj.LocationStatus = 'Active';
        obj.GroupOrder = 1;
        ctrl.activeLocs.push(obj);
      }
    });
    ctrl.activeLocs = $filter('orderBy')(ctrl.activeLocs, 'NameLine1');
    ctrl.inactiveLocs = $filter('orderBy')(
      ctrl.inactiveLocs,
      'DeactivationTimeUtc',
      true
    );
    ctrl.pendingInactiveLocs = $filter('orderBy')(
      ctrl.pendingInactiveLocs,
      'DeactivationTimeUtc',
      false
    );
    var ctrIndex = 1;
    _.each(ctrl.activeLocs, function (obj) {
      obj.SortingIndex = ctrIndex;
      ctrl.resLocs.push(obj);
      ctrIndex++;
    });

    _.each(ctrl.pendingInactiveLocs, function (obj) {
      obj.SortingIndex = ctrIndex;
      ctrl.resLocs.push(obj);
      ctrIndex++;
    });
    _.each(ctrl.inactiveLocs, function (obj) {
      obj.SortingIndex = ctrIndex;
      ctrl.resLocs.push(obj);
      ctrIndex++;
    });
    return ctrl.resLocs;
  };

  ctrl.getLocationSuccess = function (res) {
    if (res.Value) {
      $scope.locations = ctrl.groupLocations(res.Value);

      $scope.locationsDDL = {
        data: $scope.locations,
        group: 'GroupOrder',
        sort: { field: 'SortingIndex', dir: 'asc' },
      };

      $scope.strGroupTemplate =
        "#: data == 1 ? 'Active' : (data == 2 ? 'Pending Inactive' : 'Inactive') #";

      $('#dropdownlist').kendoDropDownList({
        groupTemplate: $scope.strGroupTemplate,
        fixedGroupTemplate: $scope.strGroupTemplate,
        optionLabel: 'Select Location',
        dataTextField: 'NameLine1',
        dataValueField: 'LocationId',
        dataSource: {
          data: $scope.locations,
          group: { field: 'GroupOrder' },
          sort: { field: 'SortingIndex', dir: 'asc' },
        },
      });
    }
  };
  ctrl.getlocationFailure = function () {
    toastrFactory.error('Failed to retrieve locations', 'Error');
    $scope.locationsLoading = false;
  };

  $scope.$watch('locations', function (nv) {
    if (nv != null) {
      $timeout(function () {
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        ctrl.userLocation =
          typeof cachedLocation !== 'undefined' ? cachedLocation : null;
        if (
          ctrl.userLocation &&
          ctrl.userLocation.id !== $scope.selectedLocationId
        ) {
          $scope.locationsLoading = false;
          $scope.selectedLocationId = ctrl.userLocation.id;
        }
        if (
          ctrl.userLocation &&
          ctrl.userLocation.id != null &&
          ctrl.userLocation.id === $scope.selectedLocationId
        ) {
          $scope.selectedLocationId = null;
          $scope.locationsLoading = false;
          $scope.selectedLocationId = ctrl.userLocation.id;
        }
      }, 100);
    }
  });

  // Event handler for init location
  $scope.$on('patCore:initlocation', function () {
    if (!$scope.locationsLoading) {
      ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
      ctrl.userLocation =
        typeof ctrl.location !== 'undefined' ? ctrl.location : null;
      if (ctrl.userLocation) {
        $scope.selectedLocationId = ctrl.userLocation.id;
      }
    }
  });

  //#endregion

  //#region Patients

  // Location Changed Handler
  $scope.$watch('selectedLocationId', function (nv, ov) {
    if (
      nv != null &&
      nv != ov &&
      typeof nv != 'undefined' &&
      nv != '' &&
      !$scope.locationsLoading
    ) {
      var locationId = nv;
      var filteredLocation =
        locationId == null
          ? $scope.locations[0]
          : $filter('filter')(
              $scope.locations,
              { LocationId: parseInt($scope.selectedLocationId) },
              true
            )[0];
      ctrl.selectedLocation = {
        LocationId: filteredLocation.LocationId,
        LocationName: filteredLocation.NameLine1,
      };

      ctrl.refreshGrids(ctrl.selectedLocation.LocationId);
    }
    ctrl.oldLocation = nv != '' ? nv : ov;
  });

  ctrl.refreshGrids = function (locationId) {
    if ($location.hash().toLowerCase().endsWith('allpatients')) {
      document.title = 'Pt Mgmt - All Pts';
      $scope.mailingTitle = 'All Patients';
      $scope.activeFltrTab = '2';
    } else if ($location.hash().toLowerCase().endsWith('preventivecare')) {
      document.title = 'Preventive Care';
      $scope.mailingTitle = 'Preventive Care';
      $scope.activeFltrTab = '7';
    } else if ($location.hash().toLowerCase().endsWith('treatmentplans')) {
      document.title = 'Treatment Plans';
      $scope.mailingTitle = 'Treatment Plans';
      $scope.activeFltrTab = '6';
      $scope.treatmentPlanIcon =
        'Images/PatientManagementIcons/txplans_white.svg';
    } else if ($location.hash().toLowerCase().endsWith('appointments')) {
      document.title = 'Pt Mgmt - Appointments';
      $scope.activeFltrTab = '1';
      $scope.mailingTitle = 'Appointments';
    } else if ($location.hash().toLowerCase().endsWith('othertodo')) {
      document.title = 'Pt Mgmt - Other';
      $scope.activeFltrTab = '5';
      $scope.mailingTitle = 'Other to do';
      $scope.disableMailing = true;
    }

    $scope.patientCount.update(locationId);

    if ($scope.activeFltrTab === '1') {
      // get the location object - we need to pass our timezone name to get the tz database name of the selected location's timezone

      var selectedLocation = _.find($scope.locations, function (location) {
        return $scope.selectedLocationId == location.LocationId; // sometimes the $scope.selectedLocationId value is a string, sometimes it's an int.
      });

      var selectedLocationTimeZoneDetails = timeZoneFactory.GetTimeZoneInfo(
        selectedLocation.Timezone
      ); // what do we need to pass in?
      $scope.appointmentsGridOptions.selectedLocationTzDatabaseName =
        selectedLocationTimeZoneDetails.MomentTZ; // "America\Chicago", tz database name

      $scope.appointmentsGridOptions.resetFilters();
      $scope.appointmentsGridOptions.updateFilter('LocationId', locationId);
      $scope.appointmentsGridOptions.updateFilter('AppointmentState', [
        '0|Cancellation',
        '1|Missed',
      ]);
      $scope.appointmentsGridOptions.updateFilter('IsScheduled', [true, false]);

      // $scope.appointmentsGridOptions.columnDefinition[4] // this is the appt date column. this object will always be in the [4] position in this array.
      var currentDateFromString =
        $scope.appointmentsGridOptions.columnDefinition[4].filterFrom;
      var currentDateToString =
        $scope.appointmentsGridOptions.columnDefinition[4].filterTo;

      if (
        !_.isEmpty(currentDateFromString) &&
        !_.isEmpty(currentDateToString)
      ) {
        var currentDateFrom = new Date(currentDateFromString);
        var updatedDateFrom =
          timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObject(
            currentDateFrom,
            $scope.appointmentsGridOptions.selectedLocationTzDatabaseName
          );

        var currentDateTo = new Date(currentDateToString);
        var updatedDateTo =
          timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObject(
            currentDateTo,
            $scope.appointmentsGridOptions.selectedLocationTzDatabaseName,
            true
          );

        $scope.appointmentsGridOptions.updateFilter(
          'AppointmentDateFrom',
          updatedDateFrom
        );
        $scope.appointmentsGridOptions.updateFilter(
          'AppointmentDateTo',
          updatedDateTo
        );
      } else {
        $scope.appointmentsGridOptions.updateFilter('AppointmentDateFrom', '');
        $scope.appointmentsGridOptions.updateFilter('AppointmentDateTo', '');
      }

      $scope.appointmentsGridOptions.refresh();
    }

    if ($scope.activeFltrTab === '5') {
      $scope.otherToDoGridOptions.resetFilters();
      $scope.otherToDoGridOptions.updateFilter('LocationId', locationId);
      $scope.otherToDoGridOptions.updateFilter('IsActive', [true]);
      $scope.otherToDoGridOptions.updateFilter('IsPatient', [true]);
      $scope.otherToDoGridOptions.refresh();
    }

    if ($scope.activeFltrTab === '6') {
      $scope.treatmentPlansGridOptions.resetFilters();
      $scope.treatmentPlansGridOptions.updateFilter('LocationId', locationId);
      $scope.treatmentPlansGridOptions.updateFilter('IsActive', [true]);
      $scope.treatmentPlansGridOptions.updateFilter('IsPatient', [true]);
      $scope.treatmentPlansGridOptions.refresh();
    }

    if ($scope.activeFltrTab === '7') {
      $scope.preventiveCareGridOptions.resetFilters();
      $scope.preventiveCareGridOptions.updateFilter('LocationId', locationId);
      $scope.preventiveCareGridOptions.updateFilter('IsActive', [true]);
      $scope.preventiveCareGridOptions.updateFilter('IsPatient', [true]);
      $scope.preventiveCareGridOptions.refresh();
    }

    if ($scope.activeFltrTab == '2') {
      $scope.allPatientsGridOptions.resetFilters();
      $scope.allPatientsGridOptions.updateFilter('LocationId', locationId);
      $scope.allPatientsGridOptions.updateFilter('IsActive', [true]);
      $scope.allPatientsGridOptions.updateFilter('IsPatient', [true]);
      $scope.allPatientsGridOptions.updateFilter('BirthMonths', [-1]);
      $scope.allPatientsGridOptions.refresh();
    }

    //reset collapse when location is manually selected
    ctrl.resetCollapse();
  };

  $scope.$on('displayAppliedFilters', function (event, args) {
    //clear dropdown filter before applying other filters.
    if ($scope.activeFltrTab === '1')
      $scope.appointmentsGridOptions.columnDefinition[6].filter = '';

    if (args && args.length > 0) {
      //appointments and other to do
      if (
        $scope.activeFltrTab === '1' ||
        $scope.activeFltrTab === '2' ||
        $scope.activeFltrTab === '5' ||
        $scope.activeFltrTab === '6' ||
        $scope.activeFltrTab === '7'
      ) {
        $scope.updateAdditionalFilters(args);
      } else {
        ctrl.updateGridByFilters(args);
      }
    }
  });

  $scope.$on('resetFilters', function (event, args) {
    if (
      args &&
      args.length > 0 &&
      $scope.activeFltrTab !== '1' &&
      $scope.activeFltrTab !== '2' &&
      $scope.activeFltrTab !== '5'
    ) {
      ctrl.updateGridByFilters(args);
    }
    if ($scope.activeFltrTab === '1') {
      $scope.appointmentsGridOptions.resetFilters();
      // $scope.appointmentsGridOptions.updateFilter('IsActive', [true]);
      // $scope.appointmentsGridOptions.updateFilter('IsPatient', [true]);
      $scope.appointmentsGridOptions.refresh();
    }
    if ($scope.activeFltrTab === '2') {
      $scope.allPatientsGridOptions.resetFilters();
      $scope.allPatientsGridOptions.updateFilter('IsActive', [true]);
      $scope.allPatientsGridOptions.updateFilter('IsPatient', [true]);
      $scope.allPatientsGridOptions.updateFilter('BirthMonths', [-1]);
      $scope.allPatientsGridOptions.refresh();
    }
    if ($scope.activeFltrTab === '5') {
      $scope.otherToDoGridOptions.resetFilters();
      $scope.otherToDoGridOptions.updateFilter('IsActive', [true]);
      $scope.otherToDoGridOptions.updateFilter('IsPatient', [true]);
      $scope.otherToDoGridOptions.refresh();
    }
    if ($scope.activeFltrTab === '6') {
      $scope.treatmentPlansGridOptions.resetFilters();
      $scope.treatmentPlansGridOptions.updateFilter('IsActive', [true]);
      $scope.treatmentPlansGridOptions.updateFilter('IsPatient', [true]);
      $scope.treatmentPlansGridOptions.refresh();
    }
    if ($scope.activeFltrTab === '7') {
      $scope.preventiveCareGridOptions.resetFilters();
      $scope.preventiveCareGridOptions.updateFilter('IsActive', [true]);
      $scope.preventiveCareGridOptions.updateFilter('IsPatient', [true]);
      $scope.preventiveCareGridOptions.refresh();
    }
  });

  $scope.updateAdditionalFilters = function (args) {
    if ($scope.activeFltrTab === '1') {
      $scope.selectedGrid = $scope.appointmentsGridOptions;
    } else if ($scope.activeFltrTab === '2') {
      $scope.selectedGrid = $scope.allPatientsGridOptions;
    } else if ($scope.activeFltrTab === '5') {
      $scope.selectedGrid = $scope.otherToDoGridOptions;
    } else if ($scope.activeFltrTab === '6') {
      $scope.selectedGrid = $scope.treatmentPlansGridOptions;
    } else if ($scope.activeFltrTab === '7') {
      $scope.selectedGrid = $scope.preventiveCareGridOptions;
    }

    $scope.selectedGrid.resetFilters();
    var filters = [];

    angular.forEach(args, function (arg) {
      var findHeader = $filter('filter')(filters, arg.name, true);
      var findDateRange = $filter('filter')(filters, arg.id, true);
      if (arg.id === 'PlanCreatedDateRange') {
        findHeader = [];
      }
      if (findHeader.length === 0) {
        var findAllField = $filter('filter')(
          args,
          { dataset: { key: 'All' }, name: arg.name },
          true
        );
        if (
          (findAllField.length === 0 || arg.name === 'AppointmentStates') &&
          arg.name !== 'Created Date'
        ) {
          if (
            !(arg.name == 'TreatmentPlanNameCheck' && arg.type == 'checkbox')
          ) {
            filters.push(arg.dataset.field);
            if (arg.dataset.individual && arg.dataset.individual === 'true') {
              $scope.selectedGrid.updateFilter(
                arg.dataset.field,
                arg.dataset.key
              );
            } else {
              var filterSet = [];
              var fields = $filter('filter')(
                args,
                { dataset: { field: arg.dataset.field } },
                true
              );
              angular.forEach(fields, function (fieldObj) {
                if (fieldObj.name == 'TreatmentPlanName')
                  filterSet.push(fieldObj.value);
                else if (fieldObj.dataset.field == 'HasInsurance') {
                  if (fieldObj.dataset.key !== '')
                    filterSet.push(fieldObj.dataset.key);
                } else filterSet.push(fieldObj.dataset.key);
              });
              if (arg.dataset.field != null) {
                $scope.selectedGrid.updateFilter(arg.dataset.field, filterSet);
              }
              if ($scope.activeFltrTab === '1')
                $scope.appointmentsGridOptions.updateFilter(
                  arg.dataset.field,
                  filterSet
                );
              else if ($scope.activeFltrTab === '2')
                $scope.allPatientsGridOptions.updateFilter(
                  arg.dataset.field,
                  filterSet
                );
            }
          }
        }
        if (
          findHeader.length === 0 &&
          arg.id === 'PlanCreatedDateRange' &&
          arg.name === undefined
        ) {
          var filterSetDte = [];
          filters.push(arg.dataset.field);
          var fieldsDte = $filter('filter')(
            args,
            { dataset: { field: arg.dataset.field } },
            true
          );
          angular.forEach(fieldsDte, function (fieldObj) {
            filterSetDte.push(
              document.getElementById('All').checked
                ? ''
                : fieldObj.firstElementChild.firstElementChild.firstElementChild
                    .value
            );
          });
          if (filterSetDte.length) {
            filterSetDte[1] = `${filterSetDte[1]} 23:59:59`;
          }
          $scope.selectedGrid.updateFilter(arg.dataset.field, filterSetDte);
        }
      }
    });

    if ($scope.activeFltrTab === '1') {
      var findBusinessDay = $filter('filter')(
        $scope.appointmentsGridOptions.additionalFilters,
        { field: 'BusinessDays' },
        true
      );
      if (findBusinessDay.length > 0) {
        $scope.appointmentsGridOptions.columnDefinition[4].filterFrom = '';
        $scope.appointmentsGridOptions.columnDefinition[4].filterTo = '';
      }
    }

    $scope.selectedGrid.refresh();
  };

  // update Grid by slideout filters
  ctrl.updateGridByFilters = function (args) {
    var filters = [];

    var columnFilters = ctrl.getgridColumnFilters();
    if (columnFilters.length > 0) {
      angular.forEach(columnFilters, function (colFilter) {
        filters.push(colFilter);
      });
    }

    var slideoutFilters = ctrl.getSlideoutFilters(args);
    if (slideoutFilters.length > 0) {
      angular.forEach(slideoutFilters, function (slideFilter) {
        filters.push(slideFilter);
      });
    }

    // apply filters
    if (filters.length > 0) {
      $scope.patGridOptions.dataSource.filter(filters);
    }
    if (
      filters.length === 0 &&
      typeof $scope.patGridOptions.dataSource.filter !== 'undefined'
    ) {
      $scope.patGridOptions.dataSource.filter([]);
    }
  };

  // get current grid column filters
  ctrl.getgridColumnFilters = function () {
    var filters = [];
    var currentFilters = $scope.patGridOptions.dataSource.filter();
    if (currentFilters != undefined) {
      angular.forEach(currentFilters.filters, function (filterObj) {
        var fieldName =
          typeof filterObj.field === 'undefined'
            ? filterObj.filters[0].field
            : filterObj.field;
        var findColumnFilter = $filter('filter')(
          $scope.patGridOptions.columns,
          { field: fieldName },
          true
        );
        if (findColumnFilter.length > 0) {
          filters.push(filterObj);
        }
      });
    }
    return filters;
  };

  //get slideout filters
  ctrl.getSlideoutFilters = function (args) {
    var filters = [];
    var headerFilters = [];
    angular.forEach(args, function (arg) {
      var findHeader = $filter('filter')(headerFilters, arg.name, true);
      if (findHeader.length === 0) {
        var findAllField = $filter('filter')(
          args,
          { value: 'All', name: arg.name },
          true
        );
        if (findAllField.length === 0) {
          headerFilters.push(arg.name);

          var filterSet = [];
          var fields = $filter('filter')(args, { name: arg.name }, true);
          var logic = 'or';
          angular.forEach(fields, function (fieldObj) {
            var valueType =
              $scope.patGridOptions.dataSource.options.schema.model.fields[
                fieldObj.dataset.filterField
              ].type;
            var convertedValue;
            if (valueType === 'boolean') {
              if (fieldObj.dataset.filterValue === 'true') {
                convertedValue = true;
              } else {
                convertedValue = false;
              }
            } else if (valueType === 'date') {
              logic = 'and';
              convertedValue = new Date(
                $filter('date')(fieldObj.dataset.filterValue, 'MM/dd/yyyy')
              );
            } else {
              convertedValue = fieldObj.dataset.filterValue;
            }

            filterSet.push({
              field: fieldObj.dataset.filterField,
              operator: fieldObj.dataset.filterOperator,
              value: convertedValue,
            });
          });
          var slideFilters = {
            logic: logic,
            filters: filterSet,
          };

          filters.push(slideFilters);
        }
      }
    });
    return filters;
  };

  // Navigate to patient's profile
  $scope.navToPatientProfile = function (personId) {
    if (personId != 'null') {
      personFactory.getById(personId).then(function (result) {
        var patientInfo = result.Value;
        patientValidationFactory
          .PatientSearchValidation(patientInfo)
          .then(function (res) {
            patientInfo = res;
            if (
              !patientInfo.authorization
                .UserIsAuthorizedToAtLeastOnePatientLocation
            ) {
              patientValidationFactory.LaunchPatientLocationErrorModal(
                patientInfo
              );
              return;
            } else {
              $location.search('newTab', null);
              tabLauncher.launchNewTab('#/Patient/' + personId + '/Overview');
              return '';
            }
          });
      });
    }
  };

  // Navigate to patient's treatment plan
  $scope.navToPatientTxPlan = function (personId, treatmentPlanId) {
    $scope.isMouseUp = false;
    if (personId != 'null') {
      tabLauncher.launchNewTab(
        '#/Patient/' +
          personId +
          '/Clinical?activeExpand=2&txPlanId=' +
          treatmentPlanId
      );
    }
    return '';
  };

  // Navigate to appointment's page
  $scope.navToAppointment = function (
    appointmentId,
    accountId,
    classification
  ) {
    if (appointmentId !== '00000000-0000-0000-0000-000000000000') {
      // removed the code that routed to the old appointment edit refactor controller because you can't get into this block and that controller has been deprecated
      ctrl.retrieveData(appointmentId, accountId, classification);
    }
    //return "";
  };

  // Set up actions for grid
  $scope.appointmentsGridOptions.actions.navToPatientProfile =
    $scope.navToPatientProfile;
  $scope.appointmentsGridOptions.actions.navToAppointment =
    $scope.navToAppointment;
  $scope.appointmentsGridOptions.actions.createAppointment =
    $scope.createAppointment;
  $scope.appointmentsGridOptions.actions.openModal = $scope.openModal;

  $scope.allPatientsGridOptions.actions.navToPatientProfile =
    $scope.navToPatientProfile;
  $scope.allPatientsGridOptions.actions.navToTest = $scope.navToTest;
  $scope.allPatientsGridOptions.actions.navToAppointment =
    $scope.navToAppointment;
  $scope.allPatientsGridOptions.actions.createAppointment =
    $scope.createAppointment;
  $scope.allPatientsGridOptions.actions.openModal = $scope.openModal;

  $scope.otherToDoGridOptions.actions.navToPatientProfile =
    $scope.navToPatientProfile;
  $scope.otherToDoGridOptions.actions.navToTest = $scope.navToTest;
  $scope.otherToDoGridOptions.actions.navToAppointment =
    $scope.navToAppointment;
  $scope.otherToDoGridOptions.actions.createAppointment =
    $scope.createAppointment;
  $scope.otherToDoGridOptions.actions.openModal = $scope.openModal;

  $scope.treatmentPlansGridOptions.actions.navToPatientProfile =
    $scope.navToPatientProfile;
  $scope.treatmentPlansGridOptions.actions.navToTest = $scope.navToTest;
  $scope.treatmentPlansGridOptions.actions.navToAppointment =
    $scope.navToAppointment;
  $scope.treatmentPlansGridOptions.actions.createAppointment =
    $scope.createAppointment;
  $scope.treatmentPlansGridOptions.actions.openModal = $scope.openModal;

  $scope.preventiveCareGridOptions.actions.navToPatientProfile =
    $scope.navToPatientProfile;
  $scope.preventiveCareGridOptions.actions.navToTest = $scope.navToTest;
  $scope.preventiveCareGridOptions.actions.navToAppointment =
    $scope.navToAppointment;
  $scope.preventiveCareGridOptions.actions.createAppointment =
    $scope.createAppointment;
  $scope.preventiveCareGridOptions.actions.openModal = $scope.openModal;

  //#region Recent
  $scope.saveMostRecent = function (personId) {
    globalSearchFactory.SaveMostRecentPerson(personId);
  };
  //#endregion

  //#region Init Function
  ctrl.init = function () {
    var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    ctrl.userLocation =
      typeof cachedLocation !== 'undefined' ? cachedLocation : null;
    if (ctrl.userLocation) {
      $scope.patientCount.update(ctrl.userLocation.id);
      $scope.allPatientsGridOptions.updateFilter(
        'LocationId',
        ctrl.userLocation.id
      );
    }
    $scope.locationsLoading = true;
    $scope.locations = null;
    $scope.selectedLocationId = null;
    ctrl.getLocations();

    if (!$scope.hideMenu) {
      $scope.hideDiv(false);
    }
  };
  //#endregion

  //#region Filter
  $scope.activeFltrTab = '2';
  ctrl.fltrTabActivated = true;

  // ********** GRID ****************
  $scope.isActiveFltrTab = function (filter) {
    if (filter === $scope.activeFltrTab) {
      return true;
    } else {
      return false;
    }
  };

  ctrl.resetCollapse = function () {
    //If user changed tiles while the menu is expanded
    if (document.getElementById('btnExpandCollapse') != undefined) {
      var strLabel = document.getElementById('btnExpandCollapse').innerHTML;
      if (strLabel == 'Collapse All') {
        var $this = $('.collapse-all');
        $this.text('Expand All');
        $('.panel-collapse.in').collapse('hide');
        $this.addClass('expand-all');
      }
    }
  };

  // Filter by scheduled, unscheduled or patient tab
  ctrl.treatmentPlanTabLoaded = false;
  $scope.activateFltrTab = function (filter) {
    if ($scope.activeFltrTab !== filter) {
      $scope.filteredUnreadCommunication = false;
      $scope.disableFilter = true;
      $scope.disableMailing = false;

      ctrl.resetCollapse();
      $scope.appliedFilters = '';
      ctrl.fltrTabActivated =
        $scope.activeFltrTab === filter ? !ctrl.fltrTabActivated : true;

      var switchedTab = $scope.activeFltrTab !== filter ? true : false;
      if (switchedTab) {
        $scope.disablePrint = true;
      }

      $scope.activeFltrTab = filter;

      if (!$scope.hideMenu) {
        $scope.hideDiv(false);
      }

      // Set all grids to hidden
      $scope.appointmentsGridOptions.isHidden = true;
      $scope.allPatientsGridOptions.isHidden = true;
      $scope.otherToDoGridOptions.isHidden = true;
      $scope.treatmentPlansGridOptions.isHidden = true;
      $scope.preventiveCareGridOptions.isHidden = true;
      $scope.treatmentPlanIcon =
        $scope.activeFltrTab === '6'
          ? 'Images/PatientManagementIcons/txplans_white.svg'
          : 'Images/PatientManagementIcons/txplans_gray.svg';

      // Appointments
      if ($scope.activeFltrTab === '1') {
        document.title = 'Pt Mgmt - Appointments';
        $scope.mailingTitle = 'Appointments';
        if (switchedTab) {
          // get the location object - we need to pass our timezone name to get the tz database name of the selected location's timezone
          var selectedLocation = _.find($scope.locations, function (location) {
            return $scope.selectedLocationId == location.LocationId; // sometimes the $scope.selectedLocationId value is a string, sometimes it's an int.
          });

          var selectedLocationTimeZoneDetails = timeZoneFactory.GetTimeZoneInfo(
            selectedLocation.Timezone
          ); // what do we need to pass in?
          $scope.appointmentsGridOptions.selectedLocationTzDatabaseName =
            selectedLocationTimeZoneDetails.MomentTZ; // "America\Chicago", tz database name

          $scope.appointmentsGridOptions.isHidden = false;
          $scope.appointmentsGridOptions.resetFilters();
          // $scope.appointmentsGridOptions.updateFilter('IsActive', [true]);
          // $scope.appointmentsGridOptions.updateFilter('IsPatient', [true]);
          $scope.appointmentsGridOptions.updateFilter(
            'LocationId',
            $scope.selectedLocationId
          );
          $scope.appointmentsGridOptions.updateFilter('AppointmentState', [
            '0|Cancellation',
            '1|Missed',
          ]);
          $scope.appointmentsGridOptions.updateFilter('IsScheduled', [
            true,
            false,
          ]);

          $scope.appointmentsGridOptions.refresh();
        }
        $scope.activeGridData = $scope.appointmentFilters;
      }

      // All Patients
      if ($scope.activeFltrTab === '2') {
        document.title = 'Pt Mgmt - All Pts';
        $scope.mailingTitle = 'All Patients';
        if (switchedTab) {
          $scope.allPatientsGridOptions.isHidden = false;
          $scope.allPatientsGridOptions.resetFilters();
          $scope.allPatientsGridOptions.updateFilter('IsActive', [true]);
          $scope.allPatientsGridOptions.updateFilter('IsPatient', [true]);
          $scope.allPatientsGridOptions.updateFilter(
            'LocationId',
            $scope.selectedLocationId
          );
          // adding a comment to create git file difference
          $scope.allPatientsGridOptions.updateFilter('BirthMonths', [-1]);
          $scope.allPatientsGridOptions.refresh();
        }
        $scope.activeGridData = $scope.allPatientFilters;
      }

      if ($scope.activeFltrTab === '5') {
        document.title = 'Pt Mgmt - Other';
        $scope.mailingTitle = 'Other to do';
        $scope.disableMailing = true;
        if (switchedTab) {
          $scope.otherToDoGridOptions.isHidden = false;
          $scope.otherToDoGridOptions.resetFilters();
          $scope.otherToDoGridOptions.updateFilter('IsActive', [true]);
          $scope.otherToDoGridOptions.updateFilter('IsPatient', [true]);
          $scope.otherToDoGridOptions.updateFilter(
            'LocationId',
            $scope.selectedLocationId
          );
          $scope.otherToDoGridOptions.refresh();
        }
      }

      // Treatment Plans NEW
      if ($scope.activeFltrTab === '6') {
        document.title = 'Treatment Plans';
        $scope.mailingTitle = 'Treatment Plans';
        if (switchedTab) {
          $scope.treatmentPlansGridOptions.isHidden = false;
          $scope.treatmentPlansGridOptions.resetFilters();
          $scope.treatmentPlansGridOptions.updateFilter('IsActive', [true]);
          $scope.treatmentPlansGridOptions.updateFilter('IsPatient', [true]);
          $scope.treatmentPlansGridOptions.updateFilter(
            'LocationId',
            $scope.selectedLocationId
          );
          $scope.treatmentPlansGridOptions.refresh();
        }
        $scope.activeGridData = $scope.treatmentTabFilters;
      }

      // Preventive Care NEW
      if ($scope.activeFltrTab === '7') {
        document.title = 'Preventive Care';
        $scope.mailingTitle = 'Preventive Care';
        if (switchedTab) {
          $scope.preventiveCareGridOptions.isHidden = false;
          $scope.preventiveCareGridOptions.resetFilters();
          $scope.preventiveCareGridOptions.updateFilter('IsActive', [true]);
          $scope.preventiveCareGridOptions.updateFilter('IsPatient', [true]);
          $scope.preventiveCareGridOptions.updateFilter(
            'LocationId',
            $scope.selectedLocationId
          );
          $scope.preventiveCareGridOptions.refresh();
        }
        $scope.activeGridData = $scope.preventiveCareTabFilters;
      }
    }
  };

  $scope.isPermissable = function (tab) {
    switch (tab) {
      case '1': // Appointments
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-pman-atab'
        );
      case '2': // All Patients
        return true;
      case '3': // Preventive Care
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-pman-pctab'
        );
      case '4': // Treatment Plans
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-pman-tptab'
        );
      case '5': // Miscellaneous
        return true;
    }
    return false;
  };

  //#endregion

  $scope.hideDiv = function (showDefault) {
    if (showDefault) {
      $scope.hideMenu = false;
      $scope.grdWidth = '80%';
      $scope.overflow = 'scroll';
      $scope.slideOutText = 'Hide Filters';
    } else {
      $scope.hideMenu = $scope.hideMenu ? false : true;
      $scope.grdWidth = $scope.hideMenu ? '100%' : '80%';
      $scope.overflow = $scope.hideMenu ? 'hidden' : 'scroll';
      $scope.slideOutText = $scope.hideMenu ? 'Show Filters' : 'Hide Filters';
    }
  };

  ctrl.init();
  $scope.getPracticeSettings();

  //#region Mouse Hover for Tx Plans
  $scope.filterTxPlanStatus = [
    {
      ID: '0',
      Description: localize.getLocalizedString('Proposed'),
      Active: false,
    },
    {
      ID: '1',
      Description: localize.getLocalizedString('Accepted'),
      Active: false,
    },
    {
      ID: '2',
      Description: localize.getLocalizedString('Rejected'),
      Active: false,
    },
    {
      ID: '3',
      Description: localize.getLocalizedString('Completed'),
      Active: false,
    },
    {
      ID: '4',
      Description: localize.getLocalizedString('Presented'),
      Active: false,
    },
  ];

  var keepShow = true;

  ctrl.transactionPlanHoverData = {};

  $scope.displayTxPlans = function (event, curpatientId, txPlanId) {
    $scope.mouseX = event.pageX - 10;
    $scope.mouseY = event.pageY - 55;
    if (typeof ctrl.transactionPlanHoverData[curpatientId] != 'undefined') {
      ctrl.txPlanHover(ctrl.transactionPlanHoverData[curpatientId]);
    } else {
      patientServices.TreatmentPlanHover.get({
        patientId: curpatientId,
      }).$promise.then(function (data) {
        ctrl.getTxPlanHoverSuccess(curpatientId, data);
      }, ctrl.getTxPlanHoverFailure);
    }
  };

  ctrl.txPlanHover = function (data) {
    $scope.txPlansHover = data;

    var toolTipHeight = $scope.txPlansHover.length * 20 + 20;

    if (event.pageY + toolTipHeight >= window.outerHeight - 100) {
      $scope.mouseY = $scope.mouseY - (toolTipHeight + 10);
    }

    $scope.isMouseUp = true;
    keepShow = true;
  };

  ctrl.getTxPlanHoverSuccess = function (patientId, res) {
    var data = res.Value;
    ctrl.transactionPlanHoverData[patientId] = data;
    ctrl.txPlanHover(data);
  };

  ctrl.getTxPlanHoverFailure = function (er) {
    toastrFactory.error('Failed to treatment plans', 'Error');
  };

  $scope.hideTxPlans = function () {
    keepShow = false;
    $timeout(ctrl.hideHoverTip, 100);
  };

  $scope.allPatientsGridOptions.actions.displayTxPlans = $scope.displayTxPlans;
  $scope.treatmentPlansGridOptions.actions.displayTxPlans =
    $scope.displayTxPlans;
  $scope.preventiveCareGridOptions.actions.displayTxPlans =
    $scope.displayTxPlans;

  $scope.getStatus = function (statCode) {
    return listHelper.findItemByFieldValue(
      $scope.filterTxPlanStatus,
      'ID',
      statCode
    ).Description;
  };

  $scope.getClass = function (status) {
    var cssClass = '';

    switch (status) {
      case 'Proposed':
        cssClass = 'fa-question-circle';
        break;
      case 'Presented':
        cssClass = 'fa-play-circle';
        break;
      case 'Accepted':
        cssClass = 'far fa-thumbs-up';
        break;
      case 'Rejected':
        cssClass = 'far fa-thumbs-down';
        break;
      case 'Completed':
        cssClass = 'fa-check';
        break;
    }

    return cssClass;
  };

  $scope.allPatientsGridOptions.actions.hideTxPlans = $scope.hideTxPlans;
  $scope.treatmentPlansGridOptions.actions.hideTxPlans = $scope.hideTxPlans;
  $scope.preventiveCareGridOptions.actions.hideTxPlans = $scope.hideTxPlans;

  ctrl.hideHoverTip = function () {
    if (!keepShow) {
      $scope.isMouseUp = false;
    }
  };

  $scope.keepHoverTipVisible = function () {
    //$timeout.flush();
    keepShow = true;
    $scope.isMouseUp = true;
  };

  $scope.hideHoverTip = function () {
    $scope.isMouseUp = false;
  };
  //#endregion Mouse Hover for Tx Plans
  ctrl.confirmCancel = function () {
    return;
  };

  ctrl.showWarningModal = function () {
    // modalFactory.CancelModal().then(ctrl.confirmCancel);
    var message = localize.getLocalizedString('{0}', [
      'More than 200 records.',
    ]);
    var title = localize.getLocalizedString('Warning!');
    var button2Text = localize.getLocalizedString('Ok');
    modalFactory
      .ConfirmModal(title, message, button2Text)
      .then(ctrl.cancelSave, ctrl.resumeSave);
  };
  ctrl.showWarningPreventiveCareModal = function () {
    // modalFactory.CancelModal().then(ctrl.confirmCancel);
    var message = localize.getLocalizedString('{0}', [
      'You have exceeded the limit of 1500 records.',
    ]);
    var title = localize.getLocalizedString('Warning!');
    var button2Text = localize.getLocalizedString('Ok');
    modalFactory
      .ConfirmModal(title, message, button2Text)
      .then(ctrl.cancelSave, ctrl.resumeSave);
  };
  $scope.printMailinglabels = function () {
    if ($scope.disableMailing != true && $scope.disablePrint != true) {
      var strTitle = {
        title: $scope.mailingTitle,
        activeFltrTab: $scope.activeFltrTab,
        activeGridDataCount: $scope.activeGridData.TotalCount,
      };
      if ($scope.activeFltrTab === '1') {
        //appointments
        modalFactory.SendMailingModal(strTitle).then(
          function () {
            console.log($rootScope.isPrintMailingLabel);
            if ($rootScope.isPrintMailingLabel) {
              patientServices.MailingLabel.GetMailingLabelAppointment(
                $scope.activeGridData
              ).$promise.then(function (res) {
                $scope.labels = res.Value;
                ctrl.mailingLabel = mailingLabelPrintFactory.Setup();
                ctrl.mailingLabel.data = res.Value;
                ctrl.mailingLabel.getPrintHtml();
              });
            }
            ////Generate Bulk Template
            if ($rootScope.communicationTemplateId != null) {
              var query = $resource(
                '_soarapi_/patients/' +
                  $rootScope.communicationTemplateId +
                  '/PrintBulkLetterAppointment',
                {},
                { getData: { method: 'POST', params: {} } }
              );
              if ($rootScope.isPostcard) {
                query = $resource(
                  '_soarapi_/patients/' +
                    $rootScope.communicationTemplateId +
                    '/PrintBulkPostcardAppointment',
                  {},
                  { getData: { method: 'POST', params: {} } }
                );
              }

              if ($scope.activeGridData.TotalCount > 200) {
                ctrl.showWarningModal();
              } else {
                ctrl.printTemplate = templatePrintFactory.Setup();
                ctrl.printTemplate.dataGrid = $scope.activeGridData;
                ctrl.printTemplate.communicationTemplateId =
                  $rootScope.communicationTemplateId;
                ctrl.printTemplate.isPostcard = $rootScope.isPostcard;
                ctrl.printTemplate.query = query;
                ctrl.printTemplate.getPrintHtml();
                $rootScope.communicationTemplateId = null;
              }
            }
          },
          function () {
            return;
          }
        );
      } else if ($scope.activeFltrTab === '2') {
        //all patients
        modalFactory.SendMailingModal(strTitle).then(
          function () {
            console.log($rootScope.isPrintMailingLabel);
            if ($rootScope.isPrintMailingLabel) {
              patientServices.MailingLabel.GetMailingLabelPatient(
                $scope.activeGridData
              ).$promise.then(function (res) {
                $scope.labels = res.Value;
                ctrl.mailingLabel = mailingLabelPrintFactory.Setup();
                ctrl.mailingLabel.data = res.Value;
                ctrl.mailingLabel.getPrintHtml();
              });
            }
            ////Generate Bulk Template
            if ($rootScope.communicationTemplateId != null) {
              var query = $resource(
                '_soarapi_/patients/' +
                  $rootScope.communicationTemplateId +
                  '/PrintBulkLetterPatient',
                {},
                { getData: { method: 'POST', params: {} } }
              );
              if ($rootScope.isPostcard) {
                query = $resource(
                  '_soarapi_/patients/' +
                    $rootScope.communicationTemplateId +
                    '/PrintBulkPostcardPatient',
                  {},
                  { getData: { method: 'POST', params: {} } }
                );
              }
              if ($scope.activeGridData.TotalCount > 200)
                ctrl.showWarningModal();
              else {
                ctrl.printTemplate = templatePrintFactory.Setup();
                ctrl.printTemplate.dataGrid = $scope.activeGridData;
                ctrl.printTemplate.communicationTemplateId =
                  $rootScope.communicationTemplateId;
                ctrl.printTemplate.isPostcard = $rootScope.isPostcard;
                ctrl.printTemplate.query = query;
                ctrl.printTemplate.getPrintHtml();
                $rootScope.communicationTemplateId = null;
              }
            }
          },
          function () {
            return;
          }
        );
      } else if ($scope.activeFltrTab === '6') {
        //treatment
        modalFactory.SendMailingModal(strTitle).then(
          function () {
            console.log($rootScope.isPrintMailingLabel);
            if ($rootScope.isPrintMailingLabel) {
              patientServices.MailingLabel.GetMailingLabelTreatment(
                $scope.activeGridData
              ).$promise.then(function (res) {
                $scope.labels = res.Value;
                ctrl.mailingLabel = mailingLabelPrintFactory.Setup();
                ctrl.mailingLabel.data = res.Value;
                ctrl.mailingLabel.getPrintHtml();
              });
            }
            ////Generate Bulk Template
            if ($rootScope.communicationTemplateId != null) {
              var query = $resource(
                '_soarapi_/patients/' +
                  $rootScope.communicationTemplateId +
                  '/PrintBulkLetterTreatment',
                {},
                { getData: { method: 'POST', params: {} } }
              );
              if ($rootScope.isPostcard) {
                query = $resource(
                  '_soarapi_/patients/' +
                    $rootScope.communicationTemplateId +
                    '/PrintBulkPostcardTreatment',
                  {},
                  { getData: { method: 'POST', params: {} } }
                );
              }
              if ($scope.activeGridData.TotalCount > 200)
                ctrl.showWarningModal();
              else {
                ctrl.printTemplate = templatePrintFactory.Setup();
                ctrl.printTemplate.dataGrid = $scope.activeGridData;
                ctrl.printTemplate.communicationTemplateId =
                  $rootScope.communicationTemplateId;
                ctrl.printTemplate.isPostcard = $rootScope.isPostcard;
                ctrl.printTemplate.query = query;
                ctrl.printTemplate.getPrintHtml();
                $rootScope.communicationTemplateId = null;
              }
            }
          },
          function () {
            return;
          }
        );
      } else if ($scope.activeFltrTab === '7') {
        //preventive
        if ($scope.activeGridData.TotalCount > 1500) {
          ctrl.showWarningPreventiveCareModal();
        } else {
          modalFactory.SendMailingModal(strTitle).then(
            function () {
              if ($rootScope.isPrintMailingLabel) {
                patientServices.MailingLabel.GetMailingLabelPreventive(
                  $scope.activeGridData
                ).$promise.then(function (res) {
                  $scope.labels = res.Value;
                  ctrl.mailingLabel = mailingLabelPrintFactory.Setup();
                  ctrl.mailingLabel.data = res.Value;
                  ctrl.mailingLabel.getPrintHtml();
                });
              }
              ////Generate Bulk Template
              if ($rootScope.communicationTemplateId != null) {
                var query = $resource(
                  '_soarapi_/patients/' +
                    $rootScope.communicationTemplateId +
                    '/PrintBulkLetterPreventive',
                  {},
                  { getData: { method: 'POST', params: {} } }
                );
                if ($rootScope.isPostcard) {
                  query = $resource(
                    '_soarapi_/patients/' +
                      $rootScope.communicationTemplateId +
                      '/PrintBulkPostcardPreventive',
                    {},
                    { getData: { method: 'POST', params: {} } }
                  );
                }

                if ($scope.activeGridData.TotalCount > 1500)
                  ctrl.showWarningPreventiveCareModal();
                else {
                  ctrl.printTemplate = templatePrintFactory.Setup();
                  ctrl.printTemplate.dataGrid = $scope.activeGridData;
                  ctrl.printTemplate.communicationTemplateId =
                    $rootScope.communicationTemplateId;
                  ctrl.printTemplate.isPostcard = $rootScope.isPostcard;
                  ctrl.printTemplate.query = query;
                  ctrl.printTemplate.getPrintHtml();
                  $rootScope.communicationTemplateId = null;
                }
              }
            },
            function () {
              return;
            }
          );
        }
      }
    }
  };

  //#region Print Grid
  $scope.printGrid = function () {
    if ($scope.activeFltrTab === '1') {
      ctrl.appointmentPrint = gridPrintFactory.CreateOptions();
      ctrl.appointmentPrint.tabTitle = 'Print Appointments';
      ctrl.appointmentPrint.query = $scope.appointmentsGridOptions.query;
      ctrl.appointmentPrint.filterCriteria =
        $scope.appointmentFilters.FilterCriteria;
      ctrl.appointmentPrint.sortCriteria =
        $scope.appointmentFilters.SortCriteria;
      ctrl.appointmentPrint.headerCaption = 'Appointments';
      ctrl.appointmentPrint.locations = [
        {
          LocationId: ctrl.selectedLocation.LocationId,
          LocationName: ctrl.selectedLocation.LocationName,
        },
      ];
      ctrl.appointmentPrint.columnDefinition = $filter('filter')(
        $scope.appointmentsGridOptions.columnDefinition,
        { printable: true }
      );
      ctrl.appointmentPrint.getPrintHtml();
    } else if ($scope.activeFltrTab === '2') {
      ctrl.allPatientPrint = gridPrintFactory.CreateOptions();
      ctrl.allPatientPrint.tabTitle = 'Print All Patients';
      ctrl.allPatientPrint.query = $scope.allPatientsGridOptions.query;
      ctrl.allPatientPrint.filterCriteria =
        $scope.allPatientFilters.FilterCriteria;
      ctrl.allPatientPrint.sortCriteria = $scope.allPatientFilters.SortCriteria;
      ctrl.allPatientPrint.headerCaption = 'All Patients List';
      ctrl.allPatientPrint.locations = [
        {
          LocationId: ctrl.selectedLocation.LocationId,
          LocationName: ctrl.selectedLocation.LocationName,
        },
      ];
      ctrl.allPatientPrint.columnDefinition = $filter('filter')(
        $scope.allPatientsGridOptions.columnDefinition,
        { printable: true }
      );
      ctrl.allPatientPrint.getPrintHtml();
    }
    if ($scope.activeFltrTab === '5') {
      ctrl.otherToDoPrint = gridPrintFactory.CreateOptions();
      ctrl.otherToDoPrint.tabTitle = 'Print Other To Do';
      ctrl.otherToDoPrint.query = $scope.otherToDoGridOptions.query;
      ctrl.otherToDoPrint.filterCriteria =
        $scope.otherToDoFilters.FilterCriteria;
      ctrl.otherToDoPrint.sortCriteria = $scope.otherToDoFilters.SortCriteria;
      ctrl.otherToDoPrint.headerCaption = 'Other To Do List';
      ctrl.otherToDoPrint.locations = [
        {
          LocationId: ctrl.selectedLocation.LocationId,
          LocationName: ctrl.selectedLocation.LocationName,
        },
      ];
      ctrl.otherToDoPrint.columnDefinition = $filter('filter')(
        $scope.otherToDoGridOptions.columnDefinition,
        { printable: true }
      );
      ctrl.otherToDoPrint.getPrintHtml();
    }
    if ($scope.activeFltrTab === '6') {
      ctrl.treatmentPlansPrint = gridPrintFactory.CreateOptions();
      ctrl.treatmentPlansPrint.tabTitle = 'Print Treatment Plans';
      ctrl.treatmentPlansPrint.query = $scope.treatmentPlansGridOptions.query;
      ctrl.treatmentPlansPrint.filterCriteria =
        $scope.treatmentTabFilters.FilterCriteria;
      ctrl.treatmentPlansPrint.sortCriteria =
        $scope.treatmentTabFilters.SortCriteria;
      ctrl.treatmentPlansPrint.headerCaption = 'Treatment Plans';
      ctrl.treatmentPlansPrint.locations = [
        {
          LocationId: ctrl.selectedLocation.LocationId,
          LocationName: ctrl.selectedLocation.LocationName,
        },
      ];
      ctrl.treatmentPlansPrint.columnDefinition = $filter('filter')(
        $scope.treatmentPlansGridOptions.columnDefinition,
        { printable: true }
      );
      ctrl.treatmentPlansPrint.getPrintHtml();
    }
    if ($scope.activeFltrTab === '7') {
      ctrl.preventiveCarePrint = gridPrintFactory.CreateOptions();
      ctrl.preventiveCarePrint.tabTitle = 'Print Preventive Care';
      ctrl.preventiveCarePrint.query = $scope.preventiveCareGridOptions.query;
      ctrl.preventiveCarePrint.filterCriteria =
        $scope.preventiveCareTabFilters.FilterCriteria;
      ctrl.preventiveCarePrint.sortCriteria =
        $scope.preventiveCareTabFilters.SortCriteria;
      ctrl.preventiveCarePrint.headerCaption = 'Preventive Care';
      ctrl.preventiveCarePrint.locations = [
        {
          LocationId: ctrl.selectedLocation.LocationId,
          LocationName: ctrl.selectedLocation.LocationName,
        },
      ];
      ctrl.preventiveCarePrint.columnDefinition = $filter('filter')(
        $scope.preventiveCareGridOptions.columnDefinition,
        { printable: true }
      );
      ctrl.preventiveCarePrint.getPrintHtml();
    }
  };

  //#endregion

  // #region export to csv
  var csvFileName = '';
  var exportSuccess = function (result) {
    var csv = '';
    //for (var i = 0; i < result.length; i++) {
    //    csv += result[i];
    //}

    for (var i = 0; i < result.Value.CsvRows.length; i++) {
      csv += result.Value.CsvRows[i];
    }

    result = csv;

    if (navigator.msSaveBlob) {
      var blob = new Blob([result], {
        type: 'text/csv;charset=utf-8;',
      });

      window.navigator.msSaveOrOpenBlob(blob, csvFileName);
    } else {
      var element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(result)
      );
      element.setAttribute('download', csvFileName);
      element.setAttribute('target', '_blank');
      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  };

  var exportFailure = function (er) {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to export.', [
        'Patient management',
      ])
    );
  };

  $scope.exportCSV = function () {
    $scope.activeGridData.FilterCriteria.LocationId =
      ctrl.selectedLocation.LocationId;

    if ($scope.activeFltrTab === '1') {
      csvFileName = 'PM-Appointments-' + moment().format('M-DD-YYYY') + '.csv';
      // Send whatever to the modal ... you can pass in the activeGridData if needed.
      patientLandingModalFactory.getPatientExportModal({}, true).then(
        response => {
          // only process if response object is defined.
          if (response) {
            if (
              response.PatientMailing ||
              response.PatientEmail ||
              response.PatientPrimaryPhone ||
              response.PatientHomePhone ||
              response.PatientMobilePhone ||
              response.PatientWorkPhone ||
              response.ResponsibleMailing ||
              response.ResponsibleEmail ||
              response.ResponsiblePrimaryPhone ||
              response.ResponsibleHomePhone ||
              response.ResponsibleMobilePhone ||
              response.ResponsibleWorkPhone
            ) {
              var csvParams = {
                grid: $scope.activeGridData,
                contactInfo: response,
              };
              patientServices.AppointmentPatientTab.ExportToCSVFileWithContactInfo(
                csvParams
              ).$promise.then(exportSuccess, exportFailure);
            } else {
              patientServices.AppointmentPatientTab.ExportToCSVFile(
                $scope.activeGridData
              ).$promise.then(exportSuccess, exportFailure);
            }
          }
        },
        () => {
          console.log('Unexpected failure in patient landing export modal');
        }
      );
    } else if ($scope.activeFltrTab === '2') {
      csvFileName = 'PM-All-Patients-' + moment().format('M-DD-YYYY') + '.csv';
      // Send whatever to the modal ... you can pass in the activeGridData if needed.
      patientLandingModalFactory.getPatientExportModal({}, true).then(
        response => {
          // only process if response object is defined.
          if (response) {
            if (
              response.PatientMailing ||
              response.PatientEmail ||
              response.PatientPrimaryPhone ||
              response.PatientHomePhone ||
              response.PatientMobilePhone ||
              response.PatientWorkPhone ||
              response.ResponsibleMailing ||
              response.ResponsibleEmail ||
              response.ResponsiblePrimaryPhone ||
              response.ResponsibleHomePhone ||
              response.ResponsibleMobilePhone ||
              response.ResponsibleWorkPhone
            ) {
              var csvParams = {
                grid: $scope.activeGridData,
                contactInfo: response,
              };
              patientServices.AllPatientTab.ExportToCSVFileWithContactInfo(
                csvParams
              ).$promise.then(exportSuccess, exportFailure);
            } else {
              patientServices.AllPatientTab.ExportToCSVFile(
                $scope.activeGridData
              ).$promise.then(exportSuccess, exportFailure);
            }
          }
        },
        () => {
          console.log('Unexpected failure in patient landing export modal');
        }
      );
    } else if ($scope.activeFltrTab === '5') {
      csvFileName = 'PM-Other-To-Do-' + moment().format('M-DD-YYYY') + '.csv';
      // Send whatever to the modal ... you can pass in the activeGridData if needed.
      patientLandingModalFactory.getPatientExportModal({}, true).then(
        response => {
          // only process if response object is defined.
          if (response) {
            if (
              response.PatientMailing ||
              response.PatientEmail ||
              response.PatientPrimaryPhone ||
              response.PatientHomePhone ||
              response.PatientMobilePhone ||
              response.PatientWorkPhone ||
              response.ResponsibleMailing ||
              response.ResponsibleEmail ||
              response.ResponsiblePrimaryPhone ||
              response.ResponsibleHomePhone ||
              response.ResponsibleMobilePhone ||
              response.ResponsibleWorkPhone
            ) {
              var csvParams = {
                grid: $scope.activeGridData,
                contactInfo: response,
              };
              patientServices.OtherToDoTab.ExportToCSVFileWithContactInfo(
                csvParams
              ).$promise.then(exportSuccess, exportFailure);
            } else {
              patientServices.OtherToDoTab.ExportToCSVFile(
                $scope.activeGridData
              ).$promise.then(exportSuccess, exportFailure);
            }
          }
        },
        () => {
          console.log('Unexpected failure in patient landing export modal');
        }
      );
    } else if ($scope.activeFltrTab === '6') {
      csvFileName =
        'PM-Treatment-Plans-' + moment().format('M-DD-YYYY') + '.csv';

      // Send whatever to the modal ... you can pass in the activeGridData if needed.
      patientLandingModalFactory.getPatientExportModal({}, true).then(
        response => {
          // only process if response object is defined.
          if (response) {
            if (
              response.PatientMailing ||
              response.PatientEmail ||
              response.PatientPrimaryPhone ||
              response.PatientHomePhone ||
              response.PatientMobilePhone ||
              response.PatientWorkPhone ||
              response.ResponsibleMailing ||
              response.ResponsibleEmail ||
              response.ResponsiblePrimaryPhone ||
              response.ResponsibleHomePhone ||
              response.ResponsibleMobilePhone ||
              response.ResponsibleWorkPhone
            ) {
              var csvParams = {
                grid: $scope.activeGridData,
                contactInfo: response,
              };
              patientServices.TreatmentPlanTab.ExportToCSVFileWithContactInfo(
                csvParams
              ).$promise.then(exportSuccess, exportFailure);
            } else {
              patientServices.TreatmentPlanTab.ExportToCSVFile(
                $scope.activeGridData
              ).$promise.then(exportSuccess, exportFailure);
            }
          }
        },
        () => {
          console.log('Unexpected failure in patient landing export modal');
        }
      );
    } else if ($scope.activeFltrTab === '7') {
      csvFileName =
        'PM-Preventive-Care-' + moment().format('M-DD-YYYY') + '.csv';
      // Send whatever to the modal ... you can pass in the activeGridData if needed.
      patientLandingModalFactory.getPatientExportModal({}, true).then(
        response => {
          // only process if response object is defined.
          if (response) {
            if (
              response.PatientMailing ||
              response.PatientEmail ||
              response.PatientPrimaryPhone ||
              response.PatientHomePhone ||
              response.PatientMobilePhone ||
              response.PatientWorkPhone ||
              response.ResponsibleMailing ||
              response.ResponsibleEmail ||
              response.ResponsiblePrimaryPhone ||
              response.ResponsibleHomePhone ||
              response.ResponsibleMobilePhone ||
              response.ResponsibleWorkPhone
            ) {
              var csvParams = {
                grid: $scope.activeGridData,
                contactInfo: response,
              };
              patientServices.PreventiveCareTab.ExportToCSVFileWithContactInfo(
                csvParams
              ).$promise.then(exportSuccess, exportFailure);
            } else {
              patientServices.PreventiveCareTab.ExportToCSVFile(
                $scope.activeGridData
              ).$promise.then(exportSuccess, exportFailure);
            }
          }
        },
        () => {
          console.log('Unexpected failure in patient landing export modal');
        }
      );
    }
  };

  // #endregion

  $scope.$on('$destroy', function () {
    // unregister from observer for the appointment visibility
    appointmentViewVisibleService.clearObserver(
      ctrl.onAppointmentViewVisibleChange
    );
    appointmentViewVisibleService.setAppointmentViewVisible(false);
    appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);
  });

  // #region UnreadCommunication
  $scope.filterUnreadCommunication = function () {
    $scope.filteredUnreadCommunication = !$scope.filteredUnreadCommunication;
    $scope.disableFilter = true;
    if ($scope.activeFltrTab === '2') {
      $scope.allPatientsGridOptions.updateFilter(
        'HasUnreadCommunication',
        $scope.filteredUnreadCommunication
      );
      $scope.allPatientsGridOptions.refresh();
    } else if ($scope.activeFltrTab === '7') {
      $scope.preventiveCareGridOptions.updateFilter(
        'HasUnreadCommunication',
        $scope.filteredUnreadCommunication
      );
      $scope.preventiveCareGridOptions.refresh();
    } else if ($scope.activeFltrTab === '6') {
      $scope.treatmentPlansGridOptions.updateFilter(
        'HasUnreadCommunication',
        $scope.filteredUnreadCommunication
      );
      $scope.treatmentPlansGridOptions.refresh();
    } else if ($scope.activeFltrTab === '1') {
      $scope.appointmentsGridOptions.updateFilter(
        'HasUnreadCommunication',
        $scope.filteredUnreadCommunication
      );
      $scope.appointmentsGridOptions.refresh();
    }
  };
  $scope.addAPerson = function () {
    let patientPath = 'Patient/';
    $location.path(patientPath + 'Register/');
  };
  $scope.addAFamily = function () {
    let patientPath = 'Patient/';
    $location.path(patientPath + 'FamilyRegister/');
  };
  $scope.addAPersonOld = function () {
    let patientPath = 'Patient/';
    $location.path(patientPath + 'Create/');
  };
  // #endregion
}

PatientLandingController.prototype = Object.create(BaseCtrl.prototype);
