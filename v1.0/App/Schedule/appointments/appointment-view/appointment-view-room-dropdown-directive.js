'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewRoomDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        selectedRoom: '=',
        rooms: '=',
        controlDisabled: '=?',
        inputId: '=?',
        placeHolder: '=?',
        required: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-room-dropdown.html',
      controller: 'AppointmentViewRoomDropdownController',
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
