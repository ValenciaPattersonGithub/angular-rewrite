'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentViewProviderDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        controlDisabled: '=?',
        placeHolder: '=?',
        patientInfo: '=?',
        forExaminingDentist: '=?',
        providerTypeIds: '=?', // ie[1,2]
        sbChange: '=?',
        inputId: '@',
        required: '=?',
        selectedProvider: '=',
        providerInactive: '=?selectedProviderInactive',
        onlyActive: '=?',
        objTrans: '=?',
        setPreferred: '=?',
        filterByLocationId: '=?',
        usuallyPerformedBy: '=?',
        exceptionProviderId: '=?',
        filterShowOnSchedule: '=?',
        optionsForExaminingDentist: '=?',
        filterInactiveProviders: '=?',
        isOnPatientOverview: '=?',
        disableInput: '=',
        providerScheduleExceptions: '=?',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-view/appointment-view-provider-dropdown.html',
      controller: 'AppointmentViewProviderDropdownController',
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
