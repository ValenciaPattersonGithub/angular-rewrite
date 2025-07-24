'use strict';

angular
  .module('Soar.Patient')
  .directive('patientAdditionalIdentifier', function () {
    return {
      restrict: 'E',
      scope: {
        additionalIdentifiers: '=',
        editing: '=',
        valid: '=',
        saveFunction: '=',
        onSaveSuccess: '=',
        onSaveError: '=',
      },
      templateUrl:
        'App/Patient/patient-account/patient-additional-identifier/patient-additional-identifier.html',
      controller: 'PatientAdditionalIdentiferController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
