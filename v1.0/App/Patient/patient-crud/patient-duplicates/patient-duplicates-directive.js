'use strict';

angular.module('Soar.Patient').directive('patientDuplicates', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/patient-duplicates/patient-duplicates.html',
    scope: {
      patient: '=',
    },
    controller: 'PatientDuplicatesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
