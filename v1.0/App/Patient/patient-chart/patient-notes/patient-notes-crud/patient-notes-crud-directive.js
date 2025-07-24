'use strict';

angular.module('Soar.Patient').directive('patientNotesCrud', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      onSave: '&?',
      onCancel: '&?',
      patientInfo: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/patient-notes/patient-notes-crud/patient-notes-crud.html',
    controller: 'PatientNotesCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
