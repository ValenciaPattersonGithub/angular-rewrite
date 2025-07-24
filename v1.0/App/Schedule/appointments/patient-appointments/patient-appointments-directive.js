'use strict';

angular.module('Soar.Schedule').directive('patientAppointments', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      showAppointments: '@',
      layout: '=?',
      tabIdentifier: '=?',
    },
    templateUrl:
      'App/Schedule/appointments/patient-appointments/patient-appointments.html',
    controller: 'PatientAppointmentsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
