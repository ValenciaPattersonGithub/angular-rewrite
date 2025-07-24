'use strict';

angular.module('Soar.Patient').directive('treatmentPlansLanding', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      patientInfo: '=',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plans-landing/treatment-plans-landing.html',
    controller: 'TreatmentPlansLandingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
