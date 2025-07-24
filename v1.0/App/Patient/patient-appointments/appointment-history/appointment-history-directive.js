'use strict';

angular.module('Soar.Patient').directive('appointmentHistory', function () {
  return {
    restrict: 'E',
    scope: {
      counts: '=',
      data: '=?',
    },
    templateUrl:
      'App/Patient/patient-appointments/appointment-history/appointment-history.html',
    controller: 'AppointmentHistoryDirectiveController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
