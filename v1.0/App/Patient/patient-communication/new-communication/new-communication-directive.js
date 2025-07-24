'use strict';

angular.module('Soar.Patient').directive('newCommunication', function () {
  return {
    restrict: 'E',
    scope: {
      patientId: '=',
      activeFltrTab: '=',
      appointmentId: '=',
    },
    templateUrl:
      'App/Patient/patient-communication/new-communication/new-communication.html',
    controller: 'newCommunicationController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
