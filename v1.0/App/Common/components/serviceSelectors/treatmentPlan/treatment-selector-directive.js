'use strict';
// Note servicesAdded are services that may appear in the list that have already been added to the appointment, encounter, etc
// and would not be available to be selected again.  As services are added from the treatment plan they are added to servicesAdded list
// so they cannot be selected a second time

angular.module('common.directives').directive('treatmentSelector', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      flyout: '=',
      serviceFilter: '@',
      addSelectedServices: '=',
      loadingCheck: '=?',
      activeAppointment: '=?',
      chosenLocation: '=',
      servicesAdded: '=?',
      includeEstIns: '=',
    },
    //active appointment is only used for location id. Do not use any other variable as its grabbed from two different objects
    templateUrl:
      'App/Common/components/serviceSelectors/treatmentPlan/treatment-selector.html',
    controller: 'TreatmentSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
