angular
  .module('Soar.Patient')
  .directive('patientAccountTransferRightSection', function () {
    return {
      restrict: 'E',
      scope: {
        patientData2: '=',
        accountMembers: '=',
        section: '=',
        selectedRight: '=',
        primarySelected: '&',
        emails: '=',
      },
      templateUrl:
        'App/Patient/patient-account/patient-account-transfer/patient-transfer-right-section/patient-account-transfer-right-section.html',
      controller: 'PatientAccountTransferRightSectionController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
