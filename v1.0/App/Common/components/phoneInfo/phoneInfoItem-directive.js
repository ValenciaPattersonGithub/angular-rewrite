'use strict';

angular.module('common.directives').directive('phoneInfoItem', function () {
  return {
    restrict: 'E',
    scope: {
      phoneId: '=', // the index passed by the ng-repeat
      phone: '=', // contains a phone object
      phoneTypes: '=', // passes regular phone types with the custom phone types
      editMode: '=', // triggered when custom phone type is being edited. Disables editing in other phone dropdowns
      showRemoveOption: '=', // shows remove button when there are more than one phone
      removeFunction: '&', // calls to be removed
      validForm: '=', // validation
      disableInput: '=?', // disable input fileds
      focus: '=?',
      showLabel: '=?',
      hideIsPrimary: '=?',
      hasNotes: '=?',
      hasTexts: '=?',
      phoneTabindex: '@?',
      hidePhoneTypes: '=?',
    },
    templateUrl: 'App/Common/components/phoneInfo/phoneInfoItem.html',
    controller: 'PhoneInfoItemController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
