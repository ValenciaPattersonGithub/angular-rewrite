'use strict';

angular.module('Soar.Patient').directive('patientGroups', function () {
  return {
    restrict: 'E',
    scope: {
      patientGroupTypes: '=',
      editing: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-group-type/patient-group-type.html',
    controller: 'PatientGroupTypeController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
