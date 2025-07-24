'use strict';

angular.module('Soar.Patient').directive('patientAccountAging', function () {
  return {
    restrict: 'E',
    scope: {
      graphData: '=?',
      graphId: '=?',
    },
    templateUrl:
      'App/Patient/patient-account/patient-account-aging/patient-account-aging.html',
    controller: 'PatientAccountAgingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
