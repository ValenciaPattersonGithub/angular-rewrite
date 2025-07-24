angular.module('Soar.Patient').directive('appointmentSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      gridData: '=',
      selectedLocation: '=',
    },
    templateUrl:
      'App/Patient/patient-landing/patient-landing-appointment/appointment-slideout.html',
    controller: 'AppointmentSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
