'use strict';

angular
  .module('common.directives')
  .directive('serviceFeeRollbackOptions', function () {
    return {
      restrict: 'E',
      scope: {
        services: '=',
        serviceCodes: '=?',
        onRollback: '=',
      },
      templateUrl:
        'App/Common/components/service-fee-rollback/service-fee-rollback-options/service-fee-rollback-options.html',
      controller: 'ServiceFeeRollbackOptionsController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
