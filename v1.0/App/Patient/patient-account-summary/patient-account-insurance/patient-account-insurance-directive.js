'use strict';

angular
  .module('Soar.Patient')
  .directive('patientAccountInsurance', function () {
    return {
      restrict: 'E',
      scope: {
        person: '=',
      },
      templateUrl:
        'App/Patient/patient-account-summary/patient-account-insurance/patient-account-insurance.html',
      controller: 'PatientAccountInsuranceController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
