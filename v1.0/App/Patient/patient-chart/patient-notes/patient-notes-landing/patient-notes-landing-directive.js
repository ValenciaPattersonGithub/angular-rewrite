'use strict';

angular.module('Soar.Patient').directive('patientNotes', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      onChange: '&?',
      viewSettings: '=',
      data: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-notes/patient-notes-landing/patient-notes-landing.html',
    controller: 'PatientNotesLandingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
