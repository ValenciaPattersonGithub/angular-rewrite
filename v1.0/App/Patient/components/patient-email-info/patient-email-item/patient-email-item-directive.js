'use strict';

angular.module('Soar.Patient').directive('patientEmailItem', function () {
  return {
    restrict: 'E',
    scope: {
      emailId: '=', // the index passed by the ng-repeat
      email: '=', // contains a phone object
      phoneTypes: '=', // passes regular phone types with the custom phone types
      editMode: '=', // triggered when custom phone type is being edited. Disables editing in other phone dropdowns
      showRemoveOption: '=', // shows remove button when there are more than one phone
      removeFunction: '&', // calls to be removed
      validForm: '=', // validation
      disableInput: '=?', // disable input fileds
      focus: '=?',
      showLabel: '=?',
      showIsPrimary: '=?',
      hasNotes: '=?',
      hasTexts: '=?',
      emailTabindex: '@?',
    },
    templateUrl:
      'App/Patient/components/patient-email-info/patient-email-item/patient-email-item.html',
    controller: 'PatientEmailItemController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
