'use strict';

angular.module('Soar.Patient').directive('patientReferral', function () {
  return {
    restrict: 'E',
    scope: {
      referral: '=',
      editing: '=',
      saveFunction: '=',
      valid: '=',
      onSuccess: '=',
      onError: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-referral/patient-referral.html',
    controller: 'PatientReferralController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
