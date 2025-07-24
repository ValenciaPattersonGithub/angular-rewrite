'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentPlannedServices', function () {
    return {
      restrict: 'E',
      scope: {
        // Collection of planned services for an appointment
        plannedServices: '=',
        // Callback function when user remove service from planned services collection
        onRemoveService: '=',
        disableActions: '=',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-planned-services/appointment-planned-services.html',
      controller: 'AppointmentPlannedServicesController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
