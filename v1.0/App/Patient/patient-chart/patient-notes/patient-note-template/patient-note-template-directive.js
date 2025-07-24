'use strict';

angular.module('Soar.Patient').directive('patientNoteTemplate', function () {
  return {
    restrict: 'E',
    scope: {
      selectedTemplate: '=',
      currentNote: '=',
      onFinish: '&?',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-notes/patient-note-template/patient-note-template.html',
    controller: 'PatientNoteTemplateController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
