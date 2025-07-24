'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewAppointmentTypeDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        selectedAppointmentType: '=',
        appointmentTypes: '=',
        controlDisabled: '=?',
        inputId: '=?',
        placeHolder: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-appointment-type-dropdown.html',
      controller: 'AppointmentViewAppointmentTypeDropdownController',
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
