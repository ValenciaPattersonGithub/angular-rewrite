angular.module('common.directives').directive('timePicker', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'App/Common/components/timePicker/timePicker.html',
      scope: {
        id: '@',
        tabIndex: '&',
        increment: '=?',
        selectedTime: '=?',
        //selectedDuration: '=?',
        begin: '=?',
        end: '=?',
        showDuration: '=?',
        tpDisabled: '=',
        valid: '=?',
      },
      link: function link(scope, elem, attr) {
        scope.dropdownTemplate =
          '<div id="template" type="text/x-kendo-template" class="time-picker-k-item">' +
          '<div class="block">' +
          '<div class="font-18 inline pull-left">{{ dataItem.Display }}</div>' +
          '<div class="font-12 inline pull-right italic" ng-show="dataItem.ShowDuration">{{ dataItem.Duration }} {{ ::("minutes" | i18n) }}</div>' +
          '</div>' +
          '</div>';
        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
      controller: 'TimePickerCtrl',
    };
  },
]);
