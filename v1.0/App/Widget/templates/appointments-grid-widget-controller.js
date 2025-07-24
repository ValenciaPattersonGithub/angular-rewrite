'use strict';

angular
  .module('Soar.Widget')
  .controller('AppointmentsGridWidgetController', [
    '$scope',
    '$timeout',
    'UsersFactory',
    '$q',
    'localize',
    'ScheduleServices',
    'ModalDataFactory',
    'ModalFactory',
    'toastrFactory',
    'StaticData',
    'SaveStates',
    'referenceDataService',
    'RoleNames',
    'WidgetInitStatus',
    'userSettingsDataService',
    'AppointmentViewDataLoadingService',
    'AppointmentViewVisibleService',
    'tabLauncher',
    'FeatureFlagService',
    'FuseFlag',
    AppointmentsGridWidgetController,
  ]);

function AppointmentsGridWidgetController(
  $scope,
  $timeout,
  usersFactory,
  $q,
  localize,
  scheduleServices,
  modalDataFactory,
  modalFactory,
  toastrFactory,
  staticData,
  saveStates,
  referenceDataService,
  roleNames,
  widgetInitStatus,
  userSettingsDataService,
  appointmentViewDataLoadingService,
  appointmentViewVisibleService,
  tabLauncher,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'AppointmentsGridWidgetController');
  var ctrl = this;
  var launchDarklyStatus = false;
  ctrl.appointmentStatuses = staticData.AppointmentStatuses().List;
  $scope.showNewPatientHeader = userSettingsDataService.isNewNavigationEnabled();

  ctrl.allAppointments = null;
  $scope.providerAppointments = null;

  $scope.dateFilter = moment().startOf('day').toDate();
  ctrl.oldDate = moment().startOf('day').toDate();
  $scope.options = { providerFilterOptions: null, locationFilterOptions: null };
  $scope.initials = { providerInitial: null, locationInitial: null };
  $scope.filters = { providerFilter: null, locationFilter: null };
  $scope.opens = { providersOpen: false, locationsOpen: false };

  ctrl.sortsAscending = {
    time: false,
    patient: true,
    apptType: true,
    location: true,
    room: true,
    provider: true,
  };
  ctrl.usersFromServer = null;
  ctrl.locationsFromServer = null;
  ctrl.tempLocations = [];
  ctrl.tempProviders = [];

  $scope.initializeCalled = false;
  $scope.isChrome = window.PattersonWindow.isChrome;

  ctrl.initialize = function () {
    var patAuthContext = sessionStorage.getItem('patAuthContext');
    if (patAuthContext) {
      var loggedInUserId = JSON.parse(patAuthContext).userInfo.userid;
      // PBI 334209: Defaults to the user logged in if they are a provider
      $scope.initials.providerInitial = [{ id: loggedInUserId }];
      $scope.filters.providerFilter = [{ id: loggedInUserId }];
      ctrl.tempProviders = $scope.filters.providerFilter;
      for (const provider of ctrl.tempProviders) {
        provider.Selected = true;
      }
    }

    var userLocation = sessionStorage.getItem('userLocation');
    if (userLocation) {
      var loggedInUserLocationId = JSON.parse(userLocation).id;
      $scope.initials.locationInitial = [{ id: loggedInUserLocationId }];
      $scope.filters.locationFilter = [{ id: loggedInUserLocationId }];
      ctrl.tempLocations = $scope.filters.locationFilter;
      for (const loc of ctrl.tempLocations) {
        loc.Selected = true;
      }
    }
    ctrl.getAppointments();
    var promises = [];

    promises.push(
      usersFactory.Users().then(
        function (res) {
          ctrl.usersFromServer = res.Value;
        },
        function () {
          $scope.$emit(
            'WidgetLoadingError',
            localize.getLocalizedString('Failed to load data.')
          );
        }
      )
    );

    ctrl.locationsFromServer = referenceDataService.get(
      referenceDataService.entityNames.locations
    );

    $q.all(promises).then(function () {
      ctrl.processUsersFromServer();
      ctrl.processLocationsFromServer();
      $scope.initializeCalled = true;
    });
  };
  $scope.navigate = function (url) {
    tabLauncher.launchNewTab(
      url + moment($scope.dateFilter).format('YYYY-M-DD')
    );
  };
  ctrl.processUsersFromServer = function () {
    $scope.options.providerFilterOptions = [];
    _.each(ctrl.usersFromServer, function (user) {
      // PBI 334209: Only display providers that have a Role at the selected location(s); we are already utilizing this logic with Reports
      var isProvider =
        !_.isNull(user.ProviderTypeId) && user.ProviderTypeId != 4;

      var isPracticeAdministrator =
        !_.isNull(user.Roles) &&
        user.Roles.length > 0 &&
        user.Roles.find(function (role) {
          return role.RoleName === roleNames.PracticeAdmin;
        }) != null;

      var hasLocationInLocationFilter =
        !_.isNull(user.Locations) &&
        user.Locations.length > 0 &&
        user.Locations.find(function (location) {
          return (
            $scope.filters.locationFilter.find(function (locationFilter) {
              return locationFilter.id === location.LocationId;
            }) != null
          );
        }) != null;

      if (
        isProvider &&
        (isPracticeAdministrator || hasLocationInLocationFilter)
      ) {
        var isSelected =
          $scope.filters.providerFilter.find(function (providerFilter) {
            return providerFilter.id === user.UserId;
          }) != null;
        $scope.options.providerFilterOptions.push({
          id: user.UserId,
          display: ctrl.formatProviderName(user),
          Selected: isSelected,
          Status: 'Active',
        });
      }
    });

    var isLoggedInUserInProviderFilterOptions =
      $scope.options.providerFilterOptions.find(function (
        providerFilterOption
      ) {
        return (
          providerFilterOption.id === $scope.initials.providerInitial[0].id
        );
      }) != null;
    if (!isLoggedInUserInProviderFilterOptions) {
      // PBI 334209: If the user is not a provider then default to all providers
      $scope.initials.providerInitial = $scope.options.providerFilterOptions;
    }
  };

  ctrl.processLocationsFromServer = function () {
    $scope.options.locationFilterOptions = [];

    _.each(ctrl.locationsFromServer, function (location) {
      $scope.options.locationFilterOptions.push({
        id: location.LocationId,
        display: _.escape(location.NameLine1),
      });
    });

    $scope.options.locationFilterOptions.sort(function (a, b) {
      return a.display.localeCompare(b.display);
    });
  };

  $scope.closeMultiSelects = function () {
    $scope.opens.providersOpen = false;
    $scope.opens.locationsOpen = false;
  };

  $scope.getStatusIcon = function (status) {
    return ctrl.appointmentStatuses.find(function (s) {
      return s.Value === status;
    }).Icon;
  };

  $scope.getStatusDescription = function (status) {
    return ctrl.appointmentStatuses.find(function (s) {
      return s.Value === status;
    }).Description;
  };

  $scope.parseDate = function (date) {
    return moment.utc(date).toISOString();
  };

  $scope.formatPatientName = function (patient) {
    return (
      patient.LastName + ', ' + patient.FirstName + ' - ' + patient.PatientCode
    );
  };

  $scope.showAppointmentModal = function (providerAppointment) {
    providerAppointment.appointment.Appointment.ObjectState = saveStates.None;

    let appointment = {
      AppointmentId: providerAppointment.appointment.Appointment.AppointmentId,
    };

    appointmentViewDataLoadingService
      .getViewData(appointment, false, 'soar:reload-appointments-widget')
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
  };

  $scope.$on('soar:reload-appointments-widget', function (event, appointment) {
    ctrl.getAppointments();
  });

  $scope.findProviderName = function (providerId, providers) {
    var provider = providers.find(function (provider) {
      return provider.UserId === providerId;
    });
    if (!_.isNull(provider)) {
      return ctrl.formatProviderName(provider);
    } else {
      return '';
    }
  };

  $scope.sortTime = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var result = ctrl.compareValues(a.startTime, b.startTime);
      return ctrl.sortsAscending.time ? result : -result;
    });
    ctrl.sortsAscending.time = !ctrl.sortsAscending.time;
  };

  $scope.sortPatient = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var val1 = $scope.formatPatientName(a.appointment.Person);
      var val2 = $scope.formatPatientName(b.appointment.Person);
      var result = ctrl.compareValues(val1, val2);
      return ctrl.sortsAscending.patient ? result : -result;
    });
    ctrl.sortsAscending.patient = !ctrl.sortsAscending.patient;
  };

  $scope.sortApptType = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var val1 = a.appointment.AppointmentType
        ? a.appointment.AppointmentType.Name
        : '';
      var val2 = b.appointment.AppointmentType
        ? b.appointment.AppointmentType.Name
        : '';
      var result = ctrl.compareValues(val1, val2);
      return ctrl.sortsAscending.apptType ? result : -result;
    });
    ctrl.sortsAscending.apptType = !ctrl.sortsAscending.apptType;
  };

  $scope.sortLocation = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var val1 = a.appointment.Location.NameLine1;
      var val2 = b.appointment.Location.NameLine1;
      var result = ctrl.compareValues(val1, val2);
      return ctrl.sortsAscending.location ? result : -result;
    });
    ctrl.sortsAscending.location = !ctrl.sortsAscending.location;
  };

  $scope.sortRoom = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var val1 = a.appointment.Room.Name;
      var val2 = b.appointment.Room.Name;
      var result = ctrl.compareValues(val1, val2);
      return ctrl.sortsAscending.room ? result : -result;
    });
    ctrl.sortsAscending.room = !ctrl.sortsAscending.room;
  };

  $scope.sortProvider = function () {
    $scope.providerAppointments.sort(function (a, b) {
      var val1 = $scope.findProviderName(
        a.providerId,
        a.appointment.ProviderUsers
      );
      var val2 = $scope.findProviderName(
        b.providerId,
        b.appointment.ProviderUsers
      );
      var result = ctrl.compareValues(val1, val2);
      return ctrl.sortsAscending.provider ? result : -result;
    });
    ctrl.sortsAscending.provider = !ctrl.sortsAscending.provider;
  };

  $scope.formatDateForScheduleLink = function (date) {
    return moment(date).format('YYYY-M-DD');
  };

  ctrl.compareValues = function (a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  };

  ctrl.formatProviderName = function (user) {
    var middleName = user.MiddleName || '';
    var suffixName = user.SuffixName || '';
    var designation = user.ProfessionalDesignation || '';
    return (
      user.FirstName +
      (middleName.length > 0 ? ' ' + middleName.charAt(0) : '') +
      ' ' +
      user.LastName +
      (suffixName.length > 0 ? ', ' + suffixName : '') +
      ' - ' +
      user.UserCode +
      (designation.length > 0 ? ', ' + designation : '')
    );
  };

  ctrl.appointmentProviderLocationFilter = function (providerAppointment) {
    return (
      providerAppointment &&
      !_.isNil($scope.filters) &&
      !_.isNil($scope.filters.providerFilter) &&
      !_.isNil($scope.filters.locationFilter) &&
      $scope.filters.providerFilter.find(function (providerFilter) {
        return providerFilter.id === providerAppointment.providerId;
      }) != null &&
      $scope.filters.locationFilter.find(function (locationFilter) {
        return (
          locationFilter.id ===
          providerAppointment.appointment.Location.LocationId
        );
      }) != null
    );
  };

  ctrl.mapAppointments = function (appointments) {
    return appointments.map(function (appointment) {
      return appointment.Appointment.ProviderAppointments.map(function (
        providerAppointment
      ) {
        return {
          providerId: providerAppointment.UserId,
          startTime: providerAppointment.StartTime,
          endTime: providerAppointment.EndTime,
          appointment: appointment,
        };
      });
    });
  };

  ctrl.filterProviderAppointments = function (appointments) {
    var providerAppointments = appointments.filter(
      ctrl.appointmentProviderLocationFilter
    );
    return providerAppointments.filter(function (providerAppointment) {
      return (
        providerAppointments.find(function (pa) {
          return providerAppointment.startTime === pa.endTime;
        }) == null
      );
    });
  };

  ctrl.filterAndFillAppointments = function (appointments) {
    if (appointments) {
      var providerAppointments = appointments.map(
        ctrl.filterProviderAppointments
      );
      providerAppointments = providerAppointments
        .reduce(function (a, e) {
          return a.concat(e);
        }, [])
        .sort(function (f, s) {
          return Date.parse(f.startTime) - Date.parse(s.startTime);
        });
      _.each(providerAppointments, function (providerAppointment) {
        var alerts = {};
        alerts.allergyAlerts = providerAppointment.appointment.MedicalHistoryAlerts.filter(
          function (alert) {
            return alert.MedicalHistoryAlertTypeId == 1;
          }
        );
        alerts.medicalAlerts = providerAppointment.appointment.MedicalHistoryAlerts.filter(
          function (alert) {
            return alert.MedicalHistoryAlertTypeId == 2;
          }
        );
        alerts.premedAlerts = providerAppointment.appointment.MedicalHistoryAlerts.filter(
          function (alert) {
            return alert.MedicalHistoryAlertTypeId == 3;
          }
        );
        providerAppointment.alerts = alerts;
      });
      return providerAppointments;
    }
  };

  ctrl.processAppointments = function (appointments) {
    ctrl.allAppointments = ctrl.mapAppointments(appointments.Appointment);
    $scope.providerAppointments = ctrl.filterAndFillAppointments(
      ctrl.allAppointments
    );
  };

  ctrl.getAppointments = function () {
    $scope.$emit('WidgetLoadingStarted');
    var locIds = [];
    var providerIds = [];
    for (const loc of ctrl.tempLocations) {
      if (loc.Selected) locIds.push(loc.id);
    }
    for (const provider of ctrl.tempProviders) {
      if (provider.Selected) providerIds.push(provider.id);
    }
    featureFlagService.getOnce$(fuseFlag.DashboardAppointmentWidgetMvp).subscribe((value) => {
        launchDarklyStatus = value;
    });
    var params = {
      StartTime: moment($scope.dateFilter).startOf('day').toISOString(),
      EndTime: moment($scope.dateFilter).endOf('day').toISOString(),
      LocationIds: locIds,
      ProviderUserIds: providerIds,
      LaunchDarklyStatus: launchDarklyStatus
    };
    scheduleServices.Lists.Appointments.GetWidgetPost(params).$promise.then(
      function (res) {
        ctrl.processAppointments(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function (res) {
        $scope.$emit(
          'WidgetLoadingError',
          localize.getLocalizedString('Failed to load data')
        );
      }
    );
  };

  $scope.onDateChange = function (newDate) {
    if (!_.isEqual(ctrl.oldDate, newDate)) {
      ctrl.oldDate = newDate;
      ctrl.getAppointments();
    }
  };

  $scope.providerChange = function (list) {
    var found = false;
    if (list && list.length > 0) {
      for (const provider of list) {
        found = false;
        for (const providerInner of ctrl.tempProviders) {
          if (
            providerInner.id == provider.id &&
            provider.Selected == providerInner.Selected
          ) {
            found = true;
            break;
          }
        }
        if (!found) break;
      }
    } else found = true;

    if (!found || ctrl.tempProviders.length != list.length) {
      ctrl.tempProviders = [];
      for (const provider of list) {
        ctrl.tempProviders.push({
          id: provider.id,
          Selected: provider.Selected,
        });
      }
      ctrl.getAppointments();
    }
  };

  $scope.locationChange = function (list) {
    var found = false;
    if (list && list.length > 0) {
      for (const loc of list) {
        found = false;
        for (const locInner of ctrl.tempLocations) {
          if (locInner.id == loc.id && loc.Selected == locInner.Selected) {
            found = true;
            break;
          }
        }
        if (!found) break;
      }
    } else found = true;

    if (!found || ctrl.tempLocations.length != list.length) {
      ctrl.tempLocations = [];
      for (const loc of list) {
        ctrl.tempLocations.push({ id: loc.id, Selected: loc.Selected });
      }
      ctrl.getAppointments();
    }
  };

  // $scope.$watch('data.initMode', function (nv) {
  //     ctrl.processInitMode(nv);
  // });

  //ctrl.processInitMode = function (mode) {
  // if (mode === widgetInitStatus.Loaded) {
  //     ctrl.processAppointments($scope.data.initData);
  // }
  // else if (mode === widgetInitStatus.ToLoad) {
  //  ctrl.getAppointments();
  // }
  //};

  $timeout(function () {
    ctrl.initialize();
  });
}

AppointmentsGridWidgetController.prototype = Object.create(BaseCtrl.prototype);
