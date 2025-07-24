'use strict';

angular.module('common.directives').directive('boxSelector', function () {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      bsItemUrl: '@',
      bsItemId: '@',
      selectedItem: '=',
      canAdd: '=?',
      bsItemAddUrl: '@',
      addFunc: '=?',
      patient: '=',
    },
    templateUrl: 'App/Common/components/boxSelector/boxSelector.html',
    controller: 'BoxSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
