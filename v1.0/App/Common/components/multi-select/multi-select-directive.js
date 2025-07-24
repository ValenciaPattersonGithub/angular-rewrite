angular.module('common.directives').directive('multiSelect', function () {
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
    templateUrl: 'App/Common/components/multi-select/multi-select.html',
    controller: 'MultiSelectController',
    link: function link(scope, elem) {
      scope.element = elem;
      elem.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
