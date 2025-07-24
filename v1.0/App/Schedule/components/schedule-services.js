'use strict';

angular
  .module('Soar.Schedule')
  .service('AppointmentsOpenTimeService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/opentime',
        {},
        {
          get: {
            method: 'GET',
            params: {
              locationId: '@locationId',
              utcStartDateTime: '@startDateTime',
              utcEndDateTime: '@endDateTime',
              duration: '@duration',
              providerId: '@providerId',
              providerOption: '@providerOption',
              roomId: '@appointmentTypeId',
              preferredTime: '@preferredTime',
              preferredDays: '@preferredDays',
            },
          },
        }
      );
    },
  ])
  .service('AppointmentConflictsService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_sapischeduleapi_/appointments/conflicts',
        {},
        {
          getAllConflicts: { method: 'POST' },
        }
      );
    },
  ])
  .service('AppointmentTypesService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var patCache = cacheFactory.GetCache(
        'AppointmentTypesService',
        'aggressive',
        60000,
        60000
      );
      return $resource(
        '_soarapi_/appointmenttypes',
        {},
        {
          get: { method: 'GET', cache: patCache },
          update: { method: 'PUT', cache: patCache },
          create: { method: 'POST', cache: patCache },
          getAllAppointmentTypes: { method: 'GET', cache: patCache },
          getAppointmentTypeById: {
            method: 'GET',
            cache: patCache,
            params: { Id: '@Id' },
            url: '_soarapi_/appointmentTypes/:Id',
          },
          deleteAppointmentTypeById: {
            method: 'DELETE',
            params: { Id: '@Id' },
            cache: patCache,
            url: '_soarapi_/appointmentTypes/:Id',
          },
        }
      );
    },
  ])
  .service('ScheduleServices', [
    '$resource',
    '$q',
    'SaveStates',
    'PatCacheFactory',
    '$filter',
    function ($resource, $q, saveStates, cacheFactory, $filter) {
      // cache for non patient specific
      var locationHoursCache = cacheFactory.GetCache(
        'ScheduleLocationHours',
        'aggressive',
        60000,
        60000
      );
      var providerHoursCache = cacheFactory.GetCache(
        'ScheduleProviderHours',
        'aggressive',
        60000,
        60000
      );
      var holidaysCache = cacheFactory.GetCache(
        'Holidays',
        'aggressive',
        60000,
        60000
      );
      var standardService = function (
        name,
        idParams,
        url,
        canUpdate,
        canDelete,
        validationFunction
      ) {
        var methodParams = {};

        if (angular.isArray(idParams)) {
          for (var i = 0; i < idParams.length; i++) {
            methodParams[idParams[i]] = '@' + idParams[i];
          }
        } else {
          methodParams[idParams] = '@' + idParams;
        }

        var operations = {
          Retrieve: { method: 'GET', params: methodParams },
          RetrieveWithDetails: {
            method: 'GET',
            params: methodParams,
            url: '_sapischeduleapi_/appointments/:AppointmentId/detail',
          },
        };

        if (canUpdate) {
          operations.Create = { method: 'POST' };
          operations.Update = { method: 'PUT' };
        } else {
          operations.Save = { method: 'POST' };
        }

        if (canDelete) {
          operations.Delete = { method: 'DELETE', params: methodParams };
        }

        return {
          ObjectName: name,
          IdField: angular.isArray(idParams) ? idParams[0] : idParams,
          IsValid: validationFunction,
          Operations: $resource(url, {}, operations),
        };
      };
      //TO DO move these items
      var scheduleProviders = null;
      var scheduleLocations = null;
      var providerRoomOccurrences = null;
      var scheduleStartDate = null;
      var scheduleEndDate = null;
      var scheduleDate = null;
      return {
        SoftDelete: $resource(
          '',
          {},
          {
            Appointment: {
              method: 'PUT',
              params: { AppointmentId: '@AppointmentId' },
              url: '_soarapi_/appointments/:AppointmentId/MarkAsDeleted',
            },
          }
        ),
        Dtos: {
          Appointment: standardService(
            'Appointment',
            'AppointmentId',
            '_soarapi_/appointments/:AppointmentId',
            true,
            true,
            function (appointment) {
              var c1, c2, c3, c4, c5, c6, c7;

              var validateProviderTimes = function () {
                if (
                  appointment.ProviderAppointments &&
                  appointment.ProviderAppointments.length > 0
                ) {
                  for (
                    var i = 0;
                    i < appointment.ProviderAppointments.length;
                    i++
                  ) {
                    if (
                      appointment.ProviderAppointments[i].UserId != '' &&
                      appointment.ProviderAppointments[i].UserId != null &&
                      appointment.ProviderAppointments[i].StartTime != null &&
                      appointment.ProviderAppointments[i].EndTime != null
                    ) {
                      // Do nothing
                    } else {
                      return false;
                    }
                  }
                  return true;
                } else {
                  return false;
                }
              };

              var validatePlannedServices = function () {
                if (
                  appointment.PlannedServices &&
                  appointment.PlannedServices.length > 0
                ) {
                  for (var i = 0; i < appointment.PlannedServices.length; i++) {
                    if (
                      appointment.PlannedServices[i].AffectedAreaId == 5 &&
                      (appointment.PlannedServices[i].Tooth == null ||
                        appointment.PlannedServices[i].Tooth == '')
                    ) {
                      // Do nothing
                      return false;
                    } else if (
                      appointment.PlannedServices[i].AffectedAreaId == 4 &&
                      (appointment.PlannedServices[i].Surface == null ||
                        appointment.PlannedServices[i].Surface == '')
                    ) {
                      // Do nothing
                      return false;
                    } else if (
                      appointment.PlannedServices[i].AffectedAreaId == 3 &&
                      (appointment.PlannedServices[i].Roots == null ||
                        appointment.PlannedServices[i].Roots == '')
                    ) {
                      //Do nothing
                      return false;
                    } else if (
                      appointment.PlannedServices[i].Fee < 0 ||
                      appointment.PlannedServices[i].Fee > 999999.99
                    ) {
                      // Do nothing
                      return false;
                    }
                  }

                  return true;
                } else {
                  return true;
                }
              };

              /** Block Appointment*/
              if (
                !angular.isUndefined(appointment.Classification) &&
                appointment.Classification == 1
              ) {
                c1 = appointment.Classification == 1;
                c2 =
                  appointment.StartTime != undefined &&
                  appointment.StartTime != null;
                c3 =
                  appointment.EndTime != undefined &&
                  appointment.EndTime != null;
                c4 = appointment.EndTime > appointment.StartTime;
                c5 =
                  (appointment.TreatmentRoomId &&
                    appointment.TreatmentRoomId != null) ||
                  (appointment.UserId && appointment.UserId != null);

                return c1 && c2 && c3 && c4 && c5;
              } else if (
              /** Unscheduled Appointment*/
                !angular.isUndefined(appointment.Classification) &&
                appointment.Classification == 2
              ) {
                c1 = appointment.Classification == 2;
                c2 = appointment.PersonId && appointment.PersonId != '';
                c3 = appointment.ProposedDuration != null;
                c4 = angular.isNumber(appointment.ProposedDuration);

                return c1 && c2 && c3 && c4;
              } else {
              /** Regular Appointment */
                c1 = appointment.PersonId && appointment.PersonId != '';
                c2 =
                  appointment.StartTime != undefined &&
                  appointment.StartTime != null;
                c3 =
                  appointment.EndTime != undefined &&
                  appointment.EndTime != null;
                c4 = appointment.EndTime > appointment.StartTime;
                c5 =
                  appointment.TreatmentRoomId &&
                  appointment.TreatmentRoomId != null;
                c6 = validateProviderTimes();
                c7 = validatePlannedServices();

                return c1 && c2 && c3 && c4 && c5 && c6 && c7;
              }
            }
          ),
          AppointmentType: standardService(
            'Appointment Type',
            'AppointmentTypeId',
            '_soarapi_/appointmentTypes/:AppointmentTypeId',
            true,
            true,
            function (appointmentType) {
              return (
                appointmentType.Name &&
                appointmentType.Name != '' &&
                appointmentType.DefaultDuration > 0 &&
                appointmentType.UsualAmount < 999999.99
              );
            }
          ),
          // standardService("Hours of Operation", ["LocationUserHoursId", "LocationId"], "_soarapi_/locations/:LocationId/hours/:LocationUserHoursId", true, true,
          LocationHoursOfOperation: {
            ObjectName: 'Hours of Operation',
            IdField: 'LocationUserHoursId',
            IsValid: function (hoursOfOperation) {
              return (
                hoursOfOperation.LocationId && hoursOfOperation.LocationId != ''
              );
            },
            Operations: $resource(
              '_soarapi_/locations/:LocationId/hours/:LocationUserHoursId',
              {},
              {
                Retrieve: {
                  method: 'GET',
                  cache: locationHoursCache,
                  params: { LocationId: '@LocationId' },
                },
                Create: {
                  method: 'POST',
                  cache: locationHoursCache,
                  params: { LocationId: '@LocationId' },
                },
                Update: {
                  method: 'PUT',
                  cache: locationHoursCache,
                  params: { LocationId: '@LocationId' },
                },
                Delete: {
                  method: 'DELETE',
                  cache: locationHoursCache,
                  params: {
                    LocationId: '@LocationId',
                    LocationUserHoursId: '@LocationUserHoursId',
                  },
                },
              }
            ),
          },
          // standardService("Hours of Operation", ["LocationUserHoursId", "LocationId"], "_soarapi_/locations/:LocationId/hours/:LocationUserHoursId", true, true,
          ProviderHoursOfOperation: {
            ObjectName: 'Provider Hours of Operation',
            IdField: 'LocationUserHoursId',
            IsValid: function (hoursOfOperation) {
              return hoursOfOperation.UserId && hoursOfOperation.UserId != '0';
            },
            Operations: $resource(
              '_soarapi_/users/:UserId/hours/:LocationUserHoursId',
              {},
              {
                Retrieve: {
                  method: 'GET',
                  cache: providerHoursCache,
                  params: { UserId: '@UserId' },
                },
                Create: {
                  method: 'POST',
                  cache: providerHoursCache,
                  params: { UserId: '@UserId' },
                },
                Update: {
                  method: 'PUT',
                  cache: providerHoursCache,
                  params: { UserId: '@UserId' },
                },
                Delete: {
                  method: 'DELETE',
                  cache: providerHoursCache,
                  params: {
                    UserId: '@UserId',
                    LocationUserHoursId: '@LocationUserHoursId',
                  },
                },
              }
            ),
          },
          TreatmentRooms: $resource(
            '_soarapi_/locations/:LocationId/rooms/:RoomId',
            {},
            {
              Update: { method: 'PUT', params: { LocationId: '@LocationId' } },
              GetAllRooms: {
                method: 'GET',
                url: '_soarapi_/locations/getAllRooms/rooms',
              },
            }
          ),
          Holidays: $resource(
            '_soarapi_/holiday/:HolidayId',
            {},
            {
              get: { method: 'GET', cache: holidaysCache },
              delete: { method: 'DELETE', cache: holidaysCache },
              save: { method: 'POST', cache: holidaysCache },
              Update: { method: 'PUT', cache: holidaysCache },
            }
          ),
        },
        IdealDayTemplates: $resource(
          '_soarapi_/providerIdealDayTemplates/:templateId',
          {},
          {
            update: { method: 'PUT' },
          }
        ),
        Lists: {
          Appointments: $resource(
            '_sapischeduleapi_/Appointments',
            {},
            {
              GetAll: { method: 'GET' },
              GetAllWithDetails: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/detail',
              },
              GetAllForTimeline: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/timeline/:PatientId',
                params: { PatientId: '@PatientId' },
              },
              GetSingleForTimeline: {
                method: 'GET',
                url: '_soarapi_/Appointments/timeline/single/:AppointmentId:guid',
                params: { AppointmentId: '@AppointmentId' },
              },
              GetWithDetails: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/detail/:AppointmentId',
                params: { AppointmentId: '@AppointmentId' },
              },
              GetAllScheduleBlocks: {
                method: 'GET',
                params: { Classification: '@Classification' },
              },
              FindRoomBlockConflicts: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/FindRoomConflicts',
              },
              FindUserBlockConflicts: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/FindUserConflicts',
              },
              GetAllWithSummary: {
                method: 'GET',
                url: '_soarapi_/Appointments/summary',
              },
              GetAppointmentById: {
                method: 'GET',
                url: '_sapischeduleapi_/Appointments/:AppointmentId',
                params: { AppointmentId: '@AppointmentId' },
              },
              GetWidget: {
                method: 'GET',
                url: '_soarapi_/widgets/schedule/Appointments',
              },
              GetWidgetPost: {
                method: 'POST',
                url: '_soarapi_/widgets/schedule/Appointments',
              },
              GetEncounterIdForAppointment: {
                method: 'GET',
                url: '_soarapi_/Appointments/:AppointmentId/encounter',
                params: { AppointmentId: '@AppointmentId' },
              },
            }
          ),
          AppointmentTypes: $resource(
            '_soarapi_/appointmentTypes/',
            {},
            {
              GetAll: { method: 'GET' },
            }
          ),
        },
        ProviderTime: function (appointment) {
          var getDuration = function (startTime, endTime) {
            if (startTime != null && endTime != null) {
              var startMoment = moment(startTime);
              var endMoment = moment(endTime);

              var duration = endMoment.diff(startMoment, 'minutes');

              return Math.abs(duration);
            }

            return 0;
          };

          var timeByDuration = function (time, duration) {
            var newTime = angular.copy(time);
            /** provider appointment duration can't be greater than appointment duration */
            if (duration > newDuration) {
              duration = newDuration;
            }
            newTime.setMinutes(newTime.getMinutes() + duration);

            return newTime;
          };

          var providerNewDuration = function (
            from,
            to,
            currentDuration,
            isFromEnd
          ) {
            if (oldDuration == newDuration) {
              return currentDuration;
            }

            var diff = getDuration(from, to);
            var multiplier = !isFromEnd
              ? from.getTime() < to.getTime()
                ? -1
                : 1
              : from.getTime() > to.getTime()
              ? -1
              : 1;

            var duration = currentDuration + diff * multiplier;
            duration = duration <= 0 ? 5 : Math.abs(duration);

            return duration;
          };

          var createRange = function (start, end) {
            return {
              start: new Date(start),
              end: new Date(end),
            };
          };

          /** new time can be found on appointment.start and appointment.end
           *  old time can be found on appointment.StartTime and appointment.EndTime
           */
          var newRange = createRange(appointment.start, appointment.end);
          var oldRange = createRange(
            appointment.StartTime,
            appointment.EndTime
          );

          var oldDuration = getDuration(oldRange.start, oldRange.end);
          var newDuration = getDuration(newRange.start, newRange.end);

          var providerAppointments = appointment.ProviderAppointments;

          return {
            Calculate: function () {
              var paDuration;

              // sort the providerAppointments
              providerAppointments = $filter('orderBy')(
                providerAppointments,
                'StartTime'
              );

              angular.forEach(
                providerAppointments,
                function (providerAppointment) {
                  var paRange = createRange(
                    providerAppointment.StartTime,
                    providerAppointment.EndTime
                  );
                  paDuration = getDuration(paRange.start, paRange.end);

                  if (oldDuration == paDuration) {
                    providerAppointment.StartTime =
                      newRange.start.toISOString();
                    providerAppointment.EndTime = newRange.end.toISOString();
                    paDuration = newDuration;
                  } else if (
                    paRange.start.getTime() == oldRange.start.getTime() &&
                    paRange.end.getTime() < oldRange.end.getTime()
                  ) {
                    providerAppointment.StartTime =
                      newRange.start.toISOString();
                    paDuration = providerNewDuration(
                      oldRange.start,
                      newRange.start,
                      paDuration
                    );
                    providerAppointment.EndTime = timeByDuration(
                      newRange.start,
                      paDuration
                    ).toISOString();
                  } else if (
                    paRange.start.getTime() > oldRange.start.getTime() &&
                    paRange.end.getTime() == oldRange.end.getTime()
                  ) {
                    providerAppointment.EndTime = newRange.end.toISOString();
                    paDuration = providerNewDuration(
                      oldRange.end,
                      newRange.end,
                      paDuration,
                      true
                    );
                    providerAppointment.StartTime = timeByDuration(
                      newRange.end,
                      -paDuration
                    ).toISOString();
                  } else if (
                    paRange.start.getTime() < newRange.start.getTime()
                  ) {
                    providerAppointment.StartTime =
                      newRange.start.toISOString();
                    paDuration = providerNewDuration(
                      paRange.start,
                      newRange.start,
                      paDuration
                    );
                    providerAppointment.EndTime = timeByDuration(
                      newRange.start,
                      paDuration
                    ).toISOString();
                  } else if (paRange.end.getTime() > newRange.end.getTime()) {
                    providerAppointment.EndTime = newRange.end.toISOString();
                    paDuration = providerNewDuration(
                      paRange.end,
                      newRange.end,
                      paDuration,
                      true
                    );
                    providerAppointment.StartTime = timeByDuration(
                      newRange.end,
                      -paDuration
                    ).toISOString();
                  } else {
                    providerAppointment.StartTime = paRange.start.toISOString();
                    providerAppointment.EndTime = paRange.end.toISOString();
                    paDuration = paDuration;
                  }

                  var paRangeNew = createRange(
                    providerAppointment.StartTime,
                    providerAppointment.EndTime
                  );

                  if (
                    providerAppointment.ObjectState == saveStates.None &&
                    !angular.equals(paRange, paRangeNew)
                  ) {
                    providerAppointment.ObjectState = saveStates.Update;
                  }

                  providerAppointment.Duration = paDuration;
                }
              );
            },
          };
        },
        MarkAsFinished: $resource(
          '_sapischeduleapi_/Appointments/FinishAppointment',
          {},
          {
            Appointment: { method: 'PUT' },
          }
        ),
        UpdateAndStart: $resource(
          '_soarapi_/Appointments?startAppointment=true',
          {},
          {
            Appointment: { method: 'PUT' },
          }
        ),
        Update: $resource(
          '_sapischeduleapi_/Appointments2',
          {},
          {
            Appointment: { method: 'PUT' },
          }
        ),
        AppointmentStatus: $resource(
          '_soarapi_/Appointments/:appointmentId/Status',
          {},
          {
            Update: {
              method: 'PUT',
              params: {
                appointmentId: '@appointmentId',
                manuallyUpdateStatus: '@manuallyUpdateStatus',
              },
            },
          }
        ),
        AppointmentStatusUpdate: $resource(
          '_sapischeduleapi_/Appointments/:appointmentId/StatusUpdate',
          {},
          {
            Update: {
              method: 'PUT',
              params: {
                appointmentId: '@appointmentId',
                manuallyUpdateStatus: '@manuallyUpdateStatus',
              },
            },
          }
        ),
        ProviderRoomSetup: $resource(
          '_soarapi_/providerRoomSetups/:providerRoomSetupId',
          {},
          {
            update: { method: 'PUT' },
            GetAll: { method: 'GET' },
          }
        ),
        ProviderRoomOccurrences: $resource(
          '_sapischeduleapi_/providerRoomOccurrences/:providerRoomOccurrenceId',
          {},
          {
            update: { method: 'PUT' },
            timeIsOpen: {
              method: 'GET',
              url: '_sapischeduleapi_/providerRoomOccurrences/timeIsOpen',
            },
          }
        ),
        ScheduleProviders: scheduleProviders,
        ScheduleLocations: scheduleLocations,
        ScheduleProviderRoomOccurrences: providerRoomOccurrences,
        ScheduleStartDate: scheduleStartDate,
        ScheduleEndDate: scheduleEndDate,
        ScheduleDate: scheduleDate,
      };
    },
  ])

  .service('ScheduleViews', [
    function () {
      var userLogic = {
        Providers: function (users) {
          var providers = [];

          var filterdValue = users.filter(function (f) {
            return (
              f.ProviderTypeId != null &&
              (f.ProviderTypeId < 4 || f.ProviderTypeId == 5) &&
              f.IsActive
            );
          });

          angular.forEach(filterdValue, function (f) {
            var pd = f.ProfessionalDesignation
              ? ', ' + f.ProfessionalDesignation
              : '';
            providers.push({
              Name: f.FirstName + ' ' + f.LastName + pd,
              UserCode: f.UserCode,
              UserId: f.UserId,
              ProviderTypeId: f.ProviderTypeId,
              ProviderTypeViewId: null,
            });
          });

          return providers;
        },
      };
      var appointmentLogic = {
        _setPropertyToResultObject: function (
          instance,
          propertyName,
          resultObject
        ) {
          instance[propertyName] = resultObject.Value;
        },
      };

      return {
        Users: userLogic,
        Appointments: appointmentLogic,
      };
    },
  ])
  .service('ScheduleAppointmentConflictCheck', [
    '$q',
    'ScheduleServices',
    function ($q, scheduleServices) {
      return {
        ProviderConflicts: function (appointmentParams) {
          var conflictsQuery = [];

          angular.forEach(appointmentParams.ProviderAppointments, function (p) {
            if (!p.UserId) return;

            var userParams = {
              Take: 1,
              StartTime: p.StartTime,
              EndTime: p.EndTime,
              Id: p.UserId,
              Classification: 1,
              ExcludeAppointment:
                (!angular.isUndefined(p.AppointmentId) || p.AppointmentId) !=
                null
                  ? p.AppointmentId
                  : null,
            };

            conflictsQuery.push(
              scheduleServices.Lists.Appointments.FindUserBlockConflicts(
                userParams
              ).$promise
            );
          });

          if (
            appointmentParams.ExaminingDentist &&
            appointmentParams.ExaminingDentist !== 'any'
          ) {
            var dentistParams = {
              Take: 1,
              StartTime: appointmentParams.StartTime,
              EndTime: appointmentParams.EndTime,
              Id: appointmentParams.ExaminingDentist,
              Classification: 1,
              ExcludeAppointment:
                (!angular.isUndefined(appointmentParams.AppointmentId) ||
                  appointmentParams.AppointmentId) != null
                  ? appointmentParams.AppointmentId
                  : null,
            };

            conflictsQuery.push(
              scheduleServices.Lists.Appointments.FindUserBlockConflicts(
                dentistParams
              ).$promise
            );
          }

          var roomParams = {
            Take: 1,
            StartTime: appointmentParams.StartTime,
            EndTime: appointmentParams.EndTime,
            Id: appointmentParams.TreatmentRoomId,
            Classification: 1,
            ExcludeAppointment:
              (!angular.isUndefined(appointmentParams.AppointmentId) ||
                appointmentParams.AppointmentId) != null
                ? appointmentParams.AppointmentId
                : null,
          };

          conflictsQuery.push(
            scheduleServices.Lists.Appointments.FindRoomBlockConflicts(
              roomParams
            ).$promise
          );

          return $q.all(conflictsQuery);
        },
      };
    },
  ])
  .service('AppointmentService', [
    'StaticData',
    'ListHelper',
    'SaveStates',
    function (staticData, listHelper, saveStates) {
      var status = staticData.AppointmentStatuses();

      var flagAsLateFilter = function (appointment) {
        // check for appointment status
        var appointmentStatus = _.find(status.List, {
          Value: appointment.Status,
        });

        if (!appointmentStatus || appointment.Name === 'Lunch') return false;

        if (
          _.includes(
            [
              status.Enum.Unconfirmed,
              status.Enum.ReminderSent,
              status.Enum.Confirmed,
            ],
            appointmentStatus.Value
          ) &&
          moment(appointment.StartTime).utc() <
            moment().subtract(1, 'minutes').utc()
        ) {
          return true;
        } else {
          return false;
        }
      };

      var flagAppointmentsAsLateIfNeeded = function (appointments) {
        var hasChanged = false;
        var numOfAppts = _.size(appointments);
        if (numOfAppts === 0) {
          return hasChanged;
        }

        var lateStatus = _.find(status.List, { Value: status.Enum.Late });
        for (var i = 0; i < numOfAppts; i++) {
          if (flagAsLateFilter(appointments[i])) {
            hasChanged = true;
            appointments[i].OriginalStatus = appointments[i].Status;
            appointments[i].Status = lateStatus.Value;
            appointments[i].StatusIcon = lateStatus.Icon;
          }
        }

        return hasChanged;
      };

      //check weather date is with zero offset format i.e. Z is appended at the end of date string
      var checkDateZeroOffset = function (dateString) {
        if (dateString) {
          if (dateString.substr(dateString.length - 1).toLowerCase() === 'z') {
            return true;
          } else {
            return false;
          }
        }
        return false;
      };

      var appendDetails = function (appointment, appendData) {
        var code;
        appointment.Alerts = appendData.Alerts;
        appointment.AppointmentType = appendData.AppointmentType;
        appointment.ContactInfo = appendData.ContactInformation;
        appointment.Location = appendData.Location;
        appointment.Room = appendData.Room;
        appointment.Patient = appendData.Person;
        appointment.PlannedServices = appointment.PlannedServices
          ? appointment.PlannedServices
          : [];
        appointment.Providers = [];
        appointment.ProviderUsers = appendData.ProviderUsers;
        appointment.ServiceCodes = appendData.ServiceCodes;
        var start = '';
        var end = '';
        if (appointment.StartTime != null)
          start = checkDateZeroOffset(appointment.StartTime.toString())
            ? appointment.StartTime.toString()
            : appointment.StartTime.toString() + 'Z';
        if (appointment.EndTime != null)
          end = checkDateZeroOffset(appointment.EndTime.toString())
            ? appointment.EndTime.toString()
            : appointment.EndTime.toString() + 'Z';
        if (start !== '') appointment.start = new Date(start);
        if (end !== '') appointment.end = new Date(end);
        if (start !== '') appointment.StartTime = new Date(start);
        if (end !== '') appointment.EndTime = new Date(end);
        angular.forEach(
          appointment.ProviderAppointments,
          function (providerAppointment) {
            providerAppointment.ObjectState = saveStates.None;
          }
        );

        angular.forEach(appointment.PlannedServices, function (plannedService) {
          plannedService.ObjectState = saveStates.None;
          code = listHelper.findItemByFieldValue(
            appointment.ServiceCodes,
            'ServiceCodeId',
            plannedService.ServiceCodeId
          );

          if (code != null) {
            plannedService.AffectedAreaId = code.AffectedAreaId;
            plannedService.Code = code.Code;
            plannedService.Description = code.Description;
            plannedService.DisplayAs = code.DisplayAs;
          }
        });

        angular.forEach(appendData.ProviderUsers, function (user, index) {
          if (index == 0) {
            var pd = user.ProfessionalDesignation
              ? ', ' + user.ProfessionalDesignation
              : '';
            appointment.Provider = {
              Name: user.FirstName + ' ' + user.LastName + pd,
              UserCode: user.UserCode,
              UserId: user.UserId,
              ProviderTypeId: user.ProviderTypeId,
              ProviderTypeViewId: null,
            };
          }
        });
      };

      // some of this is duplicated from the above method. This code does not loop through service codes and saves on performance.
      var appendSomeDetails = function (appointment, appendData) {
        appointment.Alerts = appendData.Alerts;
        appointment.AppointmentType = appendData.AppointmentType;
        appointment.ContactInfo = appendData.ContactInformation;
        appointment.Patient = appendData.Person;
        appointment.PlannedServices = appointment.PlannedServices
          ? appointment.PlannedServices
          : [];
        appointment.Providers = [];
        appointment.ProviderUsers = appendData.ProviderUsers;
        appointment.ServiceCodes = appendData.ServiceCodes;

        angular.forEach(
          appointment.ProviderAppointments,
          function (providerAppointment) {
            providerAppointment.ObjectState = saveStates.None;
          }
        );

        _.forEach(appendData.ProviderUsers, function (user, index) {
          if (index == 0) {
            var pd = user.ProfessionalDesignation
              ? ', ' + user.ProfessionalDesignation
              : '';
            appointment.Provider = {
              Name: user.FirstName + ' ' + user.LastName + pd,
              UserCode: user.UserCode,
              UserId: user.UserId,
              ProviderTypeId: user.ProviderTypeId,
              ProviderTypeViewId: null,
            };
          }
        });
      };

      // some of this is duplicated from the above method. This code does not loop through service codes and saves on performance.
      var appendSomeDetailsButDoNotTouchDates = function (
        appointment,
        appendData
      ) {
        appointment.Alerts = appendData.Alerts;
        appointment.AppointmentType = appendData.AppointmentType;
        appointment.ContactInfo = appendData.ContactInformation;
        appointment.Location = appendData.Location;
        appointment.Room = appendData.Room;
        appointment.Patient = appendData.Person;
        appointment.PlannedServices = appointment.PlannedServices
          ? appointment.PlannedServices
          : [];
        appointment.Providers = [];
        appointment.ProviderUsers = appendData.ProviderUsers;
        appointment.ServiceCodes = appendData.ServiceCodes;

        angular.forEach(
          appointment.ProviderAppointments,
          function (providerAppointment) {
            providerAppointment.ObjectState = saveStates.None;
          }
        );

        _.forEach(appendData.ProviderUsers, function (user, index) {
          if (index == 0) {
            var pd = user.ProfessionalDesignation
              ? ', ' + user.ProfessionalDesignation
              : '';
            appointment.Provider = {
              Name: user.FirstName + ' ' + user.LastName + pd,
              UserCode: user.UserCode,
              UserId: user.UserId,
              ProviderTypeId: user.ProviderTypeId,
              ProviderTypeViewId: null,
            };
          }
        });
      };

      return {
        FlagAppointmentsAsLateIfNeeded: flagAppointmentsAsLateIfNeeded,
        AppendDetails: appendDetails,
        AppendSomeDetails: appendSomeDetails,
        AppendSomeDetailsButDoNotTouchDates:
          appendSomeDetailsButDoNotTouchDates,
      };
    },
  ]);
