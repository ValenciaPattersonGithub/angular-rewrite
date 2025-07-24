'use strict';

angular.module('Soar.Patient').directive('hipaaAuthorizationCrud', function () {
  return {
    restrict: 'E',
    scope: {
      editing: '=?',
      patientId: '=',
      id: '@',
      title: '@',
      viewSettings: '=',
    },
    templateUrl:
      'App/Patient/patient-profile/patient-overview/hipaa-authorization/hipaa-authorization-crud/hipaa-authorization-crud.html',
    controller: 'HipaaAuthorizationCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
