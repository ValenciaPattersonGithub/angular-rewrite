'use strict';

angular.module('Soar.Patient').directive('patientFlags', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Patient/patient-crud/patient-flags/patient-flags.html',
    scope: {
      person: '=',
    },
    controller: 'PatientFlagsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
