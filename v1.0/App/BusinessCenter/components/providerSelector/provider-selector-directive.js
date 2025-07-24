'use strict';

angular.module('common.directives').directive('providerSelector', function () {
  return {
    restrict: 'E',
    scope: {
      placeHolder: '=?',
      patientInfo: '=?',
      className: '@?',
      providerTypeIds: '=?', // ie[1,2]
      sbChange: '=?',
      inputId: '@',
      required: '=?',
      selectedProvider: '=',
      providerInactive: '=?selectedProviderInactive',
      onlyActive: '=?',
      disableInput: '=?',
      objTrans: '=?',
      setPreferred: '=?',
      filterByLocationId: '=?',
      usuallyPerformedBy: '=?',
      exceptionProviderId: '=?',
      filterShowOnSchedule: '=?',
      optionsForExaminingDentist: '=?',
      filterInactiveProviders: '=?',
      isOnPatientOverview: '=?',
      providerScheduleExceptions: '=?',
      sortForClinicalNotes: '=?',
      filterByMultipleLocations: '=?',
    },
    templateUrl:
      'App/BusinessCenter/components/providerSelector/provider-selector.html',
    controller: 'ProviderSelectorController',
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
// filterByLocationId
// if a location id is passed to the directive, the providers will be filtered by that location id
// if no location passed to directive the providers will be filtered by the current location id

// usuallyPerformedBy
// 1 Dentist 2 Hygienist

//exceptionProviderId: '=?'
//pass in the id of the provider that you want to show up in the list even if they wouldn't normally appear
