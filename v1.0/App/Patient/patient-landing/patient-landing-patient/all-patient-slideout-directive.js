angular.module('Soar.Patient').directive('allPatientSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      gridData: '=',
      selectedLocation: '=',
    },
    templateUrl:
      'App/Patient/patient-landing/patient-landing-patient/all-patient-slideout.html',
    controller: 'AllPatientSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
