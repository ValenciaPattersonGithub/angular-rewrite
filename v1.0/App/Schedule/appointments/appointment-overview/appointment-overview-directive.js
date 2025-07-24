'use strict';

angular.module('Soar.Schedule').directive('appointmentOverview', function () {
  return {
    restrict: 'E',
    scope: {
      appointment: '=',
      displayFunction: '&',
      saveFunction: '&',
      cancelFunction: '&',
      editFullAppointment: '&',
    },
    templateUrl:
      'App/Schedule/appointments/appointment-overview/appointment-overview.html',
    controller: 'AppointmentOverviewController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
