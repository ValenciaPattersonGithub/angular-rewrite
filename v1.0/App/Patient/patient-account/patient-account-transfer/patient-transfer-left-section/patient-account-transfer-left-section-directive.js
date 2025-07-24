angular
  .module('Soar.Patient')
  .directive('patientAccountTransferLeftSection', function () {
    return {
      restrict: 'E',
      scope: {
        patientData: '=',
        phones: '=',
        accountMembers: '=',
        emails: '=',
        section: '=',
        selectedLeft: '=',
        primarySelected: '&',
      },
      templateUrl:
        'App/Patient/patient-account/patient-account-transfer/patient-transfer-left-section/patient-account-transfer-left-section.html',
      controller: 'PatientAccountTransferLeftSectionController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
