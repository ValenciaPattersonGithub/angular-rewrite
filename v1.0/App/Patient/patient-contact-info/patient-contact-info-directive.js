'use strict';

angular.module('Soar.Patient').directive('patientContactInfo', function () {
  return {
    restrict: 'E',
    scope: {
      contactInfo: '=',
      patient: '=',
      editing: '=',
      saveFunction: '=',
      valid: '=',
      onSuccess: '=',
      onError: '=',
    },
    templateUrl: 'App/Patient/patient-contact-info/patient-contact-info.html',
    controller: 'PatientContactInfoController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
