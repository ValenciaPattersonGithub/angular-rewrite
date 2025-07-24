'use strict';

angular.module('Soar.Patient').directive('patientImaging', function () {
  return {
    restrict: 'E',
    scope: {
      personId: '=',
      patient: '=',
      imagingProvider: '=',
    },
    templateUrl: 'App/Patient/patient-chart/imaging/imaging.html',
    controller: 'PatientImagingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
