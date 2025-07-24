'use strict';

angular.module('Soar.Patient').directive('hipaaAuthorization', function () {
  return {
    restrict: 'E',
    scope: {
      editData: '=?',
      additionalData: '=?',
      patientInfo: '=',
      id: '@',
      title: '@',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-profile/patient-overview/hipaa-authorization/hipaa-authorization.html',
    controller: 'MedicalHistoryController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
