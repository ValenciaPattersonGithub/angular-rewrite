'use strict';

angular.module('Soar.Patient').directive('patientPersonalInfo', function () {
  return {
    restrict: 'E',
    scope: {
      personalInfo: '=',
      patientData: '=',
      editing: '=',
      saveFunction: '=',
      valid: '=',
      onSuccess: '=',
      onError: '=',
      original: '=',
    },
    templateUrl: 'App/Patient/patient-personal-info/patient-personal-info.html',
    controller: 'PatientPersonalInfoController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
