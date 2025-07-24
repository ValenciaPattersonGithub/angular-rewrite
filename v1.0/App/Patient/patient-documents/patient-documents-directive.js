'use strict';
//TODO this is for placeholder only and will need to be modified for actual documents
angular.module('Soar.Patient').directive('patientDocuments', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      patientData: '=',
      editData: '=?',
      additionalData: '=?',
      id: '@',
      template: '@',
      title: '@',
      //valid: '=?',
      autoSave: '=?',
      defaultExpanded: '=?',
      changeConfirmRequired: '=?',
      patientDirectoryId: '=?',
    },
    templateUrl: 'App/Patient/patient-documents/patient-documents.html',
    controller: 'PatientDocumentsController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
