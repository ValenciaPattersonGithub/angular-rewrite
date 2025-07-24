angular.module('Soar.Patient').directive('patientHeader', function () {
  return {
    restrict: 'E',
    scope: {
      patientData: '=',
      phones: '=?',
      activeUrl: '=?',
      disableTabs: '=?',
      hideTabs: '=?',
      disableCommIcons: '=?',
    },
    templateUrl: 'App/Patient/components/patientHeader/patientHeader.html',
    controller: 'PatientHeaderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
