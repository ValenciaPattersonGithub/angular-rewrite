'use strict';

angular.module('common.directives').directive('listPanel', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      // Object that defines all vars inside of directive scope
      listPanelUrl: '=',
      backFunc: '&',
    },
    templateUrl: 'App/Common/components/listPanel/listPanel.html',
    controller: 'ListPanelCtrl',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
