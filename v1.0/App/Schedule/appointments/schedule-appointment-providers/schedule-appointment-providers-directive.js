'use strict';

angular
  .module('Soar.Schedule')
  .directive('scheduleAppointmentProviders', function () {
    return {
      restrict: 'E',
      scope: {
        selectedProviders: '=',
        appointment: '=',
        slots: '=',
        providerSchedules: '=',
        loading: '=',
        onChange: '&?',
        conflicts: '=',
        readOnly: '=',
      },
      templateUrl:
        'App/Schedule/appointments/schedule-appointment-providers/schedule-appointment-providers.html',
      controller: 'ScheduleAppointmentProvidersController',
    };
  });
