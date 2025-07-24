'use strict';

angular.module('Soar.Schedule').directive('activeAppointment', function () {
  return {
    restrict: 'E',
    scope: {
      patientInfo: '=', // Patient details
      serviceWindow: '=',
      activeAppointmentId: '=',
    },
    templateUrl:
      'App/Schedule/appointments/active-appointment/active-appointment.html',
    controller: 'ActiveAppointmentController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
