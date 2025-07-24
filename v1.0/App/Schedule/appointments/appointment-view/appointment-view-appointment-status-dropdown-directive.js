'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewAppointmentStatusDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        selectedAppointmentStatus: '=',
        appointmentStatuses: '=',
        controlDisabled: '=?',
        inputId: '=?',
        placeHolder: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-appointment-status-dropdown.html',
      controller: 'AppointmentViewAppointmentStatusDropdownController',
      link: function (scope, elem, attr) {
        // grabs tabindex form parent element to keep fluid tabbing through page
        scope.tabIndex = elem.attr('tabindex');
        // removes parent tab index, no longer necessary
        elem.attr('tabindex', '');
        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
