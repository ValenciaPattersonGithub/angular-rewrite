'use strict';

angular.module('Soar.Patient').directive('patientGroupTypes', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/patient-groupTypes/patient-groupTypes.html',
    data: {
      patient: '=',
    },
    controller: 'PatientGroupTypesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
