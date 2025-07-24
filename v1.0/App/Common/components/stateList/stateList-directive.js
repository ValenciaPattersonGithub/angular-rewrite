'use strict';

angular.module('common.directives').directive('stateList', function () {
  return {
    restrict: 'E',
    templateUrl: 'App/Common/components/stateList/stateList.html',
    controller: 'StateListController',
    scope: {
      source: '=',
      stateListId: '@',
      comboBoxBlur: '&',
      disableInput: '=?',
    },
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
