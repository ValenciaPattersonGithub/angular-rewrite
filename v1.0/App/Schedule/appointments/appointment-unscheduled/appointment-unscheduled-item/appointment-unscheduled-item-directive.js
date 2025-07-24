'use strict';

angular
  .module('Soar.Schedule')
  .directive('appointmentUnscheduledItem', function () {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        uniqueId: '=',
        alerts: '=',
        providerFunction: '=',
        deleteFunction: '=',
        searchFunction: '=',
      },
      templateUrl:
        'App/Schedule/appointments/appointment-unscheduled/appointment-unscheduled-item/appointment-unscheduled-item.html',
      link: function (scope, element) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
