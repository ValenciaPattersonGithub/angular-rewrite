angular
  .module('common.directives')
  .directive('multiSelectFixedWidth', function () {
    return {
      restrict: 'E',
      scope: {
        displayField: '@?',
        displayFunction: '=?',
        id: '@',
        idField: '@?',
        list: '=',
        selected: '=?',
        initialSelection: '=?',
        type: '@?',
        open: '=',
        msDisabled: '=?',
        authZ: '=',
        allowBlank: '=?',
        selectAllLabel: '@?',
        isGrouped: '=',
        onChange: '=',
      },
      templateUrl:
        'App/Common/components/multi-select-fixed-width/multi-select-fixed-width.html',
      controller: 'MultiSelectFixedWidthController',
      link: function link(scope, elem) {
        scope.element = elem;

        // changed to watchCollection
        scope.$watchCollection('list', function (nv, ov) {
          if (JSON.stringify(nv) != JSON.stringify(ov)) {
            scope.selectedCount = nv.filter(function (item) {
              return item.Selected;
            }).length;
          }
        });

        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
