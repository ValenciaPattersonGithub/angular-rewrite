'use strict';

angular.module('Soar.Patient').directive('patientIdentifier', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
      identifier: '=',
      valid: '=',
      formIsValid: '=',
      setFocusOnInput: '=?',
    },
    templateUrl:
      'App/Patient/patient-crud/patient-identifier/patient-identifier.html',
    controller: 'PatientIdentifierController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
