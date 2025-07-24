'use strict';

angular.module('Soar.Schedule').directive('scheduleDateSelector', function () {
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
      isRequired: '=',
      hideDateInput: '=',
      placeholder: '@',
      tabIndex: '=',
      onSelect: '=',
    },
    templateUrl:
      'App/Schedule/components/scheduleDateSelector/scheduleDateSelector.html',
    controller: 'ScheduleDateSelectorCtrl',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
