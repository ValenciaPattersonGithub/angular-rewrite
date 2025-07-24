'use strict';

angular.module('Soar.Schedule').directive('appointmentProviders', function () {
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
      'App/Schedule/appointments/appointment-providers/appointment-providers.html',
    controller: 'AppointmentProvidersController',
  };
});
