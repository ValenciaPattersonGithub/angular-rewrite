'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewLocationDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        selectedLocation: '=',
        locations: '=',
        controlDisabled: '=?',
        inputId: '=?',
        placeHolder: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-location-dropdown.html',
      controller: 'AppointmentViewLocationDropdownController',
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
