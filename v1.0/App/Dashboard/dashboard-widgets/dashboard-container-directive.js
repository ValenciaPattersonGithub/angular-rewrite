'use strict';

// data.Items will provide a list of widgets for rendering.

angular.module('Soar.Dashboard').directive('dashboardContainer', function () {
  return {
    restrict: 'E',
    scope: {
      data: '=',
    },
    templateUrl: 'App/Dashboard/dashboard-widgets/dashboard-container.html',
    controller: 'DashboardContainerController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
