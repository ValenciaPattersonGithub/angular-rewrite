'use strict';

angular.module('Soar.BusinessCenter').directive('scheduleSetup', function () {
  return {
    restrict: 'E',
    scope: {
      list: '=',
      hasAProviderSetup: '=',
    },
    replace: true,
    templateUrl:
      'App/BusinessCenter/practice-setup/practice-setup-section.html',
    controller: 'ScheduleSetupController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
