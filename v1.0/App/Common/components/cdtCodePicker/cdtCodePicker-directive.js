'use strict';

angular.module('common.directives').directive('cdtCodePicker', [
  '$rootScope',
  function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        onSelect: '=',
      },
      templateUrl: 'App/Common/components/cdtCodePicker/cdtCodePicker.html',
      controller: 'CdtCodePickerController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
