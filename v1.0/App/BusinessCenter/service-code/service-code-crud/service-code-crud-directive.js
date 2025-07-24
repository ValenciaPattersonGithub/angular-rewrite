'use strict';

angular.module('Soar.BusinessCenter').directive('serviceCodeCrud', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=?',
      updateServiceCodeList: '=?',
    },
    templateUrl:
      'App/BusinessCenter/service-code/service-code-crud/service-code-crud.html',
    controller: 'ServiceCodeCrudController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
