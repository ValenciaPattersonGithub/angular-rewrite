'use strict';

angular
  .module('common.directives')
  .directive('serviceSelectorRefactor', function () {
    return {
      restrict: 'E',
      scope: {
        patient: '=',
        flyout: '=',
        serviceFilter: '@',
        addSelectedServices: '=',
        appointment: '=?',
        loadingCheck: '=?',
        serviceCodes: '=?',
      },
      templateUrl:
        'App/Common/components/serviceSelectors/serviceSelectorRefactor/service-selector-refactor.html',
      controller: 'ServiceSelectorRefactorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
