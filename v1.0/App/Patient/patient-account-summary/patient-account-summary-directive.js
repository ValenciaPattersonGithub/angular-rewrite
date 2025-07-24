'use strict';

angular.module('Soar.Patient').directive('patientAccountSummary', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
    },
    templateUrl:
      'App/Patient/patient-account-summary/patient-account-summary.html',
    controller: 'PatientAccountSummaryController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
