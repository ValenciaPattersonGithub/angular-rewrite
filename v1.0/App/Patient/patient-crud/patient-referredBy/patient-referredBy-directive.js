'use strict';

angular.module('Soar.Patient').directive('patientReferredBy', function () {
  return {
    restrict: 'E',
    scope: {
      person: '=',
      referral: '=',
      valid: '=',
      formIsValid: '=',
      setFocusOnInput: '=?',
    },
    templateUrl:
      'App/Patient/patient-crud/patient-referredBy/patient-referredBy.html',
    controller: 'PatientReferredByController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
