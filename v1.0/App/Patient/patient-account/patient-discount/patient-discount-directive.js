'use strict';

angular.module('Soar.Patient').directive('patientDiscount', function () {
  return {
    restrict: 'E',
    scope: {
      patientDiscount: '=',
      currentPatientId: '=',
      editing: '=',
      valid: '=',
      saveFunction: '=',
      onSaveSuccess: '=',
      onSaveError: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-discount/patient-discount.html',
    controller: 'PatientDiscountController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
