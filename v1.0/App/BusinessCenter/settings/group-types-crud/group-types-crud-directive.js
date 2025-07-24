'use strict';

angular.module('Soar.BusinessCenter').directive('groupTypeCrud', function () {
  return {
    restrict: 'E',
    scope: {
      editMode: '=',
      groupTypeId: '=',
      types: '=',
    },
    templateUrl:
      'App/BusinessCenter/settings/group-types-crud/group-types-crud.html',
    controller: 'GroupTypeCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
