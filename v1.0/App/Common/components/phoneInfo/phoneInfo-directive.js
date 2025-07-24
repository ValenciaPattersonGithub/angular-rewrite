'use strict';

angular.module('common.directives').directive('phoneInfo', function () {
  return {
    restrict: 'E',
    scope: {
      phones: '=',
      maxLimit: '=',
      validPhones: '=',
      validForm: '=',
      disableInput: '=?',
      focusIf: '=?',
      showLabel: '=?',
      showIsPrimary: '=?',
      customTypeOnly: '=?',
      patientInfo: '=?',
      area: '=',
    },
    templateUrl: 'App/Common/components/phoneInfo/phoneInfo.html',
    controller: 'PhoneInfoController',
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
