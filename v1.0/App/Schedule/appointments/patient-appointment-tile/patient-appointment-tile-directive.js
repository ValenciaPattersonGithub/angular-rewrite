'use strict';

angular
  .module('Soar.Schedule')
  .directive('patientAppointmentTile', function () {
    return {
      restrict: 'E',
      scope: {
        // Object of a patient appointment
        patientAppointment: '=',
        // Current index of a directive in a iteration
        tileIndex: '=',
        // Decides whether to show date in a circle or not
        showDate: '@',
        // Decides whether to disable "Start Appointment" action button or not
        isDisabled: '=',
      },
      templateUrl:
        'App/Schedule/appointments/patient-appointment-tile/patient-appointment-tile.html',
      controller: 'PatientAppointmentsTileController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
