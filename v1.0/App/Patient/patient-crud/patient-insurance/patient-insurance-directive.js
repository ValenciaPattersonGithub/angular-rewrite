'use strict';

angular.module('Soar.Patient').directive('patientInsurance', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Patient/patient-crud/patient-insurance/patient-insurance.html',
    scope: {
      insurance: '=',
      person: '=',
      availablePriorities: '=',
      responsiblePerson: '=?',
      remove: '&?',
      priority: '&?',
      validatePolicyHolder: '=?',
      selfOnly: '=?',
      index: '@',
    },
    controller: 'PatientInsuranceController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
