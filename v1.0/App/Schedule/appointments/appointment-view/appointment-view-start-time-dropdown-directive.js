'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewStartTimeDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        //selectedStartTime: '=',
        //times: '=',
        //controlDisabled: '=?',
        inputId: '=?',
        id: '@',
        tabIndex: '&',
        increment: '=?',
        selectedTime: '=?',
        //selectedDuration: '=?',
        begin: '=?',
        end: '=?',
        tpDisabled: '=',
        valid: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-start-time-dropdown.html',
      controller: 'AppointmentViewStartTimeDropdownController',
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
