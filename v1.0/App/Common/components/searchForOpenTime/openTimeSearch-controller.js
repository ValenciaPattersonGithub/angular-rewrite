'use strict';

angular.module('common.controllers').controller('OpenTimeSearchController', [
  '$scope',
  'ListHelper',
  'toastrFactory',
  'AppointmentsOpenTimeFactory',
  'localize',
  '$filter',
  'IdmConfig',
  'SchedulingApiService',
  'ScheduleServices',
  'NewAppointmentTypesService',
  'NewRoomsService',
  'ScheduleProvidersService',
  '$location',
  'userSettingsDataService',
  'AppointmentModalLinksService',
  function (
    $scope,
    listHelper,
    toastrFactory,
    appointmentsOpenTimeFactory,
    localize,
    $filter,
    idmConfig,
    schedulingApiService,
    scheduleServices,
    appointmentTypesService,
    roomsService,
    scheduleProvidersService,
    $location,
    userSettingsDataService,
    appointmentModalLinksService
  ) {
    var ctrl = this;

    // used to force dateSelector to reset when open time search is open
    $scope.initDateSelector = true;
    $scope.itemsPerPage = 100;

    //#region initialize base objects / vars

    $scope.validStartDate = true;
    $scope.validEndDate = true;
    $scope.openSlots = [];
    $scope.fromClipboard = false;
    $scope.schedulerGroups = {
      provider: 'provider',
      room: 'room',
    };
    ctrl.loadDurations = loadDurations;
    function loadDurations() {
      $scope.durations = [];
      _.forEach($scope.minutesString, function (minutes) {
        $scope.durations.push(minutes);
      });
    }

    // have to make sure the update for angular 7 moving appointment types does not cause problems in other areas before we migrate more code.
    $scope.appointmentTypes = appointmentTypesService.appointmentTypes;

    //#endregion

    //#region constants
    $scope.anyProvider = 1;
    $scope.anyDentist = 2;
    $scope.anyHygienist = 3;
    $scope.singleProvider = 4;
    $scope.anyRoom = 1;
    $scope.singleRoom = 2;
    $scope.viewByRoom = 2;
    $scope.viewByProvider = 1;
    //#endregion

    $scope.providerPlaceholder = localize.getLocalizedString('Select Provider');

    //#region init
    ctrl.init = init;
    function init() {
      $scope.userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      $scope.timeOfDay = appointmentsOpenTimeFactory.TimeOfDay();
      $scope.daysOfWeek = appointmentsOpenTimeFactory.DaysOfWeek();
      $scope.searchParams = appointmentsOpenTimeFactory.SlotParams();
      // set minimum date for datepicker
      $scope.minDate = new Date().setHours(0, 0, 0, 0);
      // loading message
      $scope.loadingMessage = localize.getLocalizedString(
        'There are no {0} that match the filter.',
        ['openings']
      );
      // load durations
      ctrl.loadDurations();
      // set filteredLocation
      ctrl.setFilterLocation();
    }

    //#endregion

    //#region helper functions

    ctrl.resetSearchParams = resetSearchParams;
    function resetSearchParams() {
      $scope.searchParams = appointmentsOpenTimeFactory.SlotParams();
      $scope.openSlots = [];
      $scope.fromClipboard = false;
      // set filteredLocation
      ctrl.setFilterLocation();
    }

    $scope.toggleDayOfWeekSelect = function (day) {
      day.selected = !day.selected;
    };

    // reset the preferred days search parameter
    ctrl.setPreferredDaysParameter = setPreferredDaysParameter;
    function setPreferredDaysParameter(searchParams) {
      var preferredDays = [];
      searchParams.preferredDays = [];
      // capture the selected days
      for (var i = 0; i < $scope.daysOfWeek.length; i++) {
        if ($scope.daysOfWeek[i].selected === true) {
          preferredDays.push($scope.daysOfWeek[i].name);
        }
      }
      // if all days are selected or no days are selected pass null param which will
      // tell the api method to ignore the preferred days param
      if (preferredDays.length === 0 || preferredDays.length === 7) {
        searchParams.preferredDays = null;
      } else {
        searchParams.preferredDays = preferredDays;
      }
    }

    //#endregion

    //#region hide show filter

    $scope.$watch('clearSlots', function (nv, ov) {
      $scope.initDateSelector = true;
    });

    // click handler for opening the filter panel
    $scope.showFilters = function () {
      $scope.initDateSelector = true;
    };

    // click handler for closing the filter panel
    $scope.hideFilters = function () {
      $scope.initDateSelector = false;
      ctrl.resetSearchParams();

      angular.element('.open-time-search').removeClass('open');
    };

    //#endregion

    //#region filter for appointment type

    // TODO clean up this function
    $scope.appointmentTypeChanged = appointmentTypeChanged;
    function appointmentTypeChanged(apptTypeId) {
      var appTypeMatch = false;
      _.forEach(appointmentTypesService.appointmentTypes, function (type) {
        if (type.AppointmentTypeId == apptTypeId) {
          $scope.searchParams.preferredDuration = type.DefaultDuration;
          $scope.searchParams.duration = type.DefaultDuration;
        }
        if (!appTypeMatch) {
          if (
            type.AppointmentTypeId == apptTypeId &&
            type.PerformedByProviderTypeId == 2
          ) {
            $scope.searchParams.dentistId = 'noexam';
            appTypeMatch = true;
          }
        }
      });
    }

    //#endregion

    //#region jumpMonth

    $scope.jumpMonth = function (increment) {
      var startDate = new Date($scope.searchParams.startDateTime);
      startDate.setHours(0, 0, 0, 0);
      startDate.setMonth(startDate.getMonth() + increment);
      if (startDate.getDate() < $scope.searchParams.startDateTime.getDate()) {
        startDate.setDate(0);
      }
      var endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 2);
      if (endDate.getDate() < startDate.getDate()) {
        endDate.setDate(0);
      }

      $scope.searchParams.startDateTime = startDate;
      $scope.searchParams.endDateTime = endDate;
    };

    //#endregion

    //#region filtered lists for provider, location, treatment room

    // Open time search can only use the user location, as a security
    // impediment was closed to only look at the location header when
    // doing open time search and there's not a clean way to manipulate
    // that header on the request.

    ctrl.setFilterLocation = setFilterLocation;
    function setFilterLocation() {
      var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      $scope.filteredLocation = {
        LocationId: userLocation.id,
        NameAbbreviation: userLocation.name,
      };
      $scope.searchParams.locationId = $scope.filteredLocation.LocationId;
    }

    // when filteredLocation changes we need to filter treatment rooms
    ctrl.refreshTreatmentRooms = refreshTreatmentRooms;
    function refreshTreatmentRooms() {
      $scope.treatmentRoomsByLocation = [];
      _.forEach($scope.treatmentRooms, function (treatmentRoom) {
        if (treatmentRoom.LocationId === $scope.filteredLocation.LocationId) {
          $scope.treatmentRoomsByLocation.push(treatmentRoom);
        }
      });
    }

    //#endregion

    //#region watches
    // TODO these are firing too often

    $scope.$watch(
      'searchParams',
      function (nv) {
        if (nv) {
          $scope.validSearchParameters();
        }
      },
      true
    );

    $scope.$watch(
      'treatmentRooms',
      function (nv, ov) {
        if (nv) {
          ctrl.refreshTreatmentRooms();
        }
      },
      true
    );

    $scope.$watch(
      'selectedLocations',
      function (nv, ov) {
        if (nv) {
          ctrl.refreshTreatmentRooms();
        }
      },
      true
    );

    $scope.$watch('currentScheduleView', function (view) {
      switch (view) {
        case $scope.schedulerGroups.room:
          $scope.scheduleViewLabel = localize.getLocalizedString('by {0}', [
            'Room',
          ]);
          $scope.searchGroup = $scope.viewByRoom;
          break;
        case $scope.schedulerGroups.provider:
        default:
          $scope.scheduleViewLabel = localize.getLocalizedString('by {0}', [
            'Provider',
          ]);
          $scope.searchGroup = $scope.viewByProvider;
          break;
      }
      ctrl.resetSearchParams();
    });

    //#endregion

    // #region clipboard data for setting search params

    // fix clipboard data to use new parameters and remove examining dentist
    $scope.$watch('clipboardData', function (nv, ov) {
      if (nv != null) {
        $scope.fromClipboard = true;
        var clipboardData = nv.Data;
        $scope.searchParams = appointmentsOpenTimeFactory.SlotParams();
        // load params from clipboard data
        $scope.searchParams.duration = clipboardData.ProposedDuration;
        $scope.searchParams.appointmentTypeId = clipboardData.AppointmentTypeId;
        $scope.searchParams.providerId = clipboardData.UserId;
        $scope.searchParams.roomId = clipboardData.TreatmentRoomId;
        $scope.searchParams.providerOption =
          clipboardData.UserId != null
            ? $scope.singleProvider
            : $scope.anyProvider;
        $scope.searchParams.roomOption =
          clipboardData.TreatmentRoomId != null
            ? $scope.singleRoom
            : $scope.anyRoom;

        $scope.AppointmentId = clipboardData.AppointmentId;
        $scope.PatientId = clipboardData.PersonId;
        $scope.searchParams.locationId = $scope.filteredLocation.LocationId;

        if (
          clipboardData.AppointmentType &&
          clipboardData.AppointmentType.PerformedByProviderTypeId == 2
        ) {
          $scope.searchParams.dentistId = 'noexam';
        }
      } else {
        ctrl.resetSearchParams();
      }
    });

    ctrl.addSearchGroup = function (slots) {
      _.forEach(slots, function (slot) {
        slot.$$searchGroup = $scope.searchGroup;
      });
    };

    //#endregion
    $scope.search = search;
    function search() {
      // NOTE: LocationId is not respected in the search. pat-location-id header is used on backend 
      var valid = $scope.validSearchParameters();
      if (valid) {
        $scope.openSlots = [];
        $scope.loading = true;
        // set days of the week parameter
        ctrl.setPreferredDaysParameter($scope.searchParams);

        // see if anything else is using the appointmentsOpenTimeFactory and if we need to convert more of that.
        // looking at it we would need to convert something with the preview function to remove it.
        // Need to figure out how to get that work in some sprint.
        //if (idmConfig.useSchedulingAPI === 'true') {
        schedulingApiService
          .getOpenTimes($scope.searchParams)
          .then(function (res) {
            $scope.loading = false;

            var data = [];
            res.data.forEach(function (item) {
              // setup provider
              item.ProviderName = $scope.providersByLocation.filter(x => x.UserId === item.ProviderId)[0].FullName

              // setup room
              var room = roomsService.findByRoomId(item.RoomId);
              item.RoomName = room.Name;

              data.push(item);
            });

            ctrl.addSearchGroup(data);
            $scope.openSlots = $filter('orderBy')(
              data,
              'LocationStartTime',
              false
            );
          });
        //}
        //else {
        //    appointmentsOpenTimeFactory.Slots($scope.searchParams).then(function (res) {
        //        $scope.loading = false;
        //        ctrl.addSearchGroup(res.Value);
        //        $scope.openSlots = $filter('orderBy')(res.Value, 'LocationStartTime', false);
        //    });
        //}
      }
    }

    //#region Validation

    $scope.validSearchParameters = function () {
      var valid = false;
      if (
        $scope.searchParams &&
        $scope.searchParams.duration != null &&
        $scope.searchParams.startDateTime &&
        $scope.searchParams.endDateTime &&
        $scope.searchParams.startDateTime <= $scope.searchParams.endDateTime &&
        ($scope.searchParams.providerOption == $scope.anyProvider ||
          $scope.searchParams.providerOption == $scope.anyDentist ||
          $scope.searchParams.providerOption == $scope.anyHygienist ||
          ($scope.searchParams.providerOption == $scope.singleProvider &&
            $scope.searchParams.providerId)) &&
        ($scope.searchParams.roomOption == $scope.anyRoom ||
          ($scope.searchParams.roomOption == $scope.singleRoom &&
            $scope.searchParams.roomId))
      ) {
        valid = true;
      }
      return valid;
    };

    //#endregion

    ctrl.init();

    //#region schedule appointment

    $scope.scheduleAppointment = scheduleAppointment;
    function scheduleAppointment(slot) {
      if ($scope.fromClipboard) {
        ctrl.scheduleAppointmentFromClipboard(slot);
      } else {
        ctrl.scheduleAppointmentFromSlot(slot);
      }
      $scope.openSlots = [];
    }

    ctrl.scheduleAppointmentFromSlot = scheduleAppointmentFromSlot;
    function scheduleAppointmentFromSlot(slot) {
      var startDateTime = new Date(slot.LocationStartTime);
      var endDateTime = new Date(slot.LocationEndTime);
      var mockAppointment = {
        StartTime: startDateTime,
        EndTime: endDateTime,
        TreatmentRoomId: slot.RoomId,
        UserId: slot.ProviderId,
        AppointmentTypeId: $scope.searchParams.appointmentTypeId,
        LocationId: slot.LocationId,
        ProviderAppointments: [
          {
            UserId: slot.ProviderId,
            StartTime: startDateTime,
            EndTime: endDateTime,
            ObjectState: 'Add',
          },
        ],
      };

      if ($scope.searchParams.appointmentTypeId == null) {
        mockAppointment.ExaminingDentist = null;
      }

      $scope.$parent.toggleUnscheduledAppointmentView(mockAppointment);
    }

    ctrl.scheduleAppointmentFromClipboard = scheduleAppointmentFromClipboard;
    function scheduleAppointmentFromClipboard(slot) {
      var startDateTime = new Date(slot.LocationStartTime);
      var endDateTime = new Date(slot.LocationEndTime);

      $scope.clipboardData.Data.TreatmentRoomId = $scope.searchParams.roomId;
      $scope.clipboardData.Data.ExaminingDentist =
        $scope.searchParams.dentistId;
      $scope.clipboardData.Data.UserId = $scope.searchParams.providerId;
      $scope.clipboardData.Data.AppointmentTypeId =
        $scope.searchParams.appointmentTypeId;
      $scope.clipboardData.Data.ProposedDuration = $scope.searchParams.duration;
      $scope.clipboardData.Data.EndTime = endDateTime;
      $scope.clipboardData.Data.StartTime = startDateTime;
      $scope.clipboardData.Data.Location = $scope.filteredLocation;

      if ($scope.onSchedule) {
        $scope.onSchedule();
      }
    }

    //#endregion

    //#region preview appointment
    $scope.previewAppointment = previewAppointment;
    function previewAppointment(selectedSlot, index) {
      var startDateTime = new Date(selectedSlot.LocationStartTime);
      var endDateTime = new Date(selectedSlot.LocationEndTime);

      $scope.previewParam.EndDateTime = endDateTime;
      $scope.previewParam.StartDateTime = startDateTime;
      $scope.previewParam.OpenSlots = $scope.openSlots;
      $scope.previewParam.SelectedSlot = selectedSlot;
      $scope.previewParam.SelectedSlotIndex = index;
      $scope.previewParam.Duration = $scope.searchParams.duration;
      $scope.previewParam.AppointmentTypeId =
        $scope.searchParams.appointmentTypeId;
      $scope.previewParam.TreatmentRoomId = $scope.searchParams.roomId;
      $scope.previewParam.ProviderId = $scope.searchParams.providerId;
      $scope.previewParam.ExaminingDentist = $scope.searchParams.dentistId;
      $scope.previewParam.Location = $scope.filteredLocation;
      $scope.previewParam.SearchGroup = $scope.searchGroup;

      if ($scope.onPreview) {
        $scope.onPreview();
      }
    }

    //#endregion

    //#region templates

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

    //#endregion
  },
]);
