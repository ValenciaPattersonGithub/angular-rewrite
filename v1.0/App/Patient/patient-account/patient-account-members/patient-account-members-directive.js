'use strict';

angular.module('Soar.Patient').directive('patientAccountMembers', function () {
  return {
    restrict: 'E',
    scope: {
      accountId: '=',
      patientId: '=',
    },
    templateUrl:
      'App/Patient/patient-account/patient-account-members/patient-account-members.html',
    controller: 'PatientAccountMembersController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
