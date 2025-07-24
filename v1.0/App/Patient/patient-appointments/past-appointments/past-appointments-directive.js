'use strict';

angular.module('Soar.Patient').directive('pastAppointments', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      accountId: '=',
      accountView: '=',
      accountMembers: '=',
    },
    templateUrl:
      'App/Patient/patient-appointments/past-appointments/past-appointments.html',
    controller: 'PastAppointmentsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
