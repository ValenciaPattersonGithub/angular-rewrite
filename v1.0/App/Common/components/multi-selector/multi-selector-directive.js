angular.module('common.directives').directive('multiSelector', function () {
  return {
    restrict: 'E',
    scope: {
      displayField: '@?',
      id: '@',
      list: '=',
      selectedList: '=',
      selectAll: '=?',
      type: '@?',
      placeholder: '@?',
      open: '=',
      msDisabled: '=?',
      authZ: '=?',
      onBlurFn: '&?',
      isGroupedByLocationStatus: '=?',
      onChange: '=',
    },
    templateUrl: 'App/Common/components/multi-selector/multi-selector.html',
    controller: 'MultiSelectorController',
    link: function link(scope, elem) {
      scope.element = elem;
      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
    compile: function () {
      return {
        pre: function (scope, elem, attrs) {
          // Set default value template if it is not defined by user
          if (typeof attrs.isGroupedByLocationStatus == 'undefined') {
            scope.isGroupedByLocationStatus = false;
          }
        },
      };
    },
  };
});
