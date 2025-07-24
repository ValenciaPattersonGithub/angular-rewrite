'use strict';

angular
  .module('common.directives')
  .directive('preventiveCareSelector', function () {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        flyout: '=',
        serviceFilter: '@',
        addSelectedServices: '=',
        appointment: '=',
        dueDate: '=',
        loadingCheck: '=?',
      },
      templateUrl:
        'App/Common/components/serviceSelectors/preventiveCareSelector/preventive-care-selector.html',
      controller: 'PreventiveCareSelectorController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
