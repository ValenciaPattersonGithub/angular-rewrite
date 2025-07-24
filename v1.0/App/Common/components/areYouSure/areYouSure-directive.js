'use strict';
angular.module('common.directives').directive('areYouSure', [
  'localize',
  function (localize) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        message: '@',
        ifYes: '&',
        ifNo: '&',
        //Optional parameter used to set focus on yes button when it is true
        isFocusSet: '=?',
        //Need to provide value when using more than one are you sure directives on the same page
        appendId: '=?',
      },
      templateUrl: 'App/Common/components/areYouSure/areYouSure.html ',
      controller: 'AreYouSureController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
