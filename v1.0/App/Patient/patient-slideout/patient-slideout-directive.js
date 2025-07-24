'use strict';

angular.module('Soar.Patient').directive('patientSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      activeFltrTab: '=',
      activeGridData: '=',
      selectedLocation: '=',
    },
    templateUrl: 'App/Patient/patient-slideout/patient-slideout.html',
    controller: 'PatientSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
