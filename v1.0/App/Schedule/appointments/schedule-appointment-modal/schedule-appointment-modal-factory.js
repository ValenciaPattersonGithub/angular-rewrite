'use strict';
angular.module('Soar.Patient').factory('ScheduleAppointmentModalFactory', [
  'PatientServices',
  '$filter',
  'localize',
  'ListHelper',
  '$q',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  'StaticData',
  'LocationServices',
  function (
    patientServices,
    $filter,
    localize,
    listHelper,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService,
    staticData,
    locationServices
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

    factory.convertToUnscheduled = function (appointment, timeIncrement) {
      var unScheduledAppointment = {
        AppointmentId: appointment.AppointmentId
          ? appointment.AppointmentId
          : null,
        AppointmentTypeId: appointment.AppointmentTypeId,
        ProposedDuration:
          appointment.AppointmentType &&
          appointment.AppointmentType.DefaultDuration
            ? appointment.AppointmentType.DefaultDuration
            : timeIncrement,
        PersonId: appointment.PersonId,
        TreatmentRoomId: appointment.TreatmentRoomId,
        UserId: appointment.ProviderAppointments[0].UserId,
        Classification: 2, // Unscheduled
        Description: appointment.Description,
        Note: appointment.Note,
        StartTime: null,
        EndTime: null,
        ProviderAppointments: [],
        PlannedServices: [],
        ExaminingDentist: appointment.ExaminingDentist,
        IsExamNeeded: appointment.IsExamNeeded,
        Status: 0, // Unconfirmed Status
        StatusNote: appointment.StatusNote,
        DataTag: appointment.DataTag,
        LocationId: appointment.LocationId,
        IsPinned: appointment.IsPinned,
      };
      return unScheduledAppointment;
    };

    //#endregion

    // gets a list of treatment rooms by locationid
    factory.getTreatmentRoomsByLocation = function (locationId) {
      var defer = $q.defer();
      var promise = defer.promise;
      locationServices.getRooms(
        { Id: locationId },
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('Failed to retrieve the list of {0}.', [
              'rooms',
            ]),
            localize.getLocalizedString('Error')
          );
        }
      );
      return promise;
    };

    return {
      // access to rx
      access: function () {
        return factory.authAccess();
      },
      ConvertToUnscheduled: function (appointment, timeIncrement) {
        return factory.convertToUnscheduled(appointment, timeIncrement);
      },
      TreatmentRoomsByLocation: function (locationId) {
        return factory.getTreatmentRoomsByLocation(locationId);
      },
    };
  },
]);
