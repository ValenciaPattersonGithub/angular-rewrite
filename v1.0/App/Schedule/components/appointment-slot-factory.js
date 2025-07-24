(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .service('appointmentScheduleSlotService', appointmentScheduleSlotService)
    .factory('appointmentScheduleSlotFactory', appointmentScheduleSlotFactory);

  appointmentScheduleSlotService.$inject = ['$resource', '$http', '$q'];
  appointmentScheduleSlotFactory.$inject = [
    '$http',
    '$q',
    'ResourceService',
    'appointmentScheduleSlotService',
    'AppointmentsOpenTimeService',
    'toastrFactory',
    'localize',
  ];

  function appointmentScheduleSlotService($resource, $http, $q) {
    return {
      AppointmentScheduleSlots: $resource(
        '_soarapi_/AppointmentScheduleSlot',
        {},
        {
          get: {
            method: 'GET',
            params: {
              ProviderId: '@ProviderId',
              RoomId: '@RoomId',
              Start: '@Start',
              End: '@End',
              ProviderOption: '@ProviderOption',
            },
            url: '_soarapi_/AppointmentScheduleSlot',
          },
        }
      ),
    };
  }

  function appointmentScheduleSlotFactory(
    $http,
    $q,
    resourceService,
    appointmentScheduleSlotService,
    toastrFactory,
    localize
  ) {
    var factory = this;

    factory.loadSlots = function (
      ProviderId,
      RoomId,
      Start,
      End,
      ProviderOption,
      AppointmentTypeId
    ) {
      var defer = $q.defer();
      var promise = defer.promise;
      appointmentScheduleSlotService.AppointmentScheduleSlots.get({
        providerId: ProviderId,
        roomId: RoomId,
        utcStartDateTime: Start,
        utcEndDateTime: End,
        providerOption: !ProviderId && !RoomId ? ProviderOption : null,
        appointmentTypeId: AppointmentTypeId,
      }).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve the Provider Data')
          );
        }
      );
      return promise;
    };

    factory.loadData = function (
      ProviderId,
      RoomId,
      Start,
      End,
      ProviderOption,
      AppointmentTypeId
    ) {
      var defer = $q.defer();
      var promise = defer.promise;

      appointmentScheduleSlotService.AppointmentScheduleSlots.get({
        providerId: ProviderId,
        roomId: RoomId,
        utcStartDateTime: Start,
        utcEndDateTime: End,
        providerOption: !ProviderId && !RoomId ? ProviderOption : null,
        appointmentTypeId: AppointmentTypeId,
      }).$promise.then(
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve the Provider Data')
          );
        }
      );
      return promise;
    };

    return {
      LoadData: function (
        ProviderId,
        RoomId,
        Start,
        End,
        ProviderOption,
        AppointmentTypeId
      ) {
        return factory.loadData(
          ProviderId,
          RoomId,
          Start,
          End,
          ProviderOption,
          AppointmentTypeId
        );
      },
    };
  }
})();

angular.module('Soar.Schedule').factory('AppointmentsOpenTimeFactory', [
  'AppointmentsOpenTimeService',
  '$filter',
  'localize',
  '$q',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  function (
    appointmentsOpenTimeService,
    $filter,
    localize,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService
  ) {
    var factory = this;

    //#region authentication

    factory.hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sptapt-view'
      );
    };

    factory.authAccess = function () {
      if (!factory.authViewAccess()) {
        factory.hasAccess.View = true;
      }
      return factory.hasAccess;
    };

    factory.getPreviewParam = function () {
      return {
        EndDateTime: null,
        StartDateTime: null,
        OpenSlots: null,
        SelectedSlot: null,
        SelectedSlotIndex: null,
        Duration: null,
        AppointmentTypeId: null,
        ProviderId: null,
        TreatmentRoomId: null,
        ExaminingDentist: null,
        Location: null,
        SearchGroup: null,
      };
    };

    // set date range
    factory.getSlotParameters = function () {
      var startDate = new Date();

      var endDate = moment().add(2, 'month').toDate();
      // during testing
      //var endDate = moment().add(3, 'day').toDate();

      return {
        startDateTime: startDate,
        endDateTime: endDate,
        duration: 30,
        appointmentTypeId: null,
        preferredTime: 0,
        providerId: null,
        roomId: null,
        preferredDays: null,
        dentistId: 'any',
        providerOption: 1,
        roomOption: 1,
        locationId: null,
      };
    };

    factory.getSlots = function (searchParams) {
      var defer = $q.defer();
      var promise = defer.promise;

      // set the dates to utc format
      var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]';
      var utcStartDateTime = moment(searchParams.startDateTime)
        .startOf('day')
        .format(format);
      var utcEndDateTime = moment(searchParams.endDateTime)
        .endOf('day')
        .format(format);

      // set providerOption if providerId set to 1
      var providerOption = searchParams.providerId
        ? null
        : searchParams.providerOption;

      if (factory.authViewAccess()) {
        appointmentsOpenTimeService
          .get({
            locationId: searchParams.locationId,
            utcStartDateTime: utcStartDateTime,
            utcEndDateTime: utcEndDateTime,
            duration: searchParams.duration,
            providerId: searchParams.providerId,
            providerOption: providerOption,
            roomId: searchParams.roomId,
            appointmentTypeId: searchParams.appointmentTypeId,
            preferredTime: searchParams.preferredTime,
            preferredDays: searchParams.preferredDays,
          })
          .$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the Provider Data'
                )
              );
            }
          );
      }
      return promise;
    };

    factory.timeOfDay = function () {
      return [{ name: 'AM' }, { name: 'PM' }];
    };

    factory.daysOfWeek = function () {
      return [
        { name: 'Monday', abbr: 'M', id: 1, selected: false },
        { name: 'Tuesday', abbr: 'T', id: 2, selected: false },
        { name: 'Wednesday', abbr: 'W', id: 3, selected: false },
        { name: 'Thursday', abbr: 'Th', id: 4, selected: false },
        { name: 'Friday', abbr: 'F', id: 5, selected: false },
        { name: 'Saturday', abbr: 'Sa', id: 6, selected: false },
        { name: 'Sunday', abbr: 'Su', id: 0, selected: false },
      ];
    };

    return {
      access: function () {
        return factory.authAccess();
      },
      SlotParams: function () {
        return factory.getSlotParameters();
      },
      Slots: function (searchParams) {
        return factory.getSlots(searchParams);
      },
      TimeOfDay: function () {
        return factory.timeOfDay();
      },
      DaysOfWeek: function () {
        return factory.daysOfWeek();
      },
      PreviewParam: function () {
        return factory.getPreviewParam();
      },
    };
  },
]);
