'use strict';

angular.module('common.directives').directive('calendarPicker', function () {
  return {
    restrict: 'E',
    scope: {
      dateVar: '=',
      valid: '=',
      format: '@',
      inputId: '@',
      minDate: '=',
      maxDate: '=',
      mode: '@',
      disableDateInput: '=',
      hideControl: '=',
      placeholder: '@',
      tabIndex: '=',
      open: '=',
      authZ: '=',
      disableToday: '=',
    },
    link: function ($scope, $element, $attrs) {
      $scope.minDate = $attrs.minDate;
      $scope.maxDate = $attrs.maxDate;
      $element.on('$destroy', function elementOnDestroy() {
        $scope.$destroy();
      });
    },
    templateUrl: 'App/Common/components/calendarPicker/calendarPicker.html',
    controller: 'CalendarPickerCtrl',
  };
});
