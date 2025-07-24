'use strict';

angular.module('Soar.Patient').directive('eligibility', function () {
  return {
    restrict: 'E',
    scope: {
      patientId: '=',
      patient: '=?',
      benefitPlans: '=?',
      patientEligibility: '=?',
      selectedEligibility: '=?',
      controlDisabled: '=?',
      inputId: '=?',
      placeHolder: '=?',
    },
    templateUrl:
      'App/Patient/patient-account/patient-insurance-info/real-time-eligibility/eligibility-directive.html',
    controller: 'EligibilityDirectiveController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
