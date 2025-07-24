'use strict';

angular.module('common.directives').directive('feeServiceCodeSelector', [
  function () {
    return {
      restrict: 'E',
      scope: {
        //Datasource object of kendo grid
        allServiceCodes: '=',
      },
      templateUrl:
        'App/Common/components/fee-service-code-selector/fee-service-code-selector.html',
      controller: 'FeeServiceCodeSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
