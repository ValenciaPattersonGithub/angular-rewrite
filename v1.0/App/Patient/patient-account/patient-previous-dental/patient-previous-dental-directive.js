'use strict';

angular.module('Soar.Patient').directive('patientPreviousDentist', function () {
  return {
    restrict: 'E',
    scope: {
      previousDentalOffice: '=',
      currentPatientId: '=',
      editing: '=',
      valid: '=',
      saveFunction: '=',
      onSaveSuccess: '=',
      onSaveError: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-previous-dental/patient-previous-dental.html',
    controller: 'PatientPreviousDentalController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
