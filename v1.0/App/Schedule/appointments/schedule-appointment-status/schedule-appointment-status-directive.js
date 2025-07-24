angular
  .module('Soar.Schedule')
  .directive('scheduleAppointmentStatus', function () {
    return {
      restrict: 'E',
      templateUrl:
        'App/Schedule/appointments/schedule-appointment-status/schedule-appointment-status.html',
      scope: {
        id: '@',
        appointment: '=',
        person: '=',
        timeIncrement: '=',
        openList: '=?',
        onChange: '=?',
        beforeDelete: '=?',
        disableControl: '<',
        appointments: '=?',
        showAddToClipboard: '=?',
        addToClipboardCallback: '=?',
        hasRunningAppointment: '=?',
      },
      controller: 'ScheduleAppointmentStatusController',
      link: function (scope, element) {
        scope.valueTemplate =
          '<div type="text/x-kendo-template">' +
          '<span>' +
          '<span class="appointment-status-icon fa" ng-class="dataItem.icon"></span>' +
          '<span id="btn{{ dataItem.descriptionNoSpaces }}" class="appointment-status-description">' +
          '{{ dataItem.descriptionTranslation }}' +
          '</span>' +
          '</span>' +
          '</div>';

        scope.displayTemplate =
          '<div type="text/x-kendo-template">' +
          '<span>' +
          '<span class="appointment-status-icon fa" ng-class="dataItem.icon"></span>' +
          '<span id="btn{{ dataItem.descriptionNoSpaces }}" class="appointment-status-description">' +
          '{{ dataItem.descriptionTranslation }}' +
          '</span>' +
          '<div ng-if="dataItem.sectionEnd" class="appointment-status-line"></div>' +
          '</span>' +
          '</div>';
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
