'use strict';

angular.module('common.directives').directive('dateSelector', function () {
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
    templateUrl: 'App/Common/components/dateSelector/dateSelector.html',
    controller: 'DateSelectorCtrl',
    link: function link(scope, element) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
