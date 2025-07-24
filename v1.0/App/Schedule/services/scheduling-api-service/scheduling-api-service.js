// This is a stop gap for me not wanting to spend time right now migrating HTTP calls to Angular 8
// The likely life of this service will be short.
(function () {
  'use strict';

  angular
    .module('Soar.Schedule')
    .factory('SchedulingApiService', schedulingApiService);
  schedulingApiService.$inject = [
    '$http',
    '$q',
    'IdmConfig',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'TimeZoneFactory',
    'NewLocationsService',
    'ScheduleAppointmentHttpService',
    'ProviderHourOccurrencesHttpService',
  ];

  function schedulingApiService(
    $http,
    $q,
    idmConfig,
    toastrFactory,
    localize,
    patSecurityService,
    timeZoneFactory,
    locationsService,
    scheduleAppointmentHttpService,
    providerHourOccurrencesHttpService
  ) {
    // this is just a temporary thing for converted APIs and the old methods that we used to utilize before converting.
    var service = {
      getPinnedAppointmentsByPractice: getPinnedAppointmentsByPractice,
      getUnscheduledAppointmentsByPatient: getUnscheduledAppointmentsByPatient,
      getOpenTimes: getOpenTimes,
      getDayViewAppointments: getDayViewAppointments,
      getDayViewAppointmentById: getDayViewAppointmentById,
      getWeekViewAppointments: getWeekViewAppointments,
      getProviderHourOccurrences: getProviderHourOccurrences,
      getAppointmentModalAndPatientData: getAppointmentModalAndPatientData,
      getPatientDataForAppointmentModal: getPatientDataForAppointmentModal,
      getAppointmentProviders: getAppointmentProviders,
    };

    return service;

    function getPinnedAppointmentsByPractice() {
      var defer = $q.defer();
      var promise = defer.promise;
      var err = '';

      scheduleAppointmentHttpService
        .getPinnedAppointmentsByPracticeId()
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function (error) {
            err = JSON.stringify(error);
            defer.reject(error);
          }
        )
        .finally(() => {
          // Intentionally throwing JavaScript error of server error to capture with DynaTrace and track down what the root cause is.
          if (err !== '') {
            throw {
              name:
                'SERVER_ERROR:getPinnedAppointmentsByPractice:scheduling-api-service',
              message: err,
            };
          }
        });

      return promise;
    }

    function getUnscheduledAppointmentsByPatient(patientId) {
      var defer = $q.defer();
      var promise = defer.promise;

      scheduleAppointmentHttpService
        .getUnscheduledAppointmentsByPatientId(patientId)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of Pinned Appointments. Refresh the page to try again'
              ),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );

      return promise;
    }

    function getOpenTimes(searchParams) {
      var defer = $q.defer();
      var promise = defer.promise;

      // set the dates to utc format
      var format = 'YYYY-MM-DD[T]HH:mm:ss';

      var ofcLocation = locationsService.findByLocationId(
        searchParams.locationId
      );
      var locationFullTimeZone = timeZoneFactory.GetFullTZ(ofcLocation.Timezone)
        .MomentTZ;

      var s = searchParams.startDateTime;
      var utcStartDateTime = moment()
        .tz(locationFullTimeZone)
        .year(s.getFullYear())
        .month(s.getMonth())
        .date(s.getDate())
        .hour(0)
        .minute(0)
        .second(0)
        .utc()
        .format(format);
      var e = searchParams.endDateTime;
      var utcEndDateTime = moment()
        .tz(locationFullTimeZone)
        .year(e.getFullYear())
        .month(e.getMonth())
        .date(e.getDate())
        .hour(23)
        .minute(59)
        .second(59)
        .utc()
        .format(format);

      // if providerId is defined, set option to null, otherwise subtract 1 because legacy UI code says
      // anyDentist = 2, anyHygienist = 3 but the database says dentistType = 1. hygienistType = 2
      var providerOption = searchParams.providerId
        ? null
        : searchParams.providerOption - 1;

      // making daves bit wise fun code
      var days = [];
      if (searchParams.preferredDays != null) {
        searchParams.preferredDays.forEach(function (item) {
          if (item === 'Sunday') {
            days.push(0);
          } else if (item === 'Monday') {
            days.push(1);
          } else if (item === 'Tuesday') {
            days.push(2);
          } else if (item === 'Wednesday') {
            days.push(3);
          } else if (item === 'Thursday') {
            days.push(4);
          } else if (item === 'Friday') {
            days.push(5);
          } else if (item === 'Saturday') {
            days.push(6);
          }
        });
      }

      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-sch-sptapt-view')
      ) {
        console.log(searchParams);
        // required parameters
        let queryParams = {
          startDate: utcStartDateTime,
          endDate: utcEndDateTime,
          duration: searchParams.duration,
          timezone: ofcLocation.Timezone,
        };

        // optional parameters
        if (searchParams.providerId) {
          queryParams["providerId"] = searchParams.providerId;
        }
        if (providerOption) {
          queryParams["providerType"] = providerOption;
        }
        if (searchParams.roomId) {
          queryParams["roomId"] = searchParams.roomId;
        }
        if (searchParams.appointmentTypeId) {
          queryParams["appointmentTypeId"] = searchParams.appointmentTypeId;
        }
        if (searchParams.preferredTime.toString() != "0") {
          queryParams["timeOfDay"] = searchParams.preferredTime;
        }
        if (days) {
          queryParams["daysOfWeek"] = days;
        }
        console.log(queryParams);

        $http({
          url: idmConfig.schedulingApimUrl + '/api/v2/opentime/search',
          method: 'GET',
          params: queryParams,
        }).then(
          function (res) {
            promise = $.extend(promise, {
              values: res.data,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve Provider Open Times'
              )
            );
            defer.reject();
          }
        );
      }
      return promise;
    }

    //This gets multiple appointments by start and end date for the locationIds
    //This is called to get appointment data for the appointment cards display
    function getDayViewAppointments(from, to, locationIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      var err = '';

      scheduleAppointmentHttpService
        .getDayViewAppointments(from, to, locationIds)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function (error) {
            err = JSON.stringify(error);
            defer.reject(error);
          }
        )
        .finally(() => {
          // Intentionally throwing JavaScript error of server error to capture with DynaTrace and track down what the root cause is.
          if (err !== '') {
            throw {
              name:
                'SERVER_ERROR:getDayViewAppointments:scheduling-api-service',
              message: err,
            };
          }
        });
      return promise;
    }

    //This gets a single appointment by appointmentId for the locationId
    //This is called to get individual appointment data for the appointment card display
    function getDayViewAppointmentById(appointmentId, locationIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      var err = '';

      scheduleAppointmentHttpService
        .getDayViewAppointmentById(appointmentId, locationIds)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function (error) {
            err = JSON.stringify(error);
            defer.reject(error);
          }
        )
        .finally(() => {
          // Intentionally throwing JavaScript error of server error to capture with DynaTrace and track down what the root cause is.
          if (err !== '') {
            throw {
              name:
                'SERVER_ERROR:getDayViewAppointmentById:scheduling-api-service',
              message: err,
            };
          }
        });
      return promise;
    }

    function getWeekViewAppointments(from, to, locationIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      var err = '';

      scheduleAppointmentHttpService
        .getWeekViewAppointments(from, to, locationIds)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function (error) {
            err = JSON.stringify(error);
            defer.reject(error);
          }
        )
        .finally(() => {
          // Intentionally throwing JavaScript error of server error to capture with DynaTrace and track down what the root cause is.
          if (err !== '') {
            throw {
              name:
                'SERVER_ERROR:getWeekViewAppointments:scheduling-api-service',
              message: err,
            };
          }
        });
      return promise;
    }

    function getProviderHourOccurrences(dates, locationIds) {
      var defer = $q.defer();
      var promise = defer.promise;
      var err = '';

      providerHourOccurrencesHttpService
        .getProviderHourOccurrences(dates, locationIds)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function (error) {
            err = JSON.stringify(error);
            defer.reject(error);
          }
        )
        .finally(() => {
          // Intentionally throwing JavaScript error of server error to capture with DynaTrace and track down what the root cause is.
          if (err !== '') {
            throw {
              name:
                'SERVER_ERROR:getProviderHourOccurrences:scheduling-api-service',
              message: err,
            };
          }
        });

      return promise;
    }

    function getAppointmentModalAndPatientData(appointmentId) {
      var defer = $q.defer();
      var promise = defer.promise;

      scheduleAppointmentHttpService
        .getAppointmentModalAndPatientByAppointmentId(appointmentId)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function () {
            defer.reject();
          }
        );

      return promise;
    }

    function getPatientDataForAppointmentModal(patientId) {
      var defer = $q.defer();
      var promise = defer.promise;

      scheduleAppointmentHttpService
        .getPatientDataForAppointmentModal(patientId)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function () {
            defer.reject();
          }
        );

      return promise;
    }

    function getAppointmentProviders(appointmentId) {
      var defer = $q.defer();
      var promise = defer.promise;

      scheduleAppointmentHttpService
        .getAppointmentProviders(appointmentId)
        .then(
          function (res) {
            promise = $.extend(promise, {
              values: res,
            });
            defer.resolve(res);
          },
          function () {
            defer.reject();
          }
        );

      return promise;
    }
  }
})();
