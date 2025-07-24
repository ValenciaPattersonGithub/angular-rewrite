'use strict';

angular.module('Soar.Patient').directive('patientEmailInfo', function () {
  return {
    restrict: 'E',
    scope: {
      emails: '=',
      validEmails: '=',
      disableInput: '=?',
      focusIf: '=?',
      showLabel: '=?',
      patientInfo: '=?',
    },
    templateUrl:
      'App/Patient/components/patient-email-info/patient-email-info.html',
    controller: 'PatientEmailController',
    link: function link(scope, elem, attrs) {
      // grabs tabindex form parent element to keep fluid tabbing through page
      scope.tabIndex = elem.attr('tabindex');
      // removes parent tab index, no longer necessary
      elem.attr('tabindex', '');

      if (attrs.disableInput === null || attrs.disableInput === undefined) {
        scope.disableInput = false;
      }

      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
