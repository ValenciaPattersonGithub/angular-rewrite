(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .factory('AppointmentConflictFactory', AppointmentConflictFactory);

  AppointmentConflictFactory.$inject = [
    'PatientServices',
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'StaticData',
    'TimeZoneFactory',
    'AppointmentConflictsService',
  ];

  function AppointmentConflictFactory(
    patientServices,
    $filter,
    localize,
    listHelper,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService,
    staticData,
    timeZoneFactory,
    appointmentConflictsService
  ) {
    var factory = this;
    var hasAccess = { Create: false, Delete: false, Edit: false, View: false };
    //#region authentication

    factory.createAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sptapt-add'
      );
    };

    factory.deleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sptapt-delete'
      );
    };

    factory.editAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sptapt-edit'
      );
    };

    factory.viewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-sptapt-view'
      );
    };

    factory.authAccess = function () {
      if (!factory.viewAccess()) {
      } else {
        hasAccess.Create = factory.createAccess();
        hasAccess.Delete = factory.deleteAccess();
        hasAccess.Edit = factory.editAccess();
        hasAccess.View = true;
      }
      return hasAccess;
    };

    //#endregion

    //#region factory business logic methods

    factory.formatConflict = function (conflict) {
      if (conflict.FirstName) {
        conflict.$$ProviderName =
          conflict.FirstName.charAt(0) + '. ' + conflict.LastName;
      }

      // get the timezone info for this location
      if (conflict && conflict.LocationTimezone) {
        conflict.tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
          conflict.LocationTimezone,
          conflict.StartTime
        );
      }
      var startTime = angular.copy(conflict.StartTime);
      var endTime = angular.copy(conflict.EndTime);
      if (
        startTime &&
        typeof startTime == 'string' &&
        !startTime.toString().toUpperCase().endsWith('Z')
      ) {
        startTime += 'Z';
      }
      if (
        endTime &&
        typeof endTime == 'string' &&
        !endTime.toString().toUpperCase().endsWith('Z')
      ) {
        endTime += 'Z';
      }
      var to = timeZoneFactory.ConvertDateTZ(
        new Date(endTime),
        conflict.LocationTimezone
      );
      var from = timeZoneFactory.ConvertDateTZ(
        new Date(startTime),
        conflict.LocationTimezone
      );

      conflict.$$From = $filter('date')(from, 'hh:mm a');
      conflict.$$To = $filter('date')(to, 'hh:mm a');
    };

    factory.getAppointmentDto = function () {
      return {
        AppointmentId: null,
        LocationId: null,
        TreatmentRoomId: null,
        ExaminingDentist: null,
        StartTime: null,
        EndTime: null,
        Classification: null,
        ProviderAppointments: [],
      };
    };

    // builds the dto parameter for getting appointment conflicts
    factory.getConflictParams = function (appointment, provSchedules) {
      // prep the appointment params for conflicts
      var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]';

      //#region  build params for conflict api
      var appointmentDto = factory.getAppointmentDto();

      appointmentDto.AppointmentId = appointment.AppointmentId;
      appointmentDto.LocationId = appointment.LocationId;
      appointmentDto.TreatmentRoomId = appointment.TreatmentRoomId;
      appointmentDto.ExaminingDentist = appointment.ExaminingDentist;
      appointmentDto.Classification = appointment.Classification;

      if (
        appointment.ExaminingDentist === 'any' ||
        appointment.ExaminingDentist === 'noexam'
      ) {
        appointmentDto.ExaminingDentist = null;
      } else {
        appointmentDto.ExaminingDentist = appointment.ExaminingDentist;
      }

      // prep the start and end times for timezone since these may have been converted
      var startTime = timeZoneFactory.ConvertDateToSaveString(
        appointment.StartTime,
        appointment.Location.Timezone
      );
      var endTime = timeZoneFactory.ConvertDateToSaveString(
        appointment.EndTime,
        appointment.Location.Timezone
      );

      appointmentDto.StartTime = startTime;
      appointmentDto.EndTime = endTime;

      // create copy of providerSchedule with utc dates
      var providerSchedules = [];
      _.forEach(provSchedules, function (providerSchedule) {
        // prep the start and end times for timezone since these may have been converted
        var phStartTime = timeZoneFactory.ConvertDateToSaveString(
          providerSchedule.Start,
          appointment.Location.Timezone
        );
        var phEndTime = timeZoneFactory.ConvertDateToSaveString(
          providerSchedule.End,
          appointment.Location.Timezone
        );

        providerSchedules.push({
          UserId: providerSchedule.ProviderId,
          StartTime: phStartTime,
          EndTime: phEndTime,
          Name: providerSchedule.Name,
        });
      });
      appointmentDto.ProviderAppointments = providerSchedules;
      return appointmentDto;
    };

    // builds the dto parameter for getting appointment conflicts
    factory.getConflicts = function (appointmentDto) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.viewAccess()) {
        // get conflicts for this appointment and process if any
        appointmentConflictsService
          .getAllConflicts(appointmentDto)
          .$promise.then(function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            factory.processConflicts(res.Value);

            defer.resolve(res);
          });
      }
      return promise;
    };

    // process / format room conflicts array
    factory.processConflicts = function (conflicts) {
      if (conflicts) {
        if (conflicts.ProviderConflicts) {
          _.forEach(conflicts.ProviderConflicts, function (conflict) {
            factory.formatConflict(conflict);
          });
        }

        if (conflicts.Block) {
          factory.formatConflict(conflicts.Block);
        }

        if (conflicts.ExaminingDentistBlock) {
          factory.formatConflict(conflicts.ExaminingDentistBlock);
        }

        if (conflicts.RoomConflicts) {
          _.forEach(conflicts.RoomConflicts, function (conflict) {
            factory.formatConflict(conflict);
          });
        }

        if (conflicts.OutsideWorkingHours) {
          _.forEach(conflicts.OutsideWorkingHours, function (wh) {
            if (wh.FirstName) {
              wh.$$ProviderName = wh.FirstName.charAt(0) + '. ' + wh.LastName;
            } else {
              wh.$$ProviderName = wh.LastName;
            }
          });
        }
      }
    };

    //#endregion

    return {
      // access to rx
      access: function () {
        return factory.authAccess();
      },
      formatConflict: function (conflict) {
        return factory.formatConflict(conflict);
      },
      Conflicts: function (appointmentDto) {
        return factory.getConflicts(appointmentDto);
      },
      ConflictParams: function (appointment, providerSchedules) {
        return factory.getConflictParams(appointment, providerSchedules);
      },
      ProcessConflicts: function (conflicts) {
        return factory.processConflicts(conflicts);
      },
    };
  }
})();
