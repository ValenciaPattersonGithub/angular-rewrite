'use strict';

angular.module('Soar.Patient').directive('patientPreferences', function () {
  return {
    restrict: 'E',
    scope: {
      preferences: '=',
      patient: '=',
      editing: '=',
      saveFunction: '=?',
      valid: '=?',
      onSuccess: '=?',
      onError: '=?',
    },
    templateUrl: 'App/Patient/patient-preferences/patient-preferences.html',
    controller: 'PatientPreferencesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
