'use strict';

angular.module('common.directives').directive('schedulerSlideout', function () {
  return {
    restrict: 'E',
    scope: {
      bodyTemplate: '=',
    },
    templateUrl: 'App/Common/components/scheduler/scheduler-slideout.html',
    controller: 'SchedulerSlideoutContoller',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
