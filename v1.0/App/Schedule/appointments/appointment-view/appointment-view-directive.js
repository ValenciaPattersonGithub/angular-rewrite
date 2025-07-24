'use strict';

angular.module('Soar.Schedule').directive('appointmentView', function () {
  return {
    restrict: 'E',
    scope: {
      timeIncrement: '<',
    },
    templateUrl:
      'App/Schedule/appointments/appointment-view/appointment-view.html',
    controller: 'AppointmentViewController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
