//'use strict';

var ScheduleControl = angular
    .module('Soar.Schedule')
    .controller('SchedulerController', SchedulerController);

SchedulerController.$inject = [
    '$scope',
    '$window',
    '$sce',
    '$uibModal',
    'PersonFactory',
    'patSecurityService',
    'appointmentTypes',
    'practiceSettings',
    'toastrFactory',
    'ModalFactory',
    'localize',
    'ScheduleServices',
    'ScheduleViews',
    'locations',
    'serviceCodes',
    'PatientServices',
    'ListHelper',
    'BoundObjectFactory',
    '$interval',
    '$filter',
    'SaveStates',
    'alertIcons',
    '$location',
    '$routeParams',
    '$timeout',
    'PatSharedServices',
    '$q',
    'ResourceService',
    'CustomEvents',
    'AppointmentService',
    'tabLauncher',
    'ApiDefinitions',
    'FinancialService',
    '$rootScope',
    'TimeZoneFactory',
    'SoarConfig',
    'patAuthenticationService',
    'practiceService',
    '$http',
    'FeatureService',
    'providersByLocation',
    'locationService',
    'holidays',
    'AppointmentsOpenTimeFactory',
    'RoleNames',
    'AppointmentUtilities',
    'MedicalHistoryAlertsFactory',
    'SchedulerUtilities',
    'referenceDataService',
    'ScheduleTextService',
    'ScheduleModalFactory',
    'ScheduleAppointmentModalService',
    'ScheduleBlockModalService',
    'ProviderShowOnScheduleFactory',
    'SchedulingApiService',
    'ColorUtilitiesService',
    'IdmConfig',
    'AppointmentStatusService',
    'NewAppointmentTypesService',
    'PinnedAppointmentsService',
    'ScheduleDisplayPlannedServicesService',
    'NewLocationsService',
    'NewRoomsService',
    'NewScheduleAppointmentUtilitiesService',
    'ScheduleProvidersService',
    'PracticesApiService',
    'ScheduleDisplayPatientService',
    'AppointmentTimeService',
    'LocationsDisplayService',
    'platformSessionService',
    'userSettingsDataService',
    'AppointmentViewLoadingService',
    'AppointmentViewVisibleService',
    'AppointmentViewDataLoadingService',
    'ClipboardAppointmentUpdateService',
    'ScheduleAppointmentHttpService',
    'ProviderAppointmentValidationService',
    'ConnectionEventMessageTypes',
    'FeatureFlagService',
    'FuseFlag',
    'SchedulingSignalrHub',
    'HolidaysService'
];

function SchedulerController(
    $scope,
    $window,
    $sce,
    $uibModal,
    personFactory,
    patSecurityService,
    appointmentTypes,
    practiceSettings,
    toastrFactory,
    modalFactory,
    localize,
    scheduleServices,
    scheduleViews,
    locations,
    serviceCodes,
    patientServices,
    listHelper,
    boundObjectFactory,
    $interval,
    $filter,
    saveStates,
    alertIcons,
    $location,
    $routeParams,
    $timeout,
    patSharedServices,
    $q,
    resourceService,
    CustomEvents,
    appointmentService,
    tabLauncher,
    apiDefinitions,
    financialService,
    $rootScope,
    timeZoneFactory,
    soarConfig,
    patAuthenticationService,
    practiceService,
    $http,
    featureService,
    providersByLocation,
    locationService,
    holidays,
    appointmentsOpenTimeFactory,
    roleNames,
    appointmentUtilities,
    medicalHistoryAlertsFactory,
    schedulerUtilities,
    referenceDataService,
    scheduleTextService,
    scheduleModalFactory,
    scheduleAppointmentModalService,
    scheduleBlockModalService,
    providerShowOnScheduleFactory,
    schedulingApiService,
    colorUtilitiesService,
    idmConfig,
    appointmentStatusService,
    appointmentTypesService,
    pinnedAppointmentsService,
    scheduleDisplayPlannedServicesService,
    locationsService,
    roomsService,
    scheduleAppointmentUtilitiesService,
    scheduleProvidersService,
    practicesApiService,
    scheduleDisplayPatientService,
    appointmentTimeService,
    locationsDisplayService,
    platformSessionService,
    userSettingsDataService,
    appointmentViewLoadingService,
    appointmentViewVisibleService,
    appointmentViewDataLoadingService,
    clipboardAppointmentUpdateService,
    scheduleAppointmentHttpService,
    providerAppointmentValidationService,
    ConnectionEventMessageTypes,
    featureFlagService,
    fuseFlag,
    schedulingSignalRHub,
    holidayService
) {
    BaseSchedulerCtrl.call(this, $scope, 'SchedulerController');
    var ctrl = this;
    //Start these variables are used to pass into Location Dropdown
    $scope.globalSelectedLocation = '';
    //End these variables are used to pass into Location Dropdown

    $scope.locationDDLoaded = false;

    // this variable helps determine when the appointment view is visible
    // it is controlled and reset using an observable setup.
    $scope.isAppointmentViewVisible = false;
    $scope.isSecondaryAppointmentViewVisible = false;
    //This is for tooltip text on hover of the block icon
    $scope.displayBlockTooltip = false;
    $scope.displayUnscheduledTooltip = false;

    // indicator to determine whether to show location abbr and timezone
    $scope.multipleLocationsSelected = false;

    // when true, disables the hour and provider sliders from being adjusted
    $scope.userSettingsBeingSaved = false;

    // When true, disables drag functionality on schedule
    $scope.appointmentBeingSaved = false;
    $scope.appointmnetSavedNeedRedraw = false;

    $scope.apptLocationHasChanged = false;

    ctrl.today = new Date();
    $scope.todayButtonDisabled = true;
    $scope.isMissingRequiredItems = false;
    $scope.showOpenTimeSearch = false;
    ctrl.refreshPending = false;
    $scope.showClipboard = false;
    ctrl.logout = false;

    $scope.showBanner = false;
    $scope.bannerIsExpanded = false;
    $scope.bannerTitle = "Live updates have stopped";
    $scope.bannerContentTitle = "The system will automatically attempt to restore live updates. Please, refresh the page to see the most recent information.";
    $scope.bannerContentDescription = `<br/>
    If the problem persists, contact customer support: <br/>
    Phone: 1-844-426-2304 <br/>
    Email: <a target="_blank" href="mailto:customersupport@pattersoncompanies.com">customersupport@pattersoncompanies.com</a>`;

    $scope.schedulerDestroy = false;

    $scope.selectedFilter = {
        selectedLocations: []
    };

    $rootScope.$on('fuse:logout', function () {
        ctrl.logout = true;
    });

    if ($routeParams.showClipboard) {
        $scope.showClipboard = $routeParams.showClipboard === 'true';
    }
    $scope.schedulePageText = scheduleTextService.getSchedulePageText();

    locationsService.locations = $scope.locations;

    // get and store the providersByLocation data and locations data
    // this allows an optimization while loading the appointment data later on.
    appointmentViewLoadingService.loadedLocations = locations;
    appointmentViewLoadingService.loadedProvidersByLocation = providersByLocation;
    // Register to be notified if the appointment view is closing

    // Lock to prevent race conditions
    ctrl.isSettingScheduleDataSource = false;

    //Set the data source for the scheduler
    ctrl.setSchedulerDataSource = function (dataSource, retryCount = 0) {
        const maxRetries = 10;

        if (ctrl.isSettingScheduleDataSource) {
            if (retryCount >= maxRetries) {
                toastrFactory.error($scope.schedulePageText.setScheduleDataSourceFailed, 'Error');
                console.error("Max retries reached. Schedule data source update failed.");
                return;
            }
            console.log("Schedule data source update in progress, waiting...");
            setTimeout(function () {
                ctrl.setSchedulerDataSource(dataSource, retryCount + 1);
            }, 40);
        } else {
            ctrl.isSettingScheduleDataSource = true;
            $scope.scheduler.setDataSource(dataSource);
            ctrl.isSettingScheduleDataSource = false;
        }
    };

    ctrl.onAppointmentViewVisibleChange = function (
        isVisible,
        isSecondaryVisible
    ) {
        let data = appointmentViewLoadingService.currentAppointmentSaveResult;

        // reset the drag data and slots to ensure the view can be used again without issue.
        //TODO: figure out at a later time how to have this only run when you close the modal without saving.
        // Fixing the above would be a little more performant.
        if ($scope.isAppointmentViewVisible !== isVisible) {
            ctrl.resetDragSlots();
            ctrl.resetDragData();
        }

        // in case the route parameter was set reset it.
        if (isVisible === false && $scope.isAppointmentViewVisible !== isVisible) {
            $location.search('open', null);
            $scope.routeParams.open = null;
        }

        $scope.isAppointmentViewVisible = isVisible;
        $scope.isSecondaryAppointmentViewVisible = isSecondaryVisible;

        if (
            (!isVisible || !isSecondaryVisible) &&
            data !== null &&
            data !== undefined
        ) {
            ctrl.appointmentSaved(data);
        }
    };
    appointmentViewVisibleService.registerObserver(
        ctrl.onAppointmentViewVisibleChange
    );
    // end registration and handling

    // setup observable for handling clipboard appointment updates
    ctrl.onClipboardAppointmentChange = function () {
        $scope.getAndSetPinnedAppointments();
    };
    clipboardAppointmentUpdateService.registerObserver(
        ctrl.onClipboardAppointmentChange
    );

    ///This implements Feature Flag
    ctrl.checkFeatureFlags = function () {
        featureFlagService.getOnce$(fuseFlag.DisableStatusIconOnAppointmentCard).subscribe((value) => {
            $scope.DisableStatusIconFeatureFlag = value;
        });

        featureFlagService.getOnce$(fuseFlag.CreateApptColorProvColorToggle).subscribe((value) => {
            $scope.ApptColorProvColorToggleFF = value;
        });

        featureFlagService.getOnce$(fuseFlag.LiveUpdatesVisibilityCheck).subscribe((value) => {
            $scope.useVisibilityCheck = value;
        });
    };

    // we want to translate the status text so that we do not keep translating that all the time in the control.
    // this should be in a startup function however as it stands it will have to live here for the time being.
    var status = appointmentStatusService.getStatuses();
    appointmentStatusService.appointmentStatuses = scheduleTextService.getAppointmentStatusesTranslated(
        status
    );

    ctrl.providersByLocation = !_.isEmpty(providersByLocation)
        ? providersByLocation
        : [];

    $scope.MaxNoteLength = 512;

    //#region Authorization
    // view access
    ctrl.authAccess = function () {
        if (patSecurityService.IsAuthorizedByAbbreviation('soar-sch-sch-view')) {
            $scope.hasViewAccess = true;
        } else {
            toastrFactory.error(
                patSecurityService.generateMessage('soar-sch-sch-view'),
                'Not Authorized'
            );
            event.preventDefault();
            $location.path('/');
        }
    };

    // authorization
    ctrl.authAccess();

    // #endregion

    $scope.onBannerToggle = onBannerToggle;
    function onBannerToggle(param) {
        $scope.bannerIsExpanded = !$scope.bannerIsExpanded;
    }
    $scope.setBannerVisibility = setBannerVisibility;
    function setBannerVisibility(value) {
        $scope.showBanner = value;
        $scope.$digest(); // force the ui to update with this new value
    }

    ctrl.ClassificationEnum = {
        Appointment: { Name: 'Appointment', Value: 0 },
        UnscheduledAppointment: { Name: 'Unscheduled Appointment', Value: 2 },
        Block: { Name: 'Block', Value: 1 },
    };
    //#region support showOnSchedule

    // determine if user has a current exception for this location
    ctrl.findMatchingException = findMatchingException;

    function findMatchingException(provider, locationId) {
        var exception = $filter('filter')(
            provider.ShowOnScheduleExceptions,
            function (exc) {
                return exc.LocationId === locationId;
            }
        );
        return exception.length > 0 ? exception[0] : null;
    }

    //#endregion

    // #region Functions
    // #region Service Calls -- If it calls a domain service, it and it's success and error functions belong here!

    ctrl.getAppointmentModalDataFailed = function () {
        ctrl.resetDragSlots();
        ctrl.resetDragData();
        toastrFactory.error(
            $scope.schedulePageText.appointmentModalDataFailed,
            'Error'
        );
    };

    ctrl.lastAppointmentCall = {
        from: new Date(),
        to: new Date(),
    };

    ctrl.getAppointments = getAppointments;

    function getAppointments(from, to) {
        //$fuseUtil.log(getAppointments, arguments, {collapseGroup: true});

        ctrl.refreshPending = true;

        $scope.scheduleDateStart = from;
        $scope.setDayViewTitle();

        $scope.scheduleDateEnd = to;

        // this is supposed to ensure the format we pass to the service is not serialized wrong.
        // this way the server will just accept what we give it and do the predicate matching.
        // note that we are not passing 'z' as that would cause the dates to serialize wrong for how we are using them with this.
        var locationTimezoneName = $scope.selectedLocation.timezoneInfo.momentTz;
        //var y = x.setHours(x.getHours() + (number * 24))
        // if dayview ... endTime is startTime plus one day ...
        // if weekview ... endTime is startTime plus 7 days ...
        from = timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObjectNew(
            $scope.scheduleDateStart,
            locationTimezoneName
        );
        var viewName = $scope.scheduler.view().name;
        var number = 1;
        if (viewName === 'week') {
            number = 7;
        }

        // if I do not do this then the start date changes.
        var disconnectedStartDate = _.cloneDeep($scope.scheduleDateStart);
        var endDate = disconnectedStartDate.setDate(
            disconnectedStartDate.getDate() + number
        );
        to = timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObjectNew(
            endDate,
            locationTimezoneName
        );

        ctrl.lastAppointmentCall.from = _.cloneDeep(from);
        ctrl.lastAppointmentCall.to = _.cloneDeep(to);

        $scope.getAppointmentsCompleted = false;

        ctrl.providersLoaded = false;
        ctrl.appointmentsLoaded = false;

        ctrl.setHolidays();
        ctrl.hoursForDay = {};

        // Adding a Pre-Security Check to Cut Down on 401 Requests we are sending to the Scheduling API.
        let appSecurityCheck = patSecurityService.IsAuthorizedByAbbreviation(
            'soar-sch-sptapt-view'
        );
        let provHoursSecurityCheck = patSecurityService.IsAuthorizedByAbbreviation(
            'soar-sch-sprvhr-view'
        );
        if (appSecurityCheck && provHoursSecurityCheck) {
            let daysToInclude = [];
            if ($scope.schedViewName === 'week') {
                var currentDate = moment($scope.calendarPickerDate);
                var weekStart = currentDate.clone().startOf('week');
                for (var i = 0; i <= 6; i++) {
                    let date = moment(moment(weekStart).add(i, 'days')).format(
                        'YYYY-MM-DD'
                    );
                    if (!ctrl.dateIsAHoliday(date)) {
                        let thisDate = timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObjectNew(
                            date,
                            locationTimezoneName
                        );
                        daysToInclude.push(thisDate);
                    }
                }
            } else {
                // don't get the occurrences if this is a holiday
                let dateOnly = moment($scope.calendarPickerDate).format('YYYY-MM-DD');
                if (!ctrl.dateIsAHoliday(dateOnly)) {
                    let thisDate = timeZoneFactory.GetLocationLocalizedUtcDateTimeFromSystemDateObjectNew(
                        $scope.calendarPickerDate,
                        locationTimezoneName
                    );
                    daysToInclude.push(thisDate);
                }
            }
            let locationIds = _.map(
                $scope.selectedFilter.selectedLocations,
                'LocationId'
            );

            // we do not want to attempt to get providerHoursOccurrences if today is a holiday because API will throw an exception
            if (
                daysToInclude !== null &&
                daysToInclude !== undefined &&
                daysToInclude.length > 0
            ) {
                schedulingApiService
                    .getProviderHourOccurrences(daysToInclude, locationIds)
                    .then(
                        ctrl.getScheduleForProviderSuccessNew,
                        ctrl.getScheduleForProviderFailed
                    );
            }

            if ($scope.schedViewName === 'week') {
                schedulingApiService
                    .getWeekViewAppointments(from, to, locationIds)
                    .then(ctrl.GetAppointmentsOnSuccessNew, ctrl.GetAppointmentsOnError);
            } else {
                schedulingApiService
                    .getDayViewAppointments(from, to, locationIds)
                    .then(ctrl.GetAppointmentsOnSuccessNew, ctrl.GetAppointmentsOnError);
            }

            ctrl.setProviders(scheduleProvidersService.providers);
        } else {
            toastrFactory.error(
                'You do not have access to view appointments on the schedule',
                'Info'
            );
        }
    }

    ctrl.GetAppointmentsOnError = function (err) {
        ctrl.refreshPending = false;

        toastrFactory.error($scope.schedulePageText.appointmentsOnError, 'Error');
    };

    ctrl.shapeAppointmentData = shapeAppointmentData;

    function shapeAppointmentData(appt, apptDetails) {
        // code loops through service codes ... when we have an alternative method we could utilize to not have to do that.
        // figure out how to convert all usages of this to the code that calls this method in stead ...appointmentService.AppendSomeDetails
        appointmentService.AppendDetails(appt, apptDetails);
        //appointmentService.AppendSomeDetails(appt, apptDetails);
        // prevent overwriting signalr data on update if no patient alerts in details
        if (!_.isEmpty(apptDetails.PatientAlerts)) {
            appt.Alerts = apptDetails.PatientAlerts;
        }

        if (!_.isEmpty(apptDetails.MedicalAlerts)) {
            var medicalAlerts = [];
            _.forEach(apptDetails.MedicalAlerts, function (alert) {
                if (alert.GenerateAlert) {
                    medicalAlerts.push({
                        Description: alert.MedicalHistoryAlertDescription,
                        IsMedicalHistoryAlert: true,
                        TypeId: alert.MedicalHistoryAlertTypeId,
                    });
                }
            });
            appt.MedicalAlerts = medicalAlerts;
        } else {
            appt.MedicalHistoryAlertIds = apptDetails.MedicalHistoryAlertIds;
        }
        // This should be done in a different place.
        timeZoneFactory.ConvertAppointmentDatesTZ(appt);
    }

    ctrl.GetAppointmentsOnSuccessNew = GetAppointmentsOnSuccessNew;

    function GetAppointmentsOnSuccessNew(res) {
        //New code flagged
        if ($scope.DisableStatusIconFeatureFlag === true) {
            res = _.filter(res, function (res) {
                $scope.disableAppointmentCardStatusDropdown(res);
                return res;
            });
        }


        // Evaluate when time allows if the variables are still used, each of these is a guard clause, they can cause problems ...
        // try to remove as time allows.
        ctrl.refreshPending = true; // ensure it is true again to block refreshing until the end.

        $scope.getAppointmentsCompleted = true;
        ctrl.setSchedulerState(ctrl.schedulerStates.Loading);

        // check if ctrl.medicalAlerts exists
        if (!ctrl.medicalAlerts) {
            medicalHistoryAlertsFactory.MedicalHistoryAlerts().then(medAlertRes => {
                ctrl.MedicalHistoryAlertsOnSuccess(medAlertRes);
                postProcessAppointmentResponseNew(res);
            }, ctrl.MedicalHistoryAlertsOnError);
        } else {
            postProcessAppointmentResponseNew(res);
        }
    }

    ctrl.prepareAppointmentForDisplay = prepareAppointmentForDisplay;
    function prepareAppointmentForDisplay(appointment, serviceCodes) {
        let appt = appointment;

        ////////////////// things that are added to the appointment
        appt.Room = roomsService.findByRoomId(appt.TreatmentRoomId);
        appt.treatmentRoomName = appt.Room ? appt.Room.Name : '';

        appt.providerName = appt.Providers ? appt.treatmentRoomName : '';

        // the below line will be assigned a lot earlier after more rounds of refactoring
        appt.Location = locationsService.findByLocationId(appt.LocationId);
        appt.locationName = appt.Location ? appt.Location.NameLine1 : '';


        // Process Amount and Services.
        // -- we need to ensure Appointment Type is processed before this method otherwise the logic will not process correctly
        appt = scheduleDisplayPlannedServicesService.setAppointmentServiceDisplayTextAndAmount(
            appt,
            appt.PlannedServices,
            serviceCodes
        );

        appt.amount = $filter('currency')(appt.amount);

        appt = appointmentTimeService.convertScheduleAppointmentDates(appt);

        appt = appointmentStatusService.setAppointmentStatus(appt);

        // make a patient section in the schedule display service move this to that.
        if (appt.Patient) {
            appt.patientDisplayName = scheduleDisplayPatientService.formatPatientNameForScheduleCard(
                appt.Patient
            );
            appt.patientCode = appt.Patient.PatientCode;
        } else {
            appt.patientDisplayName = '';
            appt.patientCode = '';
        }

        appt = ctrl.setAppointmentAlertData(appt);

        appt.showAppointmentIcon = true;

        ctrl.addProviderIdsToAppointment(appt);

        // populate providerName
        if (
            appt.Providers &&
            appt.Providers.length > 0 &&
            appt.Providers[0] != ''
        ) {
            var provider = scheduleProvidersService.findByUserId(appt.Providers[0]);
            appt.providerName = provider ? provider.Name : '';
        } else {
            appt.providerName = '';
        }

        appt.examiningDentistName = '';
        if (appt.ExaminingDentist != null) {
            var tempExaminingProvider = scheduleProvidersService.findByUserId(
                appt.ExaminingDentist
            );
            appt.examiningDentistName = tempExaminingProvider
                ? tempExaminingProvider.Name
                : '';
        } else {
            appt.examiningDentistName = appt.IsExamNeeded
                ? 'Any Dentist'
                : 'No Exam Needed';
        }

        appt.showExaminingDentist = ctrl.IncludeExaminingDentistElement(appt);

        // set the minutes between start and end time to utilize in two different assignments
        var minuteDifference = $filter('minutes')(
            appt.end.getTime() - appt.start.getTime()
        );

        appt.hasConflicts =
            $scope.hasProviderConflict(appt) &&
            $scope.canAccommodateWarning(minuteDifference) &&
            appt.Classification != 1;

        appt.displayTime =
            $filter('date')(appt.start, 'h:mm a').toLowerCase() +
            ' - ' +
            $filter('date')(appt.end, 'h:mm a').toLowerCase() +
            ' ' +
            appt.tz +
            ' (' +
            minuteDifference +
            ' min)';
        // hopefully TimeIncrement is set at this point so we can figure out the slots used for the appointment.
        appt.slotsUsed = minuteDifference / $scope.TimeIncrement;

        // set the appointment color
        ctrl.setProviderAndAppointmentColors(appt);

        return appt;
    }


    ctrl.postProcessAppointmentResponseNew = postProcessAppointmentResponseNew;
    ctrl.users = [];

    function getProviders() {
        referenceDataService.getData(referenceDataService.entityNames.users)
            .then(function (users) {
                ctrl.users = users;
            });
    }

    getProviders();

    function postProcessAppointmentResponseNew(appts) {
        var apptList = [];
        ctrl.serviceCodes = serviceCodes;

        _.forEach(appts, function (resVal, index) {
            if (
                _.isEmpty(resVal.MedicalAlerts) &&
                !_.isNil(resVal.MedicalHistoryAlertIds) &&
                !_.isEmpty(resVal.MedicalHistoryAlertIds)
            ) {
                if (!_.isNil(resVal) && !_.isEmpty(resVal.MedicalAlerts)) {
                    resVal.MedicalAlerts = resVal.MedicalAlerts;
                } else {
                    let alerts = [];
                    let alertIds = resVal.MedicalHistoryAlertIds;
                    if (alertIds) {
                        _.forEach(alertIds, function (alertId) {
                            let alert = _.find(ctrl.medicalAlerts, { SymbolId: alertId });
                            if (alert) {
                                alerts.push(alert);
                            }
                        });
                    }
                    resVal.MedicalAlerts = alerts;
                }
            }

            resVal.PlannedServices = resVal.PlannedServices
                ? resVal.PlannedServices
                : [];
            resVal.Providers = [];

            angular.forEach(
                resVal.ProviderAppointments,
                function (providerAppointment) {
                    providerAppointment.ObjectState = saveStates.None;
                }
            );

            _.forEach(resVal.ProviderUsers, function (user, index) {
                if (index == 0) {
                    var pd = user.ProfessionalDesignation
                        ? ', ' + user.ProfessionalDesignation
                        : '';
                    resVal.Provider = {
                        Name: user.FirstName + ' ' + user.LastName + pd,
                        UserCode: user.UserCode,
                        UserId: user.UserId,
                        ProviderTypeId: user.ProviderTypeId,
                        ProviderTypeViewId: null,
                    };
                }
            });
            // prevent overwriting signalr data on update if no patient alerts in details
            if (!_.isEmpty(resVal.PatientAlerts)) {
                resVal.Alerts = resVal.PatientAlerts;
            }
            var appt = ctrl.prepareAppointmentForDisplay(resVal, ctrl.serviceCodes);
            appt.id = index;
            apptList.push(appt);
        });

        //console.log('Count of appointments loaded: ' + apptList.length);
        ctrl.isRefreshPending = false;
        ctrl.apps = apptList;

        const mappedAppointments = _.map(apptList, ctrl.mapAppointmentResponseToViewModel);
        ctrl.appointments = new kendo.data.SchedulerDataSource({
            data: mappedAppointments,
        });


        ctrl.setSchedulerDataSource(ctrl.appointments);
        ctrl.setSchedulerState(ctrl.schedulerStates.None);
        ctrl.refreshPending = false;

        // need to check if this is still doing what we think at this point.
        // this code re-filters the list for each change.
        $scope.getAndSetPinnedAppointments();

        // this probably will not work right ...
        // need to remove filtering all together and do it before the page is loaded.
        // this is probably a bug in some respects I need to understand the filters more.
        var filters = ctrl.getProviderFilters();
        if (filters !== null) {
            ctrl.updateScheduleView();
        }

        // During some cases provider hours will finish after the appointment call. To ensure that ideal days are setup
        // I am not setting up ideal days until both appointments and provider data has loaded.
        ctrl.appointmentsLoaded = true;

        if (ctrl.providersLoaded) {
            //console.log('Ideal Days Called by Appointments loading');
            ctrl.addIdealDaysTemplateColors();
            ctrl.scrollToElement(1);
        }
    }
    ctrl.setProviderAndAppointmentColors = function (appt) {

        appt = appointmentTypesService.setAppointmentTypeWithBaseColorsAndStyles(appt);

        if ($scope.ApptColorProvColorToggleFF === true) {
            appt.providerColors = {};
            appt.Providers.forEach(function (provider) {
                const providerLocal = ctrl.users.find(user => user.UserId === provider);

                if (providerLocal) {
                    const providersLocationPreferences = providerLocal.Locations.find(loc => loc.LocationId === appt.LocationId);

                    if (providersLocationPreferences && providersLocationPreferences.Color != null) {
                        appt.providerColors[provider] = appointmentTypesService.getRgbFormattedFromHex(providersLocationPreferences.Color);
                    }
                    else {
                        var apptType = appointmentTypesService.findByAppointmentTypeId(appt.AppointmentTypeId);
                        const typeColor = appointmentTypesService.getAppointmentTypeColors(apptType, appt.Status);

                        appt.providerColors[provider] = typeColor;
                    }
                }
            });
        }
    }

    // move to scheduleDisplayService probably
    ctrl.IncludeExaminingDentistElement = function (appointment) {
        let includeElement = false;

        if (
            appointment != null &&
            appointment.Providers != null &&
            appointment.Providers.length > 0 &&
            appointment.Providers[0] != ''
        ) {
            if (
                appointment.Classification !== ctrl.ClassificationEnum.Appointment.Value
            ) {
                return false;
            }

            let isHygienistAppointmentType = null;

            if (appointment.AppointmentType != null) {
                isHygienistAppointmentType =
                    appointment.AppointmentType.PerformedByProviderTypeId == 2;
            } else {
                return false;
            }

            var primaryProvider = scheduleProvidersService.findByUserId(
                appointment.Providers[0]
            );
            if (!_.isNil(primaryProvider)) {
                includeElement = isHygienistAppointmentType;
            }
        }

        return includeElement;
    };

    // move to scheduledisplayservice if we can figure out how to extract all the dependencies.
    // maybe even a schedule alert service not sure.
    ctrl.setAppointmentAlertData = setAppointmentAlertData;

    function setAppointmentAlertData(appt) {
        var icon;

        appt.MedicalAlerts = _.sortBy(appt.MedicalAlerts, ['Description']);
        appt.Alerts = _.sortBy(appt.Alerts, ['Description']);

        // Show alert if patient requires premedication.
        var index = _.findIndex(appt.MedicalAlerts, ['TypeId', 3]);
        if (index >= 0) {
            appt.premedicationDescription = appt.MedicalAlerts[index].Description;
        } else {
            appt.premedicationDescription = null;
        }

        // Show all medical alerts in a tooltip collapsed into one icon.
        var medicalAlerts = _.filter(appt.MedicalAlerts, ['TypeId', 2]);
        if (medicalAlerts.length > 0) {
            var alertsToolTip = ctrl.createAlertToolTip(medicalAlerts);
            appt.medicalAlertClass = $scope.alertIcons.getClassById(2, true);
            appt.medicalAlertText = alertsToolTip;
        } else {
            appt.medicalAlertClass = '';
            appt.medicalAlertText = null;
        }

        // Show all allergy alerts in a tooltip collapsed into one icon.
        var allergies = _.filter(appt.MedicalAlerts, ['TypeId', 1]);
        if (allergies.length > 0) {
            var allergiesToolTip = ctrl.createAlertToolTip(allergies);
            appt.allergyText = allergiesToolTip;
        } else {
            appt.allergyText = null;
        }

        // Separate Master Flags from Custom Flags and filter out alerts with no icon.
        var masterAlerts = _.filter(appt.Alerts, function (alert) {
            return !_.isNil(alert.MasterAlertId) && alert.SymbolId != null;
        });

        // Individually show each Master Flag.
        appt.masterFlags = [];

        for (var i = 0; i < masterAlerts.length; i++) {
            icon = $scope.alertIcons.getClassById(
                parseInt(masterAlerts[i].SymbolId),
                masterAlerts[i].IsMedicalHistoryAlert
            );
            if (icon > '') {
                appt.masterFlags.push({
                    class: icon,
                    desc: masterAlerts[i].Description,
                });
            }
        }

        var customAlerts = _.filter(appt.Alerts, function (alert) {
            return _.isNil(alert.MasterAlertId) && alert.SymbolId != null;
        });

        // Show all Custom Flags in a tooltip collapsed into one icon.
        if (customAlerts.length > 0) {
            var customAlertsToolTip = ctrl.createAlertToolTip(customAlerts);
            appt.customFlagClass = $scope.alertIcons.getClassById(
                customAlerts[0].SymbolId,
                false
            );
            appt.customFlagText = customAlertsToolTip;
        } else {
            appt.customFlagClass = '';
            appt.customFlagText = null;
        }

        // Show any appointment notes.
        if (appt.Note > '') {
            var noteToolTip =
                appt.Note.length <= $scope.MaxNoteLength
                    ? appt.Note
                    : appt.Note.slice(0, $scope.MaxNoteLength);
            appt.noteAlertText = noteToolTip;
        } else {
            appt.noteAlertText = null;
        }

        return appt;
    }

    ctrl.finalizeRoomSetup = finalizeRoomSetup;

    function finalizeRoomSetup() {
        // might want to change this so that we just get the rooms from the locationsService
        // ... not necessarily the most important thing right now.
        $scope.treatmentRooms = roomsService.findAllByLocationId(
            $scope.selectedLocation.LocationId
        );

        $scope.selectedRooms = $scope.treatmentRooms;
        $scope.selectedFilter.selectedRooms = $scope.treatmentRooms;
        ctrl.refreshPending = true;
        $scope.$watch(
            'selectedFilter.selectedRooms',
            function (nv, ov) {
                if (nv != null && ov != null && nv !== ov) {
                    if (ctrl.refreshPending === false) {
                        ctrl.selectedRoomsChanged(nv, ov);
                    }
                }
            },
            true
        );

        $scope.fillRoomLocationTimezoneAbbr();

        if ($scope.treatmentRooms.length > 12) {
            $scope.roomMaxLength = 12;
        }

        var startPosition = 21; // slider minimum position
        var endPosition = 215; // slider maximum position
        var sliderLength = endPosition - startPosition; // length of slider
        var doubleDigitAdj = 4;
        var pos =
            startPosition +
            ($scope.sliderValues.roomsToShow - 1) *
            (sliderLength / ($scope.roomMaxLength - 1));
        pos = $scope.sliderValues.roomsToShow >= 10 ? pos - doubleDigitAdj : pos;
        $('#roomSliderLabel').css({
            'margin-left': pos + 'px',
            'margin-top': '-56px',
        });

        ctrl.treatmentRoomsLoading = false;

        // make plans to evaluate why this timeout is present.
        $timeout(ctrl.forceRoomsToShowWithinRange);
        if (ctrl.activeGroup === 'room') {
            $scope.shiftResources(0);

            ctrl.applyUserColumnOrder();
        }
    }

    ctrl.getUserSettingsFailed = function (error) {
        ctrl.userSettingsExist = false;
        if (error.status !== 404) {
            toastrFactory.error($scope.schedulePageText.userSettingsFailed, 'Error');
        }
    };

    ctrl.getUserSettingsSuccess = function (result) {
        ctrl.applyUserSettings(result);
    };

    ctrl.getUserSettings = function () {
        userSettingsDataService
            .getUserSettings()
            .then(ctrl.getUserSettingsSuccess, ctrl.getUserSettingsFailed);
        // old service still used in other places is userSettingsService still used in payment-confirmation-controller and tests and defined in common services
    };

    ctrl.saveUserSettings = saveUserSettings;

    function saveUserSettings() {
        $scope.userSettingsBeingSaved = true;

        $scope.userSettings =
            $scope.userSettings != null ? $scope.userSettings : {};

        // merge the current userColumnOrder to the dataset
        schedulerUtilities.mergeScheduleColumnOrder(
            ctrl.scheduleColumnOrder,
            ctrl.userColumnOrder
        );
        // IsScheduleInPrivacyMode already set earlier
        $scope.userSettings.ScheduleColumnOrder = JSON.stringify(
            ctrl.scheduleColumnOrder
        );
        $scope.userSettings.DefaultProviderColumnCount =
            $scope.sliderValues.providersToShow;
        $scope.userSettings.DefaultRoomColumnCount =
            $scope.sliderValues.roomsToShow;
        $scope.userSettings.DefaultScheduleViewType =
            ctrl.activeGroup === $scope.schedulerGroups.provider ? 1 : 2;
        $scope.userSettings.DefaultHourColumnCount =
            parseInt($scope.sliderValues.activeIncrementIndex) + 1;
        $scope.userSettings.IsScheduleInPrivacyMode =
            $scope.isScheduleInPrivacyMode;
        $scope.userSettings.RoomViewAppointmentColorType =
            $scope.roomViewAppointmentColorType;

        if (ctrl.userSettingsExist) {
            userSettingsDataService
                .updateScheduleUserSettings($scope.userSettings)
                .then(ctrl.saveUserSettingsSucceeded, ctrl.saveUserSettingsFailed);
            //userSettingHttpService.clearUserSettingCache();
        } else {
            userSettingsDataService
                .saveScheduleUserSettings($scope.userSettings)
                .then(ctrl.saveUserSettingsSucceeded, ctrl.saveUserSettingsFailed);
            //userSettingHttpService.clearUserSettingCache();
        }
    }

    ctrl.saveUserSettingsFailed = function (error) {
        toastrFactory.error(
            $scope.schedulePageText.userSettingsFailedToSave,
            'Error'
        );

        $scope.userSettingsBeingSaved = false;
    };

    ctrl.saveUserSettingsSucceeded = function (result) {
        if (!$scope.schedulerDestroy) {
            toastrFactory.success(
                $scope.schedulePageText.userSettingsSaved,
                'Success'
            );
            ctrl.applyUserSettings(result.data.Value);
            $scope.schedulerDestroy = false;
        }

        $scope.userSettingsBeingSaved = false;
    };

    // move to pinnedAppointmentService part of this code
    ctrl.appointmentsForPinnedAppointmentArea = function (result) {
        ctrl.serviceCodes = serviceCodes;

        $scope.loadingPinnedAppointments = false;

        pinnedAppointmentsService.allPinnedAppointments = [];
        pinnedAppointmentsService.initializePinnedAppointmentsForSchedule(
            result,
            ctrl.serviceCodes,
            $scope.schedulePageText.anyProvider,
            $scope.isScheduleInPrivacyMode
        );

        // the following method actually filters the pinned array
        $scope.getAndSetPinnedAppointments();
    };

    // this method is for transforming the data to a format the next method understands.
    ctrl.transformPinnedAppointmentsFromApi = function (res) {
        let result = res;
        ctrl.appointmentsForPinnedAppointmentArea(result);
    };

    $scope.loadingPinnedAppointments = false;
    ctrl.getUnscheduledAppointments = function () {
        $scope.isLoading = true;
        if ($scope.loadingPinnedAppointments === false) {
            $scope.loadingPinnedAppointments = true;

            schedulingApiService
                .getPinnedAppointmentsByPractice()
                .then(
                    ctrl.transformPinnedAppointmentsFromApi,
                    ctrl.getPinnedAppointmentsError
                );
        }
    };

    ctrl.getPinnedAppointmentsError = function (err) {
        ctrl.refreshPending = false;
        toastrFactory.error(
            $scope.schedulePageText.pinnedAppointmentsOnError,
            'Error'
        );
    };

    // This method will be redone in the future and moved to a service that will handle processing of pinned appointments on the client.
    ctrl.AfterAppointmentDeleted = function () {
        pinnedAppointmentsService.removePinnedAppointmentIfItExists(
            $scope.unscheduledAppointmentToDelete.Data.AppointmentId
        );

        $scope.unscheduledAppointmentToDelete = null;
    };

    ctrl.confirmDelete = function () {
        if ($scope.unscheduledAppointmentToDelete != null) {
            $scope.unscheduledAppointmentToDelete.Delete();
        }
    };

    ctrl.cancelDelete = function () {
        $scope.unscheduledAppointmentToDelete = null;
    };

    ctrl.confirmRemoveClipboardAppointment = function () {
        $scope.clipboardAppointmentToRemove.IsPinned = false; //This variable is important! Don't remove. We don't want validation to be performed when deleting unscheduled appointment from clipboard
        var wasPinned = true;
        $scope.saveAppointment($scope.clipboardAppointmentToRemove, wasPinned);
    };

    ctrl.cancelRemoveClipboardAppointment = function () {
        $scope.clipboardAppointmentToRemove = null;
    };

    ctrl.clearAppointment = function (focusOnPatient, afterSave) {
        /** need to find typeahead and manually call focus since element is already created before it's opened */
        if (focusOnPatient) {
            var element = angular.element('#patientUnscheduledSearchTypeahead');
            element.find('input').focus();
        }

        ctrl.clearPatient();

        ctrl.clearAppointmentData(afterSave);
    };

    ctrl.clearAppointmentExceptForPatient = clearAppointmentExceptForPatient;

    function clearAppointmentExceptForPatient() {
        /** need to find typeahead and manually call focus since element is already created before it's opened */
        if (!$scope.hasPatient) {
            var element = angular.element('#patientUnscheduledSearchTypeahead');
            element.find('input').focus();
        }

        ctrl.clearAppointmentData();
    }

    ctrl.clearPatient = clearPatient;

    function clearPatient() {
        if ($scope.hasPatient) {
            $scope.clearPatientSearch();
            $scope.hasPatient = false;
        }

        $scope.appointment.Data.PersonId = null;
        $scope.selectedPatient = null;
    }

    ctrl.clearAppointmentData = clearAppointmentData;

    function clearAppointmentData(afterSave) {
        $scope.appointment.Data.AppointmentId = null;
        $scope.appointment.Data.ProviderAppointments = [];
        $scope.appointment.Data.PlannedServices = [];
        $scope.appointment.Data.ServiceCodes = [];
        $scope.appointment.Data.ProposedDuration = $scope.minutes[0];

        // if provider doesn't have an appointment type id coming in from ideal days, we need to reset the dropdown
        if (!$scope.appointment.Data.AppointmentTypeId) {
            $scope.appointment.Data.AppointmentTypeId = null;
        }

        if (afterSave == true || $scope.isOpen == false) {
            switch ($scope.appointment.Data.Classification) {
                case ctrl.ClassificationEnum.Appointment.Value:
                    ctrl.clearAppointmentForRegular();
                    break;
                case ctrl.ClassificationEnum.Block.Value:
                    ctrl.clearAppointmentForBlock();
                    break;
                case ctrl.ClassificationEnum.UnscheduledAppointment.Value:
                    ctrl.clearAppointmentForUnscheduled();
                    break;
            }

            $scope.appointment.Data.UserId = null;
            $scope.appointment.Data.AppointmentTypeId = null;
            $scope.appointment.Data.WasDragged = false;
        }

        $scope.appointment.Valid = true;
    }

    ctrl.clearAppointmentForUnscheduled = function (wantsToSave) {
        if (wantsToSave != true) {
            $scope.appointment.Data.ProposedDuration = $scope.minutes[0];
        }
        $scope.appointment.Data.StartTime = null;
        $scope.appointment.Data.EndTime = null;

        $scope.appointmentDate.Value = null;
        $scope.appointmentTime = {
            date: null,
            start: null,
            end: null,
        };
    };

    ctrl.clearAppointmentForRegular = function () {
        $scope.appointment.Data.ProposedDuration = null;
    };

    ctrl.clearAppointmentForBlock = clearAppointmentForBlock;
    function clearAppointmentForBlock() {
        $scope.appointment.Data.ProposedDuration = null;
        $scope.appointment.Data.AppointmentTypeId = null;

        if (validationLogic.InRoomView()) {
            $scope.appointment.Data.UserId = null;
        } else {
            $scope.appointment.Data.TreatmentRoomId = null;
        }
    }

    ctrl.setRequiresPatient = function (classification) {
        $scope.requiresPatient =
            classification.Value != ctrl.ClassificationEnum.Block.Value;
    };

    ctrl.setAppointmentDateTime = setAppointmentDateTime;

    function setAppointmentDateTime(dateObject, timeObject) {
        if (!dateObject || !timeObject.start || !timeObject.end) return;

        // Convert time to date and set appointment.Data.StartTime/EndTime
        var date = dateObject ? new Date(dateObject) : null;

        var startWithDate = timeObject.start ? new Date(timeObject.start) : null;
        var endWithDate = timeObject.end ? new Date(timeObject.end) : null;

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

        timeObject.start = startWithDate.toISOString();
        timeObject.end = endWithDate.toISOString();
    }

    ctrl.appointmentIsValid = function (classification) {
        switch (classification) {
            case 0:
                var validAppointmentDate = $scope.appointmentDate.Value != null;
                $scope.dateValid = $scope.appointmentDate.Value != '';
                var validAppointmentTime =
                    $scope.appointmentTime.start != null &&
                    $scope.appointmentTime.end != null &&
                    $scope.appointmentTime.start < $scope.appointmentTime.end;
                var validProvider =
                    $scope.appointment.Data.UserId != null &&
                    $scope.appointment.Data.UserId.length > 0;
                var validPatient = $scope.selectedPatient != null;

                return (
                    validAppointmentDate &&
                    validAppointmentTime &&
                    validProvider &&
                    validPatient &&
                    $scope.dateValid
                );
            default:
                return false;
        }
    };

    ctrl.FindBlockConflictsOnSuccess = FindBlockConflictsOnSuccess;

    function FindBlockConflictsOnSuccess(res) {
        var conflict = ctrl.getConflict(res);

        if (conflict) {
            // overwrite appointmentTime.Valid if there's a block.
            $scope.appointment.Valid = false;
            $scope.appointmentTime.Valid = false;

            if (
                conflict.Classification == ctrl.ClassificationEnum.Block.Value ||
                $scope.appointment.Data.Classification ==
                ctrl.ClassificationEnum.Block.Value
            ) {
                // figure out best way to put this into scheduleTextService
                $scope.conflictExistsMsg = localize.getLocalizedString(
                    'An existing block or appointment is already scheduled from {0} to {1}. Please select another time.',
                    [
                        $filter('date')(conflict.StartTime, 'h:mm a'),
                        $filter('date')(conflict.EndTime, 'h:mm a'),
                    ]
                );

                $scope.conflictExists = true;
            }
        } else {
            $scope.appointment.Save();
        }
    }

    ctrl.getConflict = function (conflicts) {
        var conflict = null;

        for (var c = 0; c < conflicts.Value.length; c++) {
            if (
                conflicts.Value[c].AppointmentId !=
                $scope.appointment.Data.AppointmentId
            ) {
                conflict = conflicts.Value[c];
                break;
            }
        }

        return conflict;
    };

    ctrl.AfterAppointmentSaved = AfterAppointmentSaved;
    function AfterAppointmentSaved() {
        switch ($scope.appointment.Data.Classification) {
            case ctrl.ClassificationEnum.UnscheduledAppointment.Value:
                ctrl.clearAppointmentData(true);
                break;
            default:
                break;
        }
    }

    ctrl.initAppointment = function () {
        $scope.appointment.AfterSaveSuccess = ctrl.AfterAppointmentSaved;
    };

    // #endregion
    // #region Scope Functions -- If it's called in the HTML, it's here.

    // setting hard coded links -- do this once
    var queryString = '';
    _.forEach($location.search(), function (value, key) {
        if (key !== 'newTab' && key !== 'newKey') {
            queryString += key + '=' + value + '&';
        }
    });
    //"{{createBreadcrumbLink('#/Schedule/ProviderHours/')}}"
    $scope.providerHoursUrl = schedulerUtilities.createBreadcrumbLink(
        '#/Schedule/ProviderHours/',
        queryString
    );
    //{{createBreadcrumbLink('#/Schedule/ProviderHours/?toIdealDays=true')}}
    $scope.providerHoursIdealDayUrl = schedulerUtilities.createBreadcrumbLink(
        '#/Schedule/ProviderHours/?toIdealDays=true',
        queryString,
        true
    );
    //{{createBreadcrumbLink('#/Schedule/Holidays/')}}
    $scope.holdaysUrl = schedulerUtilities.createBreadcrumbLink(
        '#/Schedule/Holidays/',
        queryString
    );
    //{{createBreadcrumbLink('#/Schedule/Settings/')}}
    $scope.scheduleSettingsUrl = schedulerUtilities.createBreadcrumbLink(
        '#/Schedule/Settings/',
        queryString
    );

    $scope.beginDrag = beginDrag;

    function beginDrag(event) {
        //CardMoving
        // not sure if that is still needed the ... appointment knows its type now.
        ctrl.setAppointmentType(event);
        if (event) {
            // Bug 359081, account for window scrolltop when calculating slot
            var positionY = event.originalEvent.clientY + $(window).scrollTop();
            var slot = $scope.scheduler.slotByPosition(
                event.originalEvent.clientX,
                positionY
            );
            if (slot != null) {
                ctrl.dragData.BeginSlot = slot;
                ctrl.dragData.NewBeginSlot = slot;

                if ($scope.hoverOverAppointment == null) {
                    var resources = $scope.scheduler.resourcesBySlot(slot);
                    resources = resources != null ? resources : {};

                    var tempAppointment = {
                        Classification: 0,
                        StartTime: slot.startDate,
                        EndTime: slot.endDate,
                        ProviderAppointments:
                            resources.Providers != null && resources.Providers.length > 0
                                ? [{ UserId: resources.Providers[0] }]
                                : [],
                        TreatmentRoomId:
                            resources.TreatmentRoomId > '' ? resources.TreatmentRoomId : null,
                    };

                    ctrl.dragData.Dragging = true;
                    ctrl.dragData.Valid = !validationLogic.CollidesWithBlock(
                        tempAppointment
                    );
                    angular
                        .element(slot.element)
                        .find('.schedule-slot-content')
                        .addClass(
                            ctrl.dragData.Valid == true
                                ? 'selected-valid'
                                : 'selected-invalid'
                        );
                }
            }
        }
    }

    $scope.changeStart = changeStart;

    function changeStart(routeParts) {
        //console.log('ChangeStart');

        var view = routeParts.view;
        var group = routeParts.group;

        ctrl.resetActiveResourceStartIndex();
        ctrl.clearGroupResources();
        ctrl.appointmentsLoaded = false;
        switch (view) {
            case $scope.schedulerViews.week:
                ctrl.activeView = $scope.schedulerViews.week;
                break;
            case $scope.schedulerViews.day:
            default:
                ctrl.activeView = $scope.schedulerViews.day;
                $scope.schedViewName = 'day';
                break;
        }

        switch (group) {
            case $scope.schedulerGroups.room:
                ctrl.activeGroup = $scope.schedulerGroups.room;

                ctrl.changeResourceShiftFunction(ctrl.shiftRooms);
                ctrl.resetProcessedEvents();
                break;
            case $scope.schedulerGroups.provider:
            default:
                ctrl.activeGroup = $scope.schedulerGroups.provider;

                ctrl.changeResourceShiftFunction(ctrl.shiftProviders);
                break;
        }

        //ctrl.refreshAppointmentListData();

        $scope.currentScheduleView = group;

        ctrl.changeScheduleDisplay(ctrl.activeView, ctrl.activeGroup);

        $scope.scheduler.setOptions($scope.schedulerOptions);

        $scope.scheduler.bind('dataBound', ctrl.modifyLayoutForWeek);
    }

    $scope.changeGroup = changeGroup;

    function changeGroup(group, isViewChanged) {
        ctrl.resetActiveResourceStartIndex();
        ctrl.clearGroupResources();

        switch (group) {
            case $scope.schedulerGroups.room:
                ctrl.activeGroup = $scope.schedulerGroups.room;

                ctrl.changeResourceShiftFunction(ctrl.shiftRooms);
                ctrl.resetProcessedEvents();
                break;
            case $scope.schedulerGroups.provider:
            default:
                ctrl.activeGroup = $scope.schedulerGroups.provider;

                ctrl.changeResourceShiftFunction(ctrl.shiftProviders);
                break;
        }

        $scope.currentScheduleView = group;
        ctrl.changeScheduleDisplay(ctrl.activeView, ctrl.activeGroup);
        if (isViewChanged) {
            ctrl.saveUserSettings();
            //update location dropdown when view changes on room or provider
            ctrl.updateLocationDropdownInputValuesWhenViewChanges();
        }
        $scope.scheduler.setOptions($scope.schedulerOptions);
        // modify layout for week view
        $scope.scheduler.bind('dataBound', ctrl.modifyLayoutForWeek);
    }

    //These values are needed to update the Input Values for the Location Dropdown Component when the view changes to Room View or Prov View
    ctrl.updateLocationDropdownInputValuesWhenViewChanges = updateLocationDropdownInputValuesWhenViewChanges;
    function updateLocationDropdownInputValuesWhenViewChanges() {
        $scope.locations = angular.copy($scope.locations); //This is needed to pass into location dropdown on change of global location. Have to change the list so onChange fires to send values in
    }

    $scope.changeView = changeView;

    function changeView(view) {
        ctrl.resetActiveResourceStartIndex();
        ctrl.clearGroupResources();

        switch (view) {
            case $scope.schedulerViews.week:
                ctrl.activeView = $scope.schedulerViews.week;
                //$scope.schedViewName = 'week';
                break;
            case $scope.schedulerViews.day:
            default:
                ctrl.activeView = $scope.schedulerViews.day;
                $scope.schedViewName = 'day';
                break;
        }

        ctrl.changeScheduleDisplay(ctrl.activeView, ctrl.activeGroup);

        $scope.scheduler.setOptions($scope.schedulerOptions);

        ctrl.refreshAppointmentListData();
    }

    ctrl.refreshAppointmentListData = refreshAppointmentListData;

    function refreshAppointmentListData() {
        var appointmentList = angular.copy(ctrl.apps);

        _.forEach(appointmentList, function (appointment) {
            ctrl.addProviderIdsToAppointment(appointment);
            timeZoneFactory.ConvertAppointmentDatesTZ(appointment);
        });

        let mappedAppointmentList = _.map(
            appointmentList,
            ctrl.mapAppointmentResponseToViewModel
        );

        ctrl.appointments = new kendo.data.SchedulerDataSource({
            data: mappedAppointmentList,
        });
        ctrl.setSchedulerDataSource(ctrl.appointments);
    }

    $scope.changeProviderView = changeProviderView;

    function changeProviderView(resource, providerTypeId) {
        var provider = scheduleProvidersService.findByUserId(resource.value);

        provider.ProviderTypeViewId = providerTypeId;
        /** sets active class for Regular or Hygiene */
        resource.isRegular = providerTypeId == 1;
    }

    $scope.clickStatusIcon = function (e, appointmentId) {
        // Data might already be loaded ... can probably remove the get requests for information when time allows and test the change.
        var dataItem = _.find(ctrl.apps, { AppointmentId: appointmentId });
        $scope.newTarget = null;
        $timeout(function () {
            $scope.newTarget = angular.element(e.currentTarget);
            $scope.newTarget.Data = _.cloneDeep(dataItem);
            $scope.newTarget.Data.AppointmentType = dataItem.AppointmentType;
            $scope.newTarget.Data.Provider = { Name: dataItem.providerName };
            $scope.newTarget.Data.Room = { Name: dataItem.treatmentRoomName };
        }, 100);
    };

    //#region week view view

    // style the provider event for weekly view
    ctrl.providerColumnCssForWeekView = providerColumnCssForWeekView;

    function providerColumnCssForWeekView(
        providerColumnElement,
        apptColors,
        width,
        left
    ) {
        angular.element(providerColumnElement).css({
            background: 'rgba(' + apptColors.Display + ', 0.35)',
            color: apptColors.Font,
            width: width - 5 + 'px',
            border: 'none',
        });
    }

    // get initials for first and last name only for week display
    ctrl.getFirstAndLastInitials = getFirstAndLastInitials;

    function getFirstAndLastInitials(name) {
        // if this name has a comma with professional designation, remove that for the initials display
        var firstAndLastName = name.split(',')[0];
        var firstAndLastInitials = Array.prototype.map
            .call(firstAndLastName.split(' '), function (x) {
                return x.substring(0, 1).toUpperCase();
            })
            .join('');
        return (
            firstAndLastInitials[0] +
            firstAndLastInitials[firstAndLastInitials.length - 1]
        );
    }

    // modify the group header and datetime header layout when in week view
    ctrl.modifyLayoutForWeek = modifyLayoutForWeek;

    function modifyLayoutForWeek() {
        // this is called when you set  $scope.scheduler.view(x)

        if (_.isEmpty($scope.scheduler)) {
            return;
        }
        var viewName = $scope.scheduler.view().name;
        // we only need to set the gridTarget top if we find a way to use the default k-scheduler-header and make it stay on top of the grid
        //if (viewName === "day") {
        //};
        if (viewName === 'week') {
            // custom setting the k-scheduler-header-wrap to always be on top
            // padding adjust for scroll
            var headerWrapTarget = angular.element('.k-scheduler-header-wrap');
            headerWrapTarget.addClass('weekView-header');

            // get the header target offset for the scheduler for reset
            ctrl.headerOffset = headerWrapTarget[0].offsetTop;

            // set k-scheduler-header to match day view
            var dateTimeHeaderTarget = angular.element(
                '.k-scheduler-header .k-scheduler-table tbody tr:first-of-type th'
            );
            dateTimeHeaderTarget.css({
                'text-align': 'center',
            });
        }
    }

    // custom group header for week view only to show provider first last initials in header and fullname in tooltip when provider view
    $scope.groupHeaderTemplate = groupHeaderTemplate;

    function groupHeaderTemplate(dataItem) {
        if (
            $scope.schedViewName === 'week' &&
            $scope.routeParams.group === $scope.schedulerGroups.provider
        ) {
            var name = angular.copy(dataItem.text);
            var initials = ctrl.getFirstAndLastInitials(name);

            return (
                '<div title= "' +
                _.escape(dataItem.text) +
                '"><strong class="scheduler__groupHeaderTemplate"> ' +
                _.escape(initials) +
                '</strong></div>'
            );
        } else {
            return (
                '<div title= "' +
                _.escape(dataItem.text) +
                '"><strong class="scheduler__groupHeaderTemplate"> ' +
                _.escape(dataItem.text) +
                '</strong></div>'
            );
        }
    }

    //#endregion
    // called by the 'Week' button click changes the display to 'week'
    $scope.changeToWeek = changeToWeek;

    function changeToWeek() {
        $scope.getAppointmentsCompleted = false;
        // make sure active view and route params are set
        ctrl.activeView = $scope.schedulerViews.week;
        $scope.routeParams.view = 'week';

        $scope.schedViewName = 'week';
        // this needs called now when week view is selected so that we can get the provider occurrences each day of the week
        ctrl.setProviders();

        // I think the below lines ...do the same thing twice .... need to test that out.
        $scope.scheduler.view().name = 'week';
        $scope.scheduler.view('week');
        ctrl.setHoursOfOperations();

        ctrl.appointmentsLoaded = false;
        // look at a better way to do this later as this operation does not do items efficiently
        ctrl.triggerNavigateEvent(
            'date',
            $scope.calendarPickerDate,
            'calendarpicker',
            true
        );
    }

    // called by the 'Day' button click changes the display to 'day'
    $scope.changeToDay = changeToDay;
    function changeToDay() {
        $scope.getAppointmentsCompleted = false;
        // make sure active view and route params are set
        ctrl.activeView = $scope.schedulerViews.day;
        $scope.routeParams.view = 'day';

        $scope.schedViewName = 'day';
        // this needs called now when day view is selected so that we can get the provider occurrences
        ctrl.setProviders();

        // I think the below lines ...do the same thing twice .... need to test that out.
        $scope.scheduler.view().name = 'day';
        $scope.scheduler.view('day');
        ctrl.setHoursOfOperations();

        ctrl.appointmentsLoaded = false;
        // look at a better way to do this later as this operation does not do items efficiently
        ctrl.triggerNavigateEvent(
            'date',
            $scope.calendarPickerDate,
            'calendarpicker',
            true
        );
    }

    /// My goal is to kill this method!!! DO NOT Add more to it ... do not utilize it
    $scope.createQueue = createQueue;

    function createQueue(action, args) {
        var promises = [];
        var functions = [];
        var refreshOnlyView = false;

        switch (action.toLowerCase()) {
            case 'view':
                functions.push(ctrl.funcObj($scope.changeView, args));
                break;
            case 'group':
                functions.push(ctrl.funcObj($scope.changeGroup, args));
                break;
            case 'date':
                if (args[0] == 'calendarpicker') {
                    functions.push(ctrl.funcObj(ctrl.changeDate, args));
                } else {
                    var incrementBy = ctrl.determineNavigationIncrement(
                        args[0],
                        $scope.routeParams.view
                    );
                    $scope.$broadcast('goToDateChild', args[0], incrementBy);
                }
                break;
            case 'shift':
                functions.push(ctrl.funcObj($scope.shiftResources, args));
                break;
            case 'slide':
                if (args[0] == 'row') {
                    //functions.push(ctrl.funcObj(ctrl.updateRows));
                } else if (args[0] == 'col') {
                    functions.push(ctrl.funcObj(ctrl.updateColumns));
                }
                break;
            case 'provider':
                functions.push(ctrl.funcObj($scope.changeProviderView, args));
                refreshOnlyView = false;
                break;
            case 'refresh':
                refreshOnlyView = true;
                break;
            default:
                break;
        }

        var schedulerName = $scope.scheduler ? $scope.scheduler.view().name : '';

        // the code below here is probably part of the reason why week view transitions and other changes cause issues. The blow logic is messed up and not reliable.
        if (!(action === 'refresh' && schedulerName === 'week')) {
            // && (!_.isEmpty(promises) || !_.isEmpty(functions))) {
            ctrl.refreshPending = true; // block the fresh until everything is done
            ctrl.processQueue(promises, functions, refreshOnlyView);
            if (ctrl.refreshPending) {
                // Only need to do this if the flag is true.
                ctrl.refreshPending = false;

                ctrl.refreshScheduler(refreshOnlyView);
            }
        } else {
            // This extra refresh scrolls again once the appointments have been loaded.
            ctrl.refreshScheduler(true);
        }
    }

    $scope.dropToSchedule = function (e) {
        // this is only used for drag from clipboard, dragging within schedule opens confirm reschedule modal
        var hint = angular.element('#event-hint');
        if (_.isUndefined(hint[0])) {
            return;
        }

        var providerId = null;
        var roomId = null;

        var dataItem = _.cloneDeep($scope.draggedUnscheduledAppointment);

        // Fix for IE, doesn't have clientX or clientY

        var slot = $scope.scheduler.slotByPosition(
            e.target.offsetLeft,
            e.target.offsetTop
        );
        // bug 361047 Schedule - Drag and Drop from clipboard does not open appointment modal
        // if they do not drop it within the correct area, workaround for this is to open the appointment modal
        // but leave roomId and providerId not selected
        if (_.isNil(slot)) {
            $scope.editAppointment(dataItem);
        } else {
            var resource = $scope.scheduler.resourcesBySlot(slot);
            var dropArea = null;

            if (resource.Providers) {
                providerId = resource.Providers[0];
                roomId = dataItem.TreatmentRoomId;

                let destinationProviderAtLocation = scheduleProvidersService.findByUserId(
                    providerId
                );
                if (!destinationProviderAtLocation.IsActive) {
                    modalFactory.ScheduleInactiveProviderModal().then(
                        () => {},
                        () => {}
                    ); // we don't care about these...but in order to not get a warning about an unhandled rejection
                    //  i put them in. if you have a better idea, please let me know
                    e.preventDefault();

                    return;
                }
                // we need to use the object from localProviders because destinationProviderAtLocation
                // could have a LocationId not on the  schedule
                dropArea = $scope.localProviders.filter(p => p.UserId === providerId);
                dropArea = dropArea[0];
            } else if (resource.TreatmentRoomId) {
                roomId = resource.TreatmentRoomId;
                providerId = dataItem.UserId;
                dropArea = roomsService.findByRoomId(resource.TreatmentRoomId);
            }

            var proceedWithDropToSchedule = function () {
                if (dataItem && slot) {
                    $scope.findBlocks(ctrl.appointments._data, slot, resource);

                    if (!$scope.blocked) {
                        //debugger;
                        dataItem.UserId = providerId;
                        dataItem.TreatmentRoomId = roomId;
                        dataItem.StartTime = slot.startDate;
                        dataItem.EndTime = slot.startDate
                            ? new Date(
                                slot.startDate.getTime() + dataItem.ProposedDuration * 60000
                            )
                            : null;

                        appointmentViewDataLoadingService.getViewData(dataItem, true).then(
                            function (res) {
                                appointmentViewVisibleService.changeAppointmentViewVisible(
                                    true,
                                    false
                                );
                            },
                            function (error) {
                                e.preventDefault();
                                toastrFactory.error('Problem loading the appointment', 'Error');
                            }
                        );
                    }

                    $scope.blocked = false;
                }
            };
            if (dropArea.LocationId !== dataItem.LocationId) {
                personFactory.Overview(dataItem.PersonId).then(
                    function (res) {
                        if (res.Value) {
                            let matchingLocations = res.Value.PatientLocations.filter(
                                l => l.LocationId === dropArea.LocationId
                            );
                            if (matchingLocations.length === 0) {
                                e.preventDefault();
                                ctrl.showApptLocationWarningtModal(dropArea);
                            } else {
                                $scope.inRoomView = false;
                                proceedWithDropToSchedule(
                                    e,
                                    resource,
                                    dataItem,
                                    slot,
                                    providerId,
                                    roomId
                                );
                            }
                        } else {
                            // data grab fail
                            e.preventDefault();
                            toastrFactory.error(
                                'Failed to load patient data, please try again.'
                            );
                        }
                    },
                    function (error) {
                        e.preventDefault();
                        console.log(error);
                        toastrFactory.error(
                            'Failed to load patient data, please try again.'
                        );
                    }
                );
            } else {
                proceedWithDropToSchedule(
                    e,
                    resource,
                    dataItem,
                    slot,
                    providerId,
                    roomId
                );
            }
        }
    };

    $scope.scheduleAppointment = function () {
        $scope.apptTime.endDate = $scope.clipboardData.Data.EndTime;
        $scope.apptTime.startDate = $scope.clipboardData.Data.StartTime;

        $scope.showOpenTimeSearch = false;

        $scope.editAppointmentFromPopup(
            $scope.clipboardData.Data,
            $scope.apptTime,
            $scope.clipboardData.Data.UserId,
            $scope.clipboardData.Data.TreatmentRoomId
        );
    };

    $scope.compareBlock = function (block, slot) {
        //dates
        var blockStartDate = moment(block.StartTime).format('MM/DD/YYYY');
        var blockEndDate = moment(block.EndTime).format('MM/DD/YYYY');
        var slotStartDate = moment(slot.startDate).format('MM/DD/YYYY');
        var slotEndDate = moment(slot.endDate).format('MM/DD/YYYY');

        //time
        var blockStartTime = moment(block.StartTime).format('HH:mm:ss');
        var blockEndTime = moment(block.EndTime).format('HH:mm:ss');
        var slotStartTime = moment(slot.startDate).format('HH:mm:ss');
        var slotEndTime = moment(slot.endDate).format('HH:mm:ss');

        if (blockStartDate === slotStartDate && blockEndDate === slotEndDate) {
            if (slotStartTime < blockEndTime && blockStartTime < slotEndTime) {
                $scope.blocked = true;
            }
        }
    };

    $scope.findBlocks = function (appts, slot, resource) {
        var blockList = _.filter(appts, {
            AppointmentTypeId: '00000000-0000-0000-0000-000000000000',
        });

        _.forEach(blockList, function (block) {
            if (resource.Providers != null) {
                if (block.Providers[0] === resource.Providers[0]) {
                    $scope.compareBlock(block, slot);
                }
            } else {
                if (block.TreatmentRoomId === resource.TreatmentRoomId) {
                    $scope.compareBlock(block, slot);
                }
            }
        });
    };

    ctrl.disabled = false;

    $scope.editAppointment = editAppointment;
    function editAppointment(dataItem, event) {
        if (ctrl.disabled) {
            // preventing some odd console exceptions.
            if (event !== null && event !== undefined) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        } else {
            ctrl.disabled = true;
            // investigate why this was placed here at another time.
            $timeout(
                function () {
                    ctrl.disabled = false;
                },
                1000,
                false
            );

            if (dataItem) {
                $scope.hideFilters();

                // process one model separate from others.
                if (dataItem.Classification === ctrl.ClassificationEnum.Block.Value) {
                    $scope.routeParams.open = dataItem.AppointmentId;
                    scheduleBlockModalService.editBlock(
                        dataItem,
                        scheduleProvidersService.providers,
                        ctrl.appointmentSaved,
                        ctrl.appointmentEditCanceled
                    );
                } else {
                    appointmentViewDataLoadingService.getViewData(dataItem, false).then(
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
        }
    }

    $scope.editFullAppointment = function (dataItem) {
        $scope.editAppointment(dataItem);
    };

    $scope.editAppointmentFromPopup = function (
        dataItem,
        slot,
        providerId,
        roomId,
        scheduleUnscheduled
    ) {
        var appt = angular.copy(dataItem);

        var startTime, endTime;

        if (
            dataItem.Classification !==
            ctrl.ClassificationEnum.UnscheduledAppointment.Value
        ) {
            startTime = dataItem.StartTime;
            endTime = dataItem.EndTime;
        } else if (dataItem.PersonId === ctrl.emptyGuid) {
            appt.ObjectState = saveStates.Add;
        } else {
            startTime = slot ? slot.startDate : null;
            endTime = startTime
                ? new Date(startTime.getTime() + appt.ProposedDuration * 60000)
                : null;
            appt.ObjectState = saveStates.Update;
        }

        /** No long editing an unscheduled appointment */
        if (
            startTime &&
            endTime &&
            appt.Classification !== ctrl.ClassificationEnum.Block.Value
        ) {
            appt.Classification = ctrl.ClassificationEnum.Appointment.Value;
            appt.ProposedDuration = null;
        }

        /** need setup provider appointment */
        if (appt.Classification !== ctrl.ClassificationEnum.Block.Value) {
            appt.ProviderAppointments = [
                {
                    UserId: providerId ? providerId : appt.UserId,
                    StartTime: angular.copy(startTime),
                    EndTime: angular.copy(endTime),
                    ObjectState: saveStates.Add,
                },
            ];
        }

        appt.Alerts = dataItem.Alerts;
        appt.MedicalAlerts = dataItem.MedicalAlerts;
        appt.ContactInfo = dataItem.ContactInformation;
        // get location information for appointment if dataItem.Location is null

        if (!dataItem.Location) {
            appt.Location = dataItem.Location = appointmentUtilities.getLocationForAppointment(
                appt.LocationId,
                locationsService.locations,
                $scope.selectedLocation
            );
        } else {
            appt.Location = dataItem.Location;
        }

        appt.Patient = dataItem.Person ? dataItem.Person : dataItem.Patient;
        appt.Providers = [];
        appt.TreatmentRoomId = roomId != null ? roomId : null;
        appt.ServiceCodes = dataItem.ServiceCodes;

        appt = appointmentStatusService.setAppointmentStatus(appt);

        appt.StartTime = angular.copy(startTime);
        appt.EndTime = angular.copy(endTime);
        appt.start = appt.StartTime;
        appt.end = appt.EndTime;

        if (
            appt.Classification == ctrl.ClassificationEnum.Appointment.Value &&
            dataItem.Classification ==
            ctrl.ClassificationEnum.UnscheduledAppointment.Value
        ) {
            appt.originalStart = timeZoneFactory.ConvertDateTZ(
                startTime,
                appt.Location.Timezone
            );
            appt.originalEnd = timeZoneFactory.ConvertDateTZ(
                endTime,
                appt.Location.Timezone
            );
            appt.UserId = appt.ProviderAppointments[0].UserId;
        }

        if (scheduleUnscheduled === true) {
            ctrl.unscheduledAppointmentToSchedule = appt;
        }

        $scope.editAppointment(appt);
    };

    $scope.afterSaveFromPopup = function (appointment) {
        ctrl.appointmentSaved(appointment);
    };

    $scope.endDrag = function (event) {
        if (!ctrl.movingResizingAppointment) {
            if (
                ctrl.dragData.Dragging &&
                ctrl.dragData.Slots.length > 0 &&
                ctrl.dragData.Valid
            ) {
                ctrl.dragData.OpeningModal = true;
                var newAppointment = ctrl.getDragAppointment();
                $scope.toggleUnscheduledAppointmentView(newAppointment);
            } else {
                ctrl.resetDragSlots();
                ctrl.resetDragData();
            }
        } else {
            ctrl.resetDragSlots();
        }
    };

    $scope.enterAppointment = function (appointment, e) {
        $scope.hoverOverAppointment =
            appointment != null ? appointment.AppointmentId : null;
    };

    $scope.leaveAppointment = function (appointment) {
        if (
            appointment != null &&
            $scope.hoverOverAppointment == appointment.AppointmentId
        ) {
            $scope.hoverOverAppointment = null;
        }
    };

    $scope.setWeekViewTitle = setWeekViewTitle;

    function setWeekViewTitle() {
        var startDateFilter = 'MMM d';
        var endDateFilter = 'd, yyyy';

        if ($scope.scheduleDateStart != null) {
            if (
                $scope.scheduleDateStart.getMonth() != $scope.scheduleDateEnd.getMonth()
            ) {
                endDateFilter = 'MMM ' + endDateFilter;
            }

            if (
                $scope.scheduleDateStart.getYear() != $scope.scheduleDateEnd.getYear()
            ) {
                startDateFilter += ', yyyy';
            }
            $scope.pageTitle =
                $filter('date')($scope.scheduleDateStart, startDateFilter) +
                ' - ' +
                $filter('date')($scope.scheduleDateEnd, endDateFilter);
        } else {
            $scope.pageTitle = '';
        }
        document.title = $scope.pageTitle;
    }

    $scope.setDayViewTitle = setDayViewTitle;

    function setDayViewTitle() {
        $scope.pageTitle = $filter('date')(
            $scope.scheduleDateStart,
            'EEEE, MMMM d, yyyy'
        );
        document.title = $scope.pageTitle;
    }

    $scope.isDentist = function (resource) {
        var provider = scheduleProvidersService.findByUserId(resource.value);
        return provider && provider.ProviderTypeId == 1;
    };

    $scope.isInRegularView = function (resource) {
        var provider = scheduleProvidersService.findByUserId(resource.value);
        return provider != null && provider.ProviderTypeViewId != 2;
    };

    $scope.isMissingReqs = function () {
        checkIfSelectedGlobalLocationHasAProviderSet();
        $scope.missingReqs = !(
            locationsService.locations.length > 0 &&
            $scope.selectedLocation.Rooms.length > 0 &&
            $scope.doesProviderExistForSelectedLocation === true
        );
        $scope.locationDisabled = !(locationsService.locations.length > 0);

        return $scope.missingReqs;
    };

    //This is used to check if a provider is set up for the schedule to toggle the provider link at the top of schedule
    function checkIfSelectedGlobalLocationHasAProviderSet() {
        $scope.doesProviderExistForSelectedLocation = false;
        var providerForSelectedLocation = appointmentViewLoadingService.loadedProvidersByLocation.find(
            x => x.LocationId === $scope.selectedLocation.LocationId
        );
        if (
            providerForSelectedLocation &&
            providerForSelectedLocation.LocationId !== undefined &&
            providerForSelectedLocation.LocationId !== null
        ) {
            $scope.doesProviderExistForSelectedLocation = true;
        }
    }

    $scope.jumpNextWeek = function () {
        var date = new Date($scope.scheduler.view().nextDate());
        if ($scope.scheduler.view().name == 'day') {
            date.setDate(date.getDate() + 6);
        } else {
            date.setDate(date.getDate() + 27);
        }

        return date;
    };

    $scope.jumpPrevWeek = function () {
        var date = new Date($scope.scheduler.view().nextDate());

        if ($scope.scheduler.view().name == 'day') {
            date.setDate(date.getDate() - 8);
        } else {
            date.setDate(date.getDate() - 29);
        }

        return date;
    };

    $scope.leaveScheduler = function () {
        if (!ctrl.dragData.OpeningModal) {
            ctrl.resetDragSlots();
            ctrl.resetDragData();
        }
    };

    $scope.mouseMove = function (event) {
        ctrl.resetDragSlots();
        if (ctrl.dragData.Dragging) {
            // Bug 359081, account for window scrolltop when calculating slot
            var positionY = event.originalEvent.clientY + $(window).scrollTop();
            var slot = $scope.scheduler.slotByPosition(
                event.originalEvent.clientX,
                positionY
            );

            if (slot != null) {
                if (!ctrl.dragData.OpeningModal) {
                    var originalSlots = ctrl.dragData.Slots;
                    ctrl.dragData.Slots = ctrl.getSlotsBewteenSlots(
                        ctrl.dragData.BeginSlot,
                        slot,
                        event.originalEvent.clientX,
                        positionY
                    );

                    var tempAppointment = ctrl.getDragAppointment();

                    ctrl.dragData.Valid =
                        slot.groupIndex == ctrl.dragData.BeginSlot.groupIndex &&
                        !validationLogic.CollidesWithBlock(tempAppointment);

                    if (!ctrl.dragData.Valid) {
                        ctrl.dragData.Slots = originalSlots;
                    }
                }
            } else {
                ctrl.dragData.Valid = false;
            }

            ctrl.drawDragSlots();
        }
    };

    $scope.appointmentStatusChanged = appointmentStatusChange;

    function appointmentStatusChange(
        data,
        autoSave,
        closeModal,
        afterSave,
        updatedAppointments,
        setManualUpdateFlag
    ) {
        // Early return statements cause code confusion and lead to hard to find bugs.
        // This should be refactored.
        if (autoSave == false && closeModal != true) return;

        if (!_.isNil(data.DeletedReason) && data.DeletedReason !== '') {
            let index = lookupLogic.GetEventIndexById(data.AppointmentId);
            if (index > -1) {
                ctrl.apps.splice(index, 1);
                ctrl.appointments.data().splice(index, 1);
                ctrl.changedAppointmentId = undefined;
            }
        } else if (autoSave == true) {
            var appointmentUpdate = {
                appointmentId: data.AppointmentId,
                DataTag: data.DataTag,
                NewAppointmentStatusId: data.Status,
                StartAppointment: false,
            };

            if (setManualUpdateFlag === true) {
                appointmentUpdate.manuallyUpdateStatus = true;
            }

            ctrl.setSchedulerState(ctrl.schedulerStates.Saving);

            var locationTimeZone = data.Location.Timezone;

            var locationFullTimeZone = timeZoneFactory.GetFullTZ(locationTimeZone);
            var locationMomentTimeZone = locationFullTimeZone.MomentTZ;
            $scope.locationMomentTimeZone = locationMomentTimeZone;
            var locationMomentDateToday = moment()
                .tz(locationMomentTimeZone)
                .format('MM/DD/YYYY');
            var appointmentStartDate = moment(data.StartTime).format('MM/DD/YYYY');

            // check if we're setting the appointment to completed, and if the appt start date is tomorrow.
            // if we are setting the appointment to completed, and the appt start date is tomorrow (local to the location for which the appointment is scheduled)
            // then don't allow the save.
            // appointmentUpdate.NewAppointmentStatusId: 3 == in Completed. we want Completed
            if (
                moment(appointmentStartDate).isAfter(locationMomentDateToday) &&
                appointmentUpdate.NewAppointmentStatusId === 3
            ) {
                toastrFactory.error(
                    $scope.schedulePageText.cannotCompleteAppointmentScheduledForTomorrow,
                    'Error'
                );
            } else {
                // the full return object is missing several items so we want to keep this value to only update the couple items that changed.
                $scope.mainData = data;

                appointmentUpdate.Offset =
                    moment().tz(locationMomentTimeZone)._offset / 60;

                scheduleServices.AppointmentStatusUpdate.Update(
                    appointmentUpdate,
                    function onStatusUpdatedSuccess(result) {
                        if (!_.isNil(result) && !_.isNil(result.Value)) {
                            toastrFactory.success(
                                $scope.schedulePageText.appointmentSaved,
                                'Success'
                            );
                            $scope.mainData.Status = result.Value.Status;
                            $scope.mainData.DataTag = result.Value.DataTag;

                            // we want to make this behave like the hub update
                            // only modify the status and datatag
                            $scope.mainData.ObjectState = 'status';
                            ctrl.appointmentSaved($scope.mainData);
                        } else {
                            toastrFactory.error(
                                $scope.schedulePageText.appointmentFailedToSave,
                                'Error'
                            );
                        }
                    },
                    function onStatusUpudatedError(result) {
                        toastrFactory.error(
                            $scope.schedulePageText.appointmentFailedToSave,
                            'Error'
                        );
                    }
                );
            }
        } else if (
            closeModal == true &&
            data.Classification ===
            ctrl.ClassificationEnum.UnscheduledAppointment.Value
        ) {
            if (
                !$scope.lastEditedAppointment ||
                ($scope.lastEditedAppointment &&
                    $scope.lastEditedAppointment.DataTag !== data.DataTag)
            ) {
                $scope.lastEditedAppointment = {
                    AppointmentId: data.AppointmentId,
                    DataTag: data.DataTag,
                };

                if (data.IsPinned) {
                    $scope.showClipboard = true;
                    $scope.openClipboard = true;
                }
                // check if item is in existing appointments array ... if it is then remove it.
                var index = lookupLogic.GetEventIndexById(data.AppointmentId);
                if (index > -1) {
                    ctrl.apps.splice(index, 1);
                    ctrl.appointments = new kendo.data.SchedulerDataSource({
                        data: _.map(ctrl.apps, ctrl.mapAppointmentResponseToViewModel),
                    });
                    ctrl.setSchedulerDataSource(ctrl.appointments);
                }
                // reload the pinned appointments because prior methods might not be populating the object right and we do not want to make this reliant on formatting from other pages.
                ctrl.getUnscheduledAppointments();
            }
        } else if (closeModal == true) {
            // Leaving this if option because I do not know what other action might be using this method and
            // the last thing I want to do is remove this and assume nothing uses it because
            // the way this code is setup at present it is likely 10 other things utilize this for some reason.
            // comment added when making prior if block where closeModal === true and Classification == 2
            ctrl.updatedAppointment = data;
            ctrl.appointmentSaved(data);
        }
    }

    $scope.beforeStatusChangeDelete = beforeStatusChangeDelete;
    function beforeStatusChangeDelete(appointment) {
        ctrl.changedAppointmentId = appointment.AppointmentId;
    }

    $scope.$on('patCore:initlocation', function () {
        $scope.userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        $scope.selectedLocation = angular.copy(
            listHelper.findItemByFieldValue(
                locations,
                'LocationId',
                $scope.userLocation.id
            )
        );

        // set routeParam so that if you f5 the selected location will default to your location
        $scope.routeParams.location = $scope.selectedLocation.NameAbbreviation;
        // reload the crtl.userColumnOrder for this location
        ctrl.userColumnOrder = schedulerUtilities.getUserColumnOrderByLocation(
            ctrl.scheduleColumnOrder
        );
    });

    $scope.saveAppointment = saveAppointment;
    function saveAppointment(data, wasPinned = false) {
        ctrl.setSchedulerState(ctrl.schedulerStates.Saving);
        // If status is currently Late, set the status back to the original status before saving
        if (data.Status == appointmentStatusService.appointmentStatusEnum['Late']) {
            data.Status = data.OriginalStatus;
        }
        timeZoneFactory.ConvertAppointmentDatesToSave(data);
        // Strip the unnecessary data so that it isn't sent across the wire.

        var appointmentDto = {
            AppointmentId: data.AppointmentId ? data.AppointmentId : null,
            AppointmentTypeId: data.AppointmentTypeId,
            PersonId: data.PersonId,
            TreatmentRoomId: data.TreatmentRoomId,
            UserId: data.UserId,
            Classification: data.Classification,
            Description: data.Description,
            Note: data.Note,
            StartTime: data.StartTime ? data.StartTime.toISOString() : null,
            EndTime: data.EndTime ? data.EndTime.toISOString() : null,
            ActualStartTime: data.ActualStartTime,
            ActualEndTime: data.ActualEndTime,
            ProviderAppointments: data.ProviderAppointments,
            PlannedServices: data.PlannedServices,
            ExaminingDentist: data.ExaminingDentist,
            IsExamNeeded: data.IsExamNeeded,
            Status: data.Status,
            StatusNote: data.StatusNote,
            DataTag: data.DataTag,
            IsPinned: data.IsPinned,
            LocationId: data.LocationId,
            ObjectState: data.ObjectState ? data.ObjectState : saveStates.Update,
            ProposedDuration: data.ProposedDuration,
        };

        $scope.appointment.Data = appointmentDto;

        ctrl.updatedAppointment = data;

        scheduleAppointmentModalService.saveAppointment(
            $scope.appointment.Data,
            data.OriginalStatus,
            ctrl.appointmentSaved,
            ctrl.appointmentEditCanceled,
            wasPinned
        );
    }

    $scope.saveTruncatedAppointment = saveTruncatedAppointment;
    function saveTruncatedAppointment(data) {
        ctrl.setSchedulerState(ctrl.schedulerStates.Saving);
        // If status is currently Late, set the status back to the original status before saving
        if (data.Status == appointmentStatusService.appointmentStatusEnum['Late']) {
            data.Status = data.OriginalStatus;
        }
        timeZoneFactory.ConvertAppointmentDatesToSave(data);
        // Strip the unnecessary data so that it isn't sent across the wire.
        var appointmentDto = {
            AppointmentId: data.AppointmentId ? data.AppointmentId : null,
            AppointmentTypeId: data.AppointmentTypeId,
            PersonId: data.PersonId,
            TreatmentRoomId: data.TreatmentRoomId,
            UserId: data.UserId,
            Classification: data.Classification,
            Description: data.Description,
            Note: data.Note,
            StartTime: data.StartTime ? data.StartTime.toISOString() : null,
            EndTime: data.EndTime ? data.EndTime.toISOString() : null,
            ActualStartTime: data.ActualStartTime,
            ActualEndTime: data.ActualEndTime,
            ProviderAppointments: data.ProviderAppointments,
            PlannedServices: data.PlannedServices,
            ExaminingDentist: data.ExaminingDentist,
            IsExamNeeded: data.IsExamNeeded,
            Status: data.Status,
            StatusNote: data.StatusNote,
            DataTag: data.DataTag,
            IsPinned: data.IsPinned,
            LocationId: data.LocationId,
            Location: data.Location,
            ObjectState: data.ObjectState ? data.ObjectState : saveStates.Update,
            ProposedDuration: data.ProposedDuration,
        };

        $scope.appointment.Data = appointmentDto;

        ctrl.updatedAppointment = data;
        //if location changes open modal to make other edits, otherwise just save reschedule
        //BUT don't open view when moving a block even if location has changed.
        if (
            $scope.apptLocationHasChanged &&
            $scope.appointment.Data.Classification !== 1
        ) {
            appointmentViewDataLoadingService.getViewData(appointmentDto, true).then(
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
        } else {
            scheduleAppointmentModalService.saveTruncatedAppointment(
                $scope.appointment.Data,
                data.OriginalStatus,
                ctrl.appointmentSaved,
                ctrl.appointmentEditCanceled
            );
        }
        $scope.apptLocationHasChanged = false;
    }

    $scope.setBlur = function () {
        $scope.multiSelectOpen = false;
        $scope.locationMultiSelectOpen = false;
        $scope.calendarPickerOpen = false;
        $scope.newTarget = null;
    };

    $scope.stopDrag = function (event) {
        if (!ctrl.dragData.OpeningModal) {
            ctrl.resetDragSlots();

            if (!ctrl.movingResizingAppointment) {
                ctrl.dragData.BeginSlot = null;
                ctrl.dragData.Slots = [];
                ctrl.dragData.Dragging = false;
            }
        }
    };

    $scope.openTab = function (url) {
        tabLauncher.launchNewTab(url);
    };

    ctrl.daylightSavingsCorrection = daylightSavingsCorrection;

    function daylightSavingsCorrection(dateToCheck) {
        var dayBefore = new Date(dateToCheck);
        dayBefore.setDate(dateToCheck.getDate() - 1);
        // No correction if not DST, except account for extra hour at end of DST.
        if (!moment(dateToCheck).isDST()) {
            return !moment(dayBefore).isDST() ? 0 : -60;
        }
        // One hour correction during DST, account for one less hour at start of DST.
        return moment(dayBefore).isDST() ? 60 : 120;
    }

    $scope.hasProviderConflict = function (appointment) {
        var conflict = false;
        // prevent console.errors when appointment is null
        if (appointment && appointment.AppointmentId) {
            conflict = true;
            var sched = {};
            var startSched;
            var endSched;
            var startAppointment = angular.isDate(appointment.StartTime)
                ? appointment.StartTime
                : new Date(appointment.StartTime);
            var endAppointment = angular.isDate(appointment.EndTime)
                ? appointment.EndTime
                : new Date(appointment.EndTime);
            var offset =
                (startAppointment.getTimezoneOffset() +
                    ctrl.daylightSavingsCorrection(startAppointment)) *
                60 *
                1000;
            var hasWeeklySchedule = false;

            for (var cnt = 0; cnt < ctrl.providerWeeklySchedule.length; cnt++) {
                sched = ctrl.providerWeeklySchedule[cnt];
                startSched = new Date(
                    startAppointment.toLocaleDateString() +
                    ' ' +
                    new Date(sched.StartTime + offset).toLocaleTimeString()
                );
                endSched = new Date(
                    endAppointment.toLocaleDateString() +
                    ' ' +
                    new Date(sched.StopTime + offset).toLocaleTimeString()
                );
                // NOTE: after hitting here from getAppointmentModalDataSuccessNew in the appointment modal service,
                //  appointment.Location is undefined.
                //  so I'm adding a check to see if appointment.Location is null or undefined
                //  original block is commented out below
                //  It's janky.
                // TODO: Update the API to return Location?
                if (
                    _.includes(appointment.Providers, sched.UserId) &&
                    sched.Weekday == new Date(appointment.StartTime).getDay() &&
                    sched.LocationId == appointment.LocationId &&
                    sched.LocationId == $scope.selectedLocation.LocationId &&
                    startAppointment >= startSched &&
                    endAppointment <= endSched &&
                    sched.RoomId == appointment.TreatmentRoomId
                ) {
                    // room is tied to TreatmentRoomId
                    conflict = false;
                    hasWeeklySchedule = true;
                    ctrl.checkForProviderSchedulingConflict(appointment);
                    break;
                }
            }

            var matchingConflictRec = _.find(ctrl.appointmentProviderConflicts, {
                AppointmentId: appointment.AppointmentId,
            });
            if (!hasWeeklySchedule && _.isEmpty(matchingConflictRec)) {
                ctrl.appointmentProviderConflicts.push({
                    AppointmentId: appointment.AppointmentId,
                    conflict: conflict,
                });
            }
            if (!_.isEmpty(matchingConflictRec)) {
                matchingConflictRec.conflict = conflict;
            }
        }
        return conflict;
    };

    // put this into utilities
    $scope.canAccommodateWarning = canAccommodateWarning;

    function canAccommodateWarning(mins) {
        var canAccommodate = true;

        if (mins <= 30 && $scope.sliderValues.activeIncrementIndex == 4) {
            // 4 == '12 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins == 40 && $scope.sliderValues.activeIncrementIndex == 4) {
            // 4 == '12 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins <= 20 && $scope.sliderValues.activeIncrementIndex == 3) {
            // 3 == '8 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins == 30 && $scope.sliderValues.activeIncrementIndex == 3) {
            // 3 == '8 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins <= 15 && $scope.sliderValues.activeIncrementIndex == 2) {
            // 2 == '6 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins == 20 && $scope.sliderValues.activeIncrementIndex == 2) {
            // 2 == '6 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins <= 10 && $scope.sliderValues.activeIncrementIndex == 1) {
            // 1 == '4 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins == 15 && $scope.sliderValues.activeIncrementIndex == 1) {
            // 1 == '4 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        } else if (mins <= 5 && $scope.sliderValues.activeIncrementIndex == 0) {
            // 0 == '2 hr' for old $scope.hourSliderLbl
            canAccommodate = false;
        }

        return canAccommodate;
    }

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

        if (
            $scope.selectedFilter &&
            $scope.selectedFilter.selectedLocations.length > 0
        ) {
            let list = _.cloneDeep($scope.selectedFilter.selectedLocations);

            let tempLocations = locationsService.findLocationsByLocationList(list);
            $scope.selectedFilter.selectedLocations = tempLocations;
        }
    }

    $scope.fillRoomLocationTimezoneAbbr = fillRoomLocationTimezoneAbbr;

    function fillRoomLocationTimezoneAbbr() {
        if (
            ctrl.activeGroup == $scope.schedulerGroups.room &&
            $scope.activeResources &&
            roomsService.rooms
        ) {
            for (let i = 0; i < $scope.activeResources.length; i++) {
                for (let r = 0; r < roomsService.rooms.length; r++) {
                    if (
                        roomsService.rooms[r].RoomId === $scope.activeResources[i].value ||
                        roomsService.rooms[r].RoomId === $scope.activeResources[i].RoomId
                    ) {
                        var room = roomsService.rooms[r];
                        $scope.activeResources[i].tz = room.tz;
                        $scope.activeResources[i].locationAbbr = room.locationAbbr;
                        break;
                    }
                }
            }
        }
    }

    ctrl.checkForProviderSchedulingConflict = checkForProviderSchedulingConflict;

    function checkForProviderSchedulingConflict(appointment) {
        $scope.examiningDentistHasSchedulingConflict = false;
        if (appointment.Provider) {
            var appointmentList = $scope.schedulerOptions.dataSource.data();
            var conflictItem = null;
            var isProvider = false;
            for (var cnt = 0; cnt < appointmentList.length; cnt++) {
                if (
                    appointmentList[cnt].AppointmentId.toLowerCase() !=
                    appointment.AppointmentId.toLowerCase() &&
                    appointmentList[cnt].Provider &&
                    ((appointmentList[cnt].originalStart >= appointment.originalStart &&
                        appointmentList[cnt].originalStart < appointment.originalEnd) ||
                        (appointmentList[cnt].originalEnd > appointment.originalStart &&
                            appointmentList[cnt].originalEnd <= appointment.originalEnd))
                ) {
                    isProvider =
                        appointmentList[cnt].Provider.UserId ==
                        appointment.Provider.UserId ||
                        appointmentList[cnt].ExaminingDentist ==
                        appointment.Provider.UserId ||
                        listHelper.findItemByFieldValue(
                            appointmentList[cnt].ProviderAppointments,
                            'UserId',
                            appointment.Provider.UserId
                        ) != null;
                    if (!isProvider) continue;
                    conflictItem = appointmentList[cnt];
                    break;
                }
            }
            var found = listHelper.findItemByFieldValue(
                ctrl.appointmentProviderConflicts,
                'AppointmentId',
                appointment.AppointmentId
            );
            if (!found) {
                ctrl.appointmentProviderConflicts.push({
                    AppointmentId: appointment.AppointmentId,
                    conflict: conflictItem != null,
                });
            } else {
                found.conflict = conflictItem != null;
            }
            if (conflictItem) {
                var foundConflict = listHelper.findItemByFieldValue(
                    ctrl.appointmentProviderConflicts,
                    'AppointmentId',
                    conflictItem.AppointmentId
                );
                if (!foundConflict) {
                    ctrl.appointmentProviderConflicts.push({
                        AppointmentId: conflictItem.AppointmentId,
                        conflict: true,
                    });
                } else {
                    foundConflict.conflict = true;
                }
            }
        }
    }

    ctrl.setAppointmentType = setAppointmentType;

    function setAppointmentType(e) {
        /// look at.
        ctrl.apptTypeSelected = '';
        let typeElement = angular.element(e.target).find('.idealDayColor')[0];
        if (typeElement !== null && typeElement !== undefined) {
            var classes = typeElement.className;
            if (classes) {
                ctrl.apptTypeSelected = classes.replace('idealDayColor ', '');
            }
        }
    }

    function buildCssSelectorForSlots(startTime, endTime, resourceId) {
        var cssSelector = '';
        var clonedStartTime = startTime.clone();
        while (clonedStartTime.isBefore(endTime)) {
            if (cssSelector !== '') {
                cssSelector += ',';
            }
            cssSelector +=
                '.' + resourceId + '-' + clonedStartTime.format('YYYY-MM-DDTHH-mm');
            clonedStartTime.add($scope.TimeIncrement, 'minutes');
        }
        return cssSelector;
    }

    function checkIfIdealDayIsInRange(
        occurrence,
        start,
        end,
        isInProviderView,
        isInRoomView
    ) {
        if (
            !_.isNil(occurrence) &&
            occurrence.ProviderIdealDayTemplate &&
            !_.isEmpty(occurrence.ProviderIdealDayTemplate.Details)
        ) {
            if (
                _.some($scope.selectedLocations, {
                    LocationId: occurrence.LocationId,
                }) ||
                (!_.isNil($scope.selectedLocation) &&
                    $scope.selectedLocation.LocationId === occurrence.LocationId)
            ) {
                if (moment.utc(occurrence.OriginalStartTime).isBetween(start, end)) {
                    if (!_.isEmpty($scope.activeResources)) {
                        if (isInProviderView) {
                            return _.some($scope.activeResources, {
                                value: occurrence.UserId,
                            });
                        } else if (isInRoomView) {
                            return _.some($scope.activeResources, {
                                value: occurrence.RoomId,
                            });
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    ctrl.addIdealDaysTemplateColors = addIdealDaysTemplateColors;

    function addIdealDaysTemplateColors() {
        //console.log('Ideal Days Called');

        // reset variables that control if this is run.
        ctrl.providersLoaded = false;
        ctrl.appointmentsLoaded = false;

        var earliestStartTime = null;
        var earliestStartTimeResource = null;

        var view = $scope.scheduler.view();
        if (_.isEmpty(view)) {
            return;
        }
        var isInProviderView =
            $scope.scheduler != null &&
            $scope.scheduler.options.group.resources.length > 0 &&
            $scope.scheduler.options.group.resources[0] == 'provider';
        var isInRoomView =
            $scope.scheduler != null &&
            $scope.scheduler.options.group.resources.length > 0 &&
            $scope.scheduler.options.group.resources[0] == 'room';
        var start = moment($scope.scheduleDateStart);
        var end = moment($scope.scheduleDateEnd).endOf('day');

        var idealDayOccurrences = _.filter(
            _.uniqBy(ctrl.providerWeeklySchedule, 'ProviderRoomOccurrenceId'),
            function (occurrence) {
                //var idealDayOccurrences = _.filter(ctrl.providerWeeklySchedule, function (occurrence) {
                var localResult = checkIfIdealDayIsInRange(
                    occurrence,
                    start,
                    end,
                    isInProviderView,
                    isInRoomView
                );

                // if the value is true we can set the color value so as to avoid a possible duplicate evaluation later in a foreach loop below.
                // that value is being calculated more times then it should be based on the results of this method.
                // This is a future refactoring that can occur, but not something for right now as we also need to look into provider hours as a whole longer term.
                if (
                    localResult &&
                    occurrence.ProviderIdealDayTemplate &&
                    occurrence.ProviderIdealDayTemplate.Details
                ) {
                    _.forEach(
                        occurrence.ProviderIdealDayTemplate.Details,
                        function (value) {
                            var type = appointmentTypesService.findByAppointmentTypeId(
                                value.AppointmentTypeId
                            );
                            value.displayColor = appointmentTypesService.getAppointmentTypeColors(
                                type
                            ).Display;
                        }
                    );
                }
                return localResult;
            }
        );
        if (!_.isEmpty(ctrl.hoursForDay) && !_.isEmpty($scope.activeResources)) {
            var content = $scope.scheduler.view().content;
            var resourceStartTimeList = [];
            var selectedLocationIds = _.map($scope.selectedLocations, 'LocationId');
            if (!_.isNil($scope.selectedLocation)) {
                selectedLocationIds.push($scope.selectedLocation.LocationId);
            }
            _.forEach($scope.activeResources, function eachActiveResource(resource) {
                // this collection is being created to then be iterated over again
                // in a foreach loop a couple lines below merge the two loops
                var hoursList = _.filter(
                    ctrl.hoursForDay[resource.value],
                    function (hours) {
                        return selectedLocationIds.includes(hours.LocationId);
                    }
                );

                if (!_.isEmpty(hoursList)) {
                    _.forEach(hoursList, function eachHoursList(hours) {
                        if (hours && hours.StartTime && hours.EndTime) {
                            var startTimeMoment = moment(hours.StartTime);
                            if (
                                !resourceStartTimeList[resource.value] ||
                                resourceStartTimeList[resource.value].isAfter(startTimeMoment)
                            ) {
                                resourceStartTimeList[resource.value] = startTimeMoment;
                            }
                            if (
                                !earliestStartTime ||
                                earliestStartTime.isAfter(startTimeMoment)
                            ) {
                                earliestStartTime = startTimeMoment.clone();
                                earliestStartTimeResource = resource.value;
                            }
                            var selector = buildCssSelectorForSlots(
                                hours.StartTime,
                                hours.EndTime,
                                resource.value
                            );
                            var hourSlots = content.find(selector);
                            hourSlots.removeClass('closed-time');
                            hourSlots.addClass('open-time');
                        }
                    });
                }
            });

            var occurrencesByResourceId;
            if (isInProviderView) {
                occurrencesByResourceId = _.groupBy(idealDayOccurrences, 'UserId');
            } else if (isInRoomView) {
                occurrencesByResourceId = _.groupBy(idealDayOccurrences, 'RoomId');
            }
            // avoid this when loading week view as right now we are not loading the ideal days for all days.
            if ($scope.schedViewName !== 'week') {
                _.forEach(occurrencesByResourceId, function (occurrences, resourceId) {
                    var resourceStartTime = _.isNil(resourceStartTimeList[resourceId])
                        ? moment().startOf('day').add(8, 'hours')
                        : resourceStartTimeList[resourceId];
                    _.forEach(occurrences, function (occurrence) {
                        if (!_.isNil(occurrence.ProviderIdealDayTemplate)) {
                            _.forEach(
                                occurrence.ProviderIdealDayTemplate.Details,
                                function (template) {
                                    var templateStart = moment(template.StartTime)
                                        .year(start.year())
                                        .month(start.month())
                                        .date(start.date());
                                    var templateEnd = moment(template.EndTime)
                                        .year(start.year())
                                        .month(start.month())
                                        .date(start.date());
                                    var offsetStart = moment(templateStart).subtract(1, 'hour');
                                    var startOffset = offsetStart.diff(
                                        start.startOf('day'),
                                        'minute'
                                    );
                                    var duration = templateEnd
                                        .subtract(1, 'hour')
                                        .diff(offsetStart, 'minute');
                                    var startTime = resourceStartTime
                                        .clone()
                                        .add(startOffset, 'minute');
                                    var endTime = startTime.clone().add(duration, 'minute');
                                    while (startTime.isBefore(endTime)) {
                                        var slotName =
                                            resourceId + '-' + startTime.format('YYYY-MM-DDTHH-mm');
                                        var slot = content.find(
                                            '.' + slotName + ':not(.closed-time)'
                                        );
                                        if (!_.isEmpty(slot)) {
                                            var slotElement = angular.element(slot);
                                            var html =
                                                '<div class="idealDayColor ' +
                                                _.escape(template.AppointmentTypeId) +
                                                '" style="width: 6px; height: 102%; background-color: rgb(' +
                                                template.displayColor +
                                                ') !important; -webkit-print-color-adjust: exact;"></div>';
                                            slotElement.html(html);
                                        }
                                        startTime.add($scope.TimeIncrement, 'minutes');
                                    }
                                }
                            );
                        }
                    });
                });
            }
        }

        if (earliestStartTime && earliestStartTimeResource) {
            var firstElement = $scope.scheduler
                .view()
                .content.find(
                    '.' +
                    earliestStartTimeResource +
                    '-' +
                    earliestStartTime.format('YYYY-MM-DDTHH-mm')
                );
            if (!_.isEmpty(firstElement)) {
                ctrl.setScrollElement(firstElement.parent(), 1);
            }
        }
    }
    ctrl.processProviderHours = processProviderHours;

    function processProviderHours(schedule, startProp, endProp) {
        // the below code (and two variables below this method saves us from having to look up the timezone for each record.
        // It saves the timeZone last selected and uses that if it can be used with the next record.
        var tz = '';
        if (
            ctrl.pastSelectedProviderHoursTimezone ===
            $scope.selectedLocation.Timezone &&
            ctrl.pastSelectedTimezone !== ''
        ) {
            tz = ctrl.pastSelectedTimezone;
        } else {
            ctrl.pastSelectedProviderHoursTimezone = $scope.selectedLocation.Timezone;
            // get tz for everything -- still some duplication between this and the timezoneFactory.GetTimeZoneAbbr file but not much.
            tz = timeZoneFactory.GetFullTZ($scope.selectedLocation.Timezone);
            ctrl.pastSelectedTimezone = tz;
        }

        let start = moment(
            appointmentTimeService
                .getScheduleDateDisplayFormat(tz.MomentTZ, schedule[startProp])
                .toDate()
        );
        var startMidnight = start.clone().startOf('day');

        let end = moment(
            appointmentTimeService
                .getScheduleDateDisplayFormat(tz.MomentTZ, schedule[endProp])
                .toDate()
        );
        var endMidnight = end.clone().startOf('day');

        schedule.OriginalStartTime = angular.copy(schedule.StartTime);
        schedule.StartTime = start.diff(startMidnight, 'milliseconds');
        schedule.StopTime = end.diff(endMidnight, 'milliseconds');

        // Weekly Setup -> Provider Hours transition - creating Weekday in order to play nice with the existing code
        schedule.Weekday = start.day();

        schedule.ObjectState = saveStates.None;
        var result = _.find(ctrl.providerWeeklySchedule, {
            ProviderRoomOccurrenceId: schedule.ProviderRoomOccurrenceId,
        });

        // I want to think about this for a while ... not certain this is the right solution for removing the duplicates
        // only load ones that are not there already ... find a better way to do this later.
        //if(!_.find(ctrl.providerWeeklySchedule, { ProviderRoomOccurrenceId: schedule.ProviderRoomOccurrenceId}))
        //{
        ctrl.providerWeeklySchedule.push(angular.copy(schedule));
        //}
        $scope.weeklySchedule.RoomAssignments.push(schedule);
        ctrl.addProvidersHourByRoomToDictionary(schedule);
    }

    ctrl.pastSelectedProviderHoursTimezone = '';
    ctrl.pastSelectedTimezone = '';

    ctrl.getScheduleForProviderSuccessNew = getScheduleForProviderSuccessNew;

    function getScheduleForProviderSuccessNew(result) {
        //var a = performance.now();
        //console.log(a);
        // set service value to be used by the appointment modal later if needed.
        scheduleServices.ScheduleProviderRoomOccurrences = _.cloneDeep(result);
        ctrl.providerWeeklySchedule = [];
        _.forEach($scope.provIds, function (id) {
            _.forEach(result, function (schedule) {
                if (schedule.UserId == id) {
                    if (schedule.LunchStartTime && schedule.LunchEndTime) {
                        // making separate room assignments for before and after lunch
                        ctrl.processProviderHours(schedule, 'StartTime', 'LunchStartTime');
                        ctrl.processProviderHours(schedule, 'LunchEndTime', 'EndTime');
                    } else {
                        ctrl.processProviderHours(schedule, 'StartTime', 'EndTime');
                    }
                }
            });
        });

        // During some cases provider hours will finish after the appointment call. To ensure that ideal days are setup
        // I am not setting up ideal days until both appointments and provider data has loaded.
        ctrl.providersLoaded = true;

        if (ctrl.appointmentsLoaded) {
            //console.log('Ideal Days Called by Providers loading');
            ctrl.addIdealDaysTemplateColors();
            ctrl.scrollToElement(1);
        }
    }

    ctrl.getScheduleForProviderFailed = function (error) {
        if (error.status != 404) {
            toastrFactory.error(
                $scope.schedulePageText.getScheduleForProviderFailed,
                'Error'
            );
        }
    };

    // #endregion
    // #region Controller Functions -- If it's NOT called in the HTML, it's here.
    // #region Scheduler Facade
    // #region Scheduler Facade - Date Logic (Date Manipulation)

    var dateLogic = {
        DatesCollide: function (start1, end1, start2, end2) {
            return (
                dateLogic.DateIsBetween(start1, start2, end2) ||
                dateLogic.DateIsBetween(end1, start2, end2)
            );
        },
        DateIsBetween: function (date, start, end) {
            return start <= date && date <= end;
        },
    };

    // #endregion
    // #region Scheduler Facade - Factory Logic (Object Creation)

    var factoryLogic = {
        ScheduleFieldFilter: function (fieldName, operator, value) {
            return { field: fieldName, operator: operator, value: value };
        },
        ScheduleGroupFilter: function (operator, filterList) {
            return { logic: operator, filters: filterList != null ? filterList : [] };
        },
    };

    // #endregion
    // #region Scheduler Facade - Initialization Logic (Page Initialization)

    var initializationLogic = {
        InitializeControllerVariables: function () {
            ctrl.appointments = new kendo.data.SchedulerDataSource({
                data: [],
            });
            ctrl.calendarDate = new Date();
            ctrl.currentTime = new Date();
            ctrl.dragData = {
                Appointment: null,
                BeginSlot: null,
                Dragging: false,
                Slots: [],
                EndSlot: null,
                OpeningModal: false,
            };
            ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';

            ctrl.hoursForDay = {};
            ctrl.listHelper = listHelper;
            ctrl.maxDate = moment().add(100, 'years').startOf('day').toDate();
            ctrl.minDate = moment().add(1, 'days').startOf('day').toDate();
            ctrl.scrollElement = null;
            ctrl.schedulerDate = ctrl.getActualDate($routeParams.date);
            $scope.patientId = $routeParams.patient ? $routeParams.patient : null;
            $scope.focusAppointment = $routeParams.appointment;
            ctrl.providerWeeklySchedule = [];
            ctrl.appointmentProviderConflicts = [];
            ctrl.schedulerDates = [];
            ctrl.schedulerStates = {
                None: 'None',
                Initialize: 'Initialize',
                Loading: 'Loading',
                Refresh: 'Refresh',
                Saving: 'Saving',
                DataLoaded: 'DataLoaded',
            };
            ctrl.startIndex = $routeParams.index > -1 ? $routeParams.index : -1;
            ctrl.treatmentRoomsLoading = false;
            ctrl.updatedAppointment = null;
            ctrl.userColumnOrder = {
                provider: [],
                room: [],
            };
            //ctrl.validCalendarDate = true;
            ctrl.workStart = new Date('2015/1/1 08:00 AM'); // default start
            ctrl.workEnd = new Date('2015/1/1 05:00 PM'); // default end
            ctrl.kendoWidgets = [];
            const ConstRoomViewAppointmentColorType = {
                AppointmentColor: "AppointmentColor",
                ProviderColor: "ProviderColor"
            };

            $scope.constRoomViewAppointmentColorType = ConstRoomViewAppointmentColorType;

            let localUserSettings = userSettingsDataService.getCachedUserSettings();
            $scope.userSettings = localUserSettings;
            $scope.roomViewAppointmentColorType = $scope.userSettings.RoomViewAppointmentColorType;
            ctrl.scheduleColumnOrder = JSON.parse(
                localUserSettings.ScheduleColumnOrder
            );

            ctrl.apps = [];
        },
        InitializeSchedulerEvents: function () {
            $scope.$on('kendoWidgetCreated', ctrl.kendoWidgetCreated);
            $scope.$on('$destroy', ctrl.onControllerDestruction);
        },
        InitializeScopeVariables: function () {
            $scope.openClipboard = $rootScope.openClipboard
                ? $rootScope.openClipboard
                : null;
            $scope.providerMaxLength = 12;
            $scope.roomMaxLength = 12;
            $scope.activeResources = [];
            $scope.alertIcons = alertIcons ? alertIcons.Value : [];
            $scope.alertIcons.getClassById = function (id, isMedicalHistoryAlert) {
                if (isMedicalHistoryAlert) {
                    if (id == 1) {
                        return 'fa-ban history-alert';
                    } else {
                        return 'fa-heart history-alert';
                    }
                } else {
                    if (id === '') {
                        id = 0;
                    }
                    let icon = _.find(this, { AlertIconId: id });
                    return icon ? icon.Name : 'fa-asterisk';
                }
            };
            $scope.appointment = boundObjectFactory.Create(
                scheduleServices.Dtos.Appointment
            );
            $scope.appointment.AfterSaveSuccess = ctrl.afterAppointmentSaved;
            appointmentTypesService.appointmentTypes = appointmentTypes;
            $scope.hoursOfOperationDictionary = {};
            $scope.initialProviderSelection = [];
            $scope.initialLocationSelection = [];
            $scope.initialRoomSelection = [];
            $scope.inUnscheduledAppointmentView = false;
            /** used for appointment-unscheduled */
            $scope.locationHoursForDay = null;
            $scope.locationHoursOfOperation = boundObjectFactory.Create(
                scheduleServices.Dtos.LocationHoursOfOperation
            );
            $scope.locationHoursOfOperation.Loading = true;
            if (locations !== null && locations !== undefined) {
                // loop through locations and set the DeactivationDate and the Timezone.
                // in the future these values will be cached with the location data that we get from the platform
                // however the calls have not been moved yet so this is a half way measure.
                let platformLocations = platformSessionService.getSessionStorage(
                    'activeLocations'
                );
                if (platformLocations) {
                    for (let i = 0; i < platformLocations.length; i++) {
                        for (let x = 0; x < locations.length; x++) {
                            if (
                                locations[x]['LocationId'] ===
                                platformLocations[i]['id']
                            ) {
                                locations[x].DeactivationTimeUtc =
                                    platformLocations[i].deactivationTimeUtc;
                                break;
                            }
                        }
                    }
                }
            }
            $scope.locations = locations;
            locationsService.locations = $scope.locations;
            $scope.priorityUnscheduledAppointmentId = null;
            //$scope.providers = [];
            // reference bug 344896
            // route being reset unintentionally
            $scope.routeParams = angular.copy($routeParams);
            $scope.routeParams.index = isNaN(parseInt($scope.routeParams.index))
                ? -1
                : parseInt($scope.routeParams.index);
            var initialDate = ctrl.getActualDate($routeParams.date);
            initialDate.setHours(0, 0, 0, 0);
            $scope.scheduleDateStart = initialDate;
            $scope.setDayViewTitle();
            $scope.scheduleDateEnd = initialDate;
            $scope.calendarPickerDate = $scope.scheduleDateStart;
            $scope.calendarPickerMaxDate = moment()
                .add(100, 'years')
                .startOf('day')
                .toDate();
            $scope.calendarPickerMinDate = moment()
                .subtract(100, 'years')
                .startOf('day')
                .toDate();
            $scope.hideCalendarPicker = false;
            $scope.selectedProviders = [];
            $scope.selectedRooms = [];
            $scope.selectedLocations = [];
            $scope.selectedFilter = { selectedLocations: [], selectProviders: [] };
            $scope.shiftResources = ctrl.shiftRooms;
            $scope.sliderValues = {
                activeIncrementIndex: 3,
                providersToShow: 6,
                roomsToShow: 6,
            };
            $scope.TimeIncrements = [5, 10, 15, 20, 30];
            $scope.TimeIncrement = practiceSettings
                ? practiceSettings.DefaultTimeIncrement
                : 5;
            $scope.treatmentRooms = [];
            roomsService.rooms = [];
            $scope.weeklySchedule = {
                RoomAssignments: [],
            };
            $scope.schedulerGroups = {
                provider: 'provider',
                room: 'room',
            };
            $scope.schedulerViews = {
                day: 'day',
                week: 'week',
            };
            // startSlider
            /// need to figure out if this causes a problem with setting up the time
            // adding in user settings to address some otherwise not great issues with the page loading.
            if ($scope.userSettings) {
                ctrl.applyUserSettings($scope.userSettings);
                if ($scope.userSettings.DefaultScheduleViewType === 1) {
                    $scope.routeParams.group = $scope.schedulerGroups.provider;
                } else if ($scope.userSettings.DefaultScheduleViewType === 2) {
                    $scope.routeParams.group = $scope.schedulerGroups.room;
                } else {
                    $scope.routeParams.group = $scope.schedulerGroups.room;
                    ctrl.saveUserSettings();
                    // setup the slider position.
                }

                var hoursDisplay = schedulerUtilities.setHoursDisplay(
                    $scope.sliderValues.activeIncrementIndex
                );

                $scope.schedulerHoursZoomClass = schedulerUtilities.updateRows(
                    hoursDisplay.value,
                    $scope.TimeIncrement
                );

                // set the slider class value so the columns line up.
                // normally this is done after you setup the watches but that process causes the page to re-render items
            }

            //$scope.sliderValues.activeIncrementIndex = $scope.TimeIncrements.indexOf($scope.TimeIncrement);
            $scope.pinnedAppointments = [];
            $scope.oldProvidersToShow = 1;
            $scope.oldRoomsToShow = 1;
            $scope.oldHourDisplay = 2;
            $scope.fillLocationTimezoneInfo(initialDate);
        },
        InitializeWatches: function () {
            $scope.selectedFilter.selectProviders = $scope.selectedProviders;
            $scope.$watch(
                'routeParams',
                function (nv, ov) {
                    $timeout(function () {
                        // we want to prevent the normal schedule query string values from being added to the appointment page
                        if (
                            $location.path().startsWith('/Schedule/Appointment/') ||
                            $location.path().startsWith('/Schedule/Block/')
                        ) {
                            // do nothing
                        } else if ($location.path().startsWith('/Schedule/')) {
                            $location.url(ctrl.buildQueryString());
                        }
                    }, 0);
                },
                true
            );
            $scope.$watch(
                'selectedFilter.selectProviders',
                function (nv, ov) {
                    if (ctrl.refreshPending === false) {
                        ctrl.selectedProvidersChanged(nv, ov);
                    }
                },
                true
            );

            $scope.$watch(
                'selectedFilter.selectedLocations',
                ctrl.selectedLocationsChanged
            );

            $scope.$watch(
                'sliderValues.providersToShow',
                ctrl.columnsSliderValueChanged.bind(null, 'provider')
            );
            $scope.$watch(
                'sliderValues.roomsToShow',
                ctrl.columnsSliderValueChanged.bind(null, 'room')
            );

            $scope.calendarWatch = $scope.$watch(
                'calendarPickerDate',
                ctrl.WatchCalendarDate
            );
            $scope.$watch('selectedLocation', $scope.defaultLocationChanged);
        },
    };

    // #endregion
    // #region Scheduler Facade - Filter Logic
    var filterLogic = {
        ApplyScheduleFilters: function (filters) {
            //console.log('Called ApplyScheduleFilters');
            $scope.scheduler.dataSource.filter(filters);
            //console.log('Called Refresh Schedule ... this method will die some day.');
            ctrl.refreshScheduler(true);
        },
    };

    // #endregion
    // #region Scheduler Facade - Lookup Logic

    var lookupLogic = {
        GetEventById: function (id) {
            return ctrl.listHelper.findItemByFieldValue(
                ctrl.apps,
                'AppointmentId',
                id
            );
        },
        GetEventIndexById: function (id) {
            return ctrl.listHelper.findIndexByFieldValue(
                ctrl.apps,
                'AppointmentId',
                id
            );
        },
        GetCollidingAppointments: function (event) {
            return lookupLogic.GetFilteredList(
                lookupLogic.GetCollidingEvents(event),
                validationLogic.EventIsAppointment
            );
        },
        GetCollidingBlocks: function (event) {
            return lookupLogic.GetFilteredList(
                lookupLogic.GetCollidingEvents(event),
                validationLogic.EventIsBlock
            );
        },
        GetCollidingEvents: function (event) {
            if (
                validationLogic.HasRequiredProperties(event, ['StartTime', 'EndTime'])
            ) {
                return lookupLogic.GetFilteredList(
                    lookupLogic.OcurrencesInRange(
                        event.AppointmentId,
                        event.StartTime,
                        event.EndTime
                    ),
                    validationLogic.ComparisonFilter(event, validationLogic.InSameColumn)
                );
            } else {
                return [];
            }
        },
        GetFilteredList: function (list, filterFunction) {
            if (list != null && angular.isFunction(filterFunction)) {
                var filteredList = [];

                for (var i = 0, length = list.length; i < length; i++) {
                    if (filterFunction(list[i])) {
                        filteredList.push(list[i]);
                    }
                }

                return filteredList;
            } else if (list != null) {
                return list;
            } else {
                return [];
            }
        },
        GetProviderColumnIdsForEvent: function (event) {
            var lookupFunction = validationLogic.EventIsAppointment(event)
                ? lookupLogic.GetProviderColumnIdsForAppointment
                : lookupLogic.GetProviderColumnIdsForBlock;

            return validationLogic.EventIsLunch(event) ? [] : lookupFunction(event);
        },
        GetProviderColumnIdsForAppointment: function (appointment) {
            var ids = [];

            if (
                validationLogic.HasRequiredProperties(appointment, [
                    'ProviderAppointments',
                ])
            ) {
                for (
                    var i = 0, length = appointment.ProviderAppointments.length;
                    i < length;
                    i++
                ) {
                    if (ids.indexOf(appointment.ProviderAppointments[i].UserId) < 0) {
                        ids.push(appointment.ProviderAppointments[i].UserId);
                    }
                }
            }

            if (
                validationLogic.HasRequiredProperties(appointment, [
                    'ExaminingDentist',
                ]) &&
                ids.indexOf(appointment.ExaminingDentist) < 0
            ) {
                ids.push(appointment.ExaminingDentist);
            }

            return ids;
        },
        GetProviderColumnIdsForBlock: function (block) {
            return validationLogic.HasRequiredProperties(block, ['UserId'])
                ? [block.UserId]
                : [];
        },
        OcurrencesInRange: function (id, start, end) {
            var occurrences = $scope.scheduler.occurrencesInRange(start, end);
            var selfOccurrenceIndex;

            for (var i = 0; i < occurrences.length; i++) {
                if (occurrences[i].AppointmentId == id) {
                    selfOccurrenceIndex = i;
                }
            }

            if (selfOccurrenceIndex >= 0) {
                occurrences.splice(selfOccurrenceIndex, 1);
            }

            return occurrences;
        },
    };

    // #endregion
    // #region Scheduler Facade - Validation Logic

    var validationLogic = {
        CanResizeEvent: function (eventId, newStart, newEnd) {
            var valid, event, modifiedEvent;
            event = lookupLogic.GetEventById(eventId);
            modifiedEvent = $.extend(angular.copy(event), {
                StartTime: newStart,
                EndTime: newEnd,
            });
            valid = validationLogic.HasRequiredVariables([event, newStart, newEnd]);
            valid = valid && !validationLogic.EventIsLunch(event);
            valid = valid && !validationLogic.EventIsBlocked(modifiedEvent);
            valid =
                valid &&
                !validationLogic.EventIsCompletedOrReadyForCheckout(modifiedEvent);
            return valid;
        },
        EventIsCompletedOrReadyForCheckout: function (event) {
            return event.Status === 3 || event.Status === 5;
        },
        CollidesWithAppointment: function (event) {
            return lookupLogic.GetCollidingAppointments(event).length > 0;
        },
        CollidesWithBlock: function (event) {
            return lookupLogic.GetCollidingBlocks(event).length > 0;
        },
        ComparisonFilter: function (item1, comparisonFunction) {
            return function (item2) {
                return comparisonFunction(item1, item2);
            };
        },
        EventIsAppointment: function (event) {
            return (
                event != null &&
                event.Classification === ctrl.ClassificationEnum.Appointment.Value
            );
        },
        EventIsBlock: function (event) {
            return (
                event != null &&
                event.Classification === ctrl.ClassificationEnum.Block.Value
            );
        },
        EventIsLunch: function (event) {
            return event != null && event.AppointmentType == 'lunch';
        },
        EventIsBlocked: function (event) {
            if (validationLogic.EventIsAppointment(event)) {
                return validationLogic.CollidesWithBlock(event);
            } else if (validationLogic.EventIsBlock(event)) {
                return (
                    validationLogic.CollidesWithAppointment(event) ||
                    validationLogic.CollidesWithBlock(event)
                );
            } else {
                return false;
            }
        },
        EventsCollide: function (event1, event2) {
            var separateEvents = validationLogic.HasRequiredVariables([
                event1,
                event2,
            ]);

            separateEvents =
                separateEvents &&
                !dateLogic.DatesCollide(
                    event1.StartTime,
                    event1.EndTime,
                    event2.StartTime,
                    event2.EndTime
                );

            separateEvents =
                separateEvents && !validationLogic.InSameColumn(event1, event2);

            return !separateEvents;
        },
        HasRequiredValues: function (variables, fields) {
            var valid = true;

            if (variables != null) {
                for (var i = 0; valid && i < variables.length; i++) {
                    valid = validationLogic.HasRequiredProperties(variables[i], fields);
                }
            }

            return valid;
        },
        HasRequiredVariables: function (variables) {
            var valid = true;

            if (variables != null) {
                for (var i = 0; valid && i < variables.length; i++) {
                    valid = variables[i] != null;
                }
            }

            return valid;
        },
        HasRequiredProperties: function (item, fields) {
            var valid = item != null;

            if (fields != null) {
                for (var i = 0; valid && i < fields.length; i++) {
                    valid = item[fields[i]] != null;
                }
            }

            return valid;
        },
        InProviderView: function () {
            return (
                $scope.scheduler != null &&
                $scope.scheduler.options.group.resources.length > 0 &&
                $scope.scheduler.options.group.resources[0] == 'provider'
            );
        },
        InRoomView: function () {
            return (
                $scope.scheduler != null &&
                $scope.scheduler.options.group.resources.length > 0 &&
                $scope.scheduler.options.group.resources[0] == 'room'
            );
        },
        InSameColumn: function (event1, event2) {
            return (
                validationLogic.InSameRoomColumn(event1, event2) ||
                validationLogic.InSameProviderColumn(event1, event2)
            );
        },
        InSameProviderColumn: function (event1, event2) {
            var event1Ids = lookupLogic.GetProviderColumnIdsForEvent(event1);
            var event2Ids = lookupLogic.GetProviderColumnIdsForEvent(event2);

            var separateEvents = true;

            for (
                var i = 0, event1Count = event1Ids.length;
                separateEvents && i < event1Count;
                i++
            ) {
                for (
                    var j = 0, event2Count = event2Ids.length;
                    separateEvents && j < event2Count;
                    j++
                ) {
                    separateEvents = event1Ids[i] != event2Ids[j];
                }
            }

            return !separateEvents;
        },
        InSameRoomColumn: function (event1, event2) {
            return (
                validationLogic.HasRequiredValues(
                    [event1, event2],
                    ['TreatmentRoomId']
                ) && event1.TreatmentRoomId == event2.TreatmentRoomId
            );
        },
        ValidateMoveEvent: function (
            dragData,
            appointment,
            resourceName,
            destinationId,
            newStart,
            newEnd
        ) {
            //CardMoving
            var result = {};
            var modifiedEvent;
            var appointmentResource, destinationResource;

            modifiedEvent = $.extend(angular.copy(appointment), {
                UserId: destinationId,
                StartTime: newStart,
                EndTime: newEnd,
            });

            var beginResource =
                dragData != null && dragData.BeginSlot != null
                    ? $scope.scheduler.resourcesBySlot(dragData.BeginSlot)
                    : null;

            if (beginResource != null && destinationId && destinationId != '') {
                if (resourceName == 'Providers') {
                    appointmentResource = scheduleProvidersService.findByUserId(
                        beginResource.Providers[0]
                    );
                    destinationResource = scheduleProvidersService.findByUserId(
                        destinationId
                    );

                    var providerTypeViewValidation =
                        appointmentResource.ProviderTypeViewId ==
                        destinationResource.ProviderTypeViewId ||
                        (appointmentResource.ProviderTypeViewId == 1 &&
                            destinationResource.ProviderTypeViewId == null) ||
                        (appointmentResource.ProviderTypeViewId == null &&
                            destinationResource.ProviderTypeViewId == 1);

                    /** if the appointment is not a block */
                    if (
                        appointment.Classification !==
                        ctrl.ClassificationEnum.Block.Value &&
                        appointmentResource != null &&
                        destinationResource != null &&
                        !providerTypeViewValidation
                    ) {
                        result.ErrorMessage =
                            appointmentResource.ProviderTypeViewId == 1
                                ? localize.getLocalizedString(
                                    'Moving a {0} appointment will change the provider for this appointment, please move this appointment to another {0} appointment space.',
                                    ['regular']
                                )
                                : localize.getLocalizedString(
                                    'Moving a {0} appointment will change the examining dentist for this appointment, please move this appointment to another {0} appointment space.',
                                    ['hygiene']
                                );
                        result.IsValid = false;
                        return result;
                    }

                    if (beginResource.Providers[0] != destinationId) {
                        _.forEach(
                            modifiedEvent.ProviderAppointments,
                            function (providerAppointment) {
                                if (providerAppointment.UserId != destinationId) {
                                    providerAppointment.UserId = destinationId;
                                }
                            }
                        );
                    }
                } else if (resourceName == 'Rooms') {
                    modifiedEvent.TreatmentRoomId = destinationId;
                }
            }

            result.ErrorMessage = validationLogic.EventIsBlocked(modifiedEvent)
                ? localize.getLocalizedString(
                    modifiedEvent.Classification === ctrl.ClassificationEnum.Block.Value
                        ? 'An appointment or block exists, please move this block to an open space.'
                        : 'A block exists, please move this appointment to an open space.'
                )
                : localize.getLocalizedString(
                    'The appointment is missing required fields.'
                );
            result.IsValid =
                validationLogic.HasRequiredVariables([appointment, newStart, newEnd]) &&
                !validationLogic.EventIsBlocked(modifiedEvent);

            return result;
        },
    };

    // #endregion

    ctrl.schedulerFacade = {
        Dates: dateLogic,
        Factory: factoryLogic,
        Filters: filterLogic,
        Initialization: initializationLogic,
        Lookups: lookupLogic,
        Validation: validationLogic,
    };

    // #endregion
    // #region Unclassified Functions
    ctrl.addAppointment = function (e) {
        // prevents kendo popup
        e.preventDefault();

        if (!ctrl.checkAvailability(e.event.start, e.event.end)) {
            return;
        }

        if (
            e.event.AppointmentType != 'lunch' &&
            _.isUndefined(e.event.AppointmentId)
        ) {
            var date = e.event.start;
            var endDate;
            date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5);
            endDate = _.cloneDeep(date);
            endDate.setMinutes(
                endDate.getMinutes() + practiceSettings.DefaultTimeIncrement
            );
            var treatmentRoomId = null,
                providerId = null;
            if (e.event.Providers) {
                providerId = e.event.Providers[0];
                _.forEach(ctrl.hoursForDay[e.event.Providers[0]], function (sched) {
                    if (
                        sched.Day === e.event.start.getDay() &&
                        sched.LocationId === $scope.selectedLocation.LocationId &&
                        e.event.start >= sched.StartTime.toDate() &&
                        e.event.start <= sched.EndTime.toDate()
                    ) {
                        treatmentRoomId = sched.OtherId;
                        return false;
                    }
                });
            } else {
                treatmentRoomId = e.event.TreatmentRoomId;
                _.forEach(ctrl.hoursForDay[e.event.TreatmentRoomId], function (sched) {
                    if (
                        sched.Day === e.event.start.getDay() &&
                        sched.LocationId === $scope.selectedLocation.LocationId &&
                        e.event.start >= sched.StartTime.toDate() &&
                        e.event.start <= sched.EndTime.toDate()
                    ) {
                        providerId = sched.OtherId;
                        return false;
                    }
                });
            }
            // get location id for appointment
            // ref bug 382075 / 384588
            // determines the location id by the selected roomId if available
            var selectedLocationId = scheduleAppointmentUtilitiesService.getLocationIdForAppointment(
                treatmentRoomId,
                $scope.selectedLocation
            );

            $scope.toggleUnscheduledAppointmentView({
                StartTime: date,
                EndTime: endDate,
                TreatmentRoomId: treatmentRoomId,
                UserId: providerId,
                LocationId: selectedLocationId,
                WasDragged: false,
            });
            return;
        } else if (e.event.PersonId) {
            ctrl.addProviderIdsToAppointment(e.event);
        }
        ctrl.appointments.data().push(e.event);
    };

    ctrl.addProvidersHourByRoomToDictionary = function (providerHoursByRoom) {
        if (providerHoursByRoom) {
            $scope.hoursOfOperationDictionary[
                providerHoursByRoom.UserId
            ] = providerHoursByRoom;
            if (!angular.isArray(ctrl.hoursForDay[providerHoursByRoom.UserId])) {
                ctrl.hoursForDay[providerHoursByRoom.UserId] = [];
            }
            if (!angular.isArray(ctrl.hoursForDay[providerHoursByRoom.RoomId])) {
                ctrl.hoursForDay[providerHoursByRoom.RoomId] = [];
            }
            ctrl.hoursForDay[providerHoursByRoom.UserId].push(
                ctrl.getTime(
                    providerHoursByRoom.Weekday,
                    providerHoursByRoom.StartTime,
                    providerHoursByRoom.StopTime,
                    null,
                    null,
                    providerHoursByRoom.LocationId,
                    providerHoursByRoom.RoomId
                )
            );
            ctrl.hoursForDay[providerHoursByRoom.RoomId].push(
                ctrl.getTime(
                    providerHoursByRoom.Weekday,
                    providerHoursByRoom.StartTime,
                    providerHoursByRoom.StopTime,
                    null,
                    null,
                    providerHoursByRoom.LocationId,
                    providerHoursByRoom.UserId
                )
            );
        }
    };

    ctrl.addProviderIdsToAppointment = function (appointment) {
        appointment.Providers = [];

        // replace with regular for loop
        for (let i = 0; i < appointment.ProviderAppointments.length; i++) {
            if (appointment.ProviderAppointments[i]) {
                appointment.ProviderAppointments[i].ObjectState = saveStates.None;

                if (
                    appointment.Providers.indexOf(
                        appointment.ProviderAppointments[i].UserId
                    ) < 0
                ) {
                    appointment.Providers.push(
                        appointment.ProviderAppointments[i].UserId
                    );
                }
            }
        }

        appointment.ProviderString = ctrl.listHelper.createConcatenatedString(
            appointment.ProviderAppointments,
            ctrl.getUserCodeForProviderAppointment,
            '_'
        );

        // Fake out Providers that ExaminingDentist is a ProviderAppointment so that it will show up in the Provider's column
        if (
            appointment.ExaminingDentist &&
            ctrl.activeView != $scope.schedulerViews.week
        ) {
            appointment.Providers.push(appointment.ExaminingDentist);
            appointment.ProviderString +=
                (appointment.ProviderString > '' ? '_' : '') +
                ctrl.getUserCodeForProviderAppointment({
                    UserId: appointment.ExaminingDentist,
                });
        }

        // provider block shouldn't have any providers in the list
        if (
            appointment.Classification == ctrl.ClassificationEnum.Block.Value &&
            appointment.Providers.length == 0
        ) {
            appointment.Providers.push(appointment.UserId);

            appointment.ProviderString +=
                (appointment.ProviderString > '' ? '_' : '') +
                ctrl.getUserCodeForProviderAppointment(appointment);
        }
    };

    ctrl.adjustProviderAppointments = function (appointment, newStart, oldStart) {
        var providerAppointmentDuration = 0;
        var timeFromStart = 0;

        // new start time to use
        var startMoment = moment(newStart.toISOString());
        for (var i = 0; i < appointment.ProviderAppointments.length; i++) {
            providerAppointmentDuration = ctrl.getDuration(
                appointment.ProviderAppointments[i].StartTime,
                appointment.ProviderAppointments[i].EndTime
            );
            // get duration of provider appointments to old start time before applying to new start time
            timeFromStart = ctrl.getDuration(
                oldStart,
                appointment.ProviderAppointments[i].StartTime
            );
            startMoment.add(timeFromStart, 'm');
            appointment.ProviderAppointments[i].StartTime = startMoment.toISOString();
            startMoment.add(providerAppointmentDuration, 'm');
            appointment.ProviderAppointments[i].EndTime = startMoment.toISOString();
            startMoment.add(timeFromStart + providerAppointmentDuration, 'm');
            appointment.ProviderAppointments[i].ObjectState = saveStates.Update;
        }
    };

    ctrl.isAppointmentFromTodayInLocationTime = function (
        appt,
        scheduleStartDate,
        scheduleEndDate
    ) {
        var result = false;
        // if location is null or undefined, let's try and grab it. there's gatta be an array of locations around here.
        if (_.isNil(appt.Location)) {
            if (!_.isNil(appt.LocationId)) {
                appt.Location = locationsService.findByLocationId(appt.LocationId);
            }
        }

        if (!_.isNil(appt.Location)) {
            // this is a little odd however I need to ensure the enddate is ending on the end of today which is the start of tomorrow.
            var newEndDate = null;

            if (ctrl.activeView === $scope.schedulerViews.day) {
                newEndDate = moment(scheduleStartDate).add(24, 'h').toDate();
            } else {
                // number of hours in a week
                newEndDate = moment(scheduleStartDate).add(168, 'h').toDate();
            }

            //console.log('Todays Start Date: ' + scheduleStartDate);
            //console.log('Todays End Date: ' + newEndDate);

            var tz = timeZoneFactory.GetFullTZ(appt.Location.Timezone);

            //console.log('Original Start Date: ' + appt.StartTime);
            //console.log('Original End Date: ' + appt.EndTime);
            //console.log('Converted Start Date: ' + timeZoneFactory.ConvertDateToBasicMomentTZ(appt.StartTime, tz.MomentTZ).toDate());
            //console.log('Converted End Date: ' + timeZoneFactory.ConvertDateToBasicMomentTZ(appt.EndTime, tz.MomentTZ).toDate());

            // same day methods are not consistent so just utilize < and >.
            if (
                scheduleStartDate <=
                timeZoneFactory
                    .ConvertDateToBasicMomentTZ(appt.StartTime, tz.MomentTZ)
                    .toDate() &&
                newEndDate >=
                timeZoneFactory
                    .ConvertDateToBasicMomentTZ(appt.EndTime, tz.MomentTZ)
                    .toDate()
            ) {
                result = true;
            }
        }
        //console.log('Are the appointments on the same day as today? : ' + result);
        return result;
    };

    // this method is used after the modal returns the newly created appointment or edited appointment.
    // otherwise this is the same code in the postProcess appointments method.
    // will remove duplication once we are solid on what needs to be here.
    // ... no need to be perfect, until it makes sense.
    ctrl.getAppointmentOnSuccess = getAppointmentOnSuccess;
    function getAppointmentOnSuccess(appointment) {
        // we need to massage the object we get back from the api/signalr
        //   so that we can display the alerts and flags on the appointment card
        //   after an update
        // medical alerts
        let alerts = [];
        let alertIds = appointment.MedicalHistoryAlertIds;
        if (alertIds) {
            _.forEach(alertIds, function (alertId) {
                let alert = _.find(ctrl.medicalAlerts, { SymbolId: alertId });
                if (alert) {
                    alerts.push(alert);
                }
            });
        }
        appointment.MedicalAlerts = alerts;

        // flags. these are called alerts on the frontend in some places,
        //   but they're the flags set for the patient
        appointment.Alerts = appointment.PatientAlerts;

        $scope.appointment.Saving = false;
        ctrl.resetDragData();

        var appt = ctrl.prepareAppointmentForDisplay(
            appointment,
            ctrl.serviceCodes
        );

        ctrl.addProviderIdsToAppointment(appt);

        ctrl.updateAppointmentDisplay(appt);
    }

    ctrl.getAppointmentWithDetailsOnError = function (err) {
        $scope.appointment.Loading = false;
        toastrFactory.error(
            $scope.schedulePageText.getAppointmentWithDetailsFailed,
            'Error'
        );
    };

    ctrl.appendResourceDataFromSlot = appendResourceDataFromSlot;
    function appendResourceDataFromSlot(appointment, slot) {
        if (appointment != null && slot.groupIndex > -1) {
            var resource = $scope.scheduler.resourcesBySlot(slot);
            // unsure the reason for this code to exist quite yet.
            // however it is important to highlight this code will cause problems,
            // if you do not reset the drag slots in certain scenarios.
            // we will have to figure out why this code exits at a future date.
            if (resource.Providers) {
                appointment.UserId = resource.Providers[0];
                appointment.ProviderAppointments = [
                    {
                        UserId: resource.Providers[0],
                        StartTime: appointment.StartTime,
                        EndTime: appointment.EndTime,
                        ObjectState: saveStates.Add,
                    },
                ];
            } else if (resource.TreatmentRoomId) {
                appointment.TreatmentRoomId = resource.TreatmentRoomId;
            }
        }
    }

    ctrl.mapAppointmentResponseToViewModel = function (appt) {
        // the purpose of this is to remove items from being bound on the ui.
        // I am not sure this is paying us enough of a dividend to make it worth while.
        // takes around 40 - 60ms
        var result = _.cloneDeep(appt);
        // I can see no reason to do this ... so lets remove these lines of code.
        //delete result.Location;
        //delete result.Patient;
        //delete result.Provider;
        //delete result.ProviderUsers;
        return result;
    };

    ctrl.applyUserColumnOrder = applyUserColumnOrder;
    function applyUserColumnOrder() {
        //Replace these functions with normal order by clauses.
        $scope.selectedProviders = ctrl.getOrderedList(
            ctrl.userColumnOrder['provider'],
            $scope.selectedProviders,
            'ProviderId'
        );
        $scope.selectedRooms = ctrl.getOrderedList(
            ctrl.userColumnOrder['room'],
            $scope.selectedRooms,
            'RoomId'
        );
    }

    // this code is horrible because it kicks off a change to the slide function redoing things again on the view.
    // figure out how to remove or something to that effect so the change only happens once.
    ctrl.applyUserSettings = applyUserSettings;
    function applyUserSettings(settings) {
        let currentLocation = locationService.getCurrentLocation();

        if (settings.ScheduleColumnOrder) {
            ctrl.userSettingsExist = true;
            $scope.userSettings = settings;
            // get the original settings.ScheduleColumnOrder
            var originalScheduleColumnOrder = JSON.parse(
                settings.ScheduleColumnOrder
            );
            // add location if needed
            ctrl.scheduleColumnOrder = schedulerUtilities.parseScheduleColumnOrder(
                originalScheduleColumnOrder,
                currentLocation
            );
            // get the userColumnOrder for the current location
            ctrl.userColumnOrder = schedulerUtilities.getUserColumnOrderByLocation(
                ctrl.scheduleColumnOrder,
                currentLocation
            );

            if (
                settings.DefaultHourColumnCount > 0 &&
                $scope.sliderValues.activeIncrementIndex !==
                parseInt(settings.DefaultHourColumnCount) - 1
            )
                $scope.sliderValues.activeIncrementIndex =
                    parseInt(settings.DefaultHourColumnCount) - 1;
            if (settings.DefaultProviderColumnCount > 0)
                $scope.sliderValues.providersToShow =
                    settings.DefaultProviderColumnCount;
            if (settings.DefaultRoomColumnCount > 0)
                $scope.sliderValues.roomsToShow = settings.DefaultRoomColumnCount;
            ctrl.applyUserColumnOrder();
        } else {
            // create new ctrl.scheduleColumnOrder and ctrl.userColumnOrder based on location
            ctrl.scheduleColumnOrder = [
                { location: currentLocation.id, provider: [], room: [] },
            ];
            ctrl.userColumnOrder = schedulerUtilities.getUserColumnOrderByLocation(
                ctrl.scheduleColumnOrder,
                currentLocation
            );
        }
        $scope.isScheduleInPrivacyMode = settings.IsScheduleInPrivacyMode;
        $scope.roomViewAppointmentColorType = settings.RoomViewAppointmentColorType;
    }

    ctrl.appointmentClosed = function () {
        $scope.routeParams.open = null;
    };

    ctrl.appointmentEditCanceled = function () {
        ctrl.resetDragSlots();
        ctrl.resetDragData();
        ctrl.removeOpenRouteParameter();
        ctrl.setAppointmentBeingSaved(false);
        $scope.appointmentSavedNeedRedraw = false;
    };

    ctrl.addAppointmentFromSave = addAppointmentFromSave;
    function addAppointmentFromSave(appointment) {
        //console.log('This preview method is broken');
        //console.log('It will not work unless we refactor the methods used in this method');
        appointment.start = new Date(appointment.StartTime);
        appointment.end = new Date(appointment.EndTime);
        if (
            appointment.Classification === ctrl.ClassificationEnum.Block.Value &&
            appointment.Providers.length == 0
        ) {
            if (appointment.Providers.indexOf(appointment.UserId) < 0) {
                appointment.Providers.push(appointment.UserId);
            }
        }

        let index = lookupLogic.GetEventIndexById(appointment.AppointmentId);
        let appointmentList = _.cloneDeep(ctrl.appointments.data());
        // remove existing one if need be ... other wise add.
        if (index > -1) {
            appointment.id = index;
            ctrl.apps.splice(index, 1);
            appointmentList.splice(index, 1);
        } else {
            appointment.id = ctrl.appointments.data().length - 1;
        }
        appointment.ObjectState = saveStates.None;
        if (
            ctrl.isAppointmentFromTodayInLocationTime(
                appointment,
                $scope.scheduleDateStart,
                $scope.scheduleDateEnd
            )
        ) {
            ctrl.apps.push(appointment);
            appointmentList.push(ctrl.mapAppointmentResponseToViewModel(appointment));
            ctrl.appointments = new kendo.data.SchedulerDataSource({
                data: appointmentList,
            });
            ctrl.setSchedulerDataSource(ctrl.appointments);
        } else {
            console.log('Schedule was not updated because update was not for today.');
        }

        if ($scope.$$nextSibling) {
            if ($scope.$$nextSibling.fromUnscheduled) {
                $scope.$$nextSibling.refreshPatientUnscheduledAppts();
            }
        }
    }

    ctrl.blockSavedOrCancelled = blockSavedOrCancelled;
    function blockSavedOrCancelled(block) {
        let url = sessionStorage.getItem('fuse-last-url');
        if (url !== null && url !== undefined) {
            // remove the value.
            sessionStorage.removeItem('fuse-last-url');
            window.open('#' + url, '_self');
        } else {
            console.log(
                'No value was found in session storage so we will redirect to the schedule.'
            );
            // as a fallback we should just redirect to the schedule
            window.open('#/Schedule/', '_self');
        }
    }

    ctrl.changedAppointmentId = undefined;
    ctrl.appointmentSaved = appointmentSaved;
    function appointmentSaved(newAppointment) {
        //Before saveAppointment in  schedule-appointment-modal-service, the DataTag is being stored before appointment is updated with new DataTag
        $scope.lastEditedAppointment = scheduleAppointmentModalService.getOriginalDataTagBeforeSave();

        // clear the $scope.routeParams.open, if we forget to do this,
        // a schedule reload will open the appointment whose id matches this value
        ctrl.appointmentClosed();

        if (newAppointment.IsSwitchToBlock) {
            ctrl.switchToBlockModal(newAppointment);
        } else {
            if (
                newAppointment.IsPinned &&
                newAppointment.Classification ===
                ctrl.ClassificationEnum.UnscheduledAppointment.Value
            ) {
                $scope.showClipboard = true;
                $scope.openClipboard = true;
            }

            // we only want one of the update methods to run, hub update or after modal process. So we check before proceeding.
            if (
                !$scope.lastEditedAppointment ||
                ($scope.lastEditedAppointment &&
                    $scope.lastEditedAppointment.DataTag !== newAppointment.DataTag)
            ) {
                $scope.lastEditedAppointment = {
                    AppointmentId: newAppointment.AppointmentId,
                    DataTag: newAppointment.DataTag,
                };
                //console.log('Processing postAppointmentSaved');
                //console.log($scope.lastEditedAppointment);
                $scope.appointmentSavedNeedRedraw = true;
                ctrl.postAppointmentSaved(newAppointment);
            } else {
                //console.log('The Appointment was updated in a prior event, so we will not process the postappointmentSaved method.');
            }
        }
        ctrl.setAppointmentBeingSaved(false);
    }

    ctrl.postAppointmentSaved = postAppointmentSaved;
    function postAppointmentSaved(newAppointment) {
        if (newAppointment != null) {
            $scope.appointment.Data = angular.copy(newAppointment);

            // set original status after save
            if (
                angular.isDefined($scope.appointment.Data.Status) &&
                $scope.appointment.Data.Status >= 0
            ) {
                $scope.appointment.Data.OriginalStatus = $scope.appointment.Data.Status;
            }

            if (
                newAppointment.Classification ===
                ctrl.ClassificationEnum.UnscheduledAppointment.Value
            ) {
                var index = lookupLogic.GetEventIndexById(newAppointment.AppointmentId);
                if (index > -1) {
                    ctrl.apps.splice(index, 1);
                    ctrl.appointments = new kendo.data.SchedulerDataSource({
                        data: _.map(ctrl.apps, ctrl.mapAppointmentResponseToViewModel),
                    });
                    ctrl.setSchedulerDataSource(ctrl.appointments);
                }
                /** references refresh in appointment-unscheduled-controller */
                $scope.refreshUnscheduledAppointments = true;
            }

            ctrl.removeOpenRouteParameter();

            var servicesFailed = false;

            if (
                newAppointment.PlannedServices &&
                newAppointment.PlannedServices.length > 0
            ) {
                _.forEach(newAppointment.PlannedServices, function (service) {
                    if (service.ObjectState == saveStates.Failed) {
                        servicesFailed = true;
                    }
                });
            }

            // setup the providers for the item ??
            if (angular.isUndefined(newAppointment.Providers)) {
                newAppointment.Providers = [];
            }

            // Adapter ... needed because the Modal does not return data in the same format.
            // object format from modal is not consistent from the modal. Sometimes the Patient record
            // contains data other times it is the Patient.Profile object.
            // this is an adapter.

            if (
                newAppointment.Classification !==
                ctrl.ClassificationEnum.UnscheduledAppointment.Value
            ) {
                if ($scope.scheduler) {
                    switch (newAppointment.ObjectState) {
                        case 'status':
                            var statusAppointment = _.find(ctrl.apps, {
                                AppointmentId: newAppointment.AppointmentId,
                            });

                            if (statusAppointment) {
                                // the object needs to be disconnected from the original value otherwise adding it back on the view
                                // is not working consistently because the original values are tied to DOM elements.
                                // I assume Kendo is not releasing the elements based on what I can tell.
                                var newStatusAppointment = _.cloneDeep(statusAppointment);
                                newStatusAppointment.Status = newAppointment.Status;
                                newStatusAppointment.DataTag = newAppointment.DataTag;

                                // status updates will process but will not require object format changes.
                                // all we need to do is update some Status values since both of those operations modify Status on the object

                                // this ensures the Status icon is set correctly.
                                newStatusAppointment = appointmentStatusService.setAppointmentStatus(
                                    newStatusAppointment
                                );

                                ctrl.updateAppointmentDisplay(newStatusAppointment);
                            }
                            break;
                        case saveStates.Delete:
                            var index = lookupLogic.GetEventIndexById(
                                newAppointment.AppointmentId
                            );

                            if (index > -1) {
                                ctrl.apps.splice(index, 1);
                                ctrl.appointments = new kendo.data.SchedulerDataSource({
                                    data: _.map(
                                        ctrl.apps,
                                        ctrl.mapAppointmentResponseToViewModel
                                    ),
                                });
                                ctrl.setSchedulerDataSource(ctrl.appointments);
                            }
                            break;
                        case saveStates.Update:
                            ctrl.updatedAppointment = null;

                            if (
                                ctrl.isAppointmentFromTodayInLocationTime(
                                    newAppointment,
                                    $scope.scheduleDateStart,
                                    $scope.scheduleDateEnd
                                )
                            ) {
                                ctrl.getAppointmentOnSuccess(newAppointment);
                            } else {
                                console.log(
                                    'Schedule was not updated because update was not for today, it will be removed if on the screen previously.'
                                );
                                var index = lookupLogic.GetEventIndexById(
                                    newAppointment.AppointmentId
                                );
                                // remove existing one if need be ... other wise add.
                                if (index > -1) {
                                    ctrl.apps.splice(index, 1);
                                    ctrl.appointments = new kendo.data.SchedulerDataSource({
                                        data: _.map(
                                            ctrl.apps,
                                            ctrl.mapAppointmentResponseToViewModel
                                        ),
                                    });
                                    ctrl.setSchedulerDataSource(ctrl.appointments);
                                }
                            }

                            if (servicesFailed) {
                                ctrl.showFailedServiceMessage();
                            }
                            break;
                        case saveStates.Add:
                            if (
                                ctrl.isAppointmentFromTodayInLocationTime(
                                    newAppointment,
                                    $scope.scheduleDateStart,
                                    $scope.scheduleDateEnd
                                )
                            ) {
                                ctrl.getAppointmentOnSuccess(newAppointment);
                            }
                            break;
                        default:
                            if (
                                ctrl.isAppointmentFromTodayInLocationTime(
                                    newAppointment,
                                    $scope.scheduleDateStart,
                                    $scope.scheduleDateEnd
                                )
                            ) {
                                ctrl.getAppointmentOnSuccess(newAppointment);
                            } else {
                                console.log(
                                    'Schedule was not updated because update was not for today'
                                );
                            }
                            newAppointment.ObjectState = saveStates.None;
                            $scope.createQueue('refresh');
                    }
                }
            } else {
                // For Unscheduled --- and Unscheduled on the clipboard we need to ensure proper handling.
                // We remove them from the view only if they need to be removed from the view.

                // if we are adding a new unscheduled or Clipboard Appt no action is necessary
                // Only do something if the action is something other then Add.
                if (newAppointment.ObjectState != saveStates.Add) {
                    var index = lookupLogic.GetEventIndexById(
                        newAppointment.AppointmentId
                    );

                    if (index > -1) {
                        ctrl.apps.splice(index, 1);
                        ctrl.appointments = new kendo.data.SchedulerDataSource({
                            data: _.map(ctrl.apps, ctrl.mapAppointmentResponseToViewModel),
                        });
                        ctrl.setSchedulerDataSource(ctrl.appointments);
                    }
                }
            }

            if (
                newAppointment.MedicalAlerts === undefined ||
                newAppointment.MedicalAlerts.length === 0
            ) {
                ctrl.addMedicalAlertsToAppointment(
                    newAppointment,
                    newAppointment.MedicalHistoryAlertIds
                );
            }
            // prevent overwriting signalr data on update if no patient alerts in details
            if (!_.isEmpty(newAppointment.PatientAlerts)) {
                newAppointment.Alerts = newAppointment.PatientAlerts;
            }
            ctrl.postAppointmentSavedUpdatePinnedAppointmentDisplay(
                newAppointment,
                newAppointment.ObjectState
            );

            // investigate if this should be done here.
            $scope.openClipboard = false;
        }
    }

    ctrl.buildIdList = buildIdList;
    function buildIdList(list, idField) {
        var idList = [];
        var listCopy = angular.copy(list);

        _.forEach(listCopy, function (item) {
            if (item[idField] != null) {
                idList.push(item[idField]);
            }
        });

        return idList;
        // return _.map(_.filter(list, function(item){return item[idField] !== null}), idField);
    }

    //This builds the Id list for the ScheduleColumnOrder in user settings for the providers
    ctrl.buildIdListForProvider = buildIdListForProvider;
    function buildIdListForProvider(list, providerId, locationId) {
        var idList = [];
        var listCopy = angular.copy(list);

        _.forEach(listCopy, function (item) {
            if (item[providerId] != null) {
                idList.push({
                    ProviderId: item[providerId],
                    LocationId: item[locationId],
                });
            }
        });

        return idList;
    }

    // look at removing routeParams from scope if possible
    ctrl.buildQueryString = function () {
        $location.replace();

        var routeParams = $scope.routeParams;
        var queryString = '?date=';
        if (routeParams.date) {
            queryString += routeParams.date;
        } else {
            var date = new Date();
            queryString += date.toISOString().substr(0, 10);
        }

        queryString += '&view=';
        if (routeParams.view) {
            switch (String(routeParams.view).toLowerCase()) {
                case $scope.schedulerViews.week:
                    queryString += 'week';
                    break;
                case $scope.schedulerViews.day:
                default:
                    queryString += 'day';
                    break;
            }
        } else {
            queryString += 'day';
        }

        queryString += '&group=';
        if (routeParams.group) {
            switch (String(routeParams.group).toLowerCase()) {
                case $scope.schedulerGroups.room:
                    queryString += 'room';
                    break;
                case $scope.schedulerGroups.provider:
                default:
                    queryString += 'provider';
                    break;
            }
        } else {
            queryString += 'provider';
        }

        queryString += '&providers=';
        if (routeParams.providers) {
            queryString += routeParams.providers;
        } else {
            queryString += 'all';
        }

        // adding rooms to routeParams to support room selector
        queryString += '&rooms=';
        if (routeParams.rooms) {
            queryString += routeParams.rooms;
        } else {
            queryString += 'all';
        }

        queryString += '&location=';
        if (routeParams.location) {
            queryString += routeParams.location;
        } else {
            if ($scope.selectedLocation) {
                queryString += $scope.selectedLocation.NameAbbreviation;
            } else {
                if (
                    locationsService.locations &&
                    locationsService.locations.length > 0
                ) {
                    queryString += locationsService.locations[0].NameAbbreviation;
                } else {
                    queryString += '';
                }
            }
        }

        queryString += '&index=';
        if (routeParams.index) {
            var index = parseInt(routeParams.index);
            queryString += isNaN(index) ? 0 : index;
        } else {
            queryString += 0;
        }

        if (routeParams.open > '') {
            queryString += '&open=';

            queryString += routeParams.open;
        }

        if (routeParams.open > '' && routeParams.patient > '') {
            queryString += '&patient=';

            queryString += routeParams.patient;
        }

        if (routeParams.targetTab && routeParams.open) {
            queryString += '&targetTab=';
            queryString += routeParams.targetTab;
        }

        return queryString;
    };

    ctrl.calculateResourceStartIndex = calculateResourceStartIndex;

    function calculateResourceStartIndex(list, offset, itemsToShow) {
        if (offset < 0 && list.length > itemsToShow && ctrl.startIndex == 0) {
            ctrl.startIndex = list.length - itemsToShow;
        } else {
            if (
                offset > 0 &&
                list.length > itemsToShow &&
                list.length - ctrl.startIndex == itemsToShow
            ) {
                ctrl.startIndex = 0;
            } else {
                ctrl.startIndex = Math.max(
                    0,
                    Math.min(list.length - itemsToShow, ctrl.startIndex + offset)
                );
            }
        }

        $scope.routeParams.index = ctrl.startIndex;
    }

    // revert appointment changes on cancel drag event
    ctrl.cancelDragAppointment = function () {
        //debugger;
        ctrl.setAppointmentBeingSaved(false);
        var appointment = ctrl.backupAppointment;
        var index = lookupLogic.GetEventIndexById(appointment.AppointmentId);

        if (index > -1) {
            appointment.id = index;

            ctrl.appointments.data().splice(index, 1);
            ctrl.apps.splice(index, 1);
            if ($scope.scheduler) {
                ctrl.apps.push(appointment);
                $scope.scheduler.addEvent(
                    ctrl.mapAppointmentResponseToViewModel(appointment)
                );
            }
        }
        ctrl.refreshAppointmentListData();
    };

    // Provider view configuration and card movement for display
    ctrl.changeAppointmentDisplay = changeAppointmentDisplay;
    function changeAppointmentDisplay(e) {
        var view, events, eventElement, event, slot, resource;

        //console.log('Called changeAppointmentDisplay');

        if (ctrl.isRefreshPending) {
            //console.log('View was not refreshed ... awaiting new data from api');
            $scope.isMissingRequiredItems = false;
            return;
        } else {
            $scope.isMissingRequiredItems = $scope.isMissingReqs();
        }

        if ($scope.scheduler) {
            view = $scope.scheduler.view();
            events = $scope.scheduler.dataSource.view();
        } else {
            view = this.view();
            events = this.dataSource.view();
        }

        if ($scope.schedViewName === 'week' && view.title === 'Day') {
            // This is an edge case, the user was in week view and clicked on a day column header.
            // We set the view to day and broadcast to the calendarpicker based on the date they clicked.
            // Why we have 4 different ways of specifying day view is left as an exercise for the reader - D1(Bug 405755)
            ctrl.activeView = $scope.schedulerViews.day;
            $scope.routeParams.view = 'day';
            $scope.schedViewName = 'day';
            $scope.scheduler.view().name = 'day';

            // This sends a broadcast message to the calenderPicker control which then initiates a day change.
            $scope.$broadcast('goToDateChild', 'jumptodate', view.options.date);
            return;
        }

        // was the data just loaded? or are we in transition to a new view and this is the last step.
        // the below code is only ever needed when we are in provider view on the day display.
        if (
            $scope.schedViewName &&
            $scope.schedViewName !== 'week' &&
            !validationLogic.InRoomView()
        ) {
            var firstElement = null;

            for (var idx = 0, length = events.length; idx < length; idx++) {
                event = events[idx];

                /** get event element */
                eventElement = view.element.find('[data-uid=' + event.uid + ']');

                /** event has an element to style */
                if (eventElement[0]) {
                    _.forEach(eventElement, function (element) {
                        if (
                            angular.isUndefined(element.canBeProcessed) ||
                            element.canBeProcessed
                        ) {
                            slot = $scope.scheduler.slotByElement(element);
                            resource = $scope.scheduler.resourcesBySlot(slot);
                            /** styling for provider view only */
                            if (resource.Providers) {
                                var provider = scheduleProvidersService.findByUserId(
                                    resource.Providers[0]
                                );

                                /** if provider is a Dentist, we style events in here */
                                if (provider != null && provider.ProviderTypeId === 1) {
                                    provider.ProviderTypeViewId = provider.ProviderTypeViewId
                                        ? provider.ProviderTypeViewId
                                        : 1;
                                    var columns = [];
                                    var collapsedColumns = [];

                                    /** processEvent makes sure we find every collision, also sets allCollidingEvents and allCollapsedEvents */
                                    ctrl.allCollidingEvents = [];
                                    ctrl.allCollapsedEvents = [];

                                    //**** work in progress ... need to get this evaluated on the view.
                                    // in order to ensure the status icon is not shown in some instances this needs to be processed
                                    //before putting the values on the view do these methods ... to set the appointments right.
                                    ctrl.processEvent(event, provider);

                                    var collidingEvents = ctrl.orderEventColumns(
                                        ctrl.allCollidingEvents
                                    );
                                    columns = ctrl.createColumns(
                                        event,
                                        provider.UserCode,
                                        collidingEvents
                                    );

                                    var collapsedEvents = ctrl.orderEventColumns(
                                        ctrl.allCollapsedEvents
                                    );

                                    collapsedColumns = ctrl.createColumns(
                                        event,
                                        provider.UserCode,
                                        collapsedEvents
                                    );
                                    ///

                                    // experimenting with flatten and map -- this does not update the icon though ...
                                    // I will have to move this code to get the effect I want. (do not delete)
                                    // _.forEach(collapsedColumns, function (item) {
                                    //     // go through the events and get me the one that matches the current event
                                    //     // if i find a match we will not display the icon and the details of the card.
                                    //     var result = _.find(item.events, { AppointmentId : event.AppointmentId });
                                    //
                                    //     if(result !== null)
                                    //     {
                                    //         event.showAppointmentIcon = false;
                                    //     }
                                    // });

                                    // need to crawl through the collapsedColumns values and if the current event is in that list ...
                                    ctrl.styleProviderColumn(
                                        view,
                                        slot,
                                        resource,
                                        provider,
                                        columns,
                                        collapsedColumns.length,
                                        false
                                    );
                                    ctrl.styleProviderColumn(
                                        view,
                                        slot,
                                        resource,
                                        provider,
                                        collapsedColumns,
                                        collapsedColumns.length,
                                        true
                                    );
                                    ctrl.resetProcessedEvents();
                                } else {
                                    //let eventElement = angular.element(element);
                                    /** set default css properties */
                                    //eventElement.css({
                                    //    'border-radius': '0',
                                    //    'border': 'none',
                                    //    'overflow': 'visible',
                                    //    'left': eventElement[0].offsetLeft + 5 + 'px'
                                    //}).addClass('appointment');

                                    //sctrl.addAppointmentDetails(angular.element(element), event, resource);

                                    ctrl.getProvidersTime(
                                        event,
                                        '#providerTime',
                                        angular.element(element),
                                        resource
                                    );
                                }
                            } else {
                                /** styling for other views */
                                //var eventElement = angular.element(element);
                                //eventElement.css({
                                //    'border-radius': '0',
                                //    'border': 'none',
                                //    'overflow': 'visible',
                                //    'left': eventElement[0].offsetLeft + 5 + 'px'
                                //})
                                //eventElement.addClass('appointment');
                            }

                            event.canBeProcessed = true;
                        } else {
                            event.canBeProcessed = true;
                        }
                        if (
                            (ctrl.schedulerState == ctrl.schedulerStates.Refresh ||
                                ctrl.schedulerState == ctrl.schedulerStates.Loading) &&
                            (!$scope.focusAppointment ||
                                event.AppointmentId == $scope.focusAppointment)
                        ) {
                            if (firstElement === null) {
                                firstElement = element;
                            }
                        }
                    });
                }
            }

            if (firstElement != null) {
                ctrl.setScrollElement(firstElement, 1);
            }
        }
        $scope.appointmentSavedNeedRedraw = false;
    }

    $scope.calendarUpdated = function (date) {
        $scope.calendarPickerDate = date; // There is a watch on $scope.calendarPickerDate
        //ctrl.changeDate('calendarpicker'); // so this not necessary
        // this needs called now every time the day is changed so that we can get the provider occurrences for the newly selected day
        ctrl.setProviders();
    };

    // When navigation arrows are used to jump ahead or back one day, one week, or 4 weeks
    // view param and dateArg determines what the incremental jump will be
    ctrl.determineNavigationIncrement = function (dateArg, view) {
        // when in week view the 'week' arg indicates jumping 28 days otherwise the 'day' arg indicates jumping 7 days
        if (view === 'week') {
            return dateArg === 'week' || dateArg === '-week' ? 28 : 7;
        } else {
            // when in day view the 'week' arg indicates jumping 7 days otherwise the 'day' arg indicates jumping 1 days
            return dateArg === 'week' || dateArg === '-week' ? 7 : 1;
        }
    };

    // change date changes the $scope.scheduler.view
    ctrl.changeDate = changeDate;
    function changeDate(dateType) {
        var date;
        var dateTypeLowerCase = dateType.toLowerCase();
        switch (dateTypeLowerCase) {
            case 'today':
                date = new Date();
                break;
            case 'day':
                date = $scope.scheduler.view().nextDate();
                break;
            case '-day':
                date = $scope.scheduler.view().previousDate();
                break;
            case 'week':
                date = $scope.jumpNextWeek();
                break;
            case '-week':
                date = $scope.jumpPrevWeek();
                break;
            case 'calendarpicker':
            case 'preview':
                date = $scope.calendarPickerDate;
                break;
            default:
                date = new Date();
                break;
        }

        // based on the date change, determine if the new date = today. If new date = today, then disable the today button.
        var today = new Date(
            ctrl.today.getFullYear(),
            ctrl.today.getMonth(),
            ctrl.today.getDate(),
            1,
            0,
            0,
            0
        );
        var newDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            1,
            0,
            0,
            0
        );
        if (_.isEqual(today, newDate)) {
            $scope.todayButtonDisabled = true;
        } else {
            $scope.todayButtonDisabled = false;
        }

        var navigateParam = !_.isUndefined($scope.schedViewName)
            ? dateTypeLowerCase
            : '';

        ctrl.triggerNavigateEvent(
            dateTypeLowerCase === 'preview' ? 'preview' : 'date',
            date,
            navigateParam
        );
    }

    $scope.uxChangeDate = uxChangeDate;
    function uxChangeDate(param) {
        ctrl.isRefreshPending = true;
        var incrementBy = ctrl.determineNavigationIncrement(
            param,
            $scope.routeParams.view
        );
        // This sends a broadcast message to the calenderPicker control which then initiates a day change.
        $scope.$broadcast('goToDateChild', param, incrementBy);
    }
    // set what the view state is.
    $scope.setUpGroupView = setUpGroupView;
    function setUpGroupView(group) {
        $scope.changedToRoomView = false;

        /// do not call createQueue as it initiates two updates of the values ....
        if (group === 'room') {
            createQueue('group', ['room', true]);
        } else {
            createQueue('group', ['provider', true]);
        }
    }

    ctrl.checkAvailability = function (start, end) {
        return start.getDay() === end.getDay();
    };

    ctrl.clearGroupResources = function () {
        if ($scope.scheduler.options.group.resources.length > 0) {
            $scope.scheduler.options.group.resources.splice(0);
        }
    };

    ctrl.columnsSliderValueChanged = columnsSliderValueChanged;
    function columnsSliderValueChanged(type, nv, ov) {
        if (nv != null && parseInt(nv) != parseInt(ov)) {
            $timeout.cancel(ctrl.columnZoomTimer);

            ctrl.columnZoomTimer = $timeout(
                $scope.createQueue.bind(null, 'slide', ['col']),
                500
            );
        }

        // This is to replace the redundant watcher on sliderValues
        // Also re-positioning any time there is a change to the slider values
        switch (type) {
            case 'provider':
                ctrl.adjustSliderLabelPosition('provider', nv);
                break;
            case 'room':
                ctrl.adjustSliderLabelPosition('room', nv);
                break;
            case 'hour':
                break;
        }
    }

    ctrl.confirmDragAppointmentWithNewProvider = function () {
        var appt = ctrl.tempChangeProviderAppointment;

        if (appt) {
            if (appt.LocationId !== $scope.selectedLocation.LocationId) {
                $scope.apptLocationHasChanged = true;
                ctrl.getRoomAssignmentsForProvider(
                    appt.LocationId,
                    appt.ProviderAppointments[0].UserId,
                    null,
                    appt.start,
                    appt.end
                );
            } else {
                ctrl.getRoomAssignmentsForProvider(
                    $scope.selectedLocation.LocationId,
                    appt.ProviderAppointments[0].UserId,
                    null,
                    appt.start,
                    appt.end
                );
            }
        }
    };

    ctrl.MedicalHistoryAlertsOnSuccess = function (res) {
        var medicalAlerts = [];
        _.forEach(res.Value, function (alert) {
            if (alert.GenerateAlert) {
                medicalAlerts.push({
                    Description: alert.Description,
                    SymbolId: alert.MedicalHistoryAlertId,
                    IsMedicalHistoryAlert: true,
                    TypeId: alert.MedicalHistoryAlertTypeId,
                });
            }
        });
        ctrl.medicalAlerts = medicalAlerts;
    };

    ctrl.MedicalHistoryAlertsOnError = function () {
        toastrFactory.error(
            $scope.schedulePageText.getMedicalHistoryAlertsFailed,
            'Error'
        );
    };

    //#endregion

    ctrl.addMedicalAlertsToAppointment = function (appointment, resValue) {
        if (_.isEmpty(appointment.MedicalAlerts)) {
            if (!_.isNil(resValue) && !_.isEmpty(resValue.MedicalAlerts)) {
                appointment.MedicalAlerts = resValue.MedicalAlerts;
            } else {
                let alerts = [];
                let alertIds =
                    !_.isNil(resValue) && !_.isEmpty(resValue.MedicalHistoryAlertIds)
                        ? resValue.MedicalHistoryAlertIds
                        : appointment.MedicalHistoryAlertIds;
                if (alertIds) {
                    _.forEach(alertIds, function (alertId) {
                        let alert = _.find(ctrl.medicalAlerts, { SymbolId: alertId });
                        if (alert) {
                            alerts.push(alert);
                        }
                    });
                }
                appointment.MedicalAlerts = alerts;
            }
        }
    };

    ctrl.createAlertToolTip = function (alerts) {
        var alertsToolTip = '';
        _.forEach(alerts, function (alert) {
            alertsToolTip += alert.Description + '\n';
        });
        return alertsToolTip;
    };
    //var hitMethodCount = 0;
    //var foreachEventCount = 0;
    //var foreachColumnForeachMethodCount = 0;
    ctrl.createColumns = createColumns;
    function createColumns(myEvent, groupName, events) {
        //hitMethodCount++;
        //console.log('Hit Column Method Count: ' + hitMethodCount);
        var columns = [];
        var provider = scheduleProvidersService.findByUserCode(groupName);
        //console.log()
        for (var idx = 0; idx < events.length; idx++) {
            //foreachEventCount++;
            //console.log('Looping Events In column method: ' + foreachEventCount);
            var event = events[idx];
            if (
                ((event.AppointmentType == 'lunch' ||
                    event.Classification === ctrl.ClassificationEnum.Block.Value) &&
                    event.Providers == provider.UserId) ||
                (event.ProviderString && event.ProviderString.indexOf(groupName) >= 0)
            ) {
                var eventRange = ctrl.rangeIndex(event);
                var column = null;

                for (var j = 0, columnLength = columns.length; j < columnLength; j++) {
                    //foreachColumnForeachMethodCount++;
                    //console.log('Looping Columns in Events In column method: ' + foreachColumnForeachMethodCount);
                    var endOverlaps = eventRange.start >= columns[j].end;

                    if (eventRange.start < columns[j].start || endOverlaps) {
                        column = columns[j];
                        if (column.end < eventRange.end) {
                            column.end = eventRange.end;
                        }
                        break;
                    }
                }
                if (!column) {
                    column = { start: eventRange.start, end: eventRange.end, events: [] };
                    columns.push(column);
                }
                column.events.push(event);
            }
        }
        return columns;
    }

    ctrl.DataElement = function (constructor, include, priority, order) {
        if (constructor) {
            return {
                Priority: priority ? priority : -1,
                Order: order ? order : -1,
                Create: constructor,
                Include: include ? include : true,
            };
        } else {
            return null;
        }
    };

    ctrl.drawDragSlots = function () {
        var displayClass = ctrl.dragData.Dragging
            ? ctrl.dragData.Valid
                ? 'selected-valid'
                : 'selected-invalid'
            : '';

        _.forEach(ctrl.dragData.Slots, function (slot) {
            angular
                .element(slot.element)
                .find('.schedule-slot-content')
                .addClass(displayClass);
        });
    };

    ctrl.findAllLunchAppointments = function () {
        return _.filter(ctrl.apps, { type: 'lunch' });
    };

    ctrl.forceProvidersToShowWithinRange = function () {
        $scope.sliderValues.providersToShow = $scope.sliderValues.providersToShow;
    };

    ctrl.forceRoomsToShowWithinRange = function () {
        $scope.sliderValues.roomsToShow = $scope.sliderValues.roomsToShow;
    };

    ctrl.funcObj = function (call, params) {
        return {
            Call: call,
            Params: angular.isUndefined(params) ? [] : params,
        };
    };

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

    ctrl.getDaysOfTheWeek = function (startDayString) {
        var lunchDates = [];
        var startDay = new Date(startDayString);

        // Set the day to Sunday.
        startDay.setDate(startDay.getDate() - startDay.getDay());

        for (var day = 0; day < 7; day++) {
            lunchDates.push(startDay.toISOString().substr(0, 10));
            startDay.setDate(startDay.getDate() + 1);
        }

        return lunchDates;
    };

    ctrl.getDragAppointment = getDragAppointment;
    function getDragAppointment() {
        if (ctrl.dragData.Dragging) {
            var minTime, maxTime;
            //CardMoving
            // these two methods iterate over the same collection ... join the checks.
            minTime = ctrl.getMinDateFromSlots(ctrl.dragData.Slots);
            maxTime = ctrl.getMaxDateFromSlots(ctrl.dragData.Slots);

            var resources = $scope.scheduler.resourcesBySlot(ctrl.dragData.BeginSlot);
            resources = resources != null ? resources : {};

            var treatmentRoomId = null,
                providerId = null;
            if (resources.Providers != null && resources.Providers.length > 0) {
                providerId = resources.Providers[0];
                if (minTime !== null) {
                    _.forEach(ctrl.hoursForDay[resources.Providers[0]], function (sched) {
                        if (
                            sched.Day == minTime.getDay() &&
                            sched.LocationId == $scope.selectedLocation.LocationId &&
                            minTime >= sched.StartTime.toDate() &&
                            minTime <= sched.EndTime.toDate()
                        ) {
                            treatmentRoomId = sched.OtherId;
                        }
                    });
                }
            } else {
                treatmentRoomId = resources.TreatmentRoomId;
                if (minTime !== null) {
                    _.forEach(
                        ctrl.hoursForDay[resources.TreatmentRoomId],
                        function (sched) {
                            if (
                                sched.Day == minTime.getDay() &&
                                sched.LocationId == $scope.selectedLocation.LocationId &&
                                minTime >= sched.StartTime.toDate() &&
                                minTime <= sched.EndTime.toDate()
                            ) {
                                providerId = sched.OtherId;
                            }
                        }
                    );
                }
            }

            // determines the location id by the selected roomId if available
            var selectedLocationId = scheduleAppointmentUtilitiesService.getLocationIdForAppointment(
                treatmentRoomId,
                $scope.selectedLocation
            );

            var newAppointment = {
                StartTime:
                    minTime != null ? minTime : ctrl.dragData.BeginSlot.StartTime,
                EndTime: maxTime != null ? maxTime : ctrl.dragData.BeginSlot.EndTime,
                UserId: providerId,
                TreatmentRoomId: treatmentRoomId,
                LocationId: selectedLocationId,
                WasDragged: true,
            };

            ctrl.appendResourceDataFromSlot(
                newAppointment,
                ctrl.dragData.Slots.length > 0
                    ? ctrl.dragData.Slots[0]
                    : ctrl.dragData.BeginSlot
            );

            return newAppointment;
        } else {
            return null;
        }
    }

    ctrl.getDuration = function (startTime, endTime) {
        if (startTime != null && endTime != null) {
            var startMoment = moment(startTime);
            var endMoment = moment(endTime);

            var duration = endMoment.diff(startMoment, 'minutes');

            return duration;
        }

        return 0;
    };
    $scope.getDuration = ctrl.getDuration;

    // apply filters to ctrl.hoursForDay
    // breaking this out into a separate function so i can test
    ctrl.filterHoursOfOperation = function (
        day,
        dayTimes,
        resources,
        groupedResource,
        locationIdList
    ) {
        // filter by day
        dayTimes = angular.copy(
            groupedResource.multiple
                ? $filter('filter')(
                    ctrl.hoursForDay[resources[groupedResource.field][0].value],
                    { Day: day }
                )
                : $filter('filter')(
                    ctrl.hoursForDay[resources[groupedResource.field].value],
                    { Day: day }
                )
        );
        // then filter by locationList
        if (dayTimes) {
            dayTimes = dayTimes.filter(function (i) {
                return locationIdList.indexOf(i.LocationId) != -1;
            });
        }
        return dayTimes;
    };

    ctrl.getHoursOfOperationBySlot = getHoursOfOperationBySlot;

    function getHoursOfOperationBySlot(slot) {
        var dayTimes = null;
        // create locationIdList for filtering
        var locationIdList = _.map(
            $scope.selectedFilter.selectedLocations,
            'LocationId'
        );

        if (slot != null) {
            var day = new Date(slot.startDate).getDay();
            // The resources are a single object containing the properties (specified by the "field" in the scheduler resource options) and associated values that are active for this slot.
            var resources = $scope.scheduler.resourcesBySlot(slot);
            // The groupedResources are the resources (list of names) that belong to the currently active group. If we are not grouped (day or week view), then this list will be empty.
            var groupedResources = $scope.scheduler.options.group.resources;
            var groupedResource;
            // Loop through each resource within the group, and grab the hours of operation setup if any exists.
            // There shouldn't be a scenario where a group contains 2 resources that have separate, individual hours of operation (providers and locations). If it does happen, the first found is returned.
            if (groupedResources.length > 0) {
                for (
                    var groupIndex = 0;
                    groupIndex < groupedResources.length;
                    groupIndex++
                ) {
                    groupedResource = _.find($scope.scheduler.resources, {
                        name: groupedResources[groupIndex],
                    });
                    // A large condition that boils down to this: If the resource exists and specified a field, check to see if there is an hoursForDay entry.
                    // We have to check for the multiple flag. If it is true, then the property is an array, but as far as I know, it should contain only 1 value.
                    // If it were empty, it shouldn't have been included in the resources, so that shouldn't be an issue.
                    if (
                        groupedResource &&
                        groupedResource.field &&
                        ((!groupedResource.multiple &&
                            ctrl.hoursForDay[resources[groupedResource.field]]) ||
                            (groupedResource.multiple &&
                                ctrl.hoursForDay[resources[groupedResource.field][0]]))
                    ) {
                        // filter
                        dayTimes = ctrl.filterHoursOfOperation(
                            day,
                            dayTimes,
                            resources,
                            groupedResource,
                            locationIdList
                        );
                        break;
                    }
                }
            } else {
                dayTimes = [];
                for (var p = 0; p < $scope.selectedProviders.length; p++) {
                    var hoursForDay = _.filter(
                        ctrl.hoursForDay[$scope.selectedProviders[p].UserId],
                        { Day: day }
                    );

                    if (!_.isEmpty(hoursForDay)) {
                        /** joins arrays together */
                        dayTimes = dayTimes.concat(_.cloneDeep(hoursForDay));
                    }
                }
            }
        }

        return dayTimes;
    }

    ctrl.getLoggedInLocation = function () {
        // retrieve the location that the user is currently logged into (the location dropdown in the header)
        var loggedInLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        // if we find the logged location, grab the full location object from the list of locations matching that location's id
        return loggedInLocation != null
            ? locationsService.findByLocationId(loggedInLocation.id)
            : null;
    };

    ctrl.getMaxDateFromSlots = function (slots) {
        var maxTime = null;

        _.forEach(slots, function (slot) {
            if (maxTime == null || maxTime < slot.endDate) {
                maxTime = slot.endDate;
            }
        });

        return maxTime;
    };

    ctrl.getMinDateFromSlots = function (slots) {
        var minTime = null;

        _.forEach(slots, function (slot) {
            if (minTime == null || minTime > slot.startDate) {
                minTime = slot.startDate;
            }
        });

        return minTime;
    };

    ctrl.getOrderedList = function (orderedIdList, itemList, idField) {
        if (
            validationLogic.HasRequiredVariables([orderedIdList, itemList, idField])
        ) {
            var listCopy = angular.copy(itemList);
            var sortedList = [];
            var index;
            _.forEach(orderedIdList, function (id) {
                index = ctrl.listHelper.findIndexByFieldValue(listCopy, idField, id);

                if (index > -1) {
                    sortedList.push(listCopy[index]);
                    listCopy.splice(index, 1);
                }
            });

            _.forEach(listCopy, function (item) {
                sortedList.push(item);
            });

            return sortedList;
        }

        return itemList;
    };

    ctrl.getProviderAppointment = function (appointment, userId) {
        return ctrl.listHelper.findItemByFieldValue(appointment, 'UserId', userId);
    };

    ctrl.getProviderName = function (providerId) {
        var provider = scheduleProvidersService.findByUserId(providerId);

        return !_.isEmpty(provider) ? provider.Name : '';
    };

    ctrl.getProvidersTime = getProvidersTime;

    function getProvidersTime(data, elementId, parent, resource) {
        if (!data.Classification < 1) return;
        var element = parent.find(elementId); // angular.element(elementId);
        var apptColor, providerTimeElement;
        var totalMinutes, providerMinutes, minutesFromStart;
        var count = 0;

        var val = _.findIndex($scope.activeResources, {
            value: resource.Providers[0],
        });
        _.forEach(data.ProviderAppointments, function (providerTime) {
            if (providerTime.UserId == resource.Providers[0]) {
                apptColor = data.typeColor;
                totalMinutes = ctrl.getDuration(data.StartTime, data.EndTime);
                providerMinutes = ctrl.getDuration(
                    providerTime.StartTime,
                    providerTime.EndTime
                );
                minutesFromStart = ctrl.getDuration(
                    data.StartTime,
                    providerTime.StartTime
                );
                // need to determine if there is a better way of doing this as this dom manipulation is expensive.
                providerTimeElement = angular.element(
                    '<span id="provider_time_' +
                    _.escape(val) +
                    '_' +
                    _.escape(count) +
                    '" ng-dblclick="editAppointment(dataItem)"></span>'
                );

                providerTimeElement.appendTo(element).css({
                    background: 'rgba(' + apptColor.Display + ', 0.65)',
                    'z-index': 10,
                    display: 'inline-block',
                    position: 'absolute',
                    top: String((minutesFromStart / totalMinutes) * 100) + '%',
                    left: '0',
                    width: '100%',
                    height: String((providerMinutes / totalMinutes) * 100) + '%',
                });

                count += 1;
            }
        });
    }

    ctrl.appointmentResizedOrMovedConfirm = function (appointment) {
        $scope.saveAppointment(appointment);
    };

    ctrl.appointmentResizedOrMovedCancel = function () {
        var appointment = ctrl.backupAppointment;
        var index = lookupLogic.GetEventIndexById(appointment.AppointmentId);
        if (index > -1) {
            appointment.id = index;
            ctrl.appointments.data().splice(index, 1);
            ctrl.apps.splice(index, 1);
            if ($scope.scheduler) {
                ctrl.apps.push(appointment);
                $scope.scheduler.addEvent(
                    ctrl.mapAppointmentResponseToViewModel(appointment)
                );
            }
        }

        ctrl.refreshAppointmentListData();
    };

    ctrl.getRoomAssignmentsForProvider = getRoomAssignmentsForProvider;
    function getRoomAssignmentsForProvider(
        locationId,
        providerId,
        roomId,
        startTime,
        endTime
    ) {
        if (
            $scope.appointment.Data.Classification !==
            ctrl.ClassificationEnum.Block.Value
        ) {
            var params = {
                locationDate: moment(startTime).format('YYYY-MM-DD'),
                locationId: locationId,
                providerId: providerId,
                roomId: roomId,
            };
            // interim success handler to cull the results of ProviderRoomOccurrences.get down to only include occurrences that fall within the start and end time
            var success = function (result) {
                var list = [];
                _.forEach(result.Value, function (occ) {
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
                        list.push(occ);
                    }
                });
                result.Value = list;
                ctrl.getRoomAssignmentsForProviderSuccess(result);
            };

            scheduleServices.ProviderRoomOccurrences.get(
                params,
                success,
                ctrl.getRoomAssignmentsFailed
            );
        }
    }

    ctrl.getRoomAssignmentsForProviderSuccess = function (result) {
        if ($routeParams.group != 'room') {
            var earliestDate = null;
            var treatmentRoomId = null;

            _.forEach(result.Value, function (assignment) {
                if (earliestDate == null || earliestDate > assignment.StartTime) {
                    earliestDate = assignment.StartTime;
                    treatmentRoomId = assignment.RoomId;
                }
            });

            if (treatmentRoomId != null) {
                ctrl.tempChangeProviderAppointment.Room = ctrl.listHelper.findItemByFieldValue(
                    $scope.rooms,
                    'RoomId',
                    treatmentRoomId
                );
                ctrl.tempChangeProviderAppointment.TreatmentRoomId = treatmentRoomId;
            }
            $scope.saveTruncatedAppointment(ctrl.tempChangeProviderAppointment);
        }
    };

    ctrl.getRoomAssignmentsFailed = function (error) {
        ctrl.setAppointmentBeingSaved(false);
        if (error.status != 404) {
            toastrFactory.error(
                $scope.schedulePageText.getProviderScheduleFailed,
                'Error'
            );
        }
    };

    ctrl.getServiceCodeDescription = function (serviceCode) {
        if (serviceCode) {
            return serviceCode.DisplayAs > ''
                ? serviceCode.DisplayAs
                : serviceCode.Code;
        }

        return '';
    };

    ctrl.getSlotsBewteenSlots = getSlotsBewteenSlots;
    function getSlotsBewteenSlots(startSlot, endSlot, endX, endY) {
        var selectedSlots = [];
        var slotElement = angular.element(endSlot.element);

        var slotTop = slotElement.position().top;
        var startSlotTop = angular.element(startSlot.element).position().top;

        var duration = Math.max(
            ctrl.getDuration(startSlot.startDate, endSlot.endDate),
            ctrl.getDuration(endSlot.startDate, startSlot.endDate)
        );
        var slotsToHighlight = Math.abs(Math.ceil(duration / $scope.TimeIncrement));
        var direction = startSlot.startDate < endSlot.startDate ? -1 : 1;

        var height = Math.abs((slotTop - startSlotTop) / (slotsToHighlight - 1));

        var currentSlot;
        for (var i = 0; i < slotsToHighlight; i++) {
            currentSlot = $scope.scheduler.slotByPosition(
                endX,
                endY + i * direction * height
            );

            if (currentSlot != null) {
                selectedSlots.push(currentSlot);
            }
        }

        return selectedSlots;
    }

    $scope.printScheduler = function () {
        // display of print page title
        $scope.printTitleText =
            'Print Date: ' + moment().format('MM/DD/YYYY h:mm A');
        setTimeout(function () {
            var grid = $('.scheduler-grid-container');
            var windowHeight = $(window).height();
            var difference = 1290 - windowHeight; // adjustment to ensure we fill the portrait print view.
            grid.height(windowHeight + difference);
            var schedulerElement = $('#scheduler');
            //schedulerElement.width(1139);
            schedulerElement.width(1139);
            // readjust events' positions
            schedulerElement.data('kendoScheduler').resize();
            window.print();
            // restore previous Scheduler layout
            schedulerElement.width('');
            schedulerElement.data('kendoScheduler').resize();
            grid = $('.scheduler-grid-container');
            windowHeight = $(window).height() - 190;
            grid.height(windowHeight);
        }, 200);
    };

    ctrl.getTime = getTime;
    function getTime(
        day,
        dayStart,
        dayEnd,
        lunchStart,
        lunchEnd,
        locationId,
        otherId
    ) {
        var startTime = null,
            endTime = null,
            lunchStartTime = null,
            lunchEndTime = null;

        if (dayStart && ctrl.schedulerDates.length == 0) {
            ctrl.setSchedulerDates(dayStart);
        }

        if (
            dayStart != null &&
            dayEnd != null &&
            day > -1 &&
            day < ctrl.schedulerDates.length
        ) {
            let anotherStartDate = null;
            if (angular.isNumber(dayStart)) {
                anotherStartDate = new Date(
                    ctrl.schedulerDates[day].getTime() + dayStart
                );
            } else {
                anotherStartDate = dayStart;
            }
            let anotherEndDate = null;
            if (angular.isNumber(dayEnd)) {
                anotherEndDate = new Date(ctrl.schedulerDates[day].getTime() + dayEnd);
            } else {
                anotherEndDate = dayEnd;
            }

            startTime = moment(anotherStartDate); //.weekday(day);
            startTime.year(ctrl.schedulerDates[day].getFullYear());
            startTime.month(ctrl.schedulerDates[day].getMonth());
            startTime.date(ctrl.schedulerDates[day].getDate());
            startTime.seconds(0);
            startTime.milliseconds(0);

            endTime = moment(anotherEndDate); //.weekday(day);
            endTime.year(ctrl.schedulerDates[day].getFullYear());
            endTime.month(ctrl.schedulerDates[day].getMonth());
            endTime.date(ctrl.schedulerDates[day].getDate());
            endTime.seconds(0);
            endTime.milliseconds(0);

            if (
                ctrl.workStart.getHours() < startTime.hours() ||
                (ctrl.workStart.getHours() == startTime.hours() &&
                    ctrl.workStart.getMinutes() < startTime.minutes())
            ) {
                ctrl.workStart.setHours(startTime.hours());
                ctrl.workStart.setMinutes(startTime.minutes());
            }

            if (
                ctrl.workEnd.getHours() > endTime.hours() ||
                (ctrl.workEnd.getHours() == endTime.hours() &&
                    ctrl.workEnd.getMinutes() > endTime.minutes())
            ) {
                ctrl.workEnd.setHours(endTime.hours());
                ctrl.workEnd.setMinutes(endTime.minutes());
            }

            if (lunchStart != null && lunchEnd != null) {
                lunchStartTime = moment(lunchStart).weekday(day);
                lunchStartTime.year(ctrl.schedulerDates[day].getFullYear());
                lunchStartTime.month(ctrl.schedulerDates[day].getMonth());
                lunchStartTime.date(ctrl.schedulerDates[day].getDate());

                lunchEndTime = moment(lunchEnd).weekday(day);
                lunchEndTime.year(ctrl.schedulerDates[day].getFullYear());
                lunchEndTime.month(ctrl.schedulerDates[day].getMonth());
                lunchEndTime.date(ctrl.schedulerDates[day].getDate());
            }
        }

        return {
            Day: day,
            StartTime: startTime,
            EndTime: endTime,
            LunchStartTime: lunchStartTime,
            LunchEndTime: lunchEndTime,
            LocationId: locationId,
            OtherId: otherId,
        };
    }

    ctrl.getUserCodeForProviderAppointment = function (providerAppointment) {
        var provider = undefined;
        if (providerAppointment && providerAppointment.UserId) {
            provider = scheduleProvidersService.findByUserId(
                providerAppointment.UserId
            );
        }

        return provider ? provider.UserCode : '';
    };

    ctrl.hideAppointmentStatusIcons = function (parentElement) {
        var iconContainer = parentElement.find('#appointment-status-icons');
        iconContainer.addClass('hidden');
    };

    ctrl.hideAppointmentWarningIcons = function (parentElement) {
        var iconContainer = parentElement.find(
            '.appointment-icon-warning-container'
        );
        iconContainer.addClass('hidden');
    };

    var isEventColliding = isEventColliding;
    ctrl.isEventColliding = function (event, provider) {
        //if providerId is undefined or null and UserId is present then copy UserId to ProviderId
        if (!provider.ProviderId && provider.UserId) {
            provider.ProviderId = provider.UserId;
        }

        var hasProvAppt =
            ctrl.getProviderAppointment(
                event.ProviderAppointments,
                provider.ProviderId
            ) != null;
        var isExamingingDentist = event.ExaminingDentist == provider.ProviderId;
        var inRegularView = provider.ProviderTypeViewId == 1;
        var inHygieneView = provider.ProviderTypeViewId == 2;
        var isHygieneAppointment =
            event.AppointmentType &&
            event.AppointmentType.PerformedByProviderTypeId == 2;
        var providerIsDentist = provider.ProviderTypeId == 1;
        var isBlock = event.Classification === ctrl.ClassificationEnum.Block.Value;
        var isLunch = event.AppointmentType == 'lunch';
        var hasNoAppointmentType =
            !(event.AppointmentTypeId > '') ||
            event.AppointmentTypeId == ctrl.emptyGuid;

        /** only for regular view */
        if (
            isLunch ||
            isBlock ||
            ((hasNoAppointmentType || hasProvAppt) && inRegularView)
        ) {
            return true;
        } else if (
            /** only for hygiene view */
            providerIsDentist &&
            isHygieneAppointment &&
            inHygieneView &&
            !isExamingingDentist
        ) {
            return false;
        } else if (
            event.AppointmentType &&
            event.AppointmentType.PerformedByProviderTypeId ==
            provider.ProviderTypeViewId
        ) {
            return true;
        } else {
            return false;
        }
    };

    ctrl.kendoWidgetCreated = kendoWidgetCreated;
    function kendoWidgetCreated(event, widget) {
        // the event is emitted for every widget; if we have multiple
        // widgets in this controller, we need to check that the event
        // is for the one we're interested in.

        if (widget === $scope.scheduler) {
            //var a = performance.now();
            //console.log('Start Kendo WidgetCreated 1: ' + a);

            ctrl.kendoWidgets.push(widget);
            var date = ctrl.getActualDate($routeParams.date);
            let routeView = $routeParams.view;

            if (!_.isNil(routeView) && _.trim(routeView) !== '') {
                $scope.scheduler.view(routeView);
                $scope.schedViewName = routeView;
            }

            navigateInProgress = false;

            initializationLogic.InitializeWatches();

            ctrl.finalizeRoomSetup();

            // this code used to be in the LoadLocationHours function ... but location hours are not a thing anymore
            // so I am unsure why this code exists other then to fix up some properties that might need to be removed.
            // need to evaluate it later.
            if ($scope.selectedLocation && $scope.selectedLocation > '') {
                $scope.routeParams.location = $scope.selectedLocation.NameAbbreviation;

                $scope.locationHoursOfOperation.Loading = true;
            } else {
                $scope.locationHoursOfOperation.Loading = false;
            }

            var view = $scope.routeParams.view;
            var group = $scope.routeParams.group;

            ctrl.resetActiveResourceStartIndex();
            ctrl.clearGroupResources();
            ctrl.appointmentsLoaded = false;
            switch (view) {
                case $scope.schedulerViews.week:
                    ctrl.activeView = $scope.schedulerViews.week;
                    break;
                case $scope.schedulerViews.day:
                default:
                    ctrl.activeView = $scope.schedulerViews.day;
                    $scope.schedViewName = 'day';
                    break;
            }

            switch (group) {
                case $scope.schedulerGroups.room:
                    ctrl.activeGroup = $scope.schedulerGroups.room;

                    ctrl.changeResourceShiftFunction(ctrl.shiftRooms);
                    ctrl.resetProcessedEvents();
                    break;
                case $scope.schedulerGroups.provider:
                default:
                    ctrl.activeGroup = $scope.schedulerGroups.provider;

                    ctrl.changeResourceShiftFunction(ctrl.shiftProviders);
                    break;
            }

            $scope.currentScheduleView = group;

            ctrl.changeScheduleDisplay(ctrl.activeView, ctrl.activeGroup);

            $scope.scheduler.setOptions($scope.schedulerOptions);

            $scope.scheduler.bind('dataBound', ctrl.modifyLayoutForWeek);

            ctrl.setSchedulerState(ctrl.schedulerStates.Refresh);
            //var b = performance.now();
            //console.log('Widget Created 2: ' + b);
            ctrl.refreshResource($scope.scheduler.options.group.resources[0]);
            //var c = performance.now();
            //console.log('Widget Created 3: ' + c);
            //$scope.scheduler.view($scope.scheduler.view().name);
            $scope.scheduler.date(date);

            ctrl.appointmentProviderConflicts = [];

            //var d = performance.now();
            //console.log('Widget Created 4: ' + d);
        }
    }

    ctrl.getAppointmentsBasedOnWeekOrDayView = getAppointmentsBasedOnWeekOrDayView;
    function getAppointmentsBasedOnWeekOrDayView() {
        var date = ctrl.getActualDate($routeParams.date);
        $scope.routeParams.date =
            date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        if ($scope.scheduler.view().name === 'week') {
            var weekChanged = true;
            var value = ctrl.getActualDate($routeParams.date);
            var newWeekStart = patSharedServices.Time.getStartDateOfWeek(value);
            var newWeekEnd = patSharedServices.Time.getEndDateOfWeek(value);

            var originalWeekStart = new Date(
                $scope.scheduleDateStart ? $scope.scheduleDateStart : date
            );
            originalWeekStart.setDate(
                originalWeekStart.getDate() - originalWeekStart.getDay()
            );

            weekChanged =
                weekChanged ||
                !patSharedServices.Time.isWithinWeek(newWeekStart, originalWeekStart);

            $scope.scheduleDateStart = newWeekStart;
            $scope.scheduleDateEnd = newWeekEnd;
            $scope.setWeekViewTitle();

            // bug 375711
            // if we're in week view and the calendar date has changed but the date is within the
            // currently viewed week, there is no need to reload the appointments
            if (weekChanged === true) {
                ctrl.recalculateHoursOfOperation();
                ctrl.getAppointments(newWeekStart, newWeekEnd);
            }
        } else {
            $scope.scheduleDateStart = date;
            $scope.setDayViewTitle();
            $scope.scheduleDateEnd = date;

            if ($scope.scheduler.view().name !== 'preview') {
                $scope.scheduleDateStart.setHours(0, 0, 0, 0);
                $scope.scheduleDateEnd.setHours(23, 59, 59);
            }

            var theDay = new Date(
                $scope.scheduleDateStart.getFullYear(),
                $scope.scheduleDateStart.getMonth(),
                $scope.scheduleDateStart.getDate(),
                0,
                0,
                0,
                0
            );
            var plusOneDay = new Date(
                $scope.scheduleDateStart.getFullYear(),
                $scope.scheduleDateStart.getMonth(),
                $scope.scheduleDateStart.getDate(),
                23,
                59,
                59
            );
            ctrl.recalculateHoursOfOperation();
            ctrl.getAppointments(theDay, plusOneDay);
        }
    }

    ctrl.onControllerDestruction = onControllerDestruction;
    function onControllerDestruction() {
        $scope.schedulerDestroy = true;

        if ($scope.unsubscribeToServerlessSignalrHubConnectionService) {
            //Kills the subscribe
            $scope.unsubscribeToServerlessSignalrHubConnectionService.unsubscribe();
        }
        if ($scope.unsubscribeToserverlessSignalrHubConnectionServiceConnection) {
            //Kills the subscribe
            $scope.unsubscribeToserverlessSignalrHubConnectionServiceConnection.unsubscribe();
        }

        // unregister from observer for the appointment visibility
        appointmentViewVisibleService.clearObserver(
            ctrl.onAppointmentViewVisibleChange
        );
        appointmentViewVisibleService.setAppointmentViewVisible(false);
        appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);

        clipboardAppointmentUpdateService.clearObserver(
            ctrl.onClipboardAppointmentChange
        );

        if (!_.isUndefined(ctrl.hubProxy) && !_.isUndefined(ctrl.hubConnection)) {
            ctrl.stopHub();
        }

        _.forEach(ctrl.kendoWidgets, function (widget) {
            try {
                widget.destroy();
                for (var widgetItem in widget) {
                    if (widgetItem && widget.hasOwnProperty(widgetItem)) {
                        widget[widgetItem] = null;
                    }
                }
            } catch (e) {
                /** widget is already destroyed */
            }
        });

        for (var ctrlItem in ctrl) {
            if (ctrlItem && ctrl.hasOwnProperty(ctrlItem)) {
                ctrl[ctrlItem] = null;
            }
        }
    }

    ctrl.setupBlockFromUrl = setupBlockFromUrl;
    function setupBlockFromUrl() {
        // grab the parts of the URL.
        let block = {
            AppointmentId: null,
            AppointmentTypeId: null,
            Classification: 1,
            EndTime: null,
            Patient: undefined,
            PersonId: ctrl.emptyGuid,
            PlannedServices: [],
            ProposedDuration: null,
            ProviderAppointments: [],
            ServiceCodes: [],
            StartTime: null,
            TreatmentRoomId: null,
            Providers: [],
            UserId: null,
            Status: 0,
            ObjectState: saveStates.Add,
            Location: null,
            WasDragged: false,
        };

        block.LocationId = parseInt($routeParams.location);
        if (block.LocationId !== 0) {
            block.Location = locationsService.findByLocationId(block.LocationId);
        }
        block.TreatmentRoomId = $routeParams.room;
        block.UserId = $routeParams.provider;

        let dateString = $routeParams.date;
        if (dateString) {
            var date = new Date();
            var dateParts = dateString ? dateString.split('-') : [];
            if (dateParts.length === 3) {
                date.setYear(parseInt(dateParts[0]));
                date.setMonth(parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            }

            let appointmentStartTime = date;
            let startTime = $routeParams.start;
            if (startTime) {
                var startParts = startTime ? startTime.split(':') : [];
                if (startParts.length === 3) {
                    appointmentStartTime.setHours(parseInt(startParts[0]));
                    appointmentStartTime.setMinutes(parseInt(startParts[1]));
                    appointmentStartTime.setSeconds(parseInt(startParts[2]));
                }
            }
            block.StartTime = new Date(appointmentStartTime);

            let appointmentEndTime = date;
            let endTime = $routeParams.end;
            if (endTime) {
                var endParts = endTime ? endTime.split(':') : [];
                if (endParts.length === 3) {
                    appointmentEndTime.setHours(parseInt(endParts[0]));
                    appointmentEndTime.setMinutes(parseInt(endParts[1]));
                    appointmentEndTime.setSeconds(parseInt(endParts[2]));
                }
            }
            block.EndTime = new Date(appointmentEndTime);
        }

        return block;
    }

    ctrl.buildAppointmentFromRouteParams = buildAppointmentFromRouteParams;
    function buildAppointmentFromRouteParams() {
        return {
            Location: angular.copy($scope.selectedLocation),
            Person: null,
            PersonId: $scope.routeParams.patient,
            ProposedDuration: 30,
        };
    }

    ctrl.orderEventColumns = orderEventColumns;
    function orderEventColumns(columns) {
        /** order events so columns can be created correctly */
        /** we order by Id first since there could be events that equal in both start and end time */

        var order = $filter('orderBy')(columns, '[Id]');
        order = $filter('orderBy')(order, '[end]', false);
        order = $filter('orderBy')(order, '[start]');

        return order;
    }

    ctrl.populateHoursOfOperationArray = populateHoursOfOperationArray;
    function populateHoursOfOperationArray(id, hoursOfOperations) {
        ctrl.hoursForDay[id] = [];

        _.forEach(hoursOfOperations, function (hours) {
            ctrl.hoursForDay[id].push(
                ctrl.getTime(
                    hours.Day,
                    hours.StartTime,
                    hours.EndTime,
                    null,
                    null,
                    hours.LocationId,
                    hours.OtherId
                )
            );
        });
    }

    ctrl.processEvent = processEvent;
    function processEvent(event, provider) {
        var collidingEvents;
        var numberProcessed = 0;
        if (!event.Processing && !event.Processed) {
            event.Processing = true;
            collidingEvents = $scope.scheduler.occurrencesInRange(
                event.start,
                event.end
            );
            for (var i = 0; i < collidingEvents.length; i++) {
                if (
                    collidingEvents[i].ProviderString &&
                    collidingEvents[i].ProviderString.indexOf(provider.UserCode) < 0
                ) {
                    collidingEvents.splice(i, 1);
                    i--;
                }
            }
            _.forEach(collidingEvents, function (collidingEvent) {
                numberProcessed += ctrl.processEvent(collidingEvent, provider) ? 1 : 0;
            });
            var isColliding = ctrl.isEventColliding(event, provider);
            if (isColliding) {
                ctrl.allCollidingEvents.push(event);
            } else {
                ctrl.allCollapsedEvents.push(event);
                event.showAppointmentIcon = false;
            }
            return true;
        } else {
            return false;
        }
    }

    ctrl.processQueue = processQueue;
    function processQueue(promises, functions, onlyView) {
        //$fuseUtil.log(processQueue, arguments);

        function functionCalls() {
            _.forEach(functions, function (func) {
                var params = _.isArray(func.Params) ? func.Params : [];
                if (!_.isEmpty(params)) {
                    var funcStr = 'func.Call(';
                    _.forEach(params, function (param, index, allParams) {
                        var isLastParam = index + 1 === _.size(allParams);
                        if (!_.isUndefined(param)) {
                            funcStr += 'params[' + index + ']' + (isLastParam ? '' : ', ');
                        }
                    });
                    funcStr += ');';
                    eval(funcStr);
                }
            });
            ctrl.refreshScheduler(onlyView);
        }

        if (!_.isEmpty(promises)) {
            var qs = [];
            _.forEach(promises, function (promise) {
                if (_.isFunction(promise.CallBefore)) {
                    promise.CallBefore();
                }

                if (_.isFunction(promise.Resource)) {
                    qs.push(
                        promise
                            .Resource(promise.ResourceParams)
                            .$promise.then(promise.ResourceOnSuccess, promise.ResourceOnError)
                    );
                }
            });

            $q.all(qs).then(functionCalls);
        } else {
            functionCalls();
        }
    }

    ctrl.promiseObj = function (
        resource,
        resourceParams,
        resourceOnSuccess,
        resourceOnError,
        callBefore
    ) {
        return {
            CallBefore: callBefore,
            Resource: resource,
            ResourceParams: resourceParams,
            ResourceOnSuccess: angular.isFunction(resourceOnSuccess)
                ? resourceOnSuccess
                : null,
            ResourceOnError: angular.isFunction(resourceOnError)
                ? resourceOnError
                : null,
        };
    };

    ctrl.providerColumnsUpdatedAfterProviderDropdownChange = providerColumnsUpdatedAfterProviderDropdownChange;
    function providerColumnsUpdatedAfterProviderDropdownChange(sortedList) {
        ctrl.userColumnOrder['provider'] = ctrl.buildIdListForProvider(
            sortedList,
            'ProviderId',
            'LocationId'
        );

        ctrl.applyUserColumnOrder();

        $scope.createQueue('group', [$scope.routeParams.group]);
    }

    ctrl.providerName = function (provider) {
        return provider.Name;
    };

    ctrl.rangeIndex = function (event) {
        return {
            start: event.start,
            end: event.end,
        };
    };

    ctrl.setLocationHoursForDay = setLocationHoursForDay;
    function setLocationHoursForDay() {
        if (!$scope.selectedLocation) return;

        var locationId = $scope.selectedLocation.LocationId;

        if ($scope.hoursOfOperationDictionary[locationId]) {
            var hoursOfOperations = $scope.hoursOfOperationDictionary[locationId];
            ctrl.hoursForDay[locationId] = [];
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    0,
                    hoursOfOperations.SundayStartTime,
                    hoursOfOperations.SundayStopTime,
                    hoursOfOperations.SundayLunchStart,
                    hoursOfOperations.SundayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    1,
                    hoursOfOperations.MondayStartTime,
                    hoursOfOperations.MondayStopTime,
                    hoursOfOperations.MondayLunchStart,
                    hoursOfOperations.MondayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    2,
                    hoursOfOperations.TuesdayStartTime,
                    hoursOfOperations.TuesdayStopTime,
                    hoursOfOperations.TuesdayLunchStart,
                    hoursOfOperations.TuesdayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    3,
                    hoursOfOperations.WednesdayStartTime,
                    hoursOfOperations.WednesdayStopTime,
                    hoursOfOperations.WednesdayLunchStart,
                    hoursOfOperations.WednesdayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    4,
                    hoursOfOperations.ThursdayStartTime,
                    hoursOfOperations.ThursdayStopTime,
                    hoursOfOperations.ThursdayLunchStart,
                    hoursOfOperations.ThursdayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    5,
                    hoursOfOperations.FridayStartTime,
                    hoursOfOperations.FridayStopTime,
                    hoursOfOperations.FridayLunchStart,
                    hoursOfOperations.FridayLunchStop
                )
            );
            ctrl.hoursForDay[locationId].push(
                ctrl.getTime(
                    6,
                    hoursOfOperations.SaturdayStartTime,
                    hoursOfOperations.SaturdayStopTime,
                    hoursOfOperations.SaturdayLunchStart,
                    hoursOfOperations.SaturdayLunchStop
                )
            );

            $scope.locationHoursForDay = ctrl.hoursForDay[locationId];
        }
    }

    ctrl.recalculateHoursOfOperation = recalculateHoursOfOperation;
    function recalculateHoursOfOperation() {
        ctrl.setSchedulerDates($scope.scheduleDateStart);

        var hoursOfOperationKeys = Object.keys(ctrl.hoursForDay);

        _.forEach(hoursOfOperationKeys, function (key) {
            ctrl.populateHoursOfOperationArray(key, ctrl.hoursForDay[key]);
        });
        // ???? do we need this ... I thought location hours were not a thing
        ctrl.setLocationHoursForDay();
    }

    /// this might not be needed any more...
    ctrl.flagAppointmentsAsLateIfNeeded = flagAppointmentsAsLateIfNeeded;
    function flagAppointmentsAsLateIfNeeded() {
        var appointmentsInView = $scope.scheduler.occurrencesInRange(
            $scope.scheduleDateStart,
            moment().add(1, 'minutes')
        );

        if (
            !_.isEmpty(appointmentsInView) &&
            appointmentService.FlagAppointmentsAsLateIfNeeded(appointmentsInView)
        ) {
            ctrl.refreshScheduler(true);
        }
    }

    ctrl.refreshResource = function (resourceName) {
        var resource = _.find($scope.scheduler.resources, { name: resourceName });

        if (resource) {
            resource.dataSource.data($scope.activeResources);
        }
    };

    $scope.$on('schedule-suppress-refresh', function () {
        $scope.scheduler = null;
    });

    // I really hate this method ... I hope to remove it soonish.
    // do not add more to it ... do not modify it ... many methods call this method and it reloads the whole view.
    ctrl.refreshScheduler = refreshScheduler;
    function refreshScheduler(onlyView) {
        //console.log('refreshScheduler called');
        if (ctrl.refreshPending === true || !$scope.scheduler) return;

        if (onlyView !== true) {
            //console.log('onlyView is false .. processing display update');

            ctrl.setSchedulerState(ctrl.schedulerStates.Refresh);
            ctrl.refreshResource($scope.scheduler.options.group.resources[0]);

            $scope.scheduler.view($scope.scheduler.view().name);
            $scope.scheduleDateStart = $scope.scheduler._selectedView._startDate;
            $scope.setDayViewTitle();

            $scope.scheduleDateEnd = $scope.scheduler._selectedView._endDate;

            /** needs to be set to null since it could be set to an appointment element from a different date */
            ctrl.scrollElement = null;
            //console.log('This is needed for resetting the view after changing Provider to Room view or other like transitions.');
            ctrl.addIdealDaysTemplateColors();
            ctrl.scrollToElement(1);
        }
    }

    // I need to look at if this is needed any more ... it is not used by hardly anything.
    // pull up refactoring.
    ctrl.updateScheduleView = updateScheduleView;
    function updateScheduleView() {
        //console.log('updateScheduleView called');

        if (ctrl.apps.length > 0) {
            //&& ctrl.schedulerState === 'DataLoaded'

            // this line of code is to ensure we do not trip up later ... should be removed when the dependency does.
            ctrl.refreshPending = false; // in case this was not set prior to this point.

            // not sure how or if this is fully important yet
            ctrl.setSchedulerState(ctrl.schedulerStates.Refresh);

            // rooms and or providers?
            ctrl.refreshResource($scope.scheduler.options.group.resources[0]);

            //$scope.scheduler.view($scope.scheduler.view().name);
            //$scope.scheduleDateStart = $scope.scheduler._selectedView._startDate;
            //$scope.setDayViewTitle();
            //$scope.scheduleDateEnd = $scope.scheduler._selectedView._endDate;

            /** needs to be set to null since it could be set to an appointment element from a different date */
            ctrl.scrollElement = null;
        }
    }

    ctrl.removeAllLunchAppointments = function (list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].AppointmentType == 'lunch') {
                list.splice(i, 1);
                i--;
            }
        }
    };

    ctrl.removeClassFromElements = function (selector, className) {
        angular.element(selector).removeClass(className);
    };

    ctrl.removeOpenRouteParameter = function () {
        $scope.routeParams.open = '';
    };

    ctrl.resetActiveResourceStartIndex = function () {
        ctrl.startIndex = $scope.routeParams.index ? $scope.routeParams.index : -1;
    };

    ctrl.resetDragData = function () {
        ctrl.dragData.Slots.splice(0, ctrl.dragData.Slots.length);
        ctrl.dragData.BeginSlot = null;
        ctrl.dragData.Dragging = false;
        ctrl.dragData.OpeningModal = false;
    };

    ctrl.resetDragSlots = function () {
        if (ctrl.dragData.BeginSlot != null) {
            var beginContent = angular
                .element(ctrl.dragData.BeginSlot.element)
                .find('.schedule-slot-content');
            ctrl.removeClassFromElements(beginContent, 'selected-valid');
            ctrl.removeClassFromElements(beginContent, 'selected-invalid');
        }

        _.forEach(ctrl.dragData.Slots, function (slot) {
            var slotContent = angular
                .element(slot.element)
                .find('.schedule-slot-content');
            ctrl.removeClassFromElements(slotContent, 'selected-valid');
            ctrl.removeClassFromElements(slotContent, 'selected-invalid');
        });
    };

    ctrl.resetProcessedEvents = function () {
        _.forEach(ctrl.allCollidingEvents, function (collidingEvent) {
            collidingEvent.Processing = false;
            collidingEvent.Processed = false;
        });
        _.forEach(ctrl.allCollapsedEvents, function (collapsedEvent) {
            collapsedEvent.Processing = false;
            collapsedEvent.Processed = false;
        });
    };

    ctrl.roomColumnsUpdatedAfterRoomDropdownChange = roomColumnsUpdatedAfterRoomDropdownChange;
    function roomColumnsUpdatedAfterRoomDropdownChange(sortedList) {
        ctrl.userColumnOrder['room'] = ctrl.buildIdList(sortedList, 'RoomId');

        ctrl.applyUserColumnOrder();

        $scope.createQueue('group', [$scope.routeParams.group]);
    }

    ctrl.rowSliderChanged = rowSliderChanged;
    function rowSliderChanged(nv, ov) {
        if (nv != null && nv != ov) {
            // only run when these are different.
            //# reusable block of code.
            var hoursDisplay = schedulerUtilities.setHoursDisplay(nv);
            $scope.schedulerHoursZoomClass = schedulerUtilities.updateRows(
                hoursDisplay.value,
                $scope.TimeIncrement
            );

            ctrl.adjustSliderLabelPosition('hour', nv);
            // end

            // block this operation from running until the last one finishes ... need to test this out.
            $timeout.cancel(ctrl.rowZoomTimer);
            //ctrl.rowZoomTimer = $timeout(ctrl.refreshScheduler(false), 500);
            ctrl.rowZoomTimer = $timeout(
                $scope.createQueue.bind(null, 'slide', ['row']),
                500
            );

            //ctrl.refreshScheduler(false);
            //console.log(ctrl.rowZoomTimer);
            //console.log($scope.schedulerHoursZoomClass);
        }
    }

    ctrl.scrollToElement = function (type) {
        switch (type) {
            case 1:
                if (ctrl.scrollElement) {
                    //patSharedServices.DOM.ScrollTo(null, -70).Element(ctrl.scrollElement);
                    ctrl.scroll('#scheduler-grid', 0).Element(ctrl.scrollElement);
                } else if (ctrl.scrollFirstWorkdaySlotElement) {
                    ctrl
                        .scroll('#scheduler-grid', 0)
                        .Element(ctrl.scrollFirstWorkdaySlotElement);
                }
                break;
            case 2:
                if (ctrl.scrollTimeSlotElement) {
                    ctrl
                        .scroll('div#openingsList', 0)
                        .Element(ctrl.scrollTimeSlotElement);
                }
                break;
            default:
                break;
        }
    };

    // unlike the shared scroll function this one does not wait to scroll
    // this used to delay movement until 300 ms until after the operations was requested.
    // this one will process right away.
    ctrl.scroll = function (targetElementId, offset) {
        const target = targetElementId ? targetElementId : 'html, body';
        /** always need some type of offset so the element isn't directly at top of scroll */
        offset = offset !== undefined ? offset : 0;

        const scrollTo = element => {
            const elem = $(element);

            $(target).animate(
                {
                    scrollTop: elem[0].offsetTop - offset,
                },
                0
            );
        };

        return {
            Element(element) {
                scrollTo(element);
            },
        };
    };

    $scope.locationDropdownLoaded = locationDropdownLoaded;
    function locationDropdownLoaded(val) {
        $scope.locationDDLoaded = val;
    }

    //This is called when the location or room is changed
    $scope.updateActiveResourcesForRoom = updateActiveResourcesForRoom;
    function updateActiveResourcesForRoom(nv) {
        $scope.reorderRoomColumnsList = '';
        //this list is what is used to display the room columns on the schedule
        $scope.activeResources = [];
        //this list is what is used for the room slider or the left and right arrows beside the room columns
        $scope.shiftListRooms = [];
        $scope.shiftListProviders = [];
        $scope.activeResources = nv;
        $scope.multipleLocationsSelected = _.uniqBy(nv, 'LocationId').length > 1;
        $scope.selectedRooms = $scope.activeResources;
        //the $scope.list variable is what is used for the Order Columns component
        $scope.list = $scope.selectedRooms;

        $scope.shiftListRooms = $scope.activeResources;

        ctrl.roomColumnsUpdatedAfterRoomDropdownChange($scope.selectedRooms);

        //This will get the new locations on the change of the global location
        ctrl.populateSelectedFilterSelectedLocations();

        //Only get appts if we have selected locations
        if ($scope.selectedFilter.selectedLocations.length > 0) {
            //Get appointments now that we have locations loaded
            ctrl.getAppointmentsBasedOnWeekOrDayView();
        }

        if (
            (nv !== null || nv !== undefined) &&
            $scope.globalSelectedLocation.length === 0 &&
            $scope.locationDDLoaded !== true
        ) {
            // && $scope.userSettings.ScheduleColumnOrder !== JSON.stringify(ctrl.scheduleColumnOrder))
            ctrl.saveUserSettings();
        }

        //Keep this here
        $scope.globalSelectedLocation = '';

        $scope.locationDDLoaded = false;
    }

    //This is called when the location or provider is changed
    $scope.updateActiveResourcesForProvider = updateActiveResourcesForProvider;
    function updateActiveResourcesForProvider(nv) {
        $scope.reorderProviderColumnsList = '';
        var duplicateProviders = [];

        //this list is what is used to display the provider columns on the schedule
        $scope.activeResources = [];
        //this list is what is used for the room slider or the left and right arrows beside the provider columns
        $scope.shiftListProviders = [];
        $scope.shiftListRooms = [];
        $scope.activeResources = nv;

        $scope.multipleLocationsSelected = _.uniqBy(nv, 'LocationId').length > 1;
        duplicateProviders = getDuplicateProviders($scope.activeResources);
        $scope.activeResources = moveTheDuplicateProvidersToCorrectPlaceInList(
            $scope.activeResources,
            duplicateProviders
        );
        //The $scope.selectedProviders = $scope.activeResources must stay above the filterDisplayProviderCall.
        //$scope.selectedProviders should have duplicates in the list.
        //$activeResources should be a unique list. This is what displays the schedule columns.
        $scope.selectedProviders = $scope.activeResources;
        //the $scope.list variable is what is used for the Order Columns component
        $scope.list = $scope.selectedProviders;
        //If columns are combined and there are no duplicate providers then we do NOT want to perform this logic to
        //wipe out locationAbbr
        if (duplicateProviders.length > 0) {
            if ($scope.multipleLocationsSelected) {
                $scope.activeResources = filterDisplayProviders($scope.activeResources);
            }
        }

        //No duplicates would be in $scope.list, so it is ok to assign to $scope.activeResources
        if (!$scope.multipleLocationsSelected) {
            $scope.activeResources = angular.copy($scope.list);
        }

        $scope.shiftListProviders = $scope.activeResources;
        $scope.localProviders = $scope.activeResources;
        ctrl.setProviders();

        //This must pass the $scope.selectedProviders with duplicate providers in it so it gets saved in database to user settings
        ctrl.providerColumnsUpdatedAfterProviderDropdownChange(
            $scope.selectedProviders
        );

        //This will get the new locations on the change of the global location
        ctrl.populateSelectedFilterSelectedLocations();

        ///Only get appts if we have selected locations
        if ($scope.selectedFilter.selectedLocations.length > 0) {
            //Get appointments now that we have locations loaded
            ctrl.getAppointmentsBasedOnWeekOrDayView();
        }

        if (
            (nv !== null || nv !== undefined) &&
            $scope.globalSelectedLocation.length === 0 &&
            $scope.locationDDLoaded !== true
        ) {
            // && $scope.userSettings.ScheduleColumnOrder !== JSON.stringify(ctrl.scheduleColumnOrder))
            ctrl.saveUserSettings();
        }

        //Keep this here
        $scope.globalSelectedLocation = '';

        $scope.locationDDLoaded = false;
    }

    //The uniqueProvidersObjArray holds the first found provider that is unique
    //The duplicateProviders returns the duplicate values that aren't in the uniqueProvidersObjArray
    function getDuplicateProviders(providers) {
        var duplicateProviders = [];
        var providersReverseList = [];
        providersReverseList = angular.copy(providers);
        //This gets the unique list of provider objects
        const uniqueProvidersObjArray = [
            ...new Map(
                providersReverseList.reverse().map(item => [item['ProviderId'], item])
            ).values(),
        ];

        //If list lengths aren't the same, then there are duplicates
        if (providers.length !== uniqueProvidersObjArray.length) {
            // This returns the missing duplicate record that does not exist in the uniqueProvidersObjArray
            duplicateProviders = providers.filter(
                provider1 =>
                    !uniqueProvidersObjArray.find(
                        provider2 =>
                            provider1.ProviderId === provider2.ProviderId &&
                            provider1.LocationId === provider2.LocationId
                    )
            );
        }
        return duplicateProviders;
    }

    //Make sure that the duplicate providers fall together and that the first one positioned in the providers list is in the correct sequence before reordering
    //This is needed to make sure it is saved in User Settings correctly
    function moveTheDuplicateProvidersToCorrectPlaceInList(
        providers,
        duplicateProviders
    ) {
        var allDuplicateProvidersList = [];
        var count = 0;
        var indexValueOfFirstRecord = 2000;

        //This creates a list that has all of the duplicate providers from the order in which they were added
        for (var i = 0; i < duplicateProviders.length; i++) {
            for (var j = 0; j < providers.length; j++) {
                if (duplicateProviders[i].ProviderId === providers[j].ProviderId) {
                    allDuplicateProvidersList.push({
                        ProviderId: providers[j].ProviderId,
                        LocationId: providers[j].LocationId,
                    });
                }
            }
        }

        for (var i = 0; i < allDuplicateProvidersList.length; i++) {
            //if it is the first element in the array or if the next providerId does not equal the previous ProviderId
            if (
                i === 0 ||
                (i !== 0 &&
                    allDuplicateProvidersList[i].ProviderId !==
                    allDuplicateProvidersList[i - 1].ProviderId)
            ) {
                count = 0;
            } else {
                count++;
            }
            //If not the first duplicate record for matching providers in the allDuplicateProvidersList
            if (count != 0) {
                for (var j = 0; j < providers.length; j++) {
                    if (
                        allDuplicateProvidersList[i].ProviderId ===
                        providers[j].ProviderId &&
                        allDuplicateProvidersList[i].LocationId === providers[j].LocationId
                    ) {
                        var recordRemoved = providers[j]; //keep track of record removed to addd this record
                        //Remove the record from providers list
                        providers.splice(j, 1);

                        //Add the record to the providers list after the first duplicate provider in the list
                        providers.splice(indexValueOfFirstRecord + 1, 0, recordRemoved);
                    }
                }
            } else {
                //This sets the index of the first found duplicate record
                for (var k = 0; k < providers.length; k++) {
                    if (
                        allDuplicateProvidersList[i].ProviderId ===
                        providers[k].ProviderId &&
                        allDuplicateProvidersList[i].LocationId === providers[k].LocationId
                    ) {
                        indexValueOfFirstRecord = k;
                        break;
                    }
                }
            }
        }

        return providers;
    }

    //Combine the duplicate providers and concatenate all of the location abbreviations to display on schedule grid under
    //the one provider
    function filterDisplayProviders(provlist) {
        var providersById = [];
        var providerIndexes = [];
        var locationAbbr = '';
        var locationAbbrLocations = [];
        var prov = angular.copy(provlist);
        var counter = 0;

        for (var i = 0; i < prov.length; i++) {
            if (i > 0 && prov[i].ProviderId === prov[i - 1].ProviderId) {
                prov[i - 1].locationAbbr = '';
                counter = counter + 1;
                if (counter === 1) {
                    prov[i - 1].locationAbbrLocations = [];
                    providerIndexes.push(i - 1);
                    locationAbbrLocations.push(prov[i - 1].LocationId);
                    locationAbbr += prov[i - 1].SingleLocationAbbr;
                }
                prov[i].locationAbbr = '';
                locationAbbrLocations.push(prov[i].LocationId);
                locationAbbr += ',' + prov[i].SingleLocationAbbr;
                providerIndexes.push(i);
            }

            if (
                (i > 0 &&
                    prov[i].ProviderId !== prov[i - 1].ProviderId &&
                    providerIndexes.length > 0) ||
                (i === prov.length - 1 && providerIndexes.length > 0)
            ) {
                for (var k = 0; k < prov.length; k++) {
                    for (var j = 0; j < providerIndexes.length; j++) {
                        if (k === providerIndexes[j]) {
                            prov[k].locationAbbr = locationAbbr;
                            prov[k].locationAbbrLocations = angular.copy(
                                locationAbbrLocations
                            );
                        }
                    }
                }
                locationAbbr = '';
                providerIndexes = [];
                locationAbbrLocations = [];
                counter = 0;
            }
        }

        providersById = _.uniqBy(prov, 'ProviderId');

        return providersById;
    }

    ctrl.selectedLocationsChanged = selectedLocationsChanged;
    function selectedLocationsChanged(nv, ov) {
        var nvKeys = _.orderBy(_.map(nv, 'LocationId'));
        var ovKeys = _.orderBy(_.map(ov, 'LocationId'));
        if (_.isEqual(nvKeys, ovKeys)) {
            return;
        }

        // if no locations selected, set the selectedFilter.selectedLocations to currentLocation
        if (nv.length === 0) {
            // indicator to determine whether to show location abbr and timezone
            $scope.multipleLocationsSelected = false;
            // trigger the selectedLocationsChanged event again with current location
            $scope.userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
            $scope.selectedLocation = _.cloneDeep(
                _.find(locations, { LocationId: $scope.userLocation.id })
            );
            $scope.selectedFilter.selectedLocations.push($scope.selectedLocation);
        } else {
            // set selectedLocations to new value
            $scope.selectedLocations = nv;
            // indicator to determine whether to show location abbr and timezone
            $scope.multipleLocationsSelected = nv.length > 1;

            // we need the user locations before proceeding
            ctrl.providersByLocation = [];
            //debugger;
            providerShowOnScheduleFactory
                .getProviderLocations(true)
                .then(function (res) {
                    ctrl.providersByLocation = res;

                    $scope.showReorderCols = false;
                    var newValue = nv;

                    if (newValue.length > 1 || newValue.length === 0) {
                        // disable room view
                        $scope.disableRoomView = true;
                    } else {
                        $scope.disableRoomView = false;
                    }

                    // reset lists
                    $scope.$broadcast('reinitializeList');

                    $scope.createQueue('group', [$scope.routeParams.group]);
                    $scope.routeParams.locations =
                        $scope.selectedFilter.selectedLocations.length === 0
                            ? 'all'
                            : ctrl.listHelper.createConcatenatedString(
                                $scope.selectedFilter.selectedLocations,
                                'LocationId',
                                '_'
                            );

                    $timeout(ctrl.refreshAppointmentListData);
                });
        }
    }

    //#region rooms selection

    // determine if this appointment should filtered based on location
    // if appointment has locationId that is in locationsToFilter list or if no appointment location, return true
    ctrl.filterAppointmentsByLocationFilter = filterAppointmentsByLocationFilter;
    function filterAppointmentsByLocationFilter(appointment, locationsToFilter) {
        if (appointment.LocationId) {
            var locationMatch = _.find(locationsToFilter, {
                LocationId: appointment.LocationId,
            });
            return !_.isUndefined(locationMatch);
        } else {
            return true;
        }
    }

    // update the appointments shown on the schedule based on the rooms selection
    ctrl.filterAppointmentsByRoomFilter = filterAppointmentsByRoomFilter;
    function filterAppointmentsByRoomFilter() {
        if ($scope.scheduler) {
            // we only need to filter out appointments if there are appointments
            var data = $scope.scheduler.dataSource.data();
            if (data.length > 0) {
                var filters = [];
                // get the filtered locations
                var locationsToFilter =
                    $scope.selectedFilter.selectedLocations.length > 0
                        ? $scope.selectedFilter.selectedLocations
                        : locationsService.locations;
                // do we have a room filter
                var hasRoomFilter =
                    angular.isUndefined($scope.selectedRooms) ||
                    $scope.selectedRooms == null ||
                    $scope.selectedRooms.length > 0;

                // If there are no appointment in the filter we need at least one appointmentId to filter appointments
                filters.push(
                    factoryLogic.ScheduleFieldFilter('AppointmentId', 'equals', 0)
                );
                // add appointment ids to filter based on rooms match
                _.forEach(data, function (appointment) {
                    // 1st filter by location filter
                    if (
                        ctrl.filterAppointmentsByLocationFilter(
                            appointment,
                            locationsToFilter
                        )
                    ) {
                        if (!hasRoomFilter) {
                            // if not filtered by room, push all appointments to filter list
                            filters.push(
                                factoryLogic.ScheduleFieldFilter(
                                    'AppointmentId',
                                    'equals',
                                    appointment.AppointmentId
                                )
                            );
                        } else {
                            // or filter by matching room id
                            // prevent console.errors when appointment or appointment.Room is null
                            if (appointment && appointment.Room && appointment.Room.RoomId) {
                                var room = listHelper.findItemsByFieldValue(
                                    $scope.selectedRooms,
                                    'RoomId',
                                    appointment.Room.RoomId
                                );
                                if (room) {
                                    filters.push(
                                        factoryLogic.ScheduleFieldFilter(
                                            'AppointmentId',
                                            'equals',
                                            appointment.AppointmentId
                                        )
                                    );
                                }
                            }
                        }
                    }
                });
                // apply the filters
                var filter = factoryLogic.ScheduleGroupFilter('or', filters);
                filterLogic.ApplyScheduleFilters(filter);
            }
        }
    }

    // get the rooms selector selection from the url
    ctrl.selectRoomsFromRouteParams = selectRoomsFromRouteParams;
    function selectRoomsFromRouteParams(routeParam) {
        if (routeParam > '' && routeParam !== 'all') {
            var roomIds = routeParam.split('_');
            _.forEach(roomIds, function (roomId) {
                var room = roomsService.findByRoomId(roomId);
                if (room) {
                    $scope.initialRoomSelection.push(room);
                }
            });
        }
    }

    // method which is fired when the room selection changes
    ctrl.selectedRoomsChanged = selectedRoomsChanged;
    function selectedRoomsChanged(nv, ov) {
        var newRoomList = _.map(nv, 'RoomId');
        var oldRoomList = _.map(ov, 'RoomId');

        if (
            nv === null ||
            angular.equals(newRoomList, oldRoomList) ||
            ctrl.schedulerState == ctrl.schedulerStates.Loading
        ) {
            return;
        }

        // update the scheduler based on the selectedRooms
        $scope.selectedRooms = $scope.selectedFilter.selectedRooms;
        // filter appointments by room and location filter
        ctrl.filterAppointmentsByRoomFilter();

        // I added this back in because it would appear something called by this method is removing and or adding columns. The filter method should do that as well but that is not the case.
        // calling this method reloads the cards twice but this operation is not done all the time so this is a lower priority concern then fixing the bug of it not removing columns.
        // Need to remove "CreateQueue" this from needing to be called.
        $scope.createQueue('group', [$scope.routeParams.group]);
        $scope.routeParams.rooms =
            $scope.selectedRooms.length == 0 ||
                $scope.selectedRooms.length == $scope.treatmentRooms.length
                ? 'all'
                : ctrl.listHelper.createConcatenatedString(
                    $scope.selectedRooms,
                    'RoomId',
                    '_'
                );
    }

    //#endregion

    ctrl.selectedProvidersChanged = selectedProvidersChanged;

    function selectedProvidersChanged(nv, ov) {
        var newProviderList = _.map(nv, 'UserId');
        var oldProviderList = _.map(ov, 'UserId');

        if (
            nv === null ||
            angular.equals(newProviderList, oldProviderList) ||
            ctrl.schedulerState === ctrl.schedulerStates.Loading
        ) {
            return;
        }

        $scope.selectedProviders = $scope.selectedFilter.selectProviders;
        ctrl.updateProviderFilter();

        // I added this back in because it would appear something called by this method is removing and or adding columns. The filter method should do that as well but that is not the case.
        // calling this method reloads the cards twice but this operation is not done all the time so this is a lower priority concern then fixing the bug of it not removing columns.
        // Need to remove "CreateQueue" this from needing to be called.
        $scope.createQueue('group', [$scope.routeParams.group]);
        $scope.routeParams.providers =
            $scope.selectedProviders.length == 0 ||
                $scope.selectedProviders.length ==
                scheduleProvidersService.providers.length
                ? 'all'
                : ctrl.listHelper.createConcatenatedString(
                    $scope.selectedProviders,
                    'UserCode',
                    '_'
                );
    }

    ctrl.selectProvidersFromString = function (selectedProviders) {
        if (selectedProviders > '') {
            var userCodes = selectedProviders.split('_');
            _.forEach(userCodes, function (userCode) {
                var provider = scheduleProvidersService.findByUserCode(userCode);

                if (provider) {
                    $scope.initialProviderSelection.push(provider);
                }
            });
        }
    };

    ctrl.setHoursOfOperations = setHoursOfOperations;
    function setHoursOfOperations() {
        if (ctrl.refreshPending === true) return;

        var slot, slotStart, slotEnd, dayTimes;
        var slotStartTime, slotEndTime, dayStartTime, dayEndTime;
        var i;
        var elements = $scope.scheduler.view().content.find('td');
        //var elements = $scope.scheduler.view().content.find('td:not(.k-nonwork-hour)');

        var foundFirstWorkdaySlot = false;
        for (i = 0; i < elements.length; i++) {
            slot = $scope.scheduler.slotByElement(elements[i]);
            var slotElement = angular.element(slot.element);

            // need to set ctrl.scrollFirstWorkdaySlotElement in case there are no appointments or provider occurrences to scroll to
            if (
                foundFirstWorkdaySlot === false &&
                slotElement &&
                slot.startDate.getHours() === 8
            ) {
                ctrl.scrollFirstWorkdaySlotElement = slotElement;
                foundFirstWorkdaySlot = true;
            }

            slotElement.removeClass('open-time closed-time');

            slotStart = new Date(slot.startDate);
            slotEnd = new Date(slot.endDate);

            dayTimes = ctrl.getHoursOfOperationBySlot(slot);

            if (angular.isArray(dayTimes) && dayTimes.length > 0) {
                slotStartTime = slotStart.toISOString();
                slotEndTime = slotEnd.toISOString();
                var isOpen = false;

                for (let a = 0; a < dayTimes.length; a++) {
                    dayStartTime =
                        dayTimes[a].StartTime != null
                            ? dayTimes[a].StartTime.toISOString()
                            : null;
                    dayEndTime =
                        dayTimes[a].EndTime != null
                            ? dayTimes[a].EndTime.toISOString()
                            : null;

                    if (slotStartTime >= dayStartTime && slotEndTime <= dayEndTime) {
                        slotElement.removeClass('closed-time');
                        slotElement.addClass('open-time');

                        if (ctrl.schedulerState === ctrl.schedulerStates.Refresh) {
                            ctrl.setScrollElement(slotElement, 1);
                        }
                        isOpen = true;
                    } else {
                        if (isOpen == false) slotElement.addClass('closed-time');
                    }
                }
            } else {
                slotElement.addClass('closed-time');
            }

            var columnName =
                slot.groupIndex > -1 && $scope.activeResources[slot.groupIndex]
                    ? $scope.activeResources[slot.groupIndex].text
                    : '';
            if ($scope.scheduler.view().name === 'week') {
                slotElement.attr(
                    'title',
                    columnName + ': ' + $filter('date')(slotStart, 'EEEE h:mm a')
                );
            } else {
                slotElement.attr(
                    'title',
                    columnName +
                    ': ' +
                    $filter('date')(slotStart, 'EEEE MM - dd - yyyy h: mm a')
                );
            }

            slotElement.attr(
                'id',
                columnName + $filter('date')(slotStart, 'YYYY-MM-DDTHH-mm')
            );
        }
    }

    //#region holidays region
    $scope.matchingHoliday = null;
    ctrl.dateIsAHoliday = function (occurrenceDate) {
        $scope.matchingHoliday = null;
        var match = _.find($scope.holidays, { displayDate: occurrenceDate });
        $scope.matchingHoliday = match;
        return match ? true : false;
    };

    // move to holidaysService when that is created.
    // will have to figure out if you can remove the angular.copy first
    ctrl.setHolidays = function () {
        $scope.holidays = [];
        // filter out the inactivated holidays
        // and get only days within 8 days of today.
        var endPeriod = moment($scope.calendarPickerDate).add(8, 'd');
        var startPeriod = moment($scope.calendarPickerDate).subtract(8, 'd');
        _.forEach(holidays, function (holiday) {
            _.forEach(holiday.Occurrences, function (occ) {
                var occMoment = moment(occ);
                if (
                    occMoment < endPeriod &&
                    occMoment > startPeriod &&
                    holiday.IsActive === true
                ) {
                    var newHolidayObject = angular.copy(holiday);
                    newHolidayObject.displayDate = occMoment.format('YYYY-MM-DD');
                    $scope.holidays.push(newHolidayObject);
                }
            });
        });
    };

    //#endregion

    // move to locationTimeService ... since this is for utc
    ctrl.getUTCString = getUTCString;
    function getUTCString(dateTime) {
        var dateTimeString = '';
        if (typeof dateTime === 'string') {
            dateTimeString = dateTime.toLowerCase().endsWith('z')
                ? dateTime
                : dateTime + 'Z';
        } else {
            dateTimeString =
                dateTime.toISOString != undefined ? dateTime.toISOString() : dateTime;
        }
        return dateTimeString;
    }

    ctrl.setProviders = setProviders;

    function setProviders() {
        var localProviders = [];
        var providers = [];

        if (
            $scope.selectedFilter.selectedLocations &&
            $scope.selectedFilter.selectedLocations.length > 0
        ) {
            // filter this list by the selectedLocation(s) LocationIds
            var selectedLocationsIds = _.map(
                $scope.selectedFilter.selectedLocations,
                'LocationId'
            );
            providers = _.filter(ctrl.providersByLocation, providerLocation =>
                _.includes(selectedLocationsIds, providerLocation.LocationId)
            );
            _.forEach(providers, function (newProvider) {
                if (newProvider.ShowOnSchedule === true) {
                    // check to see if they are already in the provider list
                    var providerInList = _.find(localProviders, [
                        'UserId',
                        newProvider.UserId,
                    ]);
                    // add locationAbbr
                    var thisLocation = _.find($scope.selectedFilter.selectedLocations, [
                        'LocationId',
                        newProvider.LocationId,
                    ]);
                    var locationAndTimeZoneAbbr = ctrl.addLocationTimezoneAbbr(
                        thisLocation
                    );
                    if (providerInList) {
                        // if the provider is already in the list just append the locationAndTimeZoneAbbr
                        providerInList.locationAbbr += ' ,' + locationAndTimeZoneAbbr;
                    } else {
                        // if they are not in the list, add them
                        newProvider.Name = _.escape(newProvider.FullName);
                        newProvider.FirstName = _.escape(newProvider.FirstName);
                        newProvider.LastName = _.escape(newProvider.LastName);
                        newProvider.ProviderTypeViewId = null;
                        newProvider.locationAbbr = locationAndTimeZoneAbbr;
                        newProvider.highlighted = false; // used for the modal
                        // add this provider to list
                        var scheduleProvider = angular.copy(newProvider);
                        localProviders.push(scheduleProvider);
                        providers.push(newProvider.UserId);
                    }
                }
            });
        }

        // moving storage of providers to a service.
        scheduleProvidersService.providers = localProviders;

        // map back to view bound object for display
        $scope.localProviders = scheduleProvidersService.providers;
        $scope.$broadcast('reinitializeList');

        if ($scope.localProviders !== undefined) {
            if ($scope.localProviders.ProviderId) {
                $scope.provIds = _.map($scope.localProviders, 'ProviderId');
            } else {
                $scope.provIds = _.map($scope.localProviders, 'UserId');
            }
        }

        ctrl.recalculateHoursOfOperation();
        $timeout(ctrl.forceProvidersToShowWithinRange);
    }

    // create header item for location and timezone
    // move to LocationTimeService or ScheduleDisplayservice this is used in the appointment modal as wel.
    ctrl.addLocationTimezoneAbbr = addLocationTimezoneAbbr;
    function addLocationTimezoneAbbr(location) {
        var locationAndTimezoneAbbr = location ? location.NameAbbreviation : '';
        var tz = location ? location.timezoneInfo.abbr : '';
        locationAndTimezoneAbbr += ' (' + tz + ')';
        return locationAndTimezoneAbbr;
    }

    ctrl.setSchedulerDates = setSchedulerDates;
    function setSchedulerDates(start) {
        var date = angular.isDate(start) ? angular.copy(start) : new Date(start);
        if (!date) {
            date = new Date();
        }

        var startFrom = date.setDate(date.getDate() - date.getDay());
        var currentDay = new Date(startFrom);
        ctrl.schedulerDates = [];

        for (var i = 0; i < 7; i++) {
            ctrl.schedulerDates.push(angular.copy(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
    }

    ctrl.setSchedulerState = function (newState) {
        ctrl.schedulerState = newState;
    };

    ctrl.setScrollElement = function (element, type) {
        switch (type) {
            case 1:
                ctrl.scrollElement = patSharedServices.DOM.Find.TopMostElement(
                    element,
                    ctrl.scrollElement
                );
                break;
            case 2:
                ctrl.scrollTimeSlotElement = patSharedServices.DOM.Find.TopMostElement(
                    element,
                    ctrl.scrollTimeSlotElement
                );
                break;
            default:
                break;
        }
    };

    ctrl.shiftList = shiftList;
    function shiftList(list, idField, display, offset, itemsToShow) {
        var filteredList = [];
        if (
            $scope.shiftListRooms !== undefined &&
            $scope.shiftListRooms.length > 0 &&
            $scope.shiftListRooms[0].RoomId
        ) {
            $scope.multipleLocationsSelected =
                _.uniqBy($scope.shiftListRooms, 'LocationId').length > 1;
        }

        if (
            $scope.shiftListProviders !== undefined &&
            $scope.shiftListProviders.length > 0 &&
            $scope.shiftListProviders[0].ProviderId
        ) {
            $scope.multipleLocationsSelected =
                _.uniqBy($scope.shiftListProviders, 'LocationId').length > 1;
        }

        ctrl.calculateResourceStartIndex(
            list,
            parseInt(offset),
            parseInt(itemsToShow)
        );

        var newItem;
        for (
            var index = ctrl.startIndex;
            index < list.length && filteredList.length < itemsToShow;
            index++
        ) {
            newItem = {};
            newItem.text = angular.isFunction(display)
                ? display(list[index])
                : list[index][display];
            newItem.value = list[index][idField];
            newItem.locationAbbr = list[index].locationAbbr;
            newItem.locationAbbrLocations = list[index].locationAbbrLocations;
            newItem.Name = list[index].Name;
            newItem.checked = list[index].checked;
            newItem.LocationId = list[index].LocationId;
            newItem.tz = list[index].tz;
            if (list[index].ProviderId) {
                newItem.FirstName = list[index].FirstName;
                newItem.LastName = list[index].LastName;
                newItem.ProfessionalDesignation = list[index].ProfessionalDesignation;
                newItem.SingleLocationAbbr = list[index].SingleLocationAbbr;
                newItem.ShowOnSchedule = list[index].ShowOnSchedule;
                newItem.ProviderId = list[index].ProviderId;
                newItem.ProviderTypeId = list[index].ProviderTypeId;
                if (!list[index].ProviderTypeViewId) {
                    newItem.ProviderTypeViewId = list[index].ProviderTypeId;
                }
            }
            if (list[index].RoomId) {
                newItem.RoomId = list[index].RoomId;
            }

            filteredList.push(newItem);
        }

        return filteredList;
    }

    ctrl.shiftProviders = shiftProviders;
    function shiftProviders(offset) {
        //Doing this check because for some reason this is getting hit and showing Rooms on the load
        if (
            $scope.activeResources.length > 0 &&
            $scope.shiftListProviders !== undefined &&
            $scope.shiftListProviders.length > 0
        ) {
            // && $scope.activeResources[0].hasOwnProperty('FirstName')){
            $scope.activeResources = ctrl.shiftList(
                $scope.shiftListProviders,
                'ProviderId',
                'Name',
                offset,
                $scope.sliderValues.providersToShow
            );
            // set provider is loaded if necessary
            _.forEach($scope.activeResources, function (resource) {
                var provider = scheduleProvidersService.findByUserId(
                    resource.ProviderId
                );
                resource.isDentist = provider && provider.ProviderTypeId == 1;
                resource.isInRegularView =
                    provider != null && provider.ProviderTypeViewId != 2;
            });
        }
    }

    ctrl.shiftRooms = shiftRooms;
    function shiftRooms(offset) {
        // we need to escape the room.Name property,
        //as this is user-entered text coming from the database.
        $scope.selectedRooms.forEach(room => {
            room.Name = _.escape(room.Name);
        });

        if (
            $scope.activeResources.length > 0 &&
            $scope.shiftListRooms !== undefined &&
            $scope.shiftListRooms.length > 0
        ) {
            $scope.activeResources = ctrl.shiftList(
                $scope.shiftListRooms,
                'RoomId',
                'Name',
                offset,
                $scope.sliderValues.roomsToShow
            );
        }
    }

    ctrl.showFailedServiceMessage = function () {
        toastrFactory.error(
            $scope.schedulePageText.plannedServicesCreationFailed,
            'Error'
        );
    };

    //var numberOfTimes = 0;
    ctrl.styleProviderColumn = styleProviderColumn;
    function styleProviderColumn(
        view,
        slot,
        resource,
        provider,
        columns,
        collapsedColsNum,
        isCollapsed
    ) {
        var columnEvents;
        var columnElement;
        var index;

        var width = 0;
        var left = 0;

        var slotElement = angular.element(slot.element);
        var slotLeft = slotElement[0].offsetLeft;
        var slotWidth = slotElement[0].offsetWidth * 0.9 - collapsedColsNum * 10;

        var collapsedWidth = provider.ProviderTypeViewId === 1 ? slotWidth : 0;
        var leftOffset =
            provider.ProviderTypeViewId === 1 ? 0 : collapsedColsNum * 10;
        /** styling event elements  */
        //numberOfTimes++;
        //console.log('Number of times called : ' + numberOfTimes);
        for (var a = 0; a < columns.length; a++) {
            columnEvents = angular.copy(columns[a].events);
            /** get the element of the event*/
            for (var b = 0; b < columnEvents.length; b++) {
                columnElement = view.element.find(
                    '[data-uid=' + columnEvents[b].uid + ']'
                );
                index = 0;
                /** find which element we need to style */
                for (var c = 0; c < columnElement.length; c++) {
                    if (
                        columnElement[c].offsetLeft >= slotElement[0].offsetLeft &&
                        columnElement[c].offsetLeft + columnElement[c].offsetWidth <=
                        slotElement[0].offsetLeft + slotElement[0].offsetWidth
                    ) {
                        index = c;
                    }
                }
                if (columnElement.length === 0) break;
                columnElement[index].canBeProcessed = false;
                if (!isCollapsed) {
                    width = slotWidth / columns.length - 10 * collapsedColsNum;
                    left = slotLeft + leftOffset + width * a;

                    angular.element(columnElement[index]).css({
                        left: left + 10 + 'px',
                        width: width - 5 + 'px',
                        border: 'none',
                    });
                    ctrl.getProvidersTime(
                        columnEvents[b],
                        '#providerTime',
                        angular.element(columnElement[index]),
                        resource
                    );
                } else {
                    left = slotLeft + collapsedWidth + 10 * a;

                    angular.element(columnElement[index]).css({
                        left: left + 10 + 'px',
                        width: '5px',
                        border: 'none',
                    });
                    ctrl.hideAppointmentStatusIcons(
                        angular.element(columnElement[index])
                    );
                    ctrl.hideAppointmentWarningIcons(
                        angular.element(columnElement[index])
                    );
                }
            }
        }
    }

    //var totalChanges = 0;
    ctrl.changeScheduleDisplay = changeScheduleDisplay;

    function changeScheduleDisplay(view, group) {
        // if the view has not changed .... do not change it ...
        //totalChanges++;
        //console.log('Changes method called this many times: ' + totalChanges);
        if ($scope.scheduler.view().name !== view) {
            $scope.scheduler.view(view);
        }

        $scope.scheduler.options.group.resources.push(group);
        $scope.routeParams.view = view;
        $scope.routeParams.group = group;
    }

    ctrl.changeResourceShiftFunction = function (newShiftFunction) {
        $scope.shiftResources = newShiftFunction;
        $scope.shiftResources(0);
    };

    //When the global location changes, it fires this. Inside this method, it will trigger a call to update the scheduler location dropdown values
    $scope.defaultLocationChanged = function (nv, ov) {
        if (nv !== ov && nv.LocationId !== ov.LocationId) {
            ctrl.updateLocationDropdownInputValuesWhenGlobalLocationChanges();
        }
    };

    //This will get the new locations and fire the getAppointments on the change of the global location
    //$scope.selectedFilter.selectedLocations is the variable that triggers the getAppointments
    ctrl.populateSelectedFilterSelectedLocations = populateSelectedFilterSelectedLocations;
    function populateSelectedFilterSelectedLocations() {
        $scope.selectedFilter.selectedLocations = [];
        var selectedLocations = [];

        if (
            $scope.multipleLocationsSelected ||
            $scope.routeParams.group === 'room'
        ) {
            _.forEach(locationsService.locations, function (l) {
                for (var i = 0; i < $scope.activeResources.length; i++) {
                    for (
                        var j = 0;
                        j < $scope.activeResources[i].locationAbbrLocations.length;
                        j++
                    ) {
                        if (
                            l.LocationId ===
                            $scope.activeResources[i].locationAbbrLocations[j]
                        ) {
                            selectedLocations.push(l);
                        }
                    }
                }
            });
        } else {
            _.forEach(locationsService.locations, function (l) {
                for (var i = 0; i < $scope.activeResources.length; i++) {
                    if (
                        l.LocationId === $scope.activeResources[i].locationAbbrLocations
                    ) {
                        selectedLocations.push(l);
                    }
                }
            });
        }

        //Remove Duplicate Location Objects
        selectedLocations = selectedLocations.filter(
            (element, i) => i === selectedLocations.indexOf(element)
        );

        $scope.selectedFilter.selectedLocations = angular.copy(selectedLocations);
    }

    //These values are needed to update the Input Values for the Location Dropdown Component when the global location changes
    ctrl.updateLocationDropdownInputValuesWhenGlobalLocationChanges = updateLocationDropdownInputValuesWhenGlobalLocationChanges;
    function updateLocationDropdownInputValuesWhenGlobalLocationChanges() {
        $scope.globalSelectedLocation = $scope.selectedLocation.NameLine1; //This is needed to pass into location dropdown on change of global location
        $scope.locations = angular.copy($scope.locations); //This is needed to pass into location dropdown on change of global location. Have to change the list so onChange fires to send values in
    }

    $scope.openNewUnscheduledModal = openNewUnscheduledModal;
    function openNewUnscheduledModal() {
        $scope.hideFilters();

        let dataItem = {
            LocationId: $scope.selectedLocation.LocationId,
            ProposedDuration: $scope.TimeIncrement,
            Classification: 2,
        };

        appointmentViewDataLoadingService.getViewData(dataItem, false).then(
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
    }

    //TODO: No longer called. Please remove.
    $scope.openFamilyScheduleModal = openFamilyScheduleModal;
    function openFamilyScheduleModal() {
        alert('This feature is not yet implemented');
    }

    $scope.openNewBlockModal = openNewBlockModal;
    function openNewBlockModal() {
        // method can be called early. Need to zero out the return url in case that is set from before

        // removing the possible fuse-last-url value because you opened the block modal with the schedule button.
        sessionStorage.removeItem('fuse-last-url'); // if exists remove it.

        $scope.hideFilters();

        $scope.routeParams.open = 'new';

        $scope.conflictExistsMsg = null;
        $scope.conflictExists = false;
        var appointmentLocation = locationsService.findByLocationId(
            $scope.selectedLocation.LocationId
        );

        // still not sure what this is trying to do.
        // can removed this once we remove the coding using this value in the block modal.
        $rootScope.scheduleSelectedLocations = [];
        $scope.selectedFilter.selectedLocations.forEach(function (item) {
            $rootScope.scheduleSelectedLocations.push({
                LocationId: item.LocationId,
            });
        });

        var tmpAppt = {
            AppointmentId: null,
            AppointmentTypeId: null,
            Classification: 1,
            EndTime: null,
            Patient: undefined,
            PersonId: ctrl.emptyGuid,
            PlannedServices: [],
            ProposedDuration: null,
            ProviderAppointments: [],
            ServiceCodes: [],
            StartTime: null,
            TreatmentRoomId: null,
            Providers: [],
            UserId: null,
            Status: 0,
            ObjectState: saveStates.Add,
            Location: appointmentLocation,
            WasDragged: false,
        };

        // some crazy logic to set the start and end default times.
        // needs to be looked at separately
        tmpAppt = getNewBlockDates(tmpAppt);

        scheduleBlockModalService.createBlock(
            tmpAppt,
            $scope.appointment.Data,
            scheduleProvidersService.providers,
            ctrl.appointments,
            ctrl.appointmentSaved,
            ctrl.appointmentEditCanceled
        );
    }

    // I need to rewrite all of this logic.
    // all this is doing is setting the start and end date it is way over complicated,
    // and I do not want to mess with it right now.
    ctrl.getNewBlockDates = getNewBlockDates;
    function getNewBlockDates(tmpAppt) {
        var startTimeTmp = angular.copy($scope.scheduleDateStart);
        // if week view
        if ($scope.scheduler.view().name === 'week') {
            // offset to monday in range
            var tmp = moment(startTimeTmp).day('Monday');
            if (tmp.isBefore($scope.scheduleDateStart, 'day')) {
                tmp.add(1, 'weeks');
            }
            startTimeTmp = tmp.toDate();
        }
        startTimeTmp.setHours(12);
        startTimeTmp.setMinutes(0);
        startTimeTmp.setSeconds(0);
        startTimeTmp.setMilliseconds(0);

        // I tried to edit this code ... for some reason the dates are all messed up if I try to change any of it ...
        // we should not need the angular.copy but if we remove it the variables are not right.
        // try to refactor this later.
        var tmpApptStart = angular.copy(startTimeTmp);
        startTimeTmp.setMinutes($scope.TimeIncrement);
        var tmpApptEnd = angular.copy(startTimeTmp);

        tmpAppt.StartTime = tmpApptStart;
        tmpAppt.EndTime = tmpApptEnd;
        tmpAppt.start = angular.copy(tmpApptStart);
        tmpAppt.end = angular.copy(tmpApptEnd);

        return tmpAppt;
    }

    ctrl.switchToBlockModal = switchToBlockModal;
    function switchToBlockModal(newAppointment) {
        // Drag opened appointment modal
        let appointment = newAppointment;
        let isInRoomView = validationLogic.InRoomView();

        // still not sure what this is trying to do.
        // can removed this once we remove the coding using this value in the block modal.
        $rootScope.scheduleSelectedLocations = [];
        $scope.selectedFilter.selectedLocations.forEach(function (item) {
            $rootScope.scheduleSelectedLocations.push({
                LocationId: item.LocationId,
            });
        });

        scheduleBlockModalService.switchToBlock(
            appointment,
            newAppointment,
            isInRoomView,
            scheduleProvidersService.providers,
            locationsService.locations,
            ctrl.appointmentSaved,
            ctrl.appointmentEditCanceled
        );
    }

    // This method is used to open both the block and unscheduled modals.
    $scope.toggleUnscheduledAppointmentView = toggleUnscheduledAppointmentView;
    function toggleUnscheduledAppointmentView(appointment, isBlock) {
        if (appointment && !isBlock) {
            $timeout(function () {
                appointment.AppointmentTypeId = _.isNil(ctrl.apptTypeSelected)
                    ? appointment.AppointmentTypeId
                    : ctrl.apptTypeSelected;
                $scope.newAppointment = appointment;
                $scope.appointment.Data = appointment;
                $scope.buildAppointmentNew(appointment);
            });
        } else {
            var tmpAppt = {
                AppointmentId: null,
                AppointmentTypeId: null,
                Classification: angular.isDefined(isBlock) && isBlock ? 1 : 2,
                EndTime: null,
                PersonId: ctrl.emptyGuid,
                PlannedServices: [],
                ProposedDuration: practiceSettings.DefaultTimeIncrement,
                ProviderAppointments: [],
                ServiceCodes: [],
                StartTime: null,
                TreatmentRoomId: '',
                UserId: '',
                ObjectState: saveStates.Add,
                WasDragged: false,
            };

            var startTimeTmp = angular.copy($scope.scheduleDateStart);
            // if week view
            if ($scope.scheduler.view().name === 'week') {
                // offset to monday in range
                var tmp = moment(startTimeTmp).day('Monday');
                if (tmp.isBefore($scope.scheduleDateStart, 'day')) {
                    tmp.add(1, 'weeks');
                }
                startTimeTmp = tmp.toDate();
            }
            startTimeTmp.setHours(12);
            startTimeTmp.setMinutes(0);
            startTimeTmp.setSeconds(0);
            startTimeTmp.setMilliseconds(0);
            var tmpApptStart = angular.copy(startTimeTmp);
            startTimeTmp.setMinutes($scope.TimeIncrement);
            var tmpApptEnd = angular.copy(startTimeTmp);
            if (appointment) {
                tmpAppt.StartTime = appointment.StartTime;
                tmpAppt.EndTime = appointment.EndTime;
                tmpAppt.UserId = appointment.UserId;
                tmpAppt.TreatmentRoomId = appointment.TreatmentRoomId;
            } else if (angular.isDefined(isBlock) && isBlock) {
                tmpAppt.StartTime = tmpApptStart;
                tmpAppt.EndTime = tmpApptEnd;
                tmpAppt.UserId = ctrl.emptyGuid;
                tmpAppt.TreatmentRoomId = ctrl.emptyGuid;
                ctrl.clearAppointmentForBlock();
            } else {
                // for now just setting these flags for use if they switch to a block. more work would be required if the unscheduled appointment needs to use these dates
                tmpAppt.$$BlockStartTime = tmpApptStart;
                tmpAppt.$$BlockEndTime = tmpApptEnd;
            }
            //$scope.inUnscheduledAppointmentView = true;
            $scope.appointment.Data = tmpAppt;
            $scope.buildAppointmentNew(appointment);
        }

        $scope.hideFilters();
    }

    $scope.buildAppointmentNew = buildAppointmentNew;

    function buildAppointmentNew(check) {
        var resource, params;
        ctrl.appointmentEditModalData = null;

        if (
            $scope.appointment.Data.StartTime &&
            $scope.appointment.Data.EndTime &&
            $scope.appointment.Data.Classification !=
            ctrl.ClassificationEnum.Block.Value
        ) {
            $scope.appointment.Data.Classification =
                ctrl.ClassificationEnum.Appointment.Value;
            ctrl.clearAppointmentForRegular();
            ctrl.setAppointmentDateTime(
                $scope.appointmentDate.Value,
                $scope.appointmentTime
            );

            /** calls custom validation, since this isn't actually saving an appointment */
            $scope.appointment.Valid = ctrl.appointmentIsValid(
                $scope.appointment.Data.Classification
            );
            if ($scope.appointment.Valid || check) {
                $scope.editAppointmentFromPopup(
                    $scope.appointment.Data,
                    null,
                    $scope.appointment.Data.UserId,
                    $scope.appointment.Data.TreatmentRoomId
                );
            }
        } else if (
            $scope.appointment.Data.Classification ===
            ctrl.ClassificationEnum.Block.Value
        ) {
            ctrl.setAppointmentDateTime(
                $scope.appointmentDate.Value,
                $scope.appointmentTime
            );

            ctrl.clearAppointmentForBlock();

            $scope.conflictExistsMsg = null;
            $scope.conflictExists = false;
            $scope.appointmentTime.Valid = true;

            var id = null;
            var resource;

            if (!validationLogic.InRoomView()) {
                id = $scope.appointment.Data.UserId;
                resource = scheduleServices.Lists.Appointments.FindUserBlockConflicts;
            } else {
                id = $scope.appointment.Data.TreatmentRoomId;
                resource = scheduleServices.Lists.Appointments.FindRoomBlockConflicts;
            }
            $scope.appointment.Validate();

            if ($scope.appointment.Valid) {
                if ($scope.appointment.Data.ObjectState == saveStates.Add) {
                    $scope.editAppointmentFromPopup(
                        $scope.appointment.Data,
                        null,
                        $scope.appointment.Data.UserId,
                        $scope.appointment.Data.TreatmentRoomId
                    );
                } else {
                    params = {
                        Take: 1,
                        StartTime: $scope.appointment.Data.StartTime.toISOString(),
                        EndTime: $scope.appointment.Data.EndTime.toISOString(),
                        Id: id,
                        ExcludeAppointment: $scope.appointment.Data.AppointmentId
                            ? $scope.appointment.Data.AppointmentId
                            : null,
                    };

                    resource(
                        params,
                        ctrl.FindBlockConflictsOnSuccess,
                        ctrl.FindBlockConflictsOnError
                    );
                }
            }
        } else {
            $scope.appointment.Data.Classification =
                ctrl.ClassificationEnum.UnscheduledAppointment.Value;
            ctrl.clearAppointmentForUnscheduled(true);
            $scope.appointment.Validate();
            if ($scope.appointment.Valid) {
                //$scope.appointment.Save();
                //$scope.refreshUnscheduledApptsList();
                $scope.editAppointmentFromPopup(
                    $scope.appointment.Data,
                    null,
                    $scope.appointment.Data.UserId,
                    $scope.appointment.Data.TreatmentRoomId
                );
            }
            $scope.refreshUnscheduledApptsList();
        }
    }

    $scope.$watch('inUnscheduledAppointmentView', function (nv, ov) {
        if (nv == false) {
            ctrl.resetDragSlots();
            ctrl.resetDragData();
        }
    });

    // Navigate Schedule lock. When this is set to true, additional calls will not execute
    var navigateInProgress = false;

    // this method bugs me because it is functioning for both week, preview, and normal (is there a normal) views on schedule
    // I will remove it after some more refactoring.
    ctrl.triggerNavigateEvent = triggerNavigateEvent;

    function triggerNavigateEvent(name, value, source, weekChanged) {
        //console.log('called triggerNavigateEvent ');
        if (navigateInProgress === true) {
            return;
        }

        navigateInProgress = true;

        ctrl.refreshPending = true; // block the refreshing

        $scope.routeParams.date =
            value.getFullYear() +
            '-' +
            (value.getMonth() + 1) +
            '-' +
            value.getDate();

        if ($scope.scheduler.view().name === 'week') {
            var newWeekStart = patSharedServices.Time.getStartDateOfWeek(value);
            var newWeekEnd = patSharedServices.Time.getEndDateOfWeek(value);

            var originalWeekStart = new Date(
                $scope.scheduleDateStart ? $scope.scheduleDateStart : value
            );
            originalWeekStart.setDate(
                originalWeekStart.getDate() - originalWeekStart.getDay()
            );

            weekChanged =
                weekChanged ||
                !patSharedServices.Time.isWithinWeek(newWeekStart, originalWeekStart);

            if (weekChanged === true) {
                // if we're in week view and the calendar date has changed but the date is within the
                // currently viewed week, there is no need to reload the appointments
                $scope.scheduleDateStart = newWeekStart;
                $scope.scheduleDateEnd = newWeekEnd;
                $scope.setWeekViewTitle();

                ctrl.recalculateHoursOfOperation();
                ctrl.getAppointments(newWeekStart, newWeekEnd);

                $scope.scheduler.date(value);
                if (source === 'calendarpicker') {
                    ctrl.resetProcessedEvents();
                }
            }
        } else {
            $scope.scheduleDateStart = value;
            $scope.setDayViewTitle();
            $scope.scheduleDateEnd = value;
            if (name !== 'preview') {
                $scope.scheduleDateStart.setHours(0, 0, 0, 0);
                $scope.scheduleDateEnd.setHours(23, 59, 59);
            }

            var theDay = new Date(
                $scope.scheduleDateStart.getFullYear(),
                $scope.scheduleDateStart.getMonth(),
                $scope.scheduleDateStart.getDate(),
                0,
                0,
                0,
                0
            );
            var plusOneDay = new Date(
                $scope.scheduleDateStart.getFullYear(),
                $scope.scheduleDateStart.getMonth(),
                $scope.scheduleDateStart.getDate(),
                23,
                59,
                59
            );
            ctrl.recalculateHoursOfOperation();

            // for some reason ... this method also sets the start and end time ...
            // the application did not work after changing that part, I need to figure out why that is because I would like to reload the application once
            // resetting the start and end dates as well as calling $scope.schedule.date() reloads the schedule.
            ctrl.getAppointments(theDay, plusOneDay);

            $scope.scheduler.date(value);
            if (source === 'calendarpicker') {
                ctrl.resetProcessedEvents();
            }
        }

        navigateInProgress = false;
    }

    ctrl.updateColumns = function () {
        $scope.shiftResources(0);

        $scope.loadingColumns = false;
    };

    ctrl.updateProviderFilter = updateProviderFilter;

    function updateProviderFilter() {
        if ($scope.scheduler) {
            var data = $scope.scheduler.dataSource.data();
            if (data.length > 0) {
                var filters = [];
                var locationString = '';
                var locationsToFilter =
                    $scope.selectedFilter.selectedLocations.length > 0
                        ? $scope.selectedFilter.selectedLocations
                        : locationsService.locations;
                var hasProviderFilter =
                    angular.isUndefined($scope.selectedProviders) ||
                    $scope.selectedProviders == null ||
                    $scope.selectedProviders.length > 0;
                _.forEach(locationsToFilter, function (location, index) {
                    locationString += '_' + location.LocationId;
                });

                _.forEach(data, function (appointment) {
                    if (
                        !appointment.Location ||
                        locationString.contains(appointment.Location.LocationId)
                    ) {
                        if (
                            !hasProviderFilter ||
                            !appointment.ProviderAppointments ||
                            appointment.ProviderAppointments.length == 0
                        ) {
                            filters.push(
                                factoryLogic.ScheduleFieldFilter(
                                    'AppointmentId',
                                    'equals',
                                    appointment.AppointmentId
                                )
                            );
                        } else {
                            var added = false;
                            _.forEach(appointment.ProviderAppointments, function (provAppt) {
                                if (!added) {
                                    var prov = listHelper.findItemsByFieldValue(
                                        $scope.selectedProviders,
                                        'UserId',
                                        provAppt.UserId
                                    );
                                    if (prov) {
                                        filters.push(
                                            factoryLogic.ScheduleFieldFilter(
                                                'AppointmentId',
                                                'equals',
                                                appointment.AppointmentId
                                            )
                                        );
                                        added = true;
                                    }
                                }
                            });
                        }
                    }
                });

                var filter = factoryLogic.ScheduleGroupFilter('or', filters);

                if (filter.filters.length) {
                    filterLogic.ApplyScheduleFilters(filter);
                } else {
                    // There are no appointment in the filter so filter out all appointments
                    filters.push(
                        factoryLogic.ScheduleFieldFilter('AppointmentId', 'equals', 0)
                    );
                    filterLogic.ApplyScheduleFilters(filter);
                }
            }
        }
    }

    ctrl.getProviderFilters = getProviderFilters;
    function getProviderFilters() {
        var filter = null;
        if ($scope.scheduler) {
            var data = $scope.scheduler.dataSource.data();
            if (data.length > 0) {
                var filters = [];
                var locationString = '';
                var locationsToFilter =
                    $scope.selectedFilter.selectedLocations.length > 0
                        ? $scope.selectedFilter.selectedLocations
                        : locationsService.locations;
                var hasProviderFilter =
                    angular.isUndefined($scope.selectedProviders) ||
                    $scope.selectedProviders == null ||
                    $scope.selectedProviders.length > 0;
                _.forEach(locationsToFilter, function (location, index) {
                    locationString += '_' + location.LocationId;
                });

                _.forEach(data, function (appointment) {
                    if (
                        !appointment.Location ||
                        locationString.contains(appointment.Location.LocationId)
                    ) {
                        if (
                            !hasProviderFilter ||
                            !appointment.ProviderAppointments ||
                            appointment.ProviderAppointments.length == 0
                        ) {
                            filters.push(
                                factoryLogic.ScheduleFieldFilter(
                                    'AppointmentId',
                                    'equals',
                                    appointment.AppointmentId
                                )
                            );
                        } else {
                            var added = false;
                            _.forEach(appointment.ProviderAppointments, function (provAppt) {
                                if (!added) {
                                    var prov = listHelper.findItemsByFieldValue(
                                        $scope.selectedProviders,
                                        'UserId',
                                        provAppt.UserId
                                    );
                                    if (prov) {
                                        filters.push(
                                            factoryLogic.ScheduleFieldFilter(
                                                'AppointmentId',
                                                'equals',
                                                appointment.AppointmentId
                                            )
                                        );
                                        added = true;
                                    }
                                }
                            });
                        }
                    }
                });

                filter = factoryLogic.ScheduleGroupFilter('or', filters);

                // if empty ...
                if (!filter.filters.length) {
                    // There are no appointments in the filter so filter out all appointments
                    filters.push(
                        factoryLogic.ScheduleFieldFilter('AppointmentId', 'equals', 0)
                    );
                    filter = factoryLogic.ScheduleGroupFilter('or', filters);
                }
            }
        }
        return filter;
    }

    $scope.containerIsLargeEnough = containerIsLargeEnough;
    function containerIsLargeEnough(className) {
        var result;
        if (angular.element('.' + className).css('height')) {
            var pixelCount = angular
                .element('.' + className)
                .css('height')
                .replace('px', '');
            result = pixelCount >= 30;
        }
        return result;
    }

    function sameDay(d1, d2) {
        if (!_.isDate(d1) || !_.isDate(d2)) {
            return false;
        }
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth()
        );
    }

    ctrl.WatchCalendarDate = function (nv, ov) {
        if (!sameDay($scope.scheduleDateStart, nv)) {
            ctrl.isRefreshPending = true;
            ctrl.changeDate('calendarpicker'); // calling this directly is better.
            $scope.fillLocationTimezoneInfo(nv);
            $scope.fillRoomLocationTimezoneAbbr();
        }
    };

    // call to preview slot from slotPreviewList
    $scope.onPreview = function () {
        $scope.previewParam.SelectedSlot.Start = new Date(
            $scope.previewParam.SelectedSlot.LocationStartTime
        );
        $scope.previewParam.SelectedSlot.End = new Date(
            $scope.previewParam.SelectedSlot.LocationEndTime
        );

        $scope.previewSlot(
            $scope.previewParam.SelectedSlotIndex,
            $scope.previewParam.SelectedSlot
        );
    };

    // preview appointments called from openTimeSearch
    $scope.previewParam = appointmentsOpenTimeFactory.PreviewParam();
    $scope.previewAppointment = function () {
        // set the start and end on the selectedSlot based on original slot
        // these are needed by togglePreviewAppointmentSlider
        $scope.previewParam.SelectedSlot.Start = new Date(
            $scope.previewParam.SelectedSlot.LocationStartTime
        );
        $scope.previewParam.SelectedSlot.End = new Date(
            $scope.previewParam.SelectedSlot.LocationEndTime
        );
        $scope.togglePreviewAppointmentSlider($scope.previewParam);
    };

    $scope.togglePreviewAppointmentSlider = function (previewParam) {
        $scope.previewData = previewParam;
        var previewData = angular.copy(previewParam);

        if (
            moment($scope.calendarPickerDate).format('LL') !=
            moment(previewData.SelectedSlot.Start).format('LL')
        ) {
            $scope.calendarPickerDate = $scope.previewParam.SelectedSlot.Start;
            $scope.createQueue('date', ['preview']);
            ctrl.updateProviderFilter();
        }

        setTimeout(function () {
            $scope.renderPreview(previewData);
            $scope.previewMode = true;
        }, 1000);
    };

    $scope.$on('schedule-unscheduled', function () {
        $scope.showClipboard = true;
    });

    $scope.renderPreview = function (data) {
        angular.element('.slot-preview-list').addClass('open');
        angular.element('.open-time-search').css('display', 'none');
        angular.element('#scheduler-slideout-wrapper').css('display', 'none');
        angular.element('.schedule-nav').css('pointer-events', 'none');

        $scope.openTimeSlots = data.OpenSlots;
        $scope.timeSlotToPreview = data.SelectedSlot;
        $scope.selectedSlot = data.SelectedSlotIndex;
        $scope.searchGroup = data.SearchGroup;
        $scope.buildMockAppt(data);

        $scope.renderPreviewCard();
    };

    $scope.renderPreviewCard = function () {
        setTimeout(function () {
            ctrl.addAppointmentFromSave($scope.mockAppt);
            $scope.addmockApptToScheduler($scope.mockAppt);
            ctrl.scrollToSelectedTimeSlot();
        }, 2000);
        setTimeout(function () {
            ctrl.scrollToMockAppointment();
        }, 4000);
    };

    $scope.closePreviewSlideout = function () {
        ctrl.appointments.data().pop();

        angular.element('.slot-preview-list').removeClass('open');
        angular.element('.open-time-search').css('display', 'block');
        angular.element('#scheduler-slideout-wrapper').css('display', 'block');
        angular.element('.schedule-nav').css('pointer-events', 'auto');

        $scope.previewMode = false;
        $scope.mockAppt = null;
        $scope.calendarPickerDate = new Date();
    };

    $scope.previewSlot = previewSlot;
    function previewSlot(index, slot) {
        ctrl.appointments.data().pop();

        $scope.selectedSlotIndex = index;
        $scope.timeSlotToPreview = slot;

        $scope.mockAppt.EndTime = $scope.timeSlotToPreview.End;
        $scope.mockAppt.StartTime = $scope.timeSlotToPreview.Start;
        $scope.mockAppt.Location = slot.Location;
        $scope.mockAppt.LocationId = slot.LocationId;
        $scope.mockAppt.Provider = slot.ProviderId;
        $scope.mockAppt.UserId = slot.ProviderId;
        if (slot.ProviderId) {
            $scope.mockAppt.ProviderAppointments[0].UserId = slot.ProviderId;
            $scope.mockAppt.ProviderAppointments[0].StartTime =
                $scope.timeSlotToPreview.Start;
            $scope.mockAppt.ProviderAppointments[0].EndTime =
                $scope.timeSlotToPreview.End;
        }
        $scope.mockAppt.Providers[0] = slot.ProviderId;

        $scope.mockAppt.Room = roomsService.findByRoomId(slot.RoomId);
        //$scope.mockAppt.Room = ctrl.listHelper.findItemByFieldValue($scope.treatmentRooms, "RoomId", slot.RoomId);

        $scope.mockAppt.TreatmentRoomId = slot.RoomId;

        if (
            moment($scope.calendarPickerDate).format('LL') !=
            moment($scope.timeSlotToPreview.Start).format('LL')
        ) {
            $scope.calendarPickerDate = slot.Start;
            $scope.createQueue('date', ['preview']);
            ctrl.updateProviderFilter();
        }

        if (
            moment($scope.calendarPickerDate).format('LL') !=
            moment($scope.timeSlotToPreview.Start).format('LL')
        ) {
            setTimeout(function () {
                $scope.renderPreview($scope.previewParam);
            }, 1000);
        } else {
            setTimeout(function () {
                ctrl.addAppointmentFromSave($scope.mockAppt);
                $scope.addmockApptToScheduler($scope.mockAppt);
            }, 2000);
            setTimeout(function () {
                ctrl.scrollToMockAppointment();
            }, 4000);
        }
    }

    $scope.buildMockAppt = buildMockAppt;
    function buildMockAppt(previewData) {
        $scope.mockAppt = $scope.createMockAppointment();
        $scope.mockAppt.ProposedDuration = previewData.Duration;
        //$scope.mockAppt.ExaminingDentist = previewData.ExaminingDentist;
        $scope.mockDentist = scheduleProvidersService.findByUserId(
            previewData.ExaminingDentist
        );
        $scope.mockAppt.AppointmentType = appointmentTypesService.findByAppointmentTypeId(
            previewData.AppointmentTypeId
        );
        $scope.mockAppt.AppointmentId = ctrl.emptyGuid;
        $scope.mockAppt.AppointmentTypeId =
            previewData.AppointmentTypeId != ''
                ? previewData.AppointmentTypeId
                : ctrl.emptyGuid;
        $scope.mockAppt.Location = previewData.Location;
        $scope.mockAppt.LocationId = previewData.Location.LocationId;
        $scope.mockAppt.EndTime = $scope.timeSlotToPreview.End;
        $scope.mockAppt.PersonId = ctrl.emptyGuid;
        $scope.mockAppt.StartTime = $scope.timeSlotToPreview.Start;
        $scope.mockAppt.StatusIcon = 'fa-eye';
        $scope.mockAppt.Provider = previewData.SelectedSlot.ProviderId
            ? scheduleProvidersService.findByUserId(
                previewData.SelectedSlot.ProviderId
            )
            : undefined;
        if (previewData.SelectedSlot.ProviderId) {
            $scope.mockAppt.ProviderAppointments.push({
                EndTime: $scope.timeSlotToPreview.End,
                ObjectState: 'Add',
                StartTime: $scope.timeSlotToPreview.Start,
                UserId: previewData.SelectedSlot.ProviderId,
            });
        }
        $scope.mockAppt.Providers.push(
            previewData.SelectedSlot.ProviderId
                ? previewData.SelectedSlot.ProviderId
                : undefined
        );
        $scope.mockAppt.ProviderString = $scope.mockAppt.Provider
            ? $scope.mockAppt.Provider.UserCode
            : undefined;
        $scope.mockAppt.DateModified = moment().toISOString();
        $scope.mockAppt.UserModified = $scope.userSettings.UserId;
        $scope.mockAppt.Patient.FirstName = 'Preview';
        $scope.mockAppt.Patient.LastName = 'Only';
        $scope.mockAppt.UserId = previewData.SelectedSlot.ProviderId
            ? previewData.SelectedSlot.ProviderId
            : undefined;
        $scope.mockAppt.isPreview = true;

        if (previewData.AppointmentTypeId == null) {
            $scope.mockAppt.ExaminingDentist = null;
        } else {
            $scope.mockAppt.ExaminingDentist = previewData.ExaminingDentist;
        }

        if (
            previewData.TreatmentRoomId == '' ||
            previewData.TreatmentRoomId == null
        ) {
            if (previewData.SelectedSlot.RoomId) {
                $scope.mockAppt.Room = roomsService.findByRoomId(
                    previewData.SelectedSlot.RoomId
                );
                //$scope.mockAppt.Room = ctrl.listHelper.findItemByFieldValue($scope.treatmentRooms, 'RoomId', previewData.SelectedSlot.RoomId);
                $scope.mockAppt.TreatmentRoomId = previewData.SelectedSlot.RoomId;
            } else {
                $scope.mockAppt.Room = $scope.providerRoom.Room;
                $scope.mockAppt.TreatmentRoomId = $scope.providerRoom.TreatmentRoomId;
            }
        } else {
            $scope.mockAppt.Room = roomsService.findByRoomId(
                previewData.TreatmentRoomId
            );
            //$scope.mockAppt.Room = ctrl.listHelper.findItemByFieldValue($scope.treatmentRooms, 'RoomId', previewData.TreatmentRoomId);
            $scope.mockAppt.TreatmentRoomId = previewData.TreatmentRoomId;
        }

        if ($scope.clipboardData) {
            $scope.mockAppt.PersonId = $scope.clipboardData.Data.PersonId;
            $scope.mockAppt.AppointmentId = $scope.clipboardData.Data.AppointmentId;
            $scope.mockAppt.Patient = $scope.clipboardData.Data.Patient;
        }
    }

    $scope.addmockApptToScheduler = function (appointment) {
        var index = lookupLogic.GetEventIndexById(appointment.AppointmentId);
        if (index > -1) {
            appointment.id = index;
            ctrl.appointments.data().splice(index, 1);
            ctrl.apps.splice(index, 1);
        } else {
            appointment.id = ctrl.appointments.data().length - 1;
        }

        appointment.ObjectState = saveStates.Add;
        appointment.FromPreview = true;
        ctrl.apps.push(appointment);
        $scope.scheduler.addEvent(
            ctrl.mapAppointmentResponseToViewModel(appointment)
        );

        ctrl.updateProviderFilter();
    };

    ctrl.scrollToMockAppointment = function () {
        var event, eventElement, events, view;
        if ($scope.scheduler) {
            view = $scope.scheduler.view();
            events = $scope.scheduler.dataSource.view();
        } else {
            view = this.view();
            events = this.dataSource.view();
        }

        if (events.length > 0) {
            event = _.find(events, { isPreview: true });
            if (event) {
                eventElement = view.element.find('[data-uid=' + event.uid + ']');
            } else {
                eventElement = view.element.find('[data-uid=' + events[0].uid + ']');
            }

            ctrl.scrollElement = null;
            ctrl.setScrollElement(eventElement, 1);
            ctrl.scrollToElement(1);
        } else {
            //this fixes the ff. issues:
            //1. failed to load mock appointment
            //2. failed to focus on mock appointment due to #1
            $scope.addmockApptToScheduler($scope.mockAppt);
            ctrl.scrollToMockAppointment();
        }
    };

    ctrl.scrollToSelectedTimeSlot = scrollToSelectedTimeSlot;

    function scrollToSelectedTimeSlot() {
        var event, eventElement, events, view;

        eventElement = $('#' + $scope.previewData.SelectedSlotIndex);

        ctrl.scrollTimeSlotElement = null;
        ctrl.setScrollElement(eventElement, 2);
        ctrl.scrollToElement(2);
    }

    $scope.generateGuid = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
            }
        );
        return uuid;
    };

    $scope.createMockAppointment = function () {
        var mockAppt = {
            ActualEndTime: null,
            ActualStartTime: null,
            Alerts: null,
            AppointmentId: null,
            AppointmentType: null,
            AppointmentTypeId: null,
            Classification: 0,
            ContactInfo: [],
            DataTag: null,
            DateModified: null,
            DeletedReason: null,
            Description: null,
            EndTime: null,
            ExaminingDentist: null,
            IsDeleted: null,
            IsExamNeeded: false,
            IsSooner: false,
            Location: null,
            LocationId: null,
            Note: null,
            Patient: {
                FirstName: null,
                LastName: null,
            },
            PersonId: null,
            PlannedServices: [],
            ProposedDuration: null,
            Provider: null,
            ProviderAppointments: [],
            ProviderUsers: [],
            ProviderString: null,
            Providers: [],
            ReminderMethod: null,
            Room: null,
            ServiceCodes: [],
            StartTime: null,
            Status: 0,
            StatusIcon: null,
            StatusNote: null,
            TreatmentRoomId: null,
            UserId: null,
            UserModified: null,
        };

        return mockAppt;
    };

    $scope.providerRoom = {
        Room: null,
        TreatmentRoomId: null,
    };
    $scope.mockDentist = null;
    $scope.mockAppt = null;
    $scope.selectedSlot = null;
    $scope.selectedSlotIndex = null;
    $scope.openTimeSlots = [];
    $scope.searchGroup = 1;
    $scope.timeSlotToPreview = null;

    $scope.showReorderCols = false;
    $scope.appointment = boundObjectFactory.Create(
        scheduleServices.Dtos.Appointment
    );
    $scope.unscheduledAppointmentToDelete = null;
    $scope.hasPatient = false;
    $scope.minutes = [];
    $scope.minutesString = [];
    $scope.locationHoursOfOperations = [];
    $scope.isLoading = false;
    $scope.appointmentDate = {
        Value: null,
    };
    $scope.appointmentTime = {
        date: null,
        start: null,
        end: null,
    };
    $scope.appointmentHours = {
        StartTime: null,
        EndTime: null,
    };
    $scope.clipboardData = null;
    $scope.providerAppointments = [];
    $scope.apptTime = {
        startDate: null,
        endDate: null,
    };
    $scope.clearSlots = 0;
    $scope.missingReqs = false;

    $scope.appointmentTypeMinutes = $scope.minutes[0];
    $scope.providersByLocation = providersByLocation;

    //////////////////////////////////////////////////////
    //region Toggle Left Filters area
    $scope.toggle = true;
    $scope.toggleView = toggleView;

    function toggleView(toggle) {
        $scope.toggle = toggle;
        $scope.slideOutText = toggle ? '<<Hide' : 'Show>>';

        if (!$scope.showOpenTimeSearch) {
            $scope.hideFilters();
        }

        ctrl.toggleSlideout(toggle);
    }

    ctrl.toggleSlideout = function (toggle) {
        if (toggle) {
            angular.element('#scheduler-wrapper').removeClass('toggled');
            angular.element('#topnav').removeClass('slider-top-nav-hide');
            angular.element('#topnav').addClass('slider-top-nav-show');

            angular.element('#topnav-icons').removeClass('slider-top-nav-icons-hide');
            angular.element('#topnav-icons').addClass('slider-top-nav-icons-show');
        } else {
            angular.element('#scheduler-wrapper').addClass('toggled');
            angular.element('#topnav').removeClass('slider-top-nav-show');
            angular.element('#topnav').addClass('slider-top-nav-hide');

            angular.element('#topnav-icons').removeClass('slider-top-nav-icons-show');
            angular.element('#topnav-icons').addClass('slider-top-nav-icons-hide');
        }

        // have to add in a break for the page to realize it needs to resize itself
        setTimeout(function () {
            // reinitialize the view so the cards fix themselves.
            ctrl.setSchedulerState(ctrl.schedulerStates.Refresh);
            ctrl.refreshResource($scope.scheduler.options.group.resources[0]);

            $scope.scheduler.view($scope.scheduler.view().name);

            ctrl.addIdealDaysTemplateColors();
        }, 200);
    };
    // endregion
    //////////////////////////////////////////////////////

    $scope.updateUserDefaultSettings = updateUserDefaultSettings;
    function updateUserDefaultSettings(newValue, type) {
        if (type === 1) {
            if (newValue !== $scope.oldProvidersToShow) {
                ctrl.saveUserSettings();
                $scope.oldProvidersToShow = newValue;
            }
        } else if (type === 2) {
            if (newValue !== $scope.oldRoomsToShow) {
                ctrl.saveUserSettings();
                $scope.oldRoomsToShow = newValue;
            }
        } else if (type === 3) {
            if (newValue !== $scope.oldHourDisplay) {
                ctrl.saveUserSettings();
                $scope.oldHourDisplay = newValue;
            }
            //console.log('Row Slider Changed');
            ctrl.rowSliderChanged(newValue, type);
        } else if (type === 4) {
            if (newValue !== $scope.isScheduleInPrivacyMode) {
                $scope.isScheduleInPrivacyMode = newValue;
                ctrl.appointmentsForPinnedAppointmentArea(
                    pinnedAppointmentsService.allPinnedAppointments
                );
                ctrl.saveUserSettings();
            }
        } else if (type === 5) {
            if (newValue !== $scope.roomViewAppointmentColorType) {
                $scope.roomViewAppointmentColorType = newValue;
                ctrl.saveUserSettings();
            }
        }

        $scope.createQueue('group', [$scope.routeParams.group]);
    }

    $scope.updateColumnOrder = function () {
        $scope.showReorderCols = !$scope.showReorderCols;
        $scope.reorderProviderColumnsList = [];
        $scope.reorderRoomColumnsList = [];

        if (validationLogic.InProviderView()) {
            var duplicateProviders = getDuplicateProviders($scope.list);
            $scope.list = moveTheDuplicateProvidersToCorrectPlaceInList(
                $scope.list,
                duplicateProviders
            );
            if (duplicateProviders.length > 0) {
                if ($scope.multipleLocationsSelected) {
                    $scope.activeResources = filterDisplayProviders($scope.list);
                }
            }
            //Need this variable for Provider Dropdown. Don't remove. It kicks of for the onchange and sets the reordered selected providers
            $scope.reorderProviderColumnsList = angular.copy($scope.list);
            ctrl.providerColumnsUpdatedAfterProviderDropdownChange($scope.list);
        } else if (validationLogic.InRoomView()) {
            //Need this variable for Room Dropdown. Don't remove. It kicks of for the onchange and sets the reordered selected rooms
            $scope.reorderRoomColumnsList = angular.copy($scope.list);
            ctrl.roomColumnsUpdatedAfterRoomDropdownChange($scope.list);
        }

        var longName = $.grep($scope.list, function (e) {
            var name = e.FirstName + ' ' + e.LastName;
            return name.length > 32;
        });

        if (longName.length > 0) {
            $('.reorder').css({ width: 'auto', 'padding-right': '10px' });
        } else {
            $('.reorder').css('width', '272px');
        }
    };

    $scope.toggleClipboard = function () {
        $scope.showClipboard = !$scope.showClipboard;
    };

    $scope.toggleReorderCols = function () {
        $scope.showReorderCols = !$scope.showReorderCols;

        if (validationLogic.InProviderView()) {
            $scope.list = [];
            $scope.list = $scope.selectedProviders;
        } else if (validationLogic.InRoomView()) {
            $scope.list = [];
            $scope.list = $scope.selectedRooms;
        }

        var longName = $.grep($scope.list, function (e) {
            var name = e.FirstName + ' ' + e.LastName;
            return name.length > 32;
        });

        if (longName.length > 0) {
            $('.reorder').css({ width: 'auto', 'padding-right': '10px' });
        } else {
            $('.reorder').css('width', '272px');
        }
    };

    $scope.prioritizeSort = function (item) {
        if (item.AppointmentId == $scope.priorityUnscheduledAppointmentId) {
            return new Date().toISOString();
        } else {
            return item.DateModified;
        }
    };

    // remove clipboard appointment modal
    $scope.showRemoveClipboardAppointmentModal = function (appointment) {
        $scope.clipboardAppointmentToRemove = appointment;

        modalFactory
            .AppointmentDeleteModal(
                $scope.clipboardAppointmentToRemove.Classification,
                true,
                'Deleting this appointment will remove it from this clipboard, but will retain unscheduled patient appointment. Do you want to continue?'
            )
            .then(
                ctrl.confirmRemoveClipboardAppointment,
                ctrl.cancelRemoveClipboardAppointment
            );
    };

    $scope.createOpenTimeSearchObject = function (appointment) {
        $scope.clearSlots = $scope.clearSlots + 1;

        $scope.clipboardData = boundObjectFactory.Create(
            scheduleServices.Dtos.Appointment
        );
        $scope.clipboardData.Data = angular.copy(appointment);

        // the value is already set to true so just add the class
        // it must have been opened previously
        // doing this to avoid a kendo widget issue
        // with the control after it is shown the first time
        // kendo widgets do not like to be taken off the dom.
        if ($scope.showOpenTimeSearch) {
            angular.element('.open-time-search').addClass('open');
        } else {
            $scope.showOpenTimeSearch = true;
        }

        $scope.showOpenTimeSearch = true;
    };

    $scope.draggableHint = function (e) {
        if (!$scope.selectedAppointment) return null;

        $scope.draggingAppointment = true;
        $scope.draggedUnscheduledAppointment = $scope.selectedAppointment;

        var dataItem = angular.copy($scope.selectedAppointment);
        var defaultIncrement = $scope.TimeIncrement;
        var increment = 30;
        var scalar = increment / defaultIncrement;
        var height = dataItem.ProposedDuration * scalar;
        var bgColor = dataItem.AppointmentType
            ? dataItem.AppointmentType.AppointmentTypeColor
            : 'gray';
        var color = dataItem.AppointmentType
            ? dataItem.AppointmentType.FontColor
            : 'white';

        var hintHtml =
            "<div id='event-hint' class='k-event k-event-drag-hint' style='padding: 5px; border-radius: 0; border: none; height:" +
            height +
            'px; background: ' +
            bgColor +
            '; color: ' +
            color +
            " '" +
            "   <div class='k-event-template'>" +
            _.escape(
                dataItem.Patient.FirstName +
                (dataItem.Patient.PreferredName
                    ? ' (' + dataItem.Patient.PreferredName + ')'
                    : '') +
                (dataItem.Patient.MiddleName
                    ? ' ' + dataItem.Patient.MiddleName + '.'
                    : '') +
                dataItem.Patient.LastName +
                (dataItem.Patient.Suffix ? ', ' + dataItem.Patient.Suffix : '')
            ) +
            '   </div>' +
            '</div>';
        return hintHtml;
    };

    // This seems like something we would pre setup and just have available and ready to utilize
    // I am not sure why we are calculating it every time we open the schedule ... more research is needed.
    $scope.generateDurationList = generateDurationList;
    function generateDurationList() {
        var step = $scope.TimeIncrement ? $scope.TimeIncrement : 5;

        for (var i = step; i < 996; i += step) {
            $scope.minutes.push(i);
            $scope.minutesString.push({ duration: i.toString() });
        }
    }

    $scope.selectUnscheduledAppointment = function (appointment) {
        $scope.selectedAppointment = appointment;
    };

    $scope.selectAppointmentClassification = function (classification) {
        $scope.appointment.Data.Classification = classification.Value;

        $scope.selectedClassification = classification.Name;

        if (classification.Value == ctrl.ClassificationEnum.Block.Value) {
            ctrl.clearAppointment();
        } else {
            ctrl.clearAppointmentExceptForPatient();
        }

        ctrl.setRequiresPatient(classification);
    };

    $scope.$on('openAppointmentModal', function (e, appointment) {
        $scope.appointment.Data = appointment;
        $scope.appointment.Data.Classification =
            ctrl.ClassificationEnum.Appointment.Value;
        $scope.appointmentDate.Value = new Date();
        var aptDate = $scope.appointmentDate.Value;
        var start = new Date(
            aptDate.getFullYear(),
            aptDate.getMonth(),
            aptDate.getDate(),
            1,
            0,
            0,
            0
        );
        var end = new Date(
            aptDate.getFullYear(),
            aptDate.getMonth(),
            aptDate.getDate(),
            1,
            30,
            0,
            0
        );
        $scope.appointmentTime.date = new Date(
            aptDate.getFullYear(),
            aptDate.getMonth(),
            aptDate.getDate(),
            1,
            0,
            0,
            0
        ).toISOString();
        $scope.appointmentTime.start = new Date(start).toISOString();
        $scope.appointmentTime.end = new Date(end).toISOString();

        $scope.save(true);
    });

    $scope.save = function (check) {
        var resource, params;

        if (
            $scope.appointment.Data.Classification ===
            ctrl.ClassificationEnum.Appointment.Value
        ) {
            ctrl.clearAppointmentForRegular();
            ctrl.setAppointmentDateTime(
                $scope.appointmentDate.Value,
                $scope.appointmentTime
            );

            /** calls custom validation, since this isn't actually saving an appointment */
            $scope.appointment.Valid = ctrl.appointmentIsValid(
                $scope.appointment.Data.Classification
            );
            if ($scope.appointment.Valid || check) {
                $scope.openAppointmentModal(
                    $scope.appointment.Data,
                    null,
                    $scope.appointment.Data.UserId,
                    $scope.appointment.Data.TreatmentRoomId
                );
            }
        } else if (
            $scope.appointment.Data.Classification ===
            ctrl.ClassificationEnum.Block.Value
        ) {
            ctrl.setAppointmentDateTime(
                $scope.appointmentDate.Value,
                $scope.appointmentTime
            );

            ctrl.clearAppointmentForBlock();

            $scope.conflictExistsMsg = null;
            $scope.conflictExists = false;
            $scope.appointmentTime.Valid = true;

            var id = null;
            var resource;

            if (!validationLogic.InRoomView()) {
                id = $scope.appointment.Data.UserId;
                resource = scheduleServices.Lists.Appointments.FindUserBlockConflicts;
            } else {
                id = $scope.appointment.Data.TreatmentRoomId;
                resource = scheduleServices.Lists.Appointments.FindRoomBlockConflicts;
            }

            $scope.appointment.Validate();

            if ($scope.appointment.Valid) {
                params = {
                    Take: 1,
                    StartTime: $scope.appointment.Data.StartTime.toISOString(),
                    EndTime: $scope.appointment.Data.EndTime.toISOString(),
                    Id: id,
                    ExcludeAppointment: $scope.appointment.Data.AppointmentId
                        ? $scope.appointment.Data.AppointmentId
                        : null,
                };

                resource(params, ctrl.FindBlockConflictsOnSuccess);
            }
        } else {
            ctrl.clearAppointmentForUnscheduled(true);
            $scope.appointment.Validate();
            if ($scope.appointment.Valid) {
                $scope.appointment.Save();
            }
        }
    };

    $scope.mouseEnter = function (index, e) {
        $scope.hoverIndex = index;
    };

    $scope.mouseDown = function (index, e) {
        $scope.dragIndex = index;
    };

    $scope.mouseUp = function (index, e) {
        if (
            $scope.dragIndex > -1 &&
            $scope.hoverIndex > -1 &&
            $scope.dragIndex != $scope.hoverIndex
        ) {
            var temp, step;

            // if dragging down, iterate forwards; otherwise, iterate backwards.
            step = $scope.dragIndex < $scope.hoverIndex ? 1 : -1;

            // store the dragged index in a temp variable
            temp = $scope.list[$scope.dragIndex];

            // shift all the values up or down 1 depending on whether we are dragging up or down
            for (var i = $scope.dragIndex; i != $scope.hoverIndex; i = i + step) {
                $scope.list[i] = $scope.list[i + step];
            }

            // replace the largest index with the temporary variable
            $scope.list[$scope.hoverIndex] = temp;
        }

        $scope.dragIndex = -1;
    };

    $scope.refreshUnscheduledApptsList = function () {
        pinnedAppointmentsService.allPinnedAppointments = [];

        ctrl.getUnscheduledAppointments();
    };

    // click handler for opening the filter panel
    $scope.showFilters = showFilters;
    function showFilters() {
        $scope.clipboardData = null;

        $scope.clearSlots = $scope.clearSlots + 1;

        if ($scope.showOpenTimeSearch) {
            // the value is already set to true so just add the class
            // it must have been opened previously
            // doing this to avoid a kendo widget issue
            // with the control after it is shown the first time
            // kendo widgets do not like to be taken off the dom.
            angular.element('.open-time-search').addClass('open');
        } else {
            $scope.showOpenTimeSearch = true;
        }
    }

    ctrl.adjustSliderLabelPosition = adjustSliderLabelPosition;
    function adjustSliderLabelPosition(type, nv) {
        var maxLength = 0;
        var selector = '';
        var startPosition = 21; // slider minimum position

        if (type === 'room') {
            selector = '#roomSliderLabel';
            maxLength = $scope.roomMaxLength;
        } else if (type === 'provider') {
            selector = '#providerSliderLabel';
            maxLength = $scope.providerMaxLength;
        } else if (type === 'hour') {
            selector = '#hourSliderLabel';
            startPosition = 14;
        }

        var endPosition = 215; // slider maximum position
        var sliderLength = endPosition - startPosition; // length of slider
        var doubleDigitAdj = type === 'hour' ? 6 : 5;
        var pos = 0;
        if (type === 'hour') {
            var fixedAdjustment = 48.5;
            pos = startPosition + fixedAdjustment * nv;
            pos = nv == 4 ? pos - doubleDigitAdj : pos;
        } else {
            pos = startPosition + (nv - 1) * (sliderLength / (maxLength - 1));
            pos = nv >= 10 ? pos - doubleDigitAdj : pos;
        }

        $(selector).css({ 'margin-left': pos + 'px', 'margin-top': '-56px' });
    }

    // click handler for closing the filter panel
    $scope.hideFilters = function () {
        angular.element('.open-time-search').removeClass('open');
    };

    $scope.apptTypeListTemplate =
        '<div id="apptTypeListTemplate" type="text/x-kendo-template" ng-show="dataItem">' +
        '<span class=" appointment-type-circle" ng-style="{\'background-color\': dataItem.AppointmentTypeColor, \'color\': dataItem.FontColor}"></span>' +
        '<span class="padding-8 k-state-default">#: Name #</span>' +
        '</div>';

    $scope.apptTypeValueTemplate =
        '<div id="valueTemplate" type="text/x-kendo-template">' +
        '<span id="lblSelectedAppointmentTypePreview" class="value-template-input appointment-type-circle" style="margin-bottom: 7px;" ng-style="{\'background-color\': dataItem.AppointmentTypeColor, \'color\': dataItem.FontColor}"></span>' +
        '<span id="lblSelectedAppointmentTypeName" class="value-template-input k-state-default">#: Name #</span>' +
        '</div>';

    $scope.providerListTemplate =
        '<div id="providerListTemplate" type="text/x-kendo-template">' +
        '<span id="lblSelectedName" class="k-state-default" ng-style="{\'font-weight\': dataItem.Preferred == true ? \'bold\' : \'normal\' }">#: Name #</span>' +
        '</div>';

    // centralizes some logic until we can move it into a single service
    $scope.getAndSetPinnedAppointments = function () {
        $scope.pinnedAppointments = pinnedAppointmentsService.getPinnedAppointments(
            $scope.selectedFilter.selectedLocations.map(l => l.LocationId)
        );
    };

    $scope.checkPreview = function (apptId) {
        var previewOnly = false;

        if ($('#patientName' + apptId).text() == 'Preview Only ') {
            previewOnly = true;
        }

        return previewOnly;
    };

    $scope.$rootScopeRegistrations.push(
        $rootScope.$on('open-clipboard', function () {
            $scope.showClipboard = true;
            $scope.openClipboard = true;
        })
    );

    // This used to be called by the modal if an appointment was updated and was valid. ... 2000 milliseconds later ... I think it can be deleted but I need another set of eyes and someone to test the update.
    $scope.$rootScopeRegistrations.push(
        $rootScope.$on('refresh-clipboard-appointments', function () {
            $scope.refreshUnscheduledApptsList();
        })
    );

    // #endregion
    // #endregion

    $scope.handleSignalRMessageV2 = function (message) {

        // verify we have a valid payload.
        // this will verify that we are only working with messages that we care about
        // currently displaying on the schedule
        if ($scope.shouldFilterOutAppointmentMessage(message)) {
            console.debug('message was filtered out');
            return;
        }

        const appointmentId = message.Data.AppointmentId;

        if (message.Operation == 2) // Delete
        {
            console.debug('appointment was deleted');

            // remove from our lists of pinned and regular appointments if it's there, then refresh the UI
            ctrl.removeScheduledAppointments(appointmentId);
            ctrl.removePinnedAppointments(appointmentId);

            ctrl.GetAppointmentsOnSuccessNew(ctrl.apps);
        }
        else { // create or update

            // if an update happens and no one is there to see it, does it really happen?
            if (!$scope.pageIsVisible) {
                $scope.liveUpdatesHasChanges = true;
                return;
            }

            console.debug('appointment was created/updated');
            const locationIds = $scope.selectedFilter.selectedLocations.map(l => l.LocationId);

            // fetch today's appointment data so we have the data necessary to display on the schedule
            schedulingApiService
                .getDayViewAppointmentById(appointmentId, locationIds)
                .then(function (response) { // response is a list of appointments that can include 0 or 1 appointments since we searched by an id

                    // no appointment found, so this is an unscheduled appointment
                    if (response.length == 0) {

                        console.debug('appointment was not found in dayview');

                        // remove the appointment if it's part of the current schedule
                        ctrl.removeScheduledAppointments(appointmentId);

                        // refresh the clipboard list as we have a new pinned appointment
                        ctrl.getUnscheduledAppointments();
                    }
                    else {

                        console.debug('appointment was found in dayview');

                        // remove the appointment from the list of appointments we have, so we can re-add it with the new data
                        ctrl.removeScheduledAppointments(appointmentId);
                        response[0].Alerts = response[0].PatientAlerts;
                        ctrl.apps.push(response[0]);

                        // covering the case where this appointment came from pinned appointments and is now scheduled,
                        // remove it from pinned appointments so we don't have to refresh this list at all
                        ctrl.removePinnedAppointments(appointmentId);
                    }

                    // this refreshes the schedule view with the new appointment data
                    ctrl.GetAppointmentsOnSuccessNew(ctrl.apps);
                });
        }
    }

    $scope.refreshScheduleData = function () {
        const locationIds = $scope.selectedFilter.selectedLocations.map(l => l.LocationId);
        if ($scope.schedViewName !== 'week')
        {
            schedulingApiService
                .getDayViewAppointments(ctrl.lastAppointmentCall.from, ctrl.lastAppointmentCall.to, locationIds)
                .then(ctrl.GetAppointmentsOnSuccessNew, ctrl.GetAppointmentsOnError);
        }
    }

    /**
     * The goal of this function is to stop us from processing any messages that aren't
     * relevant to the current schedule view. Ideally only processing the messages
     * that are shown on the schedule.
     */
    $scope.shouldFilterOutAppointmentMessage = function (message) {

        // we only care about appointment related messages from the hub
        // and we only care if we have data to filter on i.e. a properly formatted message
        if (message.Resource != "appointment" || !message.Data)
        {
            return true;
        }

        // never filter out pinned appointments, these include cases like an appointment
        // going from the schedule or getting created out of the blue as a pinned appointment
        if (message.Data.IsPinned == true)
        {
            return false;
        }

        // never filter out appointments that are currently included on the schedule view right now
        if (ctrl.apps.filter(a => a.AppointmentId == message.Data.AppointmentId).length > 0
            || $scope.pinnedAppointments.filter(a => a.AppointmentId == message.Data.AppointmentId).length > 0) {
            return false;
        }

        // filter out any appointments that are not in our current date range on the schedule view
        if (message.Data.StartTime && !$scope.betweenDates(new Date(message.Data.StartTime), $scope.scheduleDateStart, $scope.scheduleDateEnd))
        {
            return true;
        }

        // filter out appointments outside of our current location(s)
        if ($scope.selectedFilter.selectedLocations.length > 0
            && $scope.selectedFilter.selectedLocations.filter(l => l.LocationId == message.Data.LocationId).length == 0)
        {
            return true;
        }

        // by default don't filter out appointments
        // in case I missed a use case for filtering
        return false;
    }

    $scope.betweenDates = function (target, start, end) {
        // schedule sets start and end date as midnight of the date, so we need to get rid of times for comparisons
        const targetWithoutTime = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const startWithoutTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endWithoutTime = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        return targetWithoutTime <= endWithoutTime && targetWithoutTime >= startWithoutTime;
    }

    $scope.liveUpdatesHasChanges = false;
    $scope.pageIsVisible = true;

    $scope.initialize = initialize;
    function initialize() {
        ctrl.checkFeatureFlags();

        schedulingSignalRHub.start();
        $scope.unsubscribeToserverlessSignalrHubConnectionServiceConnection = schedulingSignalRHub
            .onConnectionEvents()
            .subscribe({
                next: messages => {
                    // Show the banner if we've closed the signalR connection or are in the process of trying to reconnect
                    if (messages === ConnectionEventMessageTypes.Close || messages === ConnectionEventMessageTypes.Reconnecting) {
                        $scope.setBannerVisibility(true);
                    }
                    // Hide the banner if we've reconnected to signalR
                    else if (messages === ConnectionEventMessageTypes.Reconnected) {
                        $scope.setBannerVisibility(false);
                    }
                }
            });

        $scope.unsubscribeToServerlessSignalrHubConnectionService = schedulingSignalRHub
            .onMessages()
            .subscribe({
                next: messages => {
                    $scope.handleSignalRMessageV2(messages)
                },
                error: error => {
                    console.log(error);
                },
            });

        if ($scope.useVisibilityCheck) {
            // visibility api tells us when a user is actually viewing the current page tab, if they navigate to another tab
            // or minimize their window this event will trigger telling us when that happens
            // in our case we turn off scheduling live updates temporarily, and whenever the user returns we can do a full
            // refresh of the schedule so they have the most up to date data. In theory this can save on update calls
            // assuming multiple updates can happen before a user goes back to a dormant tab.
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    $scope.pageIsVisible = false;
                    $scope.liveUpdatesHasChanges = false;
                    return;
                }
                if ($scope.liveUpdatesHasChanges) {
                    $scope.refreshScheduleData();
                }
                $scope.pageIsVisible = true;
                $scope.liveUpdatesHasChanges = false;
            });
        }

        //Need For SignalR
        //Remove Pinned Appointment from Clipboard
        ctrl.removePinnedAppointments = function (appointmentId) {
            //Look for appointment in the pinnedAppointments. If it is there, remove the appointment from the pinnedAppointments List
            var pinnedAppointmentIndex = $scope.pinnedAppointments.findIndex(
                p => p.AppointmentId === appointmentId
            );
            //If the appointment exists on the clipboard, then refresh the clipboard so that the appointment is not there.
            if (pinnedAppointmentIndex > -1) {
                //Have to remove the unscheduled appointment from the list in this service so the list
                //gets updated and then call $scope.getAndSetPinnedAppointments()
                pinnedAppointmentsService.removePinnedAppointmentIfItExists(
                    appointmentId
                );
            }
        };

        //Need For SignalR
        //Remove ScheduledAppointment From List
        ctrl.removeScheduledAppointments = function (appointmentId) {
            //Look for appointment in the ctrl.apps. If it is there, remove the appointment from the ctrl.apps List
            var scheduledAppointmentIndex = ctrl.apps.findIndex(
                p => p.AppointmentId === appointmentId
            );
            //If the appointment exists exists in the list, then remove it from the ctrl.apps list
            if (scheduledAppointmentIndex > -1) {
                //Have to remove the unscheduled appointment from the list in this service so the list
                //gets updated and then call $scope.getAndSetPinnedAppointments()
                ctrl.apps.splice(scheduledAppointmentIndex, 1);
            }
        };



        initializationLogic.InitializeSchedulerEvents();
        initializationLogic.InitializeControllerVariables();
        initializationLogic.InitializeScopeVariables();

        if ($scope.openClipboard) {
            $scope.showClipboard = true;
        }
        delete $rootScope.openClipboard;
        ctrl.initAppointment();

        locationsService.locations = $scope.locations;
        if (locationsService.locations.length > 0 && !$scope.selectedLocation) {
            $scope.selectedLocation = ctrl.getLoggedInLocation();

            // if the location wasn't found in our list for some reason, default to the first item in our list.
            $scope.selectedLocation =
                $scope.selectedLocation != null
                    ? $scope.selectedLocation
                    : locationsService.locations[0];

            $scope.selectedFilter.selectedLocations = [$scope.selectedLocation];
            $scope.initialLocationSelection = [$scope.selectedLocation];
        }

        // we used to have all the data loaded up here for what was needed below.
        // Now we do not since the change.
        ctrl.setProviders();

        ctrl.schedulerState = ctrl.setSchedulerState(
            ctrl.schedulerStates.Initialize
        );

        ctrl.activeGroup =
            $scope.routeParams.group > '' &&
                $scope.schedulerGroups[$scope.routeParams.group] > ''
                ? $scope.routeParams.group
                : $scope.schedulerGroups.room;
        ctrl.activeView =
            $scope.routeParams.view > '' &&
                $scope.schedulerViews[$scope.routeParams.view] > ''
                ? $scope.routeParams.view
                : $scope.schedulerViews.day;

        // check if the `location` query string param was set
        if ($scope.routeParams.location) {
            // bug 441496 - when clicking 'add to clipboard' on old appt modal from tx plan screen, provider hours are not
            //  showing up on the schedule. it's because of this line - it's setting $scope.selectedLocation
            //  to the location of the appointment, and the user's globally selected location is a different location
            //
            // if there is already a globally selected location ($scope.userLocation), and already a $scope.selectedLocation, we do NOT want
            //   to update the $scope.selectedLocation value
            if (_.isNil($scope.userLocation) && _.isNil($scope.selectedLocation)) {
                $scope.selectedLocation = locationsService.findByNameAbbreviation(
                    $scope.routeParams.location
                );
            }
        }

        /** get appointments for week */
        //var fromTime = ctrl.getActualDate($routeParams.date);
        //var startOfWeek = patSharedServices.Time.getStartDateOfWeek(fromTime);
        //var endOfWeek = patSharedServices.Time.getEndDateOfWeek(fromTime);

        ctrl.selectProvidersFromString($scope.routeParams.providers);
        // convert route params for rooms
        ctrl.selectRoomsFromRouteParams($scope.routeParams.rooms);

        ctrl.getUnscheduledAppointments();
        //#region schedule options

        ctrl.showApptLocationWarningtModal = function (dropArea) {
            $scope.apptLocationWarningModal = $uibModal.open({
                templateUrl:
                    'App/Common/components/appointment-status/modal/invalid-patient-appt-location-warning.html',
                scope: $scope,
                controller: function () {
                    $scope.close = function () {
                        $scope.apptLocationWarningModal.close();
                    };
                    if (dropArea.locationAbbr) {
                        $scope.locationDisplayName = dropArea.locationAbbr;
                    } else {
                        $scope.locationDisplayName = dropArea.Location.NameAbbreviation;
                    }
                },
                size: 'md',
                windowClass: 'center-modal',
            });
        };

        // why are we calling this now ... why not call this when setting up the sliders.
        ctrl.adjustSliderLabelPosition(
            'hour',
            $scope.sliderValues.activeIncrementIndex
        );

        $scope.stopEverythingIfSavingAppointment = function (e) {
            if ($scope.appointmentBeingSaved) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        };

        //var totalSlotTime = 0;

        function renderDaySlotTemplate(date, resources) {
            // below is a slight performance improvement as we would not be setting the titleDate (removing the $filter that is run for dates for each of those)
            ctrl.lastFilterValues = {
                //idDate: $filter('date')(date, '-MM-dd-yyyy-HH-mm'),
                classDate: $filter('date')(date, 'yyyy-MM-ddTHH-mm'),
                titleDate: $filter('date')(date, 'EEEE MM-dd-yyyy h:mm a'),
            };

            if (
                resources &&
                resources.TreatmentRoomId &&
                $scope.routeParams.group === 'room'
            ) {
                var resource = _.find($scope.activeResources, {
                    value: resources.TreatmentRoomId,
                });
                if (!_.isNil(resource)) {
                    return (
                        '<div id="' +
                        _.escape(resource.text) +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'class="schedule-slot-content closed-time ' +
                        _.escape(resource.value) +
                        ' ' +
                        _.escape(resource.value) +
                        '-' +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'title="' +
                        _.escape(resource.text) +
                        ': ' +
                        _.escape(ctrl.lastFilterValues.titleDate) +
                        '"' +
                        '>' +
                        '</div>'
                    );
                }
            } else if (
                !_.isEmpty(resources.Providers) &&
                $scope.routeParams.group === 'provider'
            ) {
                var provider = _.find($scope.activeResources, {
                    value: resources.Providers[0],
                });
                if (!_.isNil(provider)) {
                    return (
                        '<div id="' +
                        _.escape(provider.text) +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'class="schedule-slot-content closed-time ' +
                        _.escape(provider.value) +
                        ' ' +
                        _.escape(provider.value) +
                        '-' +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'title="' +
                        _.escape(provider.text) +
                        ': ' +
                        _.escape(ctrl.lastFilterValues.titleDate) +
                        '"' +
                        '>' +
                        '</div>'
                    );
                }
            }

            return '<div></div>';
        }

        function renderWeekSlotTemplate(date, resources) {
            ctrl.lastFilterValues = {
                //idDate: $filter('date')(date, '-MM-dd-yyyy-HH-mm'),
                classDate: $filter('date')(date, 'yyyy-MM-ddTHH-mm'),
                titleDate: $filter('date')(date, 'EEEE h:mm a'),
            };

            if (resources && resources.TreatmentRoomId) {
                var resource = _.find($scope.activeResources, {
                    value: resources.TreatmentRoomId,
                });
                if (!_.isNil(resource)) {
                    return (
                        '<div id="' +
                        _.escape(resource.text) +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'class="schedule-slot-content closed-time ' +
                        _.escape(resource.value) +
                        ' ' +
                        _.escape(resource.value) +
                        '-' +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'title="' +
                        _.escape(resource.text) +
                        ': ' +
                        _.escape(ctrl.lastFilterValues.titleDate) +
                        '"' +
                        '>' +
                        '</div>'
                    );
                }
            } else if (!_.isEmpty(resources.Providers)) {
                var provider = _.find($scope.activeResources, {
                    value: resources.Providers[0],
                });
                if (!_.isNil(provider)) {
                    return (
                        '<div id="' +
                        _.escape(provider.text) +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'class="schedule-slot-content closed-time ' +
                        _.escape(provider.value) +
                        ' ' +
                        _.escape(provider.value) +
                        '-' +
                        _.escape(ctrl.lastFilterValues.classDate) +
                        '" ' +
                        'title="' +
                        _.escape(provider.text) +
                        ': ' +
                        _.escape(ctrl.lastFilterValues.titleDate) +
                        '"' +
                        '>' +
                        '</div>'
                    );
                }
            }

            return '<div></div>';
        }

        $scope.schedulerOptions = {
            date: ctrl.schedulerDate,
            timezone: 'Etc/UTC',
            currentTimeMarker: { updateInterval: 60000 },
            //currentTimeMarker: false,
            allDaySlot: false,
            footer: false,
            snap: true,
            majorTimeHeaderTemplate: kendo.template(
                '<div class="hours-label">#:kendo.toString(date, "h tt")#</div>'
            ),
            minorTickCount: 60 / $scope.TimeIncrement,
            views: [
                {
                    type: 'day',
                    slotTemplate: function (data) {
                        //var start = performance.now();
                        var a = renderDaySlotTemplate(data.date, data.resources());
                        //var end = performance.now();
                        //var c = end - start;
                        //totalSlotTime += c;
                        //console.log(totalSlotTime);
                        return a;
                    },
                },
                {
                    type: 'week',
                    slotTemplate: function (data) {
                        return renderWeekSlotTemplate(data.date, data.resources());
                    },
                    // We should be able to utilize this to create a custom click for the weekview headers.
                    // To get that to work again but this is a little involved so I would like to save the link and get back to it soon.
                    //https://docs.telerik.com/kendo-ui/knowledge-base/implement-more-events-button-in-week-view
                    //dateHeaderTemplate: kendo.template('<strong>#=kendo.toString(date, ' + '"ddd"' + ')#</strong>')
                },
                {
                    type: 'month',
                },
            ],
            // custom group header template for the week view
            groupHeaderTemplate: function (dataItem) {
                return $scope.groupHeaderTemplate(dataItem);
            },
            showWorkHours: false,
            dataBinding: function (e) {
                var view = this.view();

                view.timesHeader.hide();
            },
            dataSource: ctrl.appointments,
            group: {
                date: true,
                resources:
                    $scope.routeParams.group > '' &&
                        $scope.schedulerGroups[$scope.routeParams.group] > ''
                        ? [$scope.routeParams.group]
                        : [$scope.schedulerGroups.provider],
            },
            resources: new kendo.data.ObservableArray([
                {
                    field: 'TreatmentRoomId',
                    name: 'room',
                    title: 'Rooms',
                    dataSource: $scope.activeResources,
                    nullable: true,
                },
                {
                    field: 'Providers',
                    name: 'provider',
                    title: 'Providers',
                    dataSource: $scope.activeResources,
                    nullable: true,
                    multiple: true,
                },
            ]),
            dataBound: ctrl.changeAppointmentDisplay,
            editable: {
                destroy: false,
                update: false,
            },
            add: ctrl.addAppointment,
            edit: function (e) {
                e.preventDefault();
            },
            navigate: $scope.navigateView,
            resizeStart: function (e) {
                //CardMoving
                if (
                    e.event.AppointmentType == 'lunch' ||
                    $scope.appointmentBeingSaved ||
                    $scope.appointmentSavedNeedRedraw
                ) {
                    e.preventDefault();
                } else {
                    ctrl.movingResizingAppointment = true;

                    ctrl.resetDragSlots();
                    ctrl.dragData.Dragging = false;
                    ctrl.dragData.Slots = [];
                }
            },
            resize: function (e) {
                //CardMoving
                if (
                    !ctrl.schedulerFacade.Validation.CanResizeEvent(
                        e.event.AppointmentId,
                        e.start,
                        e.end
                    )
                ) {
                    this.wrapper.find('.k-marquee-color').css('background', '#d9534f');
                    e.preventDefault();
                } else {
                    this.wrapper.find('.k-marquee-color').css('background', '#5cb85c');
                }
            },
            resizeEnd: function (e) {
                //CardMoving
                ctrl.movingResizingAppointment = false;

                if (
                    !ctrl.schedulerFacade.Validation.CanResizeEvent(
                        e.event.AppointmentId,
                        e.start,
                        e.end
                    )
                ) {
                    e.preventDefault();
                } else {
                    ctrl.backupAppointment = _.cloneDeep(
                        lookupLogic.GetEventById(e.event.AppointmentId)
                    );
                    let confirmAppointment = _.cloneDeep(ctrl.backupAppointment);

                    confirmAppointment.startOriginal = _.cloneDeep(
                        ctrl.backupAppointment.start
                    );
                    confirmAppointment.endOriginal = _.cloneDeep(
                        ctrl.backupAppointment.end
                    );
                    confirmAppointment.StartTimeOriginal = _.cloneDeep(
                        ctrl.backupAppointment.StartTime
                    );
                    confirmAppointment.EndTimeOriginal = _.cloneDeep(
                        ctrl.backupAppointment.EndTime
                    );
                    confirmAppointment.NewStartTime = e.start;

                    // This hacky conversion of the string to a date and back to a string is address the issue where domain sends us an ISO string 2-digit milliseconds, but javascript gives us 3 digits.
                    if (
                        new Date(confirmAppointment.StartTime).toISOString() !=
                        e.start.toISOString() ||
                        new Date(confirmAppointment.EndTime).toISOString() !=
                        e.end.toISOString()
                    ) {
                        confirmAppointment.start = e.start;
                        confirmAppointment.end = e.end;

                        confirmAppointment.StartTime = e.start;
                        confirmAppointment.EndTime = e.end;

                        var processResize = function (rescheduleConfirmAppointment) {
                            // keep this search until we find that we have a better understanding of the object format
                            // and we can move all handling off the view we are baby stepping our way to a better place.
                            let appointment = null;
                            for (var i = 0; i <= ctrl.apps.length - 1; i++) {
                                if (
                                    ctrl.apps[i].AppointmentId ===
                                    rescheduleConfirmAppointment.AppointmentId
                                ) {
                                    appointment = ctrl.apps[i];
                                    break;
                                }
                            }

                            // get the appointment from the list of appointments stored on the schedule
                            if (appointment !== null) {
                                // adjust provider appointments based on new time range
                                appointmentUtilities.updateProviderAppointmentsOnDrag(
                                    appointment,
                                    e.start,
                                    e.end
                                );
                                // mark any duplicate provider appointments for deletion
                                appointmentUtilities.markDuplicateProviderAppointmentsToRemove(
                                    appointment
                                );

                                // Strip the unnecessary data so that it isn't sent across the wire.
                                appointment.StartTime = e.start;
                                appointment.EndTime = e.end;
                                ctrl.setAppointmentBeingSaved(true);
                                $scope.saveTruncatedAppointment(appointment);
                            }
                        };

                        if (e.start.getTime() === e.event.start.getTime()) {
                            // this event is changing the end time so this isn't considered a reschedule, no need to prompt
                            processResize(confirmAppointment);
                        } else {
                            modalFactory
                                .AppointmentRescheduleConfirmModal(confirmAppointment)
                                .then(processResize, ctrl.appointmentResizedOrMovedCancel);
                        }
                    }
                }
            },
            moveStart: function (e) {
                if (
                    e.event.AppointmentType == 'lunch' ||
                    e.event.Status == 3 ||
                    $scope.appointmentBeingSaved ||
                    $scope.appointmentSavedNeedRedraw
                ) {
                    e.preventDefault();
                } else if (
                    (e.event.Status && e.event.Status === 5) ||
                    e.event.Status === 3
                ) {
                    e.preventDefault();
                } else {
                    ctrl.movingResizingAppointment = true;
                }
            },
            move: function (e) {
                if ((e.event.Status && e.event.Status === 5) || e.event.Status === 3) {
                    e.preventDefault();
                }
                var sourceId = '';
                var sourceName = '';
                var validObj = {};

                if (e.resources.Providers && e.resources.Providers.length > 0) {
                    sourceName = 'Providers';
                    sourceId = e.resources.Providers[0];
                } else if (
                    e.resources.TreatmentRoomId &&
                    e.resources.TreatmentRoomId > ''
                ) {
                    sourceName = 'Rooms';
                    sourceId = e.resources.TreatmentRoomId;
                }

                validObj = validationLogic.ValidateMoveEvent(
                    ctrl.dragData,
                    e.event,
                    sourceName,
                    sourceId,
                    e.start,
                    e.end
                );

                if (validObj.IsValid == false) {
                    this.wrapper.find('.k-event-drag-hint').css('background', '#d9534f');
                    this.wrapper
                        .find('.k-event-drag-hint')
                        .prepend($('#hint-warning-lbl'));
                    this.wrapper
                        .find('.k-event-drag-hint')
                        .append(
                            $(
                                angular.element(
                                    '<label id="hint-warning-lbl">' +
                                    _.escape(validObj.ErrorMessage) +
                                    '</label>'
                                )
                            )
                        );
                } else {
                    this.wrapper.find('.k-event-drag-hint').css('background', '#5cb85c');
                }
            },
            moveEnd: function (e) {
                if ((e.event.Status && e.event.Status === 5) || e.event.Status === 3) {
                    e.preventDefault();
                }
                ctrl.movingResizingAppointment = false;

                var sourceId = '';
                var sourceName = '';
                var validObj = {};
                var dropArea = {};

                $scope.hasChanges = false;
                $scope.providerIsChanging = false;
                $scope.examiningDentistIsChanging = false;
                if (e.resources.Providers && e.resources.Providers.length > 0) {
                    sourceName = 'Providers';
                    sourceId = e.resources.Providers[0];

                    let destinationProviderAtLocation = scheduleProvidersService.findByUserId(
                        sourceId
                    );
                    if (!destinationProviderAtLocation.IsActive) {
                        modalFactory.ScheduleInactiveProviderModal().then(
                            () => {},
                            () => {}
                        ); // we don't care about these...but in order to not get a warning about an unhandled rejection
                        //  i put them in. if you have a better idea, please let me know
                        e.preventDefault();

                        return;
                    }
                    dropArea = $scope.localProviders.filter(p => p.UserId === sourceId);
                    dropArea = dropArea[0];
                } else if (
                    e.resources.TreatmentRoomId &&
                    e.resources.TreatmentRoomId > ''
                ) {
                    sourceName = 'Rooms';
                    sourceId = e.resources.TreatmentRoomId;
                    dropArea = roomsService.findByRoomId(sourceId);
                    if (dropArea === null) {
                        for (var i = 0; i < $scope.selectedRooms.length; i++) {
                            if ($scope.selectedRooms[i].RoomId === sourceId) {
                                dropArea = $scope.selectedRooms[i];
                                break;
                            }
                        }
                    }
                }

                validObj = validationLogic.ValidateMoveEvent(
                    ctrl.dragData,
                    e.event,
                    sourceName,
                    sourceId,
                    e.start,
                    e.end
                );

                if (validObj.IsValid == false) {
                    e.preventDefault();
                } else {
                    var beginResource = $scope.scheduler.resourcesBySlot(
                        ctrl.dragData.NewBeginSlot
                    );

                    let confirmAppointment = _.cloneDeep(
                        lookupLogic.GetEventById(e.event.AppointmentId)
                    );
                    ctrl.backupAppointment = _.cloneDeep(confirmAppointment);
                    confirmAppointment.startOriginal = _.cloneDeep(
                        confirmAppointment.start
                    );
                    confirmAppointment.endOriginal = _.cloneDeep(confirmAppointment.end);
                    confirmAppointment.StartTimeOriginal = _.cloneDeep(
                        confirmAppointment.StartTime
                    );
                    confirmAppointment.EndTimeOriginal = _.cloneDeep(
                        confirmAppointment.EndTime
                    );
                    confirmAppointment.NewStartTime = e.start;

                    // transform object for move transform because we do not get all the needed fields when we get the appointment data from the views

                    if (
                        $scope.scheduler.options.group.resources[0] === 'room' &&
                        beginResource.TreatmentRoomId != e.resources.TreatmentRoomId
                    ) {
                        confirmAppointment.TreatmentRoomId = e.resources.TreatmentRoomId;
                        // get the location from the room the room has the locationId and rooms are not in multiple locations
                        // that would not make sense ... but what do I know ... so get the locationId using the roomId
                        var room = roomsService.findByRoomId(
                            confirmAppointment.TreatmentRoomId
                        );
                        if (room === null) {
                            for (var i = 0; i < $scope.selectedRooms.length; i++) {
                                if (
                                    $scope.selectedRooms[i].RoomId ===
                                    confirmAppointment.TreatmentRoomId
                                ) {
                                    confirmAppointment.LocationId =
                                        $scope.selectedRooms[i].LocationId;
                                    break;
                                }
                            }
                        } else {
                            confirmAppointment.LocationId = room.LocationId;
                        }
                    } else if (
                        $scope.scheduler.options.group.resources[0] === 'provider' &&
                        beginResource.Providers[0] !== e.resources.Providers[0]
                    ) {
                        if (beginResource.Providers[0] !== e.resources.Providers[0]) {
                            var destinationProvider = scheduleProvidersService.findByUserId(
                                sourceId
                            );
                            if (destinationProvider.ProviderTypeViewId != 2) {
                                /** is a block */
                                if (confirmAppointment.Classification > 0) {
                                    confirmAppointment.UserId = e.resources.Providers[0];
                                } else {
                                    /** is a regular appointment */
                                    $scope.providerIsChanging = true;
                                    for (
                                        let i = 0;
                                        i < confirmAppointment.ProviderAppointments.length;
                                        i++
                                    ) {
                                        if (
                                            confirmAppointment.ProviderAppointments[i].UserId ==
                                            beginResource.Providers[0]
                                        ) {
                                            confirmAppointment.ProviderAppointments[i].UserId =
                                                e.resources.Providers[0];
                                            confirmAppointment.ProviderAppointments[i].ObjectState =
                                                saveStates.Update;
                                        }
                                    }

                                    if (
                                        confirmAppointment.ProviderAppointments !== null &&
                                        confirmAppointment.ProviderAppointments !== undefined &&
                                        confirmAppointment.Classification !== 1
                                    ) {
                                        confirmAppointment.UserId = e.resources.Providers[0];
                                        confirmAppointment.Providers[0] = e.resources.Providers[0];
                                    } else {
                                        confirmAppointment.UserId = null;
                                    }
                                }
                            } else {
                                $scope.examiningDentistIsChanging = true;
                                confirmAppointment.ExaminingDentist = e.resources.Providers[0];
                            }
                            $scope.hasChanges = true;
                        }
                    }
                    if (
                        new Date(confirmAppointment.StartTime).toISOString() !=
                        e.start.toISOString() ||
                        new Date(confirmAppointment.EndTime).toISOString() !=
                        e.end.toISOString() ||
                        confirmAppointment.TreatmentRoomId !== e.event.TreatmentRoomId
                    ) {
                        $scope.hasChanges = true;
                        confirmAppointment.start = e.start;
                        confirmAppointment.end = e.end;

                        // modify Alec's Mom based on startTime change(ref bug 282929 / 375709 )
                        appointmentUtilities.updateProviderAppointmentsOnMove(
                            confirmAppointment,
                            e.start
                        );
                    }

                    var success = function (appointment) {
                        //check if variable gets set
                        if (
                            appointment.Location !== null &&
                            appointment.LocationId !== appointment.Location.LocationId
                        ) {
                            let newLocationObject = $scope.locations.filter(
                                l => l.LocationId === appointment.LocationId
                            );
                            appointment.Location = newLocationObject[0];
                            $scope.apptLocationHasChanged = true;
                            if ($scope.currentScheduleView === 'provider') {
                                appointment.TreatmentRoomId = null;
                                appointment.Room = null;
                            }
                            //WE MAY NEED THIS IN THE NEAR FUTURE SO I AM LEAVING IT HERE TEMPORARILY
                            //If provider can be rescheduled to new location set userId on appointment which is later checked by the appointmentViewLoadingService
                            //if ($scope.currentScheduleView === 'room') {
                            //    let providerCanBeDraggedToNewApptLocation = _.filter(ctrl.providersByLocation, (providerLocation) =>
                            //        providerLocation.UserId === appointment.ProviderAppointments[0].UserId && providerLocation.LocationId === appointment.LocationId);
                            //    if (providerCanBeDraggedToNewApptLocation.length > 0) {
                            //        appointment.UserId = appointment.ProviderAppointments[0].UserId;
                            //    } else {
                            //        appointment.UserId = null;
                            //    }
                            //}
                        }
                        let providerName = '';

                        if ($scope.hasChanges) {
                            ctrl.setAppointmentBeingSaved(true);
                            // Strip the unnecessary data so that it isn't sent across the wire.
                            appointment.StartTime = e.start;
                            appointment.EndTime = e.end;

                            var title = 'Change Provider';
                            var button1Text = 'Yes';
                            var button2Text = 'No';
                            var message = null;
                            if ($scope.providerIsChanging) {
                                providerName = ctrl.getProviderName(e.resources.Providers[0]);

                                message = localize.getLocalizedString(
                                    'Would you like to change the provider for this scheduled appointment to {0}?',
                                    [providerName]
                                );

                                ctrl.tempChangeProviderAppointment = angular.copy(appointment);

                                modalFactory
                                    .ConfirmModal(title, message, button1Text, button2Text)
                                    .then(
                                        ctrl.confirmDragAppointmentWithNewProvider,
                                        ctrl.cancelDragAppointment
                                    );
                            } else if ($scope.examiningDentistIsChanging) {
                                providerName = ctrl.getProviderName(e.resources.Providers[0]);
                                message = localize.getLocalizedString(
                                    'Would you like to change the examining dentist for this scheduled appointment to {0}?',
                                    [providerName]
                                );

                                ctrl.tempChangeProviderAppointment = angular.copy(appointment);

                                modalFactory
                                    .ConfirmModal(title, message, button1Text, button2Text)
                                    .then(
                                        ctrl.confirmDragAppointmentWithNewProvider,
                                        ctrl.cancelDragAppointment
                                    );
                            } else {
                                $scope.saveTruncatedAppointment(appointment);
                            }
                        }
                        $scope.endDrag(e.event);
                    };

                    var cancel = function () {
                        ctrl.setAppointmentBeingSaved(false);
                        var appointment = ctrl.backupAppointment;
                        var index = lookupLogic.GetEventIndexById(
                            appointment.AppointmentId
                        );
                        if (index > -1) {
                            appointment.id = index;
                            ctrl.appointments.data().splice(index, 1);
                            ctrl.apps.splice(index, 1);
                            if ($scope.scheduler) {
                                ctrl.apps.push(appointment);
                                $scope.scheduler.addEvent(
                                    ctrl.mapAppointmentResponseToViewModel(appointment)
                                );
                            }
                        }

                        ctrl.refreshAppointmentListData();
                        $scope.endDrag(e.event);
                    };
                    // bug 335792 we don't need confirmation on move if this is a block (Classification = 1)
                    if (
                        confirmAppointment.Classification ===
                        ctrl.ClassificationEnum.Block.Value
                    ) {
                        if (destinationProvider) {
                            confirmAppointment.LocationId = destinationProvider.LocationId;
                        }
                        success(confirmAppointment);
                    } else if (
                        dropArea.LocationId !== ctrl.backupAppointment.LocationId
                    ) {
                        // we need this to be async every time for a race condition between when we go to render
                        // the first update, and when we potentially have to cancel that update
                        // where the ctrl.appointments is null/undefined. If that happens, after this
                        // function finishes it will leave a ghost/duplicate appointment on the schedule.
                        // This function is a promise, but sometimes it completes immediately because the
                        // data it's fetching for a patient is cached. If that's the case this runs much more
                        // quickly than we expect and the duplication happens.
                        setTimeout(() =>
                            // location changing, throw warning modal if patient doesn' exist at new location
                            personFactory.Overview(e.event.Patient.PatientId).then(
                                function (res) {
                                    if (res.Value) {
                                        let matchingLocations = res.Value.PatientLocations.filter(
                                            l => l.LocationId === dropArea.LocationId
                                        );
                                        if (matchingLocations.length > 0) {
                                            confirmAppointment.LocationId = dropArea.LocationId;

                                            modalFactory
                                                .AppointmentRescheduleConfirmModal(confirmAppointment)
                                                .then(success, cancel);
                                        } else {
                                            ctrl.showApptLocationWarningtModal(dropArea);
                                            cancel();
                                        }
                                    } else {
                                        toastrFactory.error(
                                            'Failed to load patient data, please try again.'
                                        );
                                        cancel();
                                    }
                                },
                                function () {
                                    toastrFactory.error(
                                        'Failed to load patient data, please try again.'
                                    );
                                    cancel();
                                }
                            ), 10);
                    } else {
                        // this is the 99% case
                        modalFactory
                            .AppointmentRescheduleConfirmModal(confirmAppointment)
                            .then(success, cancel);
                    }
                }
            },
        };

        // I am not sure what the purpose is for this method call.
        $scope.selectAppointmentClassification(
            ctrl.ClassificationEnum.UnscheduledAppointment
        );

        $scope.currentProviderCount = 0;
        $scope.currentHourCount = 0;
        $scope.currentRoomCount = 0;
        $scope.dragIndex = -1;
        $scope.hoverIndex = -1;
        $scope.disableRoomView = false;
        $scope.previewMode = false;

        $scope.list = [];

        $scope.blocked = false;

        ctrl.setAppointmentBeingSaved = function (isAppointmentBeingSaved) {
            //console.log('setting $scope.appointmentBeingSaved to ' + isAppointmentBeingSaved);
            $scope.appointmentBeingSaved = isAppointmentBeingSaved;
        };
        $scope.setAppointmentBeingSaved = ctrl.setAppointmentBeingSaved;

        $scope.generateDurationList();

        ctrl.disableTodayButton = function () {
            if (
                !_.isUndefined(ctrl.today) &&
                !_.isUndefined($scope.calendarPickerDate)
            ) {
                var today = new Date(
                    ctrl.today.getFullYear(),
                    ctrl.today.getMonth(),
                    ctrl.today.getDate(),
                    1,
                    0,
                    0,
                    0
                );
                var calendarSelection = new Date(
                    $scope.calendarPickerDate.getFullYear(),
                    $scope.calendarPickerDate.getMonth(),
                    $scope.calendarPickerDate.getDate(),
                    1,
                    0,
                    0,
                    0
                );

                if (_.isEqual(today, calendarSelection)) {
                    $scope.todayButtonDisabled = true;
                } else {
                    $scope.todayButtonDisabled = false;
                }
            }
        };
        ctrl.disableTodayButton();

        setScheduleGridRows();
        //#endregion

        //#region SignalR

        ctrl.setTokenCookie = function () {
            ctrl.token = patAuthenticationService.getCachedToken();
            if (ctrl.token) {
                var cookie = 'access_token=' + ctrl.token + '; path=/;';
                if (location.hostname != 'localhost') {
                    cookie += ctrl.getCookieDomain();
                }
                document.cookie = cookie;
            }
        };

        ctrl.clearAuthentication = function () {
            var cookie =
                'access_token=; path=/; expires=' + new Date(0).toUTCString() + ';';
            if (location.hostname != 'localhost') {
                cookie += ctrl.getCookieDomain();
            }
            document.cookie = cookie;
        };

        ctrl.getCookieDomain = function () {
            var temp = location.host.split('.').reverse();
            return 'domain=.' + temp[1] + '.' + temp[0];
        };

        $scope.getTimeslotBackgroundColor = function(dataItem, providerTime) {
            if (!dataItem || !providerTime) return '';

            if (dataItem.providerColors[providerTime.UserId].Display === dataItem.typeColor.Display) {
                return 'rgba(' + dataItem.providerColors[providerTime.UserId].Display + ', 0.35)';
            }

            return 'rgba(' + dataItem.providerColors[providerTime.UserId].Display + ', 1)';
        }

        $scope.getTimeslotTop = function(dataItem, providerTime)  {
            if (!dataItem || !providerTime) return '';
            return ((ctrl.getDuration(dataItem.StartTime, providerTime.StartTime) / ctrl.getDuration(dataItem.StartTime, dataItem.EndTime)) * 100) + '%'
        }

        $scope.getTimeslotHeight = function(dataItem, providerTime)  {
            if (!dataItem || !providerTime) return '';
            return ((ctrl.getDuration(providerTime.StartTime, providerTime.EndTime) / ctrl.getDuration(dataItem.StartTime, dataItem.EndTime)) * 100) + '%'
        }

        //When an appointment has an EncounterId and the Status is equal to 3 (Completed), we want to disable the appointment card status dropdown.
        //When a Provider, a Provider on Service Transaction, or an Examining Dentist is invalid in the appointment, we want to disable and display tooltip
        //return true to disable and false to enable
        ///IMPORTANT: When launch darkly flag is removed, make this function ctrl.disableAppointmentCardStatusDropdown. We don't want to call from html code
        $scope.disableAppointmentCardStatusDropdown = function (appointment) {

            if (
                appointment.hasOwnProperty('PlannedServices') &&
                appointment.PlannedServices.length > 0 &&
                appointment.PlannedServices[0].EncounterId !== null &&
                appointment.Status === 3
            ) {
                //New code flagged
                if ($scope.DisableStatusIconFeatureFlag === true) {
                    appointment.AppoinmentIsCheckedOutWithEncounter = true;
                }

                return true;
            }
            //New code flagged
            if ($scope.DisableStatusIconFeatureFlag === true) {
                ctrl.isProviderValidOnAllAppointmentViewFields(appointment);

                if (ctrl.ProviderFieldsOnAppointmentViewAreInvalid) {
                    //Add this to appointment to use for tooltip enable in scheduler.html
                    appointment.IsProviderInvalid = true;
                    return true;
                }
            }

            //New code flagged
            if ($scope.DisableStatusIconFeatureFlag === true) {
                //Add this to appointmnent to use for tooltip when an appointment is checked out with an encounter
                appointment.AppoinmentIsCheckedOutWithEncounter = false;
                //Add this to appointment to use for tooltip enable in scheduler.html
                appointment.IsProviderInvalid = false;
            }

            return false;
        };


        ///This will check if provider is valid on all appointment view fields that
        ///have to do with a provider
        ctrl.isProviderValidOnAllAppointmentViewFields = function (appointment) {
            var providerIds = ctrl.getUniqueProviderIds(appointment.ProviderAppointments);
            var plannedServiceProviderIds = ctrl.getUniqueProviderIds(appointment.PlannedServices);
            var performedByProviderTypeId = appointment.AppointmentType ? appointment.AppointmentType.PerformedByProviderTypeId : null;
            var areProvidersValid = providerAppointmentValidationService.isProviderValidOnAllAppointmentViewFields(appointment.ExaminingDentist, appointment.LocationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId);

            if (!areProvidersValid) {

                ctrl.ProviderFieldsOnAppointmentViewAreInvalid = true;
            }
            else {
                ctrl.ProviderFieldsOnAppointmentViewAreInvalid = false;
            }
        };

        //This will return provider ids without duplicating in the list
        ctrl.getUniqueProviderIds = function (providerIdsList) {
            var providerIds = [];
            var uniqueProviderIds = [];
            if (providerIdsList.length > 0 && providerIdsList[0].UserId) {
                _.find(providerIdsList, function (n) {
                    providerIds.push(n.UserId);
                });
            }
            if (providerIdsList.length > 0 && providerIdsList[0].ProviderUserId) {
                _.find(providerIdsList, function (n) {
                    providerIds.push(n.ProviderUserId);
                });
            }
            if (providerIds) {
                uniqueProviderIds = _.uniq(providerIds);
            }
            return uniqueProviderIds;
        };

        //This gets called when dragging and dropping onto schedule from the clipboard
        ctrl.updateAppointmentDisplay = updateAppointmentDisplay;
        function updateAppointmentDisplay(appointment) {
            //console.log('Before update of the page.');
            // remove existing one if need be ... other wise add.
            var index = lookupLogic.GetEventIndexById(appointment.AppointmentId);
            if (index > -1) {
                appointment.id = index;
                //console.log('Item was removed from the page because it changed.');
                ctrl.apps.splice(index, 1);
            } else {
                // we have to find the largest id already in the array so that we do not overwrite existing Ids.
                // Kendo uses this Id number to identify different items on the scheduler control
                // sharing the number can cause issues like the disappearing cards that we have seen at times.
                // it took a very long time to identify this as a likely cause for the issue
                var largest = 0;
                for (var i = 0; i <= ctrl.apps.length - 1; i++) {
                    if (ctrl.apps[i].id > largest) {
                        largest = ctrl.apps[i].id;
                    }
                }
                //console.log('Largest existing item id is: ' + largest);
                // doing ++ did not result in the desired behavior all the time so I am incrementing with + 1
                appointment.id = largest + 1;
            }

            //console.log('Item added onto the page.');
            //console.log('Appointment Status After Adding: ' + appt.Status);
            ctrl.apps.push(appointment);

            ctrl.appointments = new kendo.data.SchedulerDataSource({
                data: _.map(ctrl.apps, ctrl.mapAppointmentResponseToViewModel),
            });

            ctrl.setSchedulerDataSource(ctrl.appointments);
        }

        // This method will be redone in the future and moved to a service that will handle processing of pinned appointments on the client.
        ctrl.postAppointmentSavedUpdatePinnedAppointmentDisplay = postAppointmentSavedUpdatePinnedAppointmentDisplay;
        function postAppointmentSavedUpdatePinnedAppointmentDisplay(
            currentAppointment,
            state
        ) {
            pinnedAppointmentsService.removePinnedAppointmentIfItExists(
                currentAppointment.AppointmentId
            );

            if (
                currentAppointment.IsPinned === undefined ||
                currentAppointment.IsPinned === null
            ) {
                currentAppointment.IsPinned = false;
            }
            if (
                pinnedAppointmentsService.canAddToListCriteria(
                    currentAppointment,
                    state
                )
            ) {
                ctrl.serviceCodes = referenceDataService.get(
                    referenceDataService.entityNames.serviceCodes
                );

                // format pinned appointment
                // when doing updates in the future consider passing pinned appointments to view in the format they need to be in.

                currentAppointment.Providers = [];

                // I copied this and the above from a function to make things clearer while we work out how to refactor but this looks very strange.
                _.forEach(currentAppointment.ProviderUsers, function (user, index) {
                    if (index == 0) {
                        let pd = user.ProfessionalDesignation
                            ? ', ' + user.ProfessionalDesignation
                            : '';
                        currentAppointment.Provider = {
                            Name: user.FirstName + ' ' + user.LastName + pd,
                            UserCode: user.UserCode,
                            UserId: user.UserId,
                            ProviderTypeId: user.ProviderTypeId,
                            ProviderTypeViewId: null,
                        };
                    }
                });

                currentAppointment = pinnedAppointmentsService.transformSingleAppointmentForSchedule(
                    currentAppointment,
                    ctrl.serviceCodes,
                    $scope.schedulePageText.anyProvider,
                    $scope.isScheduleInPrivacyMode
                );

                pinnedAppointmentsService.tempAddPinnedAppointment(currentAppointment);
            }

            // the following method actually filters the pinned array
            $scope.getAndSetPinnedAppointments();
        }

        //#endregion SignalR
    }

    // #endregion
}

SchedulerController.prototype = Object.create(BaseSchedulerCtrl.prototype);

//#region Resolve

// I think these items are used by a lot of other pages ...
ScheduleControl.resolveScheduleControl = {
    appointmentStatuses: [
        'StaticData',
        function (staticData) {
            return staticData.AppointmentStatuses();
        },
    ],
    alertIcons: [
        'StaticData',
        function (staticData) {
            return staticData.AlertIcons();
        },
    ],
    locations: [
        'PracticesApiService',
        function (practicesApiService) {
            return practicesApiService
                .getLocationsWithDetails(2135)
                .then(function (res) {
                    return res.data;
                });
            //return locationServices.getDetailedPermittedLocations({ ActionId: 2135 }).$promise;
        },
    ],
    appointmentTypes: [
        'referenceDataService',
        function (referenceDataService) {
            return referenceDataService
                .getData(referenceDataService.entityNames.appointmentTypes)
                .then(function (res) {
                    return res;
                });
        },
    ],
    practiceSettings: [
        'PracticesApiService',
        function (practicesApiService) {
            return practicesApiService
                .getPracticeSetting()
                .then(function (res) {
                    return res.data.Value;
                });
        },
    ],
    holidays: [
        'PracticesApiService',
        function (practicesApiService) {
            return practicesApiService
                .getHolidays()
                .then(function (res) {
                    return res.data.Value;
                });
        },
    ],
    // substitute the userLocationsSetup data for roles based determination of providers by location providersByUserLocationSetup
    providersByLocation: [
        'ProviderShowOnScheduleFactory',
        function (providerShowOnScheduleFactory) {
            return providerShowOnScheduleFactory.getProviderLocations(true);
        },
    ],
    serviceCodes: [
        'referenceDataService',
        function (referenceDataService) {
            return referenceDataService
                .getData(referenceDataService.entityNames.serviceCodes)
                .then(function (res) {
                    return res;
                });
        },
    ],
};

//#endregion

//window functions for schedule controller
$(window).resize(function () {
    setScheduleGridRows();
});

function setScheduleGridRows() {
    var grid = $('.scheduler-grid-container');
    // we need to alter the height so that the window does not have two scroll bars
    var windowHeight = $(window).height() - 190;
    grid.height(windowHeight);
}
