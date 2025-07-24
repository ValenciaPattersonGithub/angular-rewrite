'use strict';

angular
  .module('Soar.Patient')
  .directive('patientAccountLatestStatement', function () {
    return {
      restrict: 'E',
      scope: {
        person: '=',
      },
      templateUrl:
        'App/Patient/patient-account-summary/patient-account-latest-statement/patient-account-latest-statement.html',
      controller: 'PatientAccountLatestStatementController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
