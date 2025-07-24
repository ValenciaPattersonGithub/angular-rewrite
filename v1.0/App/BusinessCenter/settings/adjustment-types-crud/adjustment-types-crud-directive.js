'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('adjustmentTypeCrud', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        editMode: '=',
        typeId: '=',
        types: '=',
        associatedAdjustment: '=',
      },
      templateUrl:
        'App/BusinessCenter/settings/adjustment-types-crud/adjustment-types-crud.html',
      controller: 'AdjustmentTypeCrudController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
