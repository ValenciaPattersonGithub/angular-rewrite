'use strict';

angular.module('Soar.Patient').directive('realTimeEligibility', function () {
  return {
    restrict: 'E',
    scope: {
      patientId: '=',
      patient: '=?',
      benefitPlans: '=?',
      eligibility: '=?',
    },
    templateUrl:
      'App/Patient/patient-account/patient-insurance-info/real-time-eligibility/real-time-eligibility-directive.html',
    controller: 'RealTimeEligibilityDirectiveController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
