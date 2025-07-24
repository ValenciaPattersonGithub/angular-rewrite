(function () {
  'use strict';
  angular
    .module('Soar.Schedule')
    .service(
      'AppointmentViewValidationService',
      appointmentViewValidationService
    );

  appointmentViewValidationService.$inject = [];

  function appointmentViewValidationService() {
    var service = this;

    // This function was pulled from `standardServices.Dtos.Appointment` - it's the validation function
    //  passed in to `standardServices.validationFunction`.
    service.validateAppointment = function (appointment) {
      var c1, c2, c3, c4, c5, c6, c7;

      var validateProviderTimes = function () {
        if (
          appointment.ProviderAppointments &&
          appointment.ProviderAppointments.length > 0
        ) {
          for (var i = 0; i < appointment.ProviderAppointments.length; i++) {
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
            } else if (
              (appointment.PlannedServices[i].ProviderId == null &&
                appointment.PlannedServices[i].$$isProviderOnServiceValid ==
                  false) ||
              appointment.PlannedServices[i].ProviderId == null
            ) {
              // Do nothing
              return false;
            } else if (
              appointment.PlannedServices[i].LocationId !=
              appointment.LocationId
            ) {
              // Do nothing
              return false;
            } else if (
              (appointment.PlannedServices[i].LocationId ==
                appointment.LocationId &&
                appointment.$$didLocationChange == true &&
                !appointment.PlannedServices[i].ObjectState) ||
              appointment.PlannedServices[i].ObjectState == null ||
              appointment.PlannedServices[i].ObjectState == undefined ||
              appointment.PlannedServices[i].ObjectState == 'None'
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
          appointment.StartTime != undefined && appointment.StartTime != null;
        c3 = appointment.EndTime != undefined && appointment.EndTime != null;
        c4 = appointment.EndTime > appointment.StartTime;
        c5 =
          (appointment.TreatmentRoomId &&
            appointment.TreatmentRoomId != null) ||
          (appointment.UserId && appointment.UserId != null);
        //debugger;
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

        //debugger;
        return c1 && c2 && c3 && c4;
      } else {
      /** Regular Appointment */
        //debugger;
        c1 = appointment.PersonId && appointment.PersonId != '';
        c2 =
          appointment.StartTime != undefined && appointment.StartTime != null;
        c3 = appointment.EndTime != undefined && appointment.EndTime != null;
        c4 = appointment.EndTime > appointment.StartTime;
        c5 = appointment.TreatmentRoomId && appointment.TreatmentRoomId != null;
        c6 = validateProviderTimes();
        c7 = validatePlannedServices();
        //debugger;
        return c1 && c2 && c3 && c4 && c5 && c6 && c7;
      }
    };

    return {
      validateAppointment: service.validateAppointment,
    };
  }
})();
