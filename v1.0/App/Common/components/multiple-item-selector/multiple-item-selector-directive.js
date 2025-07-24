'use strict';

angular
  .module('common.controllers')
  .directive('multipleItemSelector', function () {
    return {
      restrict: 'E',
      scope: {
        fullList: '=',
        selectedItems: '=',
        key: '=',
        textProperty: '=',
        valueProperty: '=',
        displayName: '=',
        orderBy: '=',
      },
      templateUrl:
        'App/Common/components/multiple-item-selector/multiple-item-selector.html',
      controller: 'MultipleItemSelectorCtrl',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });

/* usage example
    <multiple-item-selector full-list="locationsMock"
            selected-items="userLocationsMock"
            key="'LocationId'"
            text-property="'NameLine1'"
            value-property="'LocationId'"
            display-name="'Location'">
    </multiple-item-selector>
*/
