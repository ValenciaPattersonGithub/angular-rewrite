'use strict';

angular.module('Soar.Patient').directive('preventiveCareAppt', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=?',
      editing: '=?',
      appointment: '=?',
      plannedServices: '=?',
    },
    templateUrl:
      'App/Patient/patient-chart/health/preventive-care-appt/preventive-care-appt.html',
    controller: 'PreventiveCareApptDirectiveController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
