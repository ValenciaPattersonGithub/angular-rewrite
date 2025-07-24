'use strict';

angular.module('common.directives').directive('serviceCodesPicker', [
  '$rootScope',
  function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        onSelect: '=',
      },
      templateUrl:
        'App/Common/components/serviceCodesPicker/serviceCodesPicker.html',
      controller: 'ServiceCodesPickerController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
