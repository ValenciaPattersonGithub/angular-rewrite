angular.module('Soar.Patient').directive('patientDetailsModal', function () {
  return {
    restrict: 'EA',
    scope: {
      selectedPatientId: '=',
      phones: '=',
      activeUrl: '=',
      disableTabs: '=?',
    },
    templateUrl:
      'App/Patient/patient-communication/patient-details-modal/patient-details-modal.html',
    controller: 'PatientDetailsModalController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
