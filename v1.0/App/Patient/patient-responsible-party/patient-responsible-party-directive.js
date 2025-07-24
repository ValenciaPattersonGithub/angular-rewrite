'use strict';

angular
  .module('Soar.Patient')
  .directive('patientResponsibleParty', function () {
    return {
      restrict: 'E',
      scope: {
        patient: '=',
        responsiblePerson: '=',
        defaultFocus: '=?',
        disableParty: '=?',
        isValid: '=?',
        showError: '=?',
        ageCheck: '=?',
        showHeader: '=?',
      },
      templateUrl:
        'App/Patient/patient-responsible-party/patient-responsible-party.html',
      controller: 'PatientResponsiblePartyController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
