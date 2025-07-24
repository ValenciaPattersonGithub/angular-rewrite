'use strict';

angular.module('common.directives').directive('proposedSelector', function () {
  return {
    restrict: 'E',
    scope: {
      patient: '=',
      flyout: '=',
      serviceFilter: '@',
      addSelectedServices: '=?',
      loadingCheck: '=?',
      servicesOnPlan: '=?',
      chosenLocation: '=?',
      servicesAdded: '=?',
    },
    templateUrl:
      'App/Common/components/serviceSelectors/proposedServices/proposed-selector.html',
    controller: 'ProposedSelectorController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
