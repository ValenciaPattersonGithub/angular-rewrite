'use strict';

angular.module('Soar.Schedule').directive('provider-schedules', function () {
  return {
    restrict: 'E',
    scope: {
      providers: '=',
    },
    templateUrl:
      'App/Schedule/appointments/provider-schedules/provider-schedules.html',
    controller: 'ProviderSchedulesController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
