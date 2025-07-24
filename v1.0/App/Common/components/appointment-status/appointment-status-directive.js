angular.module('common.directives').directive('appointmentStatus', function () {
  return {
    restrict: 'E',
    templateUrl:
      'App/Common/components/appointment-status/appointment-status.html',
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
    },
    controller: 'AppointmentStatusController',
    link: function (scope, element) {
      scope.valueTemplate =
        '<div type="text/x-kendo-template">' +
        '<span>' +
        '<span class="appointment-status-icon fa" ng-class="dataItem.Icon"></span>' +
        '<span id="btn{{ dataItem.Description | removeSpaces }}" class="appointment-status-description">' +
        '{{ dataItem.Description | i18n }}' +
        '</span>' +
        '</span>' +
        '</div>';

      scope.displayTemplate =
        '<div type="text/x-kendo-template">' +
        '<span>' +
        '<span class="appointment-status-icon fa" ng-class="dataItem.Icon"></span>' +
        '<span id="btn{{ dataItem.Description | removeSpaces }}" class="appointment-status-description">' +
        '{{ dataItem.Description | i18n }}' +
        '</span>' +
        '<div ng-if="dataItem.SectionEnd" class="appointment-status-line"></div>' +
        '</span>' +
        '</div>';
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
