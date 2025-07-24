'use strict';

angular.module('Soar.Patient').directive('patientReferred', function () {
  return {
    restrict: 'E',
    scope: {
      count: '=',
    },
    templateUrl:
      'App/Patient/patient-crud/patient-referred/patient-referred.html',
    controller: 'PatientReferredController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
