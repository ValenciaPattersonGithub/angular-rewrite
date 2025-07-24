angular.module('Soar.Patient').directive('treatmentplansSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      gridData: '=',
      selectedLocation: '=',
    },
    templateUrl:
      'App/Patient/patient-landing/patient-landing-treatmentplan/treatmentplans-slideout.html',
    controller: 'TreatmentPlansSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
