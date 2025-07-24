angular.module('Soar.Patient').directive('otherToDoSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      gridData: '=',
      selectedLocation: '=',
    },
    templateUrl:
      'App/Patient/patient-landing/patient-landing-other-to-do/other-to-do-slideout.html',
    controller: 'OtherToDoSlideoutController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
