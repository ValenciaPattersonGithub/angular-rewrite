'use strict';

angular.module('common.directives').directive('checkbox', function () {
  return {
    restrict: 'E',
    scope: {
      authZ: '@?',
      checkboxId: '@',
      checkboxValue: '=',
      checkboxLabel: '=?',
      changeFunction: '&?',
      checkboxDisabled: '=?',
      checkboxHidden: '=?',
      isAccountFilter: '=?',
    },
    templateUrl: 'App/Common/components/checkbox/checkbox.html',
    controller: 'CheckboxController',
    link: function (scope, elem, attr) {
      // grabs tabindex form parent element to keep fluid tabbing through page
      scope.tabIndex = elem.attr('tabindex');
      // removes parent tab index, no longer necessary
      elem.attr('tabindex', '');
      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
