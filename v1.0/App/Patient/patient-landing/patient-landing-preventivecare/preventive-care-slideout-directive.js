angular.module('Soar.Patient').directive('preventiveCareSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      gridData: '=',
      selectedLocation: '=',
    },
    templateUrl:
      'App/Patient/patient-landing/patient-landing-preventivecare/preventive-care-slideout.html',
    controller: 'PrevCareSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
